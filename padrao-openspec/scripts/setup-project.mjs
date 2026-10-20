#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const storeRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const installScript = path.join(storeRoot, 'scripts', 'install-skills.mjs');
const namePlaceholder = '{{Nome do Projeto}}';

// The standard has no stack presets (ADR-0003); old automations that still pass --stack must fail loudly.
const stackRemovedMessage =
  '--stack was removed: the standard has no stack presets. Define the stack and the validation ' +
  'commands with /opsx:init.';

// A store cloned from the standard keeps "origin" pointing at it; a push would publish the
// project's planning to the standard's repository.
const standardRepoPattern = /[/:]PadraoOpenspct(?:\.git)?\/?$/i;

function usage() {
  console.log(`Usage: node scripts/setup-project.mjs [code-repo] [options]

Bootstrap this store for one project: install skills and agents into the code repository,
write the project name into this store's openspec/project.md, and optionally register this
store on the machine. The stack is defined later by /opsx:init. Missing answers are asked
interactively; without a terminal, pass them as options.

Arguments:
  [code-repo]                   Path to the project's code repository

Options:
  --name <project name>         Replaces ${namePlaceholder} in openspec/project.md
  --target <agents|claude|both> Skill destination in the code repository (default: both)
  --register-id <id>            Register this store with this id (default when asked: folder name)
  --no-register                 Do not register this store
  --force                       Replace a different store declaration in the code repository
  --keep-origin                 Keep the store's "origin" remote even when it points to PadraoOpenspct
                                (by default it is renamed to "padrao")
  --yes                         Do not ask for the final confirmation
  -h, --help                    Show this help`);
}

function parseArgs(args) {
  const options = {
    code: null, name: null, target: 'both', registerId: null, register: null, force: false, yes: false,
    keepOrigin: false, detachRemote: null,
  };
  const valueOf = (index, flag) => {
    const value = args[index + 1];
    if (value === undefined || value.startsWith('--')) throw new Error(`${flag} requires a value.`);
    return value;
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--stack') throw new Error(stackRemovedMessage);
    else if (arg === '--name') options.name = valueOf(index++, arg);
    else if (arg === '--target') options.target = valueOf(index++, arg);
    else if (arg === '--register-id') { options.registerId = valueOf(index++, arg); options.register = true; }
    else if (arg === '--no-register') options.register = false;
    else if (arg === '--force') options.force = true;
    else if (arg === '--keep-origin') options.keepOrigin = true;
    else if (arg === '--yes') options.yes = true;
    else if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
    else if (options.code === null) options.code = arg;
    else throw new Error(`Unexpected argument: ${arg}`);
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

// A clone of the whole repository keeps the store in <projeto>-openspec/padrao-openspec, so the
// clone folder names the project better than the store folder itself.
function defaultStoreId() {
  const name = path.basename(storeRoot);
  return name === 'padrao-openspec' ? path.basename(path.dirname(storeRoot)) : name;
}

function validateRegisterId(id) {
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(id)) {
    throw new Error(`Invalid store id "${id}". Use letters, digits and hyphens.`);
  }
}

function git(args) {
  return execFileSync('git', args, { cwd: storeRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

// Returns the store's origin URL when it points to the standard's repository, otherwise null.
function standardOrigin() {
  try {
    const url = git(['remote', 'get-url', 'origin']);
    return standardRepoPattern.test(url) ? url : null;
  } catch {
    return null;
  }
}

function hasRemote(name) {
  try {
    return git(['remote']).split(/\r?\n/).includes(name);
  } catch {
    return false;
  }
}

async function askMissing(rl, options) {
  const origin = options.keepOrigin ? null : standardOrigin();
  if (!origin) options.detachRemote = false;

  if (!rl) {
    if (!options.code) throw new Error('No terminal to ask questions; pass <code-repo>.');
    options.register ??= false;
    options.detachRemote ??= true;
    return;
  }

  if (options.detachRemote === null && !options.yes) {
    const answer = (await rl.question(
      `O remote origin deste store aponta para o repositório do padrão (${origin}). Renomear para "padrao"? [S/n]: `,
    )).trim().toLowerCase();
    options.detachRemote = answer === '' || answer.startsWith('s') || answer.startsWith('y');
  }
  options.detachRemote ??= true;

  while (!options.code) {
    options.code = (await rl.question('Caminho do repositório de código do projeto: ')).trim() || null;
  }
  if (options.name === null) {
    options.name = (await rl.question('Nome do projeto (Enter para preencher depois): ')).trim() || null;
  }
  if (options.register === null) {
    const id = defaultStoreId();
    const answer = (await rl.question(`Registrar este store nesta máquina como "${id}"? [S/n]: `)).trim().toLowerCase();
    options.register = answer === '' || answer.startsWith('s') || answer.startsWith('y');
    if (options.register) options.registerId = id;
  }
}

async function confirm(rl, plan, options) {
  console.log('\nResumo:');
  for (const line of plan) console.log(`  - ${line}`);
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

function quoteForShell(value) {
  if (value.includes('"')) throw new Error(`Unsupported character in argument: ${value}`);
  return `"${value}"`;
}

// On Windows the CLI is a .cmd shim, which spawnSync can only start through a shell.
function runOpenspec(args, { cwd = storeRoot, capture = false } = {}) {
  const spawnOptions = capture
    ? { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    : { cwd, stdio: 'inherit' };
  return process.platform === 'win32'
    ? spawnSync(['openspec', ...args.map(quoteForShell)].join(' '), { ...spawnOptions, shell: true })
    : spawnSync('openspec', args, spawnOptions);
}

const storeDeclarationPattern = /^store:[ \t]*["']?([^"'\s#]*)["']?[ \t]*(?:#.*)?$/m;

// The OpenSpec CLI resolves a declared store when the code repository's openspec/config.yaml
// (or config.yml) carries a "store: <id>" line.
function codeConfigPath(codeRoot) {
  const yml = path.join(codeRoot, 'openspec', 'config.yml');
  const yaml = path.join(codeRoot, 'openspec', 'config.yaml');
  return !existsSync(yaml) && existsSync(yml) ? yml : yaml;
}

// Fails before anything is changed when the code repository already declares a different store.
function checkStoreDeclaration(codeRoot, id, force) {
  const configPath = codeConfigPath(codeRoot);
  if (!existsSync(configPath)) return;
  const declared = readFileSync(configPath, 'utf8').match(storeDeclarationPattern)?.[1];
  if (declared !== undefined && declared !== id && !force) {
    throw new Error(
      `${configPath} already declares store "${declared}". Edit it, or rerun with --force to declare "${id}".`,
    );
  }
}

function writeStoreDeclaration(codeRoot, id) {
  const configPath = codeConfigPath(codeRoot);
  if (!existsSync(configPath)) {
    mkdirSync(path.dirname(configPath), { recursive: true });
    writeAtomic(configPath, `store: ${id}\n`);
    return `Created ${configPath} declaring store "${id}".`;
  }

  const current = readFileSync(configPath, 'utf8');
  const declared = current.match(storeDeclarationPattern)?.[1];
  if (declared === id) return `Unchanged: ${configPath} already declares store "${id}".`;
  if (declared !== undefined) {
    writeAtomic(configPath, current.replace(storeDeclarationPattern, `store: ${id}`));
    return `Replaced the store declaration in ${configPath} with "${id}".`;
  }
  const eol = current.includes('\r\n') ? '\r\n' : '\n';
  const separator = current.length === 0 || current.endsWith('\n') ? '' : eol;
  writeAtomic(configPath, `${current}${separator}store: ${id}${eol}`);
  return `Added the store declaration "${id}" to ${configPath}.`;
}

// Runs the CLI from the code repository and requires it to resolve this store as the OpenSpec root.
function verifyStoreResolution(codeRoot, id) {
  const fix = [
    `  openspec store register "${storeRoot}" --id ${id}`,
    `  and make sure ${codeConfigPath(codeRoot)} contains: store: ${id}`,
  ].join('\n');
  const result = runOpenspec(['context', '--json'], { cwd: codeRoot, capture: true });
  let resolved = null;
  try {
    resolved = JSON.parse(result.stdout ?? '').root?.path ?? null;
  } catch {
    resolved = null;
  }
  if (result.status !== 0 || !resolved) {
    const details = `${result.stderr ?? ''}`.trim();
    throw new Error(`The OpenSpec CLI could not resolve the store from ${codeRoot}.${details ? `\n${details}` : ''}\nFix:\n${fix}`);
  }
  if (realpathSync(resolved) !== realpathSync(storeRoot)) {
    throw new Error(
      `From ${codeRoot} the OpenSpec CLI resolves ${resolved}, not this store (${storeRoot}). ` +
      `An openspec/ folder with specs/ or changes/ in the code repository makes the CLI ignore the declaration.\nFix:\n${fix}`,
    );
  }
  return resolved;
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

  const projectPath = path.join(storeRoot, 'openspec', 'project.md');
  const currentProject = readFileSync(projectPath, 'utf8');

  if (options.register) checkStoreDeclaration(codeRoot, options.registerId, options.force);

  const installArgs = [installScript, codeRoot, '--target', options.target];

  const plan = [
    `Repositório de código: ${codeRoot} (skills e agentes em --target ${options.target})`,
    `Store: ${storeRoot} (project.md e config.yaml continuam neutros até o /opsx:init)`,
    options.name ? `Nome do projeto: ${options.name}` : 'Nome do projeto: preencher depois em openspec/project.md',
    options.register
      ? `Registrar o store nesta máquina como "${options.registerId}" e declará-lo em ${codeConfigPath(codeRoot)}`
      : 'Não registrar o store',
  ];
  if (options.detachRemote) plan.push('Renomear o remote origin do store (repositório do padrão) para "padrao"');
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
  if (options.name && currentProject.includes(namePlaceholder)) {
    writeAtomic(projectPath, currentProject.replaceAll(namePlaceholder, options.name));
    console.log('Updated project name in openspec/project.md');
  } else {
    console.log('Unchanged: openspec/project.md and openspec/config.yaml');
  }
  let remoteNote = '';
  if (options.detachRemote) {
    if (hasRemote('padrao')) {
      console.warn('Warning: the store already has a "padrao" remote; "origin" still points to the standard. Rename or remove it by hand.');
    } else {
      git(['remote', 'rename', 'origin', 'padrao']);
      console.log('Renamed the store remote "origin" (the standard repository) to "padrao".');
      remoteNote = `
  3. O store não tem mais remote "origin". Para publicar o planejamento do projeto, crie um
     repositório para o store e rode: git -C "${storeRoot}" remote add origin <url-do-store>
     Para desfazer a troca: git -C "${storeRoot}" remote rename padrao origin`;
    }
  }

  console.log('\n[3/3] Registro do store...');
  if (options.register) {
    console.log('Running openspec store register (the CLI can take a few seconds)...');
    const register = runOpenspec(['store', 'register', storeRoot, '--id', options.registerId, '--yes']);
    if (register.status !== 0) {
      throw new Error(
        `Store registration failed. Fix the reported problem and run:\n  openspec store register "${storeRoot}" --id ${options.registerId}`,
      );
    }
    console.log(writeStoreDeclaration(codeRoot, options.registerId));
    console.log('Checking that the OpenSpec CLI resolves the store from the code repository...');
    verifyStoreResolution(codeRoot, options.registerId);
    console.log(`Resolved: from ${codeRoot} the OpenSpec CLI uses this store.`);
  } else {
    const id = options.registerId ?? defaultStoreId();
    console.log(`Skipped. The code repository cannot resolve this store until you register and declare it:
  openspec store register "${storeRoot}" --id ${id}
  then add the line "store: ${id}" to ${codeConfigPath(codeRoot)}
or rerun this setup with --register-id ${id}.`);
  }


  console.log(`
Pronto. Próximos passos:
  1. No repositório de código, rode /opsx:init: ele registra a stack, os comandos de
     verificação e as ADRs fundacionais no project.md deste store.
  2. Faça commit das mudanças deste store e do repositório de código.${remoteNote}`);
}

try {
  await main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
