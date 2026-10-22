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
const trailerKey = 'OpenSpec-Change';
// Change and store ids follow OpenSpec's kebab-case names; validating them first also keeps them safe
// for the Windows shell and for git's --grep.
const idPattern = /^[a-z0-9][a-z0-9-]*$/i;

class UsageError extends Error {}

function usage() {
  return `Uso: node docs/openspec-portao.mjs <apply|archive> <change> [--json] [--store <id>]
       node docs/openspec-portao.mjs instalar-hook

  apply <change>    libera escrever código só com a aprovação completa no proposal
  archive <change>  libera arquivar só com escopo archive, tarefas marcadas, verification.md
                    e, numa change com commits de código, review.md
  instalar-hook     instala um hook commit-msg que recusa commits "OpenSpec-Change: <change>"
                    de changes que o portão de apply bloqueia

Saída: 0 libera, 1 bloqueia (com os motivos), 2 erro de uso ou de ambiente.
--json: {"ok":bool,"acao":"...","change":"...|null","motivos":[...],"erro":"..."} (erro só na saída 2).`;
}

function parseArgs(args) {
  const options = { action: null, change: null, json: false, store: null };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--json') options.json = true;
    else if (arg === '--store') {
      options.store = args[index + 1] ?? null;
      index += 1;
    } else if (arg === '-h' || arg === '--help') options.help = true;
    else if (arg.startsWith('-')) options.unknown = arg;
    else if (options.action === null) options.action = arg;
    else if (options.change === null) options.change = arg;
    else options.extra = arg;
  }
  return options;
}

function validateOptions(options) {
  if (options.unknown) throw new UsageError(`Opção desconhecida: ${options.unknown}`);
  if (options.extra) throw new UsageError(`Argumento inesperado: ${options.extra}`);
  if (options.store !== null && !idPattern.test(options.store)) throw new UsageError('--store precisa de um id válido (letras, dígitos e hífens).');
  if (!options.action) throw new UsageError(`Falta a ação.\n${usage()}`);
}

function validateChange(change, action) {
  if (!change) throw new UsageError(`Falta o nome da change: node docs/openspec-portao.mjs ${action} <change>`);
  if (!idPattern.test(change)) throw new UsageError(`Nome de change inválido: "${change}" (use letras, dígitos e hífens).`);
}

// On Windows the OpenSpec CLI is a .cmd shim, which spawnSync can only start through a shell; every
// argument here was validated against idPattern or is a fixed word.
function openspecJson(args, store) {
  const full = [...args, '--json', ...(store ? ['--store', store] : [])];
  const options = { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] };
  const result = process.platform === 'win32'
    ? spawnSync(['openspec', ...full.map((value) => `"${value}"`)].join(' '), { ...options, shell: true })
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

// Markdown decoration (backticks, bold, italics) is not part of the value.
const clean = (value) => `${value ?? ''}`.replace(/[`*_]/g, '').trim();

// Reads the "## Aprovação" section: plain "- Chave: valor" items.
function readApproval(changeRoot) {
  const proposal = path.join(changeRoot, 'proposal.md');
  if (!existsSync(proposal)) return null;
  const text = readFileSync(proposal, 'utf8').normalize('NFC').replace(/\r\n/g, '\n');
  const start = text.search(/^## Aprovação[ \t]*$/m);
  if (start < 0) return null;
  const rest = text.slice(start).split('\n').slice(1);
  const end = rest.findIndex((line) => /^## /.test(line));
  const fields = {};
  for (const line of end < 0 ? rest : rest.slice(0, end)) {
    const match = line.match(/^-\s+([^:]+):\s*(.*)$/);
    if (match) fields[clean(match[1]).toLowerCase()] = clean(match[2]);
  }
  return fields;
}

// An empty value, a dash placeholder or anything that starts with "Pendente" is not filled.
const filled = (value) => {
  const text = clean(value);
  return text !== '' && !/^[-—–]+$/.test(text) && !/^(pendente|n\/?a)\b/i.test(text);
};

function approvalReasons(fields) {
  if (!fields) return ['O proposal não tem a seção "## Aprovação". Peça a aprovação explícita do responsável e registre-a.'];
  const reasons = [];
  if (!filled(fields['responsável'])) reasons.push('A aprovação está pendente (Responsável vazio ou "Pendente"). Peça a aprovação explícita do responsável no chat e registre-a.');
  if (!filled(fields.data)) reasons.push('A aprovação não tem Data.');
  if (!/\b(apply|archive)\b/i.test(fields.escopo ?? '')) reasons.push('A aprovação não tem Escopo (apply ou archive).');
  if (!filled(fields.origem)) reasons.push('A aprovação não tem Origem (a frase do responsável).');
  return reasons;
}

function git(args) {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  return result.status === 0 ? result.stdout : null;
}

// Commits of the current repository whose last OpenSpec-Change trailer is exactly this change and that
// touch something outside openspec/ (planning commits in a single-repository project do not count).
function codeCommitsOfChange(change) {
  if (git(['rev-parse', '--is-inside-work-tree'])?.trim() !== 'true') {
    throw new UsageError('Rode o portão de archive dentro do repositório de código: ele confere os commits da change.');
  }
  const log = git(['log', `--format=%H%x00%(trailers:key=${trailerKey},valueonly,separator=%x01)%x02`]) ?? '';
  const commits = log.split('\x02').map((entry) => entry.trim()).filter(Boolean)
    .map((entry) => entry.split('\x00'))
    .filter(([, trailers]) => (trailers ?? '').split('\x01').map((value) => value.trim()).includes(change))
    .map(([sha]) => sha);
  return commits.filter((sha) => (git(['show', '--name-only', '--format=', sha]) ?? '')
    .split('\n').map((file) => file.trim()).filter(Boolean)
    .some((file) => !file.startsWith('openspec/')));
}

function check(action, change, store) {
  const changeRoot = resolveChange(change, store);
  const fields = readApproval(changeRoot);
  const reasons = approvalReasons(fields);
  if (action === 'archive') {
    const archiveScope = /\barchive\b/i.test(fields?.escopo ?? '') || filled(fields?.archive);
    if (fields && !archiveScope) {
      reasons.push('O escopo aprovado não é archive. Peça ao responsável a confirmação do archive, registre-a no item "Archive:" e rode o portão de novo.');
    }
    const progress = openspecJson(['instructions', 'apply', '--change', change], store).progress;
    if (!progress) reasons.push('Não consegui ler o progresso das tarefas pelo OpenSpec CLI.');
    else if (progress.remaining > 0) reasons.push(`Há ${progress.remaining} tarefa(s) sem marcar de ${progress.total}.`);
    if (!existsSync(path.join(changeRoot, 'verification.md'))) {
      reasons.push('Falta o verification.md: rode o fluxo de verify (.claude/commands/opsx/verify.md) antes de arquivar.');
    }
    if (codeCommitsOfChange(change).length > 0 && !existsSync(path.join(changeRoot, 'review.md'))) {
      reasons.push('A change tem commits de código e falta o review.md: faça a revisão de código (passo 6a do apply).');
    }
  }
  return { ok: reasons.length === 0, acao: action, change, motivos: reasons };
}

function installHook() {
  const top = git(['rev-parse', '--show-toplevel']);
  const hooks = git(['rev-parse', '--git-path', 'hooks']);
  if (top === null || hooks === null) throw new UsageError('Rode o instalar-hook dentro do repositório de código.');
  const hookPath = path.resolve(hooks.trim(), 'commit-msg');
  if (existsSync(hookPath) && !readFileSync(hookPath, 'utf8').includes(hookMarker)) {
    throw new UsageError(`Já existe um hook commit-msg que não é o do padrão: ${hookPath}. Junte os dois à mão.`);
  }
  // The hook never blocks when the gate, node or a trailer is missing: only a real "blocked" (1) refuses.
  writeFileSync(hookPath, [
    '#!/bin/sh',
    hookMarker,
    'gate="$(git rev-parse --show-toplevel)/docs/openspec-portao.mjs"',
    '[ -f "$gate" ] || exit 0',
    `grep -q '^${trailerKey}:' "$1" || exit 0`,
    'command -v node >/dev/null 2>&1 || exit 0',
    'exec node "$gate" commit-msg "$1"',
    '',
  ].join('\n'));
  try {
    chmodSync(hookPath, 0o755);
  } catch {
    // Windows does not need the executable bit; Git for Windows runs hooks through its shell.
  }
  return hookPath;
}

// Called by the hook. Only a commit that names an active change, touches something outside openspec/
// and whose change the apply gate blocks is refused; an archived change (rework fix commits) passes.
function commitMsg(file, store) {
  const lines = readFileSync(file, 'utf8').replace(/\r\n/g, '\n').split('\n').filter((line) => !line.startsWith('#'));
  const trailers = lines.map((line) => line.match(new RegExp(`^${trailerKey}:[ \\t]*(\\S+)[ \\t]*$`))).filter(Boolean);
  if (trailers.length === 0) return EXIT_OK;
  const change = trailers[trailers.length - 1][1];
  if (!idPattern.test(change)) return EXIT_OK;
  const staged = (git(['diff', '--cached', '--name-only']) ?? '').split('\n').map((name) => name.trim()).filter(Boolean);
  if (staged.length > 0 && staged.every((name) => name.startsWith('openspec/'))) return EXIT_OK;
  let result;
  try {
    result = check('apply', change, store);
  } catch {
    return EXIT_OK;
  }
  if (result.ok) return EXIT_OK;
  console.error(`Commit recusado pelo portão do padrão (change ${change}):`);
  for (const reason of result.motivos) console.error(`  - ${reason}`);
  return EXIT_BLOCKED;
}

function report(options, result, code) {
  if (options.json) {
    console.log(JSON.stringify(result));
  } else if (code === EXIT_ERROR) {
    console.error(`Erro: ${result.erro}`);
  } else if (result.ok) {
    console.log(`✔ liberado: ${result.acao} da change ${result.change}`);
  } else {
    console.log(`✗ bloqueado: ${result.acao} da change ${result.change}`);
    for (const reason of result.motivos) console.log(`  - ${reason}`);
  }
  return code;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const base = { acao: options.action, change: options.change ?? null };
  try {
    if (options.help) {
      if (options.json) return report(options, { ok: true, ...base, motivos: [], ajuda: usage() }, EXIT_OK);
      console.log(usage());
      return EXIT_OK;
    }
    validateOptions(options);
    if (options.action === 'instalar-hook') {
      const hookPath = installHook();
      if (options.json) return report(options, { ok: true, ...base, motivos: [], hook: hookPath }, EXIT_OK);
      console.log(`Hook instalado: ${hookPath}`);
      return EXIT_OK;
    }
    if (options.action === 'commit-msg') return commitMsg(options.change, options.store);
    if (!['apply', 'archive'].includes(options.action)) throw new UsageError(`Ação desconhecida: ${options.action}\n${usage()}`);
    validateChange(options.change, options.action);
    const result = check(options.action, options.change, options.store);
    return report(options, result, result.ok ? EXIT_OK : EXIT_BLOCKED);
  } catch (error) {
    return report(options, { ok: false, ...base, motivos: [error.message], erro: error.message }, EXIT_ERROR);
  }
}

process.exitCode = main();
