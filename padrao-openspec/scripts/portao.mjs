#!/usr/bin/env node

// The standard's gate: a deterministic answer, the same for any agent, to "may I write code for this
// change?" (apply) and "may I archive it?" (archive). Delivered to the code repository as
// docs/openspec-portao.mjs. The change and its progress come from the OpenSpec CLI, run from the
// current folder, so the store declared in openspec/config.yaml (or --store) is respected.

import { existsSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const EXIT_OK = 0;
const EXIT_BLOCKED = 1;
const EXIT_ERROR = 2;
const hookMarker = '# openspec-padrao commit-msg hook';
const trailerPattern = /^OpenSpec-Change:[ \t]*(\S+)[ \t]*$/m;

function usage() {
  console.log(`Uso: node docs/openspec-portao.mjs <apply|archive> <change> [--json] [--store <id>]
       node docs/openspec-portao.mjs instalar-hook

  apply <change>    libera escrever código só com a aprovação completa no proposal
  archive <change>  libera arquivar só com escopo archive, tarefas marcadas, verification.md
                    e, numa change com commits de código, review.md
  instalar-hook     instala um hook commit-msg que recusa commits "OpenSpec-Change: <change>"
                    de changes que o portão de apply não libera

Saída: 0 libera, 1 bloqueia (com os motivos), 2 erro de uso ou de ambiente.`);
}

function parseArgs(args) {
  const options = { action: null, change: null, json: false, store: null };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--json') options.json = true;
    else if (arg === '--store') {
      options.store = args[index + 1];
      if (!options.store || options.store.startsWith('--')) throw new UsageError('--store precisa de um id.');
      index += 1;
    } else if (arg === '-h' || arg === '--help') options.help = true;
    else if (arg.startsWith('-')) throw new UsageError(`Opção desconhecida: ${arg}`);
    else if (options.action === null) options.action = arg;
    else if (options.change === null) options.change = arg;
    else throw new UsageError(`Argumento inesperado: ${arg}`);
  }
  return options;
}

class UsageError extends Error {}

function quoteForShell(value) {
  if (value.includes('"')) throw new UsageError(`Caractere não suportado em argumento: ${value}`);
  return `"${value}"`;
}

// On Windows the OpenSpec CLI is a .cmd shim, which spawnSync can only start through a shell.
function openspecJson(args, store) {
  const full = [...args, '--json', ...(store ? ['--store', store] : [])];
  const options = { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] };
  const result = process.platform === 'win32'
    ? spawnSync(['openspec', ...full.map(quoteForShell)].join(' '), { ...options, shell: true })
    : spawnSync('openspec', full, options);
  if (result.error) throw new UsageError('OpenSpec CLI não encontrado. Instale com: npm install -g @fission-ai/openspec@1.14.2');
  try {
    return JSON.parse(result.stdout);
  } catch {
    const details = `${result.stderr ?? ''}${result.stdout ?? ''}`.trim();
    throw new UsageError(`O OpenSpec CLI não respondeu em JSON.${details ? `\n${details}` : ''}`);
  }
}

function resolveChange(change, store) {
  const status = openspecJson(['status', '--change', change], store);
  if (!status.changeRoot || !existsSync(status.changeRoot)) {
    const message = status.message ?? status.error ?? status.status?.map?.((item) => item.message).join(' ') ?? '';
    throw new UsageError(
      `Não encontrei a change "${change}".${message ? ` ${message}` : ''}\n` +
      'Rode o portão na pasta do código, que declara o store (linha store: de openspec/config.yaml), ou passe --store <id>.',
    );
  }
  return status.changeRoot;
}

// Reads the "## Aprovação" section: plain "- Chave: valor" items.
function readApproval(changeRoot) {
  const proposal = path.join(changeRoot, 'proposal.md');
  if (!existsSync(proposal)) return null;
  const text = readFileSync(proposal, 'utf8').replace(/\r\n/g, '\n');
  const start = text.search(/^## Aprovação[ \t]*$/m);
  if (start < 0) return null;
  const rest = text.slice(start).split('\n').slice(1);
  const end = rest.findIndex((line) => /^## /.test(line));
  const fields = {};
  for (const line of end < 0 ? rest : rest.slice(0, end)) {
    const match = line.match(/^-\s+([^:]+):\s*(.*)$/);
    if (match) fields[match[1].trim().toLowerCase()] = match[2].trim();
  }
  return fields;
}

const filled = (value) => Boolean(value) && value !== '—' && value !== '-' && value.toLowerCase() !== 'pendente';

function approvalReasons(fields) {
  if (!fields) return ['O proposal não tem a seção "## Aprovação". Peça a aprovação explícita do responsável e registre-a.'];
  const reasons = [];
  if (!filled(fields['responsável'])) reasons.push('A aprovação está pendente (Responsável: Pendente). Peça a aprovação explícita do responsável no chat e registre-a.');
  if (!filled(fields.data)) reasons.push('A aprovação não tem Data.');
  if (!/^(apply|archive)\b/i.test(fields.escopo ?? '')) reasons.push('A aprovação não tem Escopo (apply ou archive).');
  if (!filled(fields.origem)) reasons.push('A aprovação não tem Origem (a frase do responsável).');
  return reasons;
}

function commitsOfChange(change) {
  const result = spawnSync('git', ['log', '--format=%H', `--grep=OpenSpec-Change: ${change}`], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim().split('\n').filter(Boolean) : [];
}

function check(action, change, store) {
  const changeRoot = resolveChange(change, store);
  const fields = readApproval(changeRoot);
  const reasons = approvalReasons(fields);
  if (action === 'archive') {
    const archiveScope = /^archive\b/i.test(fields?.escopo ?? '') || filled(fields?.archive);
    if (fields && !archiveScope) {
      reasons.push('O escopo aprovado não é archive. Peça ao responsável a confirmação do archive e registre-a no item "Archive:".');
    }
    const progress = openspecJson(['instructions', 'apply', '--change', change], store).progress;
    if (!progress) reasons.push('Não consegui ler o progresso das tarefas pelo OpenSpec CLI.');
    else if (progress.remaining > 0) reasons.push(`Há ${progress.remaining} tarefa(s) sem marcar de ${progress.total}.`);
    if (!existsSync(path.join(changeRoot, 'verification.md'))) {
      reasons.push('Falta o verification.md: rode o fluxo de verify (.claude/commands/opsx/verify.md) antes de arquivar.');
    }
    if (commitsOfChange(change).length > 0 && !existsSync(path.join(changeRoot, 'review.md'))) {
      reasons.push('A change tem commits de código e falta o review.md: faça a revisão de código (passo 6a do apply).');
    }
  }
  return { ok: reasons.length === 0, acao: action, change, motivos: reasons };
}

function installHook() {
  const top = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' });
  const hooks = spawnSync('git', ['rev-parse', '--git-path', 'hooks'], { encoding: 'utf8' });
  if (top.status !== 0 || hooks.status !== 0) throw new UsageError('Rode o instalar-hook dentro do repositório de código.');
  const hookPath = path.resolve(hooks.stdout.trim(), 'commit-msg');
  if (existsSync(hookPath) && !readFileSync(hookPath, 'utf8').includes(hookMarker)) {
    throw new UsageError(`Já existe um hook commit-msg que não é o do padrão: ${hookPath}. Junte os dois à mão.`);
  }
  writeFileSync(hookPath, `#!/bin/sh\n${hookMarker}\nexec node "$(git rev-parse --show-toplevel)/docs/openspec-portao.mjs" commit-msg "$1"\n`);
  try {
    chmodSync(hookPath, 0o755);
  } catch {
    // Windows does not need the executable bit; Git for Windows runs hooks through its shell.
  }
  console.log(`Hook instalado: ${hookPath}`);
}

// Called by the hook: only commits that name a change are checked.
function commitMsg(file, store) {
  const message = readFileSync(file, 'utf8');
  const match = message.match(trailerPattern);
  if (!match) return EXIT_OK;
  const result = check('apply', match[1], store);
  if (result.ok) return EXIT_OK;
  console.error(`Commit recusado pelo portão do padrão (change ${match[1]}):`);
  for (const reason of result.motivos) console.error(`  - ${reason}`);
  return EXIT_BLOCKED;
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
    if (options.help || !options.action) {
      usage();
      return options.help ? EXIT_OK : EXIT_ERROR;
    }
    if (options.action === 'instalar-hook') {
      installHook();
      return EXIT_OK;
    }
    if (options.action === 'commit-msg') return commitMsg(options.change, options.store);
    if (!['apply', 'archive'].includes(options.action)) throw new UsageError(`Ação desconhecida: ${options.action}`);
    if (!options.change) throw new UsageError(`Falta o nome da change: node docs/openspec-portao.mjs ${options.action} <change>`);
    const result = check(options.action, options.change, options.store);
    if (options.json) console.log(JSON.stringify(result));
    else if (result.ok) console.log(`✔ liberado: ${options.action} da change ${options.change}`);
    else {
      console.log(`✗ bloqueado: ${options.action} da change ${options.change}`);
      for (const reason of result.motivos) console.log(`  - ${reason}`);
    }
    return result.ok ? EXIT_OK : EXIT_BLOCKED;
  } catch (error) {
    if (options?.json) console.log(JSON.stringify({ ok: false, erro: error.message }));
    else console.error(`Erro: ${error.message}`);
    return EXIT_ERROR;
  }
}

process.exitCode = main();
