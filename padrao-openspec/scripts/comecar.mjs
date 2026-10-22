#!/usr/bin/env node

// Entry point for a developer who only has the standard's link. Downloaded alone from the
// latest release, it creates a new project (one clone of the standard, at the latest tag) or
// joins a project in progress (clones its code and store and registers the store).

import { existsSync, mkdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const defaultSource = 'https://github.com/Gilmar1987/PadraoOpenspct';
const cliVersion = '1.14.2';
const cliPackage = `@fission-ai/openspec@${cliVersion}`;
const idPattern = /^[a-z0-9][a-z0-9-]*$/;
const storeDeclarationPattern = /^store:[ \t]*["']?([^"'\s#]*)["']?[ \t]*(?:#.*)?$/m;
const syncedFolderPattern = /^(onedrive\b.*|dropbox\b.*|google ?drive\b.*|googledrive\b.*|my drive|meu drive|icloud\b.*|mobile documents|cloudstorage)$/i;
// git init -b needs Git 2.28.
const minGit = [2, 28];

function usage() {
  console.log(`Uso: node comecar.mjs [opções]

Cria um projeto novo com o padrão OpenSpec ou entra num projeto que já usa o padrão.
Sem opções, o script pergunta tudo. Sem terminal interativo, informe as respostas por opção.

Opções:
  --modo <novo|existente>   Projeto novo ou projeto em andamento
  --pasta <dir>             Pasta onde os repositórios ficam (sugestão: a pasta atual)
  --nome <texto>            Projeto novo: nome do projeto
  --id <id>                 Projeto novo: id usado nas pastas e no store (sugestão: derivado do nome)
  --codigo <dir>            Projeto novo: pasta do código já criada por um gerador de projeto
  --url-codigo <url>        Projeto em andamento: URL do repositório de código
  --url-store <url>         Projeto em andamento: URL do repositório do store
  --yes                     Não pedir confirmações
  --origem <url-ou-pasta>   Repositório do padrão (padrão: ${defaultSource})
  --tag <vX.Y.Z>            Release do padrão (padrão: a mais recente)
  -h, --help                Mostra esta ajuda`);
}

function parseArgs(args) {
  const options = {
    modo: null, pasta: null, nome: null, id: null, codigo: null, urlCodigo: null, urlStore: null,
    yes: false, origem: defaultSource, tag: null,
  };
  const valued = {
    '--modo': 'modo', '--pasta': 'pasta', '--nome': 'nome', '--id': 'id', '--codigo': 'codigo',
    '--url-codigo': 'urlCodigo', '--url-store': 'urlStore', '--origem': 'origem', '--tag': 'tag',
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--yes') options.yes = true;
    else if (valued[arg]) {
      const value = args[index + 1];
      if (value === undefined || value.startsWith('--')) throw new Error(`${arg} precisa de um valor.`);
      options[valued[arg]] = value;
      index += 1;
    } else throw new Error(`Opção desconhecida: ${arg}`);
  }
  if (options.modo !== null && !['novo', 'existente'].includes(options.modo)) {
    throw new Error(`--modo inválido: "${options.modo}". Use novo ou existente.`);
  }
  if (options.id !== null && !idPattern.test(options.id)) throw new Error(invalidIdMessage(options.id));
  if (options.tag !== null && !/^v\d+\.\d+\.\d+$/.test(options.tag)) {
    throw new Error(`--tag inválida: "${options.tag}". Use vX.Y.Z.`);
  }
  return options;
}

function invalidIdMessage(id) {
  return `Id inválido: "${id}". Use letras minúsculas, dígitos e hífens, começando por letra ou dígito (--id).`;
}

// Reads answers through the line iterator, which buffers lines; rl.question drops lines that
// arrive before the question is asked (for example, several answers pasted at once).
// node:readline/promises only exists from Node 17, so it is loaded after the version check.
async function createPrompter() {
  const { default: readline } = await import('node:readline/promises');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const lines = rl[Symbol.asyncIterator]();
  return {
    async question(prompt) {
      // The readline prompt, not a plain write: a real console redraws the line with it.
      rl.setPrompt(prompt);
      rl.prompt();
      const { value, done } = await lines.next();
      if (done) throw new Error('A entrada terminou antes de todas as respostas.');
      return value.trim();
    },
    close: () => rl.close(),
  };
}

// Asks a free-text question. Without a terminal, a missing answer stops with the option to pass.
async function ask(rl, prompt, option, suggestion = null) {
  if (!rl) {
    if (suggestion !== null) return suggestion;
    throw new Error(`Falta ${option}: sem terminal interativo, informe a resposta por opção.`);
  }
  for (;;) {
    const answer = await rl.question(suggestion !== null ? `${prompt} [${suggestion}]: ` : `${prompt}: `);
    if (answer) return answer;
    if (suggestion !== null) return suggestion;
  }
}

async function askYesNo(rl, prompt, options, { defaultYes = true } = {}) {
  if (options.yes) return true;
  if (!rl) throw new Error(`Falta --yes: sem terminal interativo para responder "${prompt}".`);
  const answer = (await rl.question(`${prompt} ${defaultYes ? '[S/n]' : '[s/N]'}: `)).toLowerCase();
  if (answer === '') return defaultYes;
  return answer.startsWith('s') || answer.startsWith('y');
}

function quoteForShell(value) {
  if (value.includes('"')) throw new Error(`Caractere não suportado em argumento: ${value}`);
  return `"${value}"`;
}

// On Windows npm and the OpenSpec CLI are .cmd shims, which spawnSync can only start through a shell.
function runTool(command, args, { cwd = process.cwd(), capture = false } = {}) {
  const spawnOptions = capture
    ? { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    : { cwd, stdio: 'inherit' };
  return process.platform === 'win32'
    ? spawnSync([command, ...args.map(quoteForShell)].join(' '), { ...spawnOptions, shell: true })
    : spawnSync(command, args, spawnOptions);
}

function git(args, { capture = false } = {}) {
  const result = spawnSync('git', args, capture
    ? { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    : { stdio: 'inherit' });
  if (result.error || result.status !== 0) {
    const details = capture ? `${result.stderr ?? ''}`.trim() : '';
    throw new Error(`git ${args[0]} falhou.${details ? `\n${details}` : ''}`);
  }
  return capture ? result.stdout.trim() : '';
}

function toolVersion(command, args) {
  const result = command === 'git' ? spawnSync('git', args, { encoding: 'utf8' }) : runTool(command, args, { capture: true });
  if (result.error || result.status !== 0) return null;
  return (`${result.stdout}`.match(/\d+\.\d+\.\d+/) ?? [`${result.stdout}`.trim()])[0];
}

function line(label, value, status) {
  console.log(`  ${label.padEnd(14, '.')} ${value.padEnd(9)} ${status}`);
}

async function checkEnvironment(rl, options) {
  console.log('Conferindo o ambiente...');
  const gitVersion = toolVersion('git', ['--version']);
  if (!gitVersion) throw new Error('Git não encontrado. Instale o Git (https://git-scm.com/downloads) e rode o script de novo.');
  const [major, minor] = gitVersion.split('.').map(Number);
  if (major < minGit[0] || (major === minGit[0] && minor < minGit[1])) {
    throw new Error(`Git ${gitVersion} é antigo. Atualize para ${minGit.join('.')} ou mais recente (https://git-scm.com/downloads).`);
  }
  line('Git ', gitVersion, 'ok');
  line('Node.js ', process.versions.node, 'ok');

  let cli = toolVersion('openspec', ['--version']);
  if (!cli) {
    line('OpenSpec CLI ', '—', 'não encontrado');
    const install = await askYesNo(rl, `Instalar o OpenSpec CLI ${cliVersion} agora (npm install -g ${cliPackage})?`, options);
    if (!install) throw new Error(`Instale o OpenSpec CLI com: npm install -g ${cliPackage}`);
    const result = runTool('npm', ['install', '-g', cliPackage]);
    cli = result.status === 0 ? toolVersion('openspec', ['--version']) : null;
    if (!cli) throw new Error(`A instalação do OpenSpec CLI falhou. Rode à mão: npm install -g ${cliPackage}`);
  }
  line('OpenSpec CLI ', cli, cli === cliVersion ? 'ok' : `ok (o padrão usa ${cliVersion})`);
}

function slugify(name) {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function isSyncedFolder(dir) {
  if (dir.split(/[\\/]+/).some((segment) => syncedFolderPattern.test(segment))) return true;
  const roots = [process.env.OneDrive, process.env.OneDriveCommercial, process.env.OneDriveConsumer].filter(Boolean);
  const normalize = (value) => (process.platform === 'win32' ? path.resolve(value).toLowerCase() : path.resolve(value));
  return roots.some((root) => {
    const relative = path.relative(normalize(root), normalize(dir));
    return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
  });
}

async function askBaseFolder(rl, options) {
  const base = path.resolve(options.pasta ?? await ask(rl, 'Pasta onde os repositórios vão ficar', '--pasta', process.cwd()));
  const plan = [];
  if (existsSync(base)) {
    if (!statSync(base).isDirectory()) throw new Error(`${base} existe e não é uma pasta.`);
  } else {
    if (!await askYesNo(rl, `A pasta ${base} não existe. Criar?`, options)) throw new Error('Nada foi criado.');
    plan.push(`Criar a pasta ${base}`);
  }
  if (isSyncedFolder(base)) {
    console.warn(`Aviso: ${base} parece sincronizada (OneDrive, Dropbox, Google Drive ou iCloud). A sincronização pode travar arquivos do Git e deixar o npm lento.`);
    if (!options.yes && !await askYesNo(rl, 'Continuar mesmo assim?', options, { defaultYes: false })) {
      throw new Error('Nada foi criado. Escolha uma pasta fora da sincronização.');
    }
  }
  return { base, plan };
}

function refuseExisting(dir) {
  if (existsSync(dir)) throw new Error(`A pasta ${dir} já existe. Nada foi alterado; escolha outro id ou outra pasta base.`);
}

function latestTag(source) {
  const refs = git(['ls-remote', '--tags', '--refs', '--', source, 'v*'], { capture: true });
  const versions = [...refs.matchAll(/refs\/tags\/v(\d+)\.(\d+)\.(\d+)$/gm)].map((match) => match.slice(1).map(Number));
  if (versions.length === 0) throw new Error(`Nenhuma release vX.Y.Z encontrada em ${source}.`);
  versions.sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2]);
  return `v${versions[0].join('.')}`;
}

async function confirmPlan(rl, plan, options) {
  console.log('\nResumo:');
  for (const item of plan) console.log(`  - ${item}`);
  if (!await askYesNo(rl, '\nConfirmar?', options)) throw new Error('Nada foi criado.');
}

// Steps already done, listed when a later step fails so the developer knows what to remove.
const progress = { done: [], created: [] };

function step(message, action) {
  action();
  progress.done.push(message);
  console.log(`  ✔ ${message}`);
}

// The /opsx:* commands live in <code>/.claude/commands, so Claude Code only loads them when the
// code folder itself is the workspace, not a folder above it.
function openWorkspaceSteps(codeDir, next) {
  const hasCode = runTool('code', ['--version'], { capture: true }).status === 0;
  return [
    '  1. Abra a pasta do projeto como pasta do workspace (não a pasta acima dela):',
    ...(hasCode ? [`       code "${codeDir}"`, `     ou, no VS Code: File → Open Folder → ${codeDir}`] : [`       no VS Code: File → Open Folder → ${codeDir}`]),
    `  2. Nessa janela, abra o Claude Code e ${next}`,
    '     Se /opsx não aparecer, o Claude Code foi aberto em outra pasta.',
  ].join('\n');
}

async function newProject(rl, options) {
  const { base, plan } = await askBaseFolder(rl, options);
  const name = options.nome ?? await ask(rl, 'Nome do projeto, como as pessoas o chamam', '--nome');
  let id = options.id;
  while (id === null) {
    const answer = await ask(rl, 'Id do projeto, usado nas pastas e no store', '--id', slugify(name) || null);
    if (idPattern.test(answer)) id = answer;
    else if (!rl) throw new Error(invalidIdMessage(answer));
    else console.log(invalidIdMessage(answer));
  }

  let generated = options.codigo;
  if (generated === null && rl) {
    generated = (await rl.question(`Pasta do código já criada por um gerador de projeto (Enter para criar ${path.join(base, id)}): `)) || null;
  }
  const storeDir = path.join(base, `${id}-openspec`);
  const codeDir = generated ? path.resolve(base, generated) : path.join(base, id);
  refuseExisting(storeDir);
  if (generated) {
    if (!existsSync(codeDir) || !statSync(codeDir).isDirectory()) throw new Error(`A pasta do código ${codeDir} não existe.`);
  } else {
    refuseExisting(codeDir);
  }

  refuseRegisteredId(id);
  const tag = options.tag ?? latestTag(options.origem);
  plan.push(
    `Store: ${storeDir} (clone da release ${tag} de ${options.origem}, branch main)`,
    generated ? `Código: ${codeDir} (pasta existente)` : `Código: ${codeDir} (repositório novo, branch main)`,
    `Setup: comandos /opsx:*, skills e agentes no código; store registrado como "${id}"`,
  );
  await confirmPlan(rl, plan, options);

  console.log('');
  if (!existsSync(base)) {
    step(`Pasta ${base} criada`, () => mkdirSync(base, { recursive: true }));
    progress.created.push(base);
  }
  step(`Store clonado da ${tag}`, () => {
    git(['-c', 'advice.detachedHead=false', 'clone', '--branch', tag, '--', options.origem, storeDir]);
    progress.created.push(storeDir);
  });
  step('Branch main criada no store', () => git(['-C', storeDir, 'switch', '-q', '-c', 'main']));
  if (!existsSync(path.join(codeDir, '.git'))) {
    step('Repositório de código criado', () => {
      if (!generated) {
        mkdirSync(codeDir);
        progress.created.push(codeDir);
      }
      git(['init', '-q', '-b', 'main', codeDir]);
    });
  }
  console.log('  … Rodando o setup (pode levar alguns segundos)');
  step('Setup concluído (skills, comandos e agentes no código; store registrado e ligado ao código)', () => {
    const setup = path.join(storeDir, 'padrao-openspec', 'scripts', 'setup-project.mjs');
    // The setup's own summary and next steps would repeat this script's; show them only on failure.
    const result = spawnSync(process.execPath, [setup, codeDir, '--name', name, '--register-id', id, '--yes'], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    });
    if (result.status !== 0) throw new Error(`O setup falhou:\n${`${result.stdout ?? ''}${result.stderr ?? ''}`.trim()}`);
  });

  console.log(`
Pronto. Próximo passo:
${openWorkspaceSteps(codeDir, 'rode: /opsx:init')}
Depois do init, commite os dois repositórios e crie os remotos (veja o COMECE-AQUI.md, "Commitar e publicar").
No GitHub do código, ligue Settings → Actions → General → "Allow GitHub Actions to create and approve
pull requests" para receber as atualizações do padrão por PR.`);
}

function repoName(url) {
  const name = url.replace(/[\\/]+$/, '').split(/[\\/:]/).pop().replace(/\.git$/i, '');
  if (!name) throw new Error(`Não foi possível tirar o nome do repositório da URL ${url}.`);
  return name;
}

function readStoreId(codeDir) {
  for (const file of ['config.yaml', 'config.yml']) {
    const config = path.join(codeDir, 'openspec', file);
    if (existsSync(config)) {
      const match = readFileSync(config, 'utf8').match(storeDeclarationPattern);
      if (match?.[1]) {
        if (!idPattern.test(match[1])) throw new Error(`O código declara um id de store inválido: "${match[1]}" (${config}).`);
        return match[1];
      }
    }
  }
  throw new Error(
    `O código não declara um store (linha "store:" em ${path.join(codeDir, 'openspec', 'config.yaml')}). ` +
    'Peça ao tech lead para rodar o setup no projeto e commitar o openspec/config.yaml. Nenhum store foi registrado.',
  );
}

function registeredStores() {
  const result = runTool('openspec', ['store', 'list', '--json'], { capture: true });
  try {
    return JSON.parse(result.stdout).stores ?? [];
  } catch {
    return [];
  }
}

function refuseRegisteredId(id) {
  const existing = registeredStores().find((store) => store.id === id);
  if (existing) {
    throw new Error(
      `O id "${id}" já está registrado nesta máquina para ${existing.root}. ` +
      `Se esse registro é antigo, rode "openspec store unregister ${id}" e rode o script de novo.`,
    );
  }
}

function storeRootOf(storeDir) {
  for (const candidate of [path.join(storeDir, 'padrao-openspec'), storeDir]) {
    if (existsSync(path.join(candidate, 'openspec'))) return candidate;
  }
  throw new Error(`${storeDir} não tem a pasta openspec/: a URL informada não parece ser de um store.`);
}

function resolvedRoot(codeDir) {
  const result = runTool('openspec', ['context', '--json'], { cwd: codeDir, capture: true });
  try {
    return realpathSync.native(JSON.parse(result.stdout).root.path);
  } catch {
    return null;
  }
}

async function joinProject(rl, options) {
  const { base, plan } = await askBaseFolder(rl, options);
  const urlCodigo = options.urlCodigo ?? await ask(rl, 'URL do repositório de código', '--url-codigo');
  const urlStore = options.urlStore ?? await ask(rl, 'URL do repositório do store', '--url-store');
  const codeName = repoName(urlCodigo);
  let storeName = repoName(urlStore);
  if (storeName === codeName) storeName = `${storeName}-openspec`;
  const codeDir = path.join(base, codeName);
  const storeDir = path.join(base, storeName);
  refuseExisting(codeDir);
  refuseExisting(storeDir);

  plan.push(`Código: ${codeDir} (clone de ${urlCodigo})`, `Store: ${storeDir} (clone de ${urlStore})`,
    'Registrar o store nesta máquina com o id que o código declara');
  await confirmPlan(rl, plan, options);

  console.log('');
  if (!existsSync(base)) {
    step(`Pasta ${base} criada`, () => mkdirSync(base, { recursive: true }));
    progress.created.push(base);
  }
  step('Código clonado', () => {
    git(['clone', '--', urlCodigo, codeDir]);
    progress.created.push(codeDir);
  });
  const id = readStoreId(codeDir);
  console.log(`  ✔ Id do store lido do código: ${id}`);
  refuseRegisteredId(id);
  step('Store clonado', () => {
    git(['clone', '--', urlStore, storeDir]);
    progress.created.push(storeDir);
  });
  const storeRoot = storeRootOf(storeDir);
  step('Store registrado nesta máquina', () => {
    const result = runTool('openspec', ['store', 'register', storeRoot, '--id', id, '--yes'], { capture: true });
    if (result.status !== 0) {
      throw new Error(`O registro do store falhou.\n${`${result.stdout ?? ''}${result.stderr ?? ''}`.trim()}`);
    }
  });
  step('O CLI encontra o store a partir do código', () => {
    const resolved = resolvedRoot(codeDir);
    // The native realpath normalizes the drive letter, which the CLI reports in upper case.
    if (resolved !== realpathSync.native(storeRoot)) {
      throw new Error(
        `A partir de ${codeDir} o CLI resolve ${resolved ?? 'nada'}, e não ${storeRoot}.\n` +
        `Confira com: openspec store register "${storeRoot}" --id ${id} --yes`,
      );
    }
  });

  console.log(`
Pronto. O projeto já está inicializado: não rode /opsx:init.
${openWorkspaceSteps(codeDir, 'comece pela primeira change: /opsx:propose <nome-da-change>')}`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    return;
  }
  // Checked before anything else: older Node cannot load the prompter.
  if (Number(process.versions.node.split('.')[0]) < 18) {
    throw new Error(`Node.js ${process.versions.node} é antigo. Atualize para 18 ou mais recente (https://nodejs.org).`);
  }
  const rl = process.stdin.isTTY && process.stdout.isTTY ? await createPrompter() : null;
  try {
    console.log('Padrão OpenSpec — comece aqui\n');
    await checkEnvironment(rl, options);
    let modo = options.modo;
    while (modo === null) {
      if (!rl) throw new Error('Falta --modo: sem terminal interativo, informe novo ou existente.');
      const answer = await rl.question('\nO que você vai fazer?\n  1) Criar um projeto novo\n  2) Entrar num projeto que já usa o padrão\n> ');
      modo = { 1: 'novo', 2: 'existente' }[answer] ?? null;
    }
    if (modo === 'novo') await newProject(rl, options);
    else await joinProject(rl, options);
  } finally {
    rl?.close();
  }
}

try {
  await main();
} catch (error) {
  console.error(`\nErro: ${error.message}`);
  if (progress.done.length > 0) {
    console.error('\nJá feito antes do erro:');
    for (const item of progress.done) console.error(`  - ${item}`);
  }
  if (progress.created.length > 0) {
    console.error('\nPastas criadas (apague-as antes de rodar o script de novo):');
    for (const dir of progress.created) console.error(`  - ${dir}`);
  }
  process.exitCode = 1;
}
