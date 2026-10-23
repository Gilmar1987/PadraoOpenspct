#!/usr/bin/env node

// The standard's gate: a deterministic answer, the same for any agent, to "may I write code for this
// change?" (apply) and "may I archive it?" (archive). Delivered to the code repository as
// docs/openspec-portao.mjs. The change and its progress come from the OpenSpec CLI, run from the
// current folder, so the store declared in openspec/config.yaml (or --store) is respected.

import { existsSync, readFileSync, readdirSync, writeFileSync, chmodSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
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
  return `Uso: node docs/openspec-portao.mjs <apply|archive|selo> <change> [--json] [--store <id>]
       node docs/openspec-portao.mjs estado [--json] [--store <id>]
       node docs/openspec-portao.mjs instalar-hook

  apply <change>    libera escrever código só com a aprovação completa no proposal, com o selo
                    do conteúdo em dia e sem inferências [INFERIDO: ...] pendentes
  archive <change>  libera arquivar só com escopo archive, tarefas marcadas, verification.md
                    e, numa change com commits de código, review.md
  selo <change>     imprime o selo (sha256) do planejamento da change, para o item "Conteúdo:"
                    da seção ## Aprovação
  estado            lista as changes ativas com tarefas, aprovação, selo, inferências e o
                    próximo passo do fluxo (sempre sai com 0, ou 2 em erro de ambiente)
  instalar-hook     instala um hook commit-msg que recusa commits "OpenSpec-Change: <change>"
                    de changes que o portão de apply bloqueia

Saída: 0 libera, 1 bloqueia (com os motivos), 2 erro de uso ou de ambiente.
--json: {"ok":bool,"acao":"...","change":"...|null","motivos":[...],"avisos":[...],"erro":"..."}
(avisos só quando houver; erro só na saída 2; selo acrescenta "conteudo" e "arquivos").`;
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
    if (!match) continue;
    const key = clean(match[1]).toLowerCase();
    fields[key] = clean(match[2]);
    // The seal in force is the last one written by an approval: its own "Conteúdo:" item, or the one inside
    // a "Reconfirmação:" or "Archive:" item. "Aprovação anterior" keeps a superseded seal and never counts.
    if (!['conteúdo', 'conteudo', 'reconfirmação', 'reconfirmacao', 'archive'].includes(key)) continue;
    const text = key.startsWith('conte') ? `Conteúdo: ${match[2]}` : match[2];
    if (!/Conte[úu]do:/i.test(text)) continue;
    const seal = text.match(/Conte[úu]do:\s*`?(sha256:[0-9a-f]{64})`?\s*(;|$)/i);
    fields.selo = seal ? seal[1].toLowerCase() : 'ilegível';
  }
  return fields;
}

// Planning files of the change that the approval covers: every .md under the change folder except the
// records written after it (review, verification, interface report) and generated reports.
function planningFiles(changeRoot) {
  const skipFiles = new Set(['review.md', 'verification.md', 'interface-report.md']);
  const skipDirs = new Set(['interface', 'archive']);
  const files = [];
  const walk = (dir, prefix) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      // Hidden entries (the ingest's .inputs/, ignored by git) differ between machines.
      if (entry.name.startsWith('.')) continue;
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) walk(path.join(dir, entry.name), relative);
      } else if (entry.name.endsWith('.md') && !skipFiles.has(entry.name) && !entry.name.startsWith('relatorio')) {
        files.push(relative);
      }
    }
  };
  walk(changeRoot, '');
  return files.sort();
}

const readText = (file) => readFileSync(file, 'utf8').replace(/^﻿/, '').normalize('NFC').replace(/\r\n?/g, '\n');

// What the approval is about, without what the apply legitimately changes: the approval record itself,
// checkbox states and Evidência lines. Line endings, Unicode form and trailing spaces do not count.
function normalizeForSeal(relative, text) {
  let body = text.replace(/[ \t]+$/gm, '');
  if (relative === 'proposal.md') {
    const start = body.search(/^## Aprovação[ \t]*$/m);
    if (start >= 0) {
      const after = body.slice(start).split('\n');
      const next = after.findIndex((line, index) => index > 0 && /^## /.test(line));
      body = body.slice(0, start) + (next < 0 ? '' : after.slice(next).join('\n'));
    }
  }
  return body
    .replace(/^(\s*[-*] )\[[xX]\]/gm, '$1[ ]')
    // Confirming an inference removes its marker; the statement itself stays sealed.
    .replace(/[ \t]?\[INFERIDO:[^\]\n]*\]/gi, '')
    .split('\n').filter((line) => !/^\s+[-*] Evidência:/.test(line)).join('\n');
}

function sealOf(changeRoot) {
  const files = planningFiles(changeRoot);
  const hash = createHash('sha256');
  for (const relative of files) {
    hash.update(`${relative}\0${normalizeForSeal(relative, readText(path.join(changeRoot, relative)))}\0`);
  }
  return { conteudo: `sha256:${hash.digest('hex')}`, arquivos: files };
}

// [INFERIDO: ...] markers outside code: fenced blocks and inline code quote the marker, they do not use it.
function inferenceReasons(changeRoot) {
  const reasons = [];
  for (const relative of planningFiles(changeRoot)) {
    // A fence closes only with the same character, at least as long as the one that opened it.
    let fence = null;
    readText(path.join(changeRoot, relative)).split('\n').forEach((line, index) => {
      const marker = line.match(/^\s*(`{3,}|~{3,})/);
      if (marker) {
        if (!fence) fence = marker[1];
        else if (marker[1][0] === fence[0] && marker[1].length >= fence.length && !line.trim().slice(marker[1].length)) fence = null;
        return;
      }
      if (fence) return;
      const prose = line.replace(/(`+)[\s\S]*?\1/g, '');
      if (/\[INFERIDO:/i.test(prose)) {
        reasons.push(`Inferência não confirmada em ${relative}:${index + 1} ("${line.trim().slice(0, 120)}"). Confirme com o responsável e tire a marca, ou corrija o texto.`);
      }
    });
  }
  return reasons;
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
  const warnings = [];
  if (fields && filled(fields['responsável'])) {
    const seal = sealOf(changeRoot);
    if (!fields.selo) {
      warnings.push('Aprovação sem selo de conteúdo (registrada antes do selo): o portão não confere se o planejamento mudou depois dela.');
    } else if (fields.selo === 'ilegível') {
      reasons.push('O selo da aprovação está ilegível: o item "Conteúdo:" precisa de sha256: seguido de 64 dígitos hexadecimais, como sai de "node docs/openspec-portao.mjs selo <change>".');
    } else if (fields.selo !== seal.conteudo) {
      reasons.push(`A aprovação venceu: o planejamento mudou depois dela (selo registrado ${fields.selo}, atual ${seal.conteudo}; arquivos selados: ${seal.arquivos.join(', ')}). Mostre ao responsável o que mudou e registre a reconfirmação com o /opsx:update, ou peça uma nova aprovação se o escopo mudou.`);
    }
  }
  reasons.push(...inferenceReasons(changeRoot));
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
  return { ok: reasons.length === 0, acao: action, change, motivos: reasons, ...(warnings.length ? { avisos: warnings } : {}) };
}

// The next step of the flow for one change, in the order a person would take them.
function nextStep(item, changeRoot) {
  if (item.aprovacao === 'pendente') return 'pedir a aprovação ao responsável';
  if (item.selo === 'vencido' || item.selo === 'ilegível') return 'reconfirmar a aprovação com /opsx:update';
  if (item.inferencias > 0) return 'confirmar as inferências [INFERIDO] com o responsável';
  if (item.tarefas.feitas < item.tarefas.total || item.tarefas.total === 0) return '/opsx:apply';
  if (!existsSync(path.join(changeRoot, 'verification.md'))) return '/opsx:verify';
  if (item.aprovacao === 'apply') return 'pedir a confirmação do archive ao responsável';
  return '/opsx:archive';
}

// One CLI call for the list; everything else comes from the change folders.
function state(store) {
  const list = openspecJson(['list'], store);
  if (!list.root?.path) {
    const message = list.message ?? list.error ?? '';
    throw new UsageError(`Não encontrei a raiz OpenSpec.${message ? ` ${message}` : ''}\nRode o portão na pasta do código, que declara o store, ou passe --store <id>.`);
  }
  const changes = (list.changes ?? []).map((entry) => {
    const changeRoot = path.join(list.root.path, 'openspec', 'changes', entry.name);
    const fields = existsSync(changeRoot) ? readApproval(changeRoot) : null;
    const approved = fields && approvalReasons(fields).length === 0;
    const scope = /\barchive\b/i.test(fields?.escopo ?? '') || filled(fields?.archive) ? 'archive' : 'apply';
    let seal = 'ausente';
    if (approved && fields.selo === 'ilegível') seal = 'ilegível';
    else if (approved && fields.selo) seal = fields.selo === sealOf(changeRoot).conteudo ? 'valido' : 'vencido';
    const item = {
      change: entry.name,
      tarefas: { feitas: entry.completedTasks ?? 0, total: entry.totalTasks ?? 0 },
      aprovacao: approved ? scope : 'pendente',
      selo: seal,
      inferencias: existsSync(changeRoot) ? inferenceReasons(changeRoot).length : 0,
    };
    item.proximo = nextStep(item, changeRoot);
    return item;
  });
  return { ok: true, acao: 'estado', change: null, motivos: [], changes };
}

function stateLine(item) {
  const approval = item.aprovacao === 'pendente' ? 'aprovação pendente' : `aprovada (${item.aprovacao})`;
  const seal = item.aprovacao === 'pendente' ? '' : `, selo ${item.selo}`;
  const marks = item.inferencias ? `, ${item.inferencias} inferência(s)` : '';
  return `${item.change}: ${item.tarefas.feitas}/${item.tarefas.total} tarefas, ${approval}${seal}${marks} → ${item.proximo}`;
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
  } else if (result.acao === 'selo') {
    console.log(result.conteudo);
  } else if (result.acao === 'estado') {
    if (!result.changes.length) console.log('Nenhuma change ativa.');
    for (const item of result.changes) console.log(stateLine(item));
  } else if (result.ok) {
    console.log(`✔ liberado: ${result.acao} da change ${result.change}`);
    for (const warning of result.avisos ?? []) console.log(`  aviso: ${warning}`);
  } else {
    console.log(`✗ bloqueado: ${result.acao} da change ${result.change}`);
    for (const reason of result.motivos) console.log(`  - ${reason}`);
    for (const warning of result.avisos ?? []) console.log(`  aviso: ${warning}`);
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
    if (options.action === 'estado') {
      if (options.change) throw new UsageError(`Argumento inesperado: ${options.change}`);
      return report(options, state(options.store), EXIT_OK);
    }
    if (!['apply', 'archive', 'selo'].includes(options.action)) throw new UsageError(`Ação desconhecida: ${options.action}\n${usage()}`);
    validateChange(options.change, options.action);
    if (options.action === 'selo') {
      const seal = sealOf(resolveChange(options.change, options.store));
      return report(options, { ok: true, ...base, motivos: [], ...seal }, EXIT_OK);
    }
    const result = check(options.action, options.change, options.store);
    return report(options, result, result.ok ? EXIT_OK : EXIT_BLOCKED);
  } catch (error) {
    return report(options, { ok: false, ...base, motivos: [error.message], erro: error.message }, EXIT_ERROR);
  }
}

process.exitCode = main();
