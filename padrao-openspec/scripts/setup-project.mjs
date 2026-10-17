#!/usr/bin/env node

import { copyFileSync, existsSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const storeRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const installScript = path.join(storeRoot, 'scripts', 'install-skills.mjs');
const namePlaceholder = '{{Nome do Projeto}}';

const presets = {
  dotnet: { label: '.NET', stacks: ['dotnet'] },
  nextjs: { label: 'Next.js', stacks: ['nextjs'] },
  'dotnet-nextjs': { label: '.NET (back-end) + Next.js (front-end)', stacks: ['dotnet', 'nextjs'] },
  none: { label: 'Nenhuma: manter o store neutro', stacks: [] },
};

function usage() {
  console.log(`Usage: node scripts/setup-project.mjs [code-repo] [options]

Bootstrap this store for one project: install skills and agents into the code repository,
apply the stack preset to this store's openspec/project.md and openspec/config.yaml, and
optionally register this store on the machine. Missing answers are asked interactively;
without a terminal, pass them as options.

Arguments:
  [code-repo]                   Path to the project's code repository

Options:
  --stack <${Object.keys(presets).join('|')}>
  --name <project name>         Replaces ${namePlaceholder} in openspec/project.md
  --target <agents|claude|both> Skill destination in the code repository (default: agents)
  --register-id <id>            Register this store with this id (default when asked: folder name)
  --no-register                 Do not register this store
  --force                       Apply the preset even if openspec/project.md was already filled
  --yes                         Do not ask for the final confirmation
  -h, --help                    Show this help`);
}

function parseArgs(args) {
  const options = { code: null, stack: null, name: null, target: 'agents', registerId: null, register: null, force: false, yes: false };
  const valueOf = (index, flag) => {
    const value = args[index + 1];
    if (value === undefined || value.startsWith('--')) throw new Error(`${flag} requires a value.`);
    return value;
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--stack') options.stack = valueOf(index++, arg);
    else if (arg === '--name') options.name = valueOf(index++, arg);
    else if (arg === '--target') options.target = valueOf(index++, arg);
    else if (arg === '--register-id') { options.registerId = valueOf(index++, arg); options.register = true; }
    else if (arg === '--no-register') options.register = false;
    else if (arg === '--force') options.force = true;
    else if (arg === '--yes') options.yes = true;
    else if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
    else if (options.code === null) options.code = arg;
    else throw new Error(`Unexpected argument: ${arg}`);
  }

  if (options.stack !== null && !Object.hasOwn(presets, options.stack)) {
    throw new Error(`Invalid stack "${options.stack}". Use ${Object.keys(presets).join(', ')}.`);
  }
  if (!['agents', 'claude', 'both'].includes(options.target)) {
    throw new Error(`Invalid target "${options.target}". Use agents, claude, or both.`);
  }
  return options;
}

// Reads answers through the line iterator, which buffers lines; rl.question drops lines that
// arrive before the question is asked (for example, several answers pasted at once).
function createPrompter() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const lines = rl[Symbol.asyncIterator]();
  return {
    async question(prompt) {
      process.stdout.write(prompt);
      const { value, done } = await lines.next();
      if (done) throw new Error('Input ended before all questions were answered.');
      return value;
    },
    close: () => rl.close(),
  };
}

function validateRegisterId(id) {
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(id)) {
    throw new Error(`Invalid store id "${id}". Use letters, digits and hyphens.`);
  }
}

async function askMissing(rl, options) {
  if (!rl) {
    const missing = [!options.stack && '--stack', !options.code && '<code-repo>'].filter(Boolean);
    if (missing.length > 0) throw new Error(`No terminal to ask questions; pass ${missing.join(' and ')}.`);
    options.register ??= false;
    return;
  }

  if (!options.stack) {
      const keys = Object.keys(presets);
      console.log('\nQual a stack do projeto?');
      keys.forEach((key, index) => console.log(`  ${index + 1}) ${presets[key].label}`));
    while (!options.stack) {
      const answer = (await rl.question('Escolha [1-4]: ')).trim();
      options.stack = keys[Number(answer) - 1] ?? (Object.hasOwn(presets, answer) ? answer : null);
    }
  }
  while (!options.code) {
    options.code = (await rl.question('Caminho do repositório de código do projeto: ')).trim() || null;
  }
  if (options.name === null) {
    options.name = (await rl.question('Nome do projeto (Enter para preencher depois): ')).trim() || null;
  }
  if (options.register === null) {
    const id = path.basename(storeRoot);
    const answer = (await rl.question(`Registrar este store nesta máquina como "${id}"? [S/n]: `)).trim().toLowerCase();
    options.register = answer === '' || answer.startsWith('s') || answer.startsWith('y');
    if (options.register) options.registerId = id;
  }
}

async function confirm(rl, plan, options) {
  console.log('\nResumo:');
  for (const line of plan) console.log(`  - ${line}`);
  if (path.basename(storeRoot) === 'padrao-openspec' && options.stack !== 'none') {
    console.log('\n  Atenção: esta pasta se chama padrao-openspec. Aplique presets no store do projeto, não no template.');
  }
  if (options.yes) return true;
  if (!rl) throw new Error('No terminal to confirm; pass --yes.');
  const answer = (await rl.question('\nConfirmar? [s/N]: ')).trim().toLowerCase();
  return answer.startsWith('s') || answer.startsWith('y');
}

function writeAtomic(target, content) {
  const staged = path.join(path.dirname(target), `.${path.basename(target)}-${randomUUID()}.tmp`);
  try {
    writeFileSync(staged, content);
    renameSync(staged, target);
  } finally {
    if (existsSync(staged)) rmSync(staged, { force: true });
  }
}

function committedVersion(relativePath) {
  try {
    return execFileSync('git', ['show', `HEAD:${relativePath}`], {
      cwd: storeRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

// A file is pristine when it matches a preset or the committed version; anything else may hold
// local edits, so it is copied to a timestamped backup before being replaced.
function backupIfEdited(relativePath, presetFileName) {
  const target = path.join(storeRoot, relativePath);
  const current = readFileSync(target, 'utf8').replace(/\r\n/g, '\n');
  const candidates = readdirSync(path.join(storeRoot, 'presets'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(storeRoot, 'presets', entry.name, presetFileName))
    .filter((file) => existsSync(file))
    .map((file) => readFileSync(file, 'utf8'));
  const committed = committedVersion(relativePath.split(path.sep).join('/'));
  if (committed !== null) candidates.push(committed);
  if (candidates.some((candidate) => candidate.replace(/\r\n/g, '\n') === current)) return null;

  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
  const backup = `${target}.${stamp}.bak`;
  copyFileSync(target, backup);
  return backup;
}

function quoteForShell(value) {
  if (value.includes('"')) throw new Error(`Unsupported character in argument: ${value}`);
  return `"${value}"`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    return;
  }

  const rl = process.stdin.isTTY && process.stdout.isTTY ? createPrompter() : null;
  try {
    await setup(rl, options);
  } finally {
    rl?.close();
  }
}

async function setup(rl, options) {
  await askMissing(rl, options);
  if (options.registerId) validateRegisterId(options.registerId);

  const codeRoot = path.resolve(options.code);
  if (!existsSync(codeRoot) || !statSync(codeRoot).isDirectory()) {
    throw new Error(`Code repository directory does not exist: ${codeRoot}`);
  }

  const preset = presets[options.stack];
  const projectPath = path.join(storeRoot, 'openspec', 'project.md');
  const configPath = path.join(storeRoot, 'openspec', 'config.yaml');
  const presetDir = path.join(storeRoot, 'presets', options.stack);
  const currentProject = readFileSync(projectPath, 'utf8');
  const applyPreset = options.stack !== 'none';

  if (applyPreset) {
    for (const file of ['project.md', 'config.yaml']) {
      if (!existsSync(path.join(presetDir, file))) throw new Error(`Preset file not found: ${path.join(presetDir, file)}`);
    }
    if (!currentProject.includes(namePlaceholder) && !options.force) {
      throw new Error(
        'openspec/project.md was already filled for a project; applying a preset would overwrite it. ' +
        'Review it, then rerun with --force if you really want to replace it.',
      );
    }
  }

  const installArgs = [installScript, codeRoot, '--target', options.target];
  if (preset.stacks.length > 0) installArgs.push('--stack', preset.stacks.join(','));

  const plan = [
    `Stack: ${preset.label}`,
    `Repositório de código: ${codeRoot} (skills e agentes em --target ${options.target}${preset.stacks.length ? `, --stack ${preset.stacks.join(',')}` : ''})`,
    applyPreset
      ? `Store: ${storeRoot} (substitui openspec/project.md e openspec/config.yaml pelo preset ${options.stack})`
      : `Store: ${storeRoot} (mantém project.md e config.yaml neutros)`,
    options.name ? `Nome do projeto: ${options.name}` : 'Nome do projeto: preencher depois em openspec/project.md',
    options.register ? `Registrar o store nesta máquina como "${options.registerId}"` : 'Não registrar o store',
  ];
  if (!(await confirm(rl, plan, options))) {
    console.log('Cancelado; nada foi alterado.');
    return;
  }

  // The installer checks for conflicts before copying anything, so a failure here leaves both repositories untouched.
  console.log('\n[1/3] Instalando skills e agentes no repositório de código...');
  const install = spawnSync(process.execPath, installArgs, { stdio: 'inherit' });
  if (install.status !== 0) {
    throw new Error('Installer failed; the store was not changed. Fix the reported problem and rerun.');
  }

  console.log('\n[2/3] Configurando o store...');
  if (applyPreset) {
    for (const [relativePath, presetFile] of [[path.join('openspec', 'project.md'), 'project.md'], [path.join('openspec', 'config.yaml'), 'config.yaml']]) {
      const backup = backupIfEdited(relativePath, presetFile);
      if (backup) console.log(`Backup of edited ${relativePath}: ${path.relative(storeRoot, backup)}`);
    }
    const name = options.name ?? namePlaceholder;
    writeAtomic(projectPath, readFileSync(path.join(presetDir, 'project.md'), 'utf8').replaceAll(namePlaceholder, name));
    writeAtomic(configPath, readFileSync(path.join(presetDir, 'config.yaml'), 'utf8'));
    console.log(`Applied preset: ${options.stack}`);
  } else if (options.name && currentProject.includes(namePlaceholder)) {
    writeAtomic(projectPath, currentProject.replaceAll(namePlaceholder, options.name));
    console.log('Updated project name in openspec/project.md');
  } else {
    console.log('Unchanged: openspec/project.md and openspec/config.yaml');
  }

  console.log('\n[3/3] Registro do store...');
  if (options.register) {
    console.log('Running openspec store register (the CLI can take a few seconds)...');
    const args = ['store', 'register', storeRoot, '--id', options.registerId, '--yes'];
    const register = process.platform === 'win32'
      ? spawnSync(['openspec', ...args.map(quoteForShell)].join(' '), { stdio: 'inherit', shell: true })
      : spawnSync('openspec', args, { stdio: 'inherit' });
    if (register.status !== 0) {
      console.warn(`Warning: store registration failed. Run it later: openspec store register "${storeRoot}" --id ${options.registerId}`);
    }
  } else {
    console.log('Skipped.');
  }

  console.log(`
Pronto. Próximos passos:
  1. Preencha a Stack Summary em openspec/project.md com as escolhas reais.
  2. Registre as decisões transversais como ADRs em openspec/adrs/.
  3. Faça commit das mudanças deste store e do repositório de código.`);
}

try {
  await main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
