#!/usr/bin/env node

// Passive flow metrics for OpenSpec changes. Reads the store, the code repositories and
// (optionally) GitHub through gh, and writes metrics.csv and resumo.md. It never changes the
// store or the code repositories, never reads commit authors and never writes names.

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const columns = [
  'change', 'estado', 'criada', 'aprovada', 'arquivada',
  'dias_ate_aprovacao', 'dias_execucao', 'lead_time_dias',
  'requisitos', 'cenarios', 'tarefas', 'tarefas_concluidas',
  'retrabalho', 'criticos', 'warnings', 'sugestoes', 'nao_verificados',
  'ci_falhas_antes_do_verde',
];

function usage() {
  console.log(`Usage: node padrao-openspec/scripts/flow-metrics.mjs [options]

Read-only flow metrics for the changes of an OpenSpec store. Writes metrics.csv (one row per
change) and resumo.md (aggregated) to the output directory and changes nothing else.

Options:
  --store <dir>   Directory that contains openspec/ (default: ${scriptRoot})
  --code <repo>   Code repository whose commits carry the OpenSpec-Change trailer; repeatable
  --ci            Count failed CI runs before the first green one, through gh (optional)
  --out <dir>     Output directory (default: current directory)
  --usage <dir>   Folder (code repository or store) whose local Claude Code sessions are read to
                  write uso-ia.csv; repeatable. Only usage metadata is read, never message content
  --usage-dir <d> Claude Code sessions folder (default: ~/.claude/projects)
  -h, --help      Show this help`);
}

function parseArgs(args) {
  const options = {
    store: scriptRoot, code: [], ci: false, out: process.cwd(),
    usage: [], usageDir: path.join(os.homedir(), '.claude', 'projects'),
  };
  const valueOf = (index, flag) => {
    const value = args[index + 1];
    if (value === undefined || value.startsWith('--')) throw new Error(`${flag} requires a value.`);
    return value;
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '-h' || arg === '--help') options.help = true;
    else if (arg === '--store') options.store = valueOf(index++, arg);
    else if (arg === '--code') options.code.push(valueOf(index++, arg));
    else if (arg === '--ci') options.ci = true;
    else if (arg === '--out') options.out = valueOf(index++, arg);
    else if (arg === '--usage') options.usage.push(valueOf(index++, arg));
    else if (arg === '--usage-dir') options.usageDir = valueOf(index++, arg);
    else throw new Error(`Unknown option: ${arg}`);
  }
  return options;
}

function readIfPresent(file) {
  return existsSync(file) ? readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : null;
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (result.error || result.status !== 0) return null;
  return result.stdout;
}

function daysBetween(from, to) {
  if (!from || !to) return null;
  const toTime = (date) => Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)));
  return Math.round((toTime(to) - toTime(from)) / 86_400_000);
}

function median(values) {
  const sorted = values.filter((value) => value !== null).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const middle = Math.floor(sorted.length / 2);
  const value = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  return Number.isInteger(value) ? value : Number(value.toFixed(1));
}

function isoWeek(date) {
  const day = new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10))));
  const weekday = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() + 4 - weekday);
  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((day - yearStart) / 86_400_000 + 1) / 7);
  return `${day.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function listMarkdown(dir) {
  if (!existsSync(dir)) return [];
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listMarkdown(full));
    else if (entry.name.endsWith('.md')) files.push(full);
  }
  return files;
}

// Creation date: created in .openspec.yaml, else the first commit that touched the change folder.
function createdDate(changeDir, storeRoot) {
  const meta = readIfPresent(path.join(changeDir, '.openspec.yaml'));
  const match = meta?.match(/^created:\s*["']?(\d{4}-\d{2}-\d{2})/m);
  if (match) return match[1];
  const log = run('git', ['log', '--reverse', '--format=%cs', '--', path.relative(storeRoot, changeDir)], storeRoot);
  const first = log?.split('\n').find((line) => datePattern.test(line.trim()));
  return first ? first.trim() : null;
}

// Approval date: the Data field of the "## Aprovação" section. No fallback: an invented date is worse than none.
function approvalDate(changeDir) {
  const proposal = readIfPresent(path.join(changeDir, 'proposal.md'));
  if (!proposal) return null;
  const section = proposal.split(/^## Aprovação\s*$/m)[1];
  if (section === undefined) return null;
  const body = section.split(/^## /m)[0];
  const match = body.match(/^- Data:\s*(\d{4}-\d{2}-\d{2})\s*$/m);
  return match ? match[1] : null;
}

function specCounts(changeDir) {
  let requirements = 0;
  let scenarios = 0;
  for (const file of listMarkdown(path.join(changeDir, 'specs'))) {
    const text = readFileSync(file, 'utf8');
    requirements += (text.match(/^### Requirement:/gm) ?? []).length;
    scenarios += (text.match(/^#### Scenario:/gm) ?? []).length;
  }
  return { requirements, scenarios };
}

// Same rule as the OpenSpec CLI: only a box holding x or X (any spacing) is done.
function taskCounts(changeDir) {
  const tasks = readIfPresent(path.join(changeDir, 'tasks.md'));
  if (!tasks) return { total: null, done: null };
  const boxes = tasks.match(/^\s*- \[[^\]]*\]/gm) ?? [];
  const done = boxes.filter((box) => /\[\s*[xX]\s*\]$/.test(box)).length;
  return { total: boxes.length, done };
}

// Latest entry of verification.md (one "## AAAA-MM-DD" section per verify run).
function verificationCounts(changeDir) {
  const record = readIfPresent(path.join(changeDir, 'verification.md'));
  if (!record) return null;
  const sections = record.split(/^## (?=\d{4}-\d{2}-\d{2})/m).slice(1);
  if (sections.length === 0) return null;
  const last = sections.at(-1);
  const number = (label) => {
    const match = last.match(new RegExp(`^- ${label}:\\s*(\\d+)`, 'm'));
    return match ? Number(match[1]) : null;
  };
  const unverified = last.match(/^- Não verificado:\s*(.*)$/m)?.[1].trim();
  const unverifiedCount = unverified === undefined
    ? null
    : (unverified === '' || unverified === '—' || unverified === '-') ? 0 : unverified.split(';').filter((item) => item.trim()).length;
  return { critical: number('Críticos'), warnings: number('Warnings'), suggestions: number('Sugestões'), unverified: unverifiedCount };
}

function readChanges(storeRoot) {
  const changesDir = path.join(storeRoot, 'openspec', 'changes');
  if (!existsSync(changesDir)) throw new Error(`No openspec/changes directory under ${storeRoot}.`);
  const changes = [];
  const describe = (dir, name, state, archived) => {
    const created = createdDate(dir, storeRoot);
    const approved = approvalDate(dir);
    const specs = specCounts(dir);
    const tasks = taskCounts(dir);
    return {
      name, state, created, approved, archived,
      waitDays: daysBetween(created, approved),
      execDays: daysBetween(approved, archived),
      leadDays: daysBetween(created, archived),
      requirements: specs.requirements, scenarios: specs.scenarios,
      tasks: tasks.total, tasksDone: tasks.done,
      verification: verificationCounts(dir),
      rework: null, ciFailures: null,
    };
  };

  for (const entry of readdirSync(changesDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'archive') continue;
    changes.push(describe(path.join(changesDir, entry.name), entry.name, 'ativa', null));
  }
  const archiveDir = path.join(changesDir, 'archive');
  if (existsSync(archiveDir)) {
    for (const entry of readdirSync(archiveDir, { withFileTypes: true })) {
      const match = entry.isDirectory() && entry.name.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
      if (!match) continue;
      changes.push(describe(path.join(archiveDir, entry.name), match[2], 'arquivada', match[1]));
    }
  }
  return changes.sort((a, b) =>
    (a.state === b.state ? 0 : a.state === 'arquivada' ? -1 : 1)
    || String(a.archived ?? a.created ?? '').localeCompare(String(b.archived ?? b.created ?? ''))
    || a.name.localeCompare(b.name));
}

// Commits of every code repository: date, subject and OpenSpec-Change trailer values. No author fields.
function readCodeCommits(repos) {
  const commits = [];
  const unreadable = [];
  for (const repo of repos) {
    const log = run('git', ['log', '--all', '--format=%cs%x1f%s%x1f%(trailers:key=OpenSpec-Change,valueonly,separator=%x2C)%x1e'], repo);
    if (log === null) {
      unreadable.push(repo);
      continue;
    }
    for (const record of log.split('\x1e')) {
      const [date, subject, trailers] = record.replace(/^\n/, '').split('\x1f');
      if (!date || !datePattern.test(date.trim())) continue;
      commits.push({
        date: date.trim(),
        subject: subject ?? '',
        changes: (trailers ?? '').split(',').map((value) => value.trim()).filter(Boolean),
      });
    }
  }
  return { commits, unreadable };
}

function applyRework(changes, commits) {
  const isFix = (subject) => /^fix(\(|!|:)/.test(subject);
  const withTrailer = commits.filter((commit) => commit.changes.length > 0);
  const conventionFound = withTrailer.length > 0;
  if (conventionFound) {
    for (const change of changes) {
      if (change.state !== 'arquivada') continue;
      change.rework = withTrailer.filter((commit) =>
        isFix(commit.subject) && commit.changes.includes(change.name) && commit.date > change.archived).length;
    }
  }
  const fixesWithoutTrailer = commits.filter((commit) => isFix(commit.subject) && commit.changes.length === 0).length;
  return { conventionFound, fixesWithoutTrailer };
}

// Heuristic: first pull request that mentions the change, then failed runs before the first success on its branch.
function applyCi(changes, storeRoot) {
  if (run('gh', ['--version'], storeRoot) === null) return { collected: false, reason: 'gh não encontrado' };
  if (run('gh', ['auth', 'status'], storeRoot) === null) return { collected: false, reason: 'gh sem autenticação' };
  let found = 0;
  for (const change of changes) {
    const prs = run('gh', ['pr', 'list', '--state', 'all', '--search', `${change.name} in:title,body`, '--json', 'number,headRefName', '--limit', '1'], storeRoot);
    const pr = prs ? JSON.parse(prs)[0] : undefined;
    if (!pr) continue;
    const runsJson = run('gh', ['run', 'list', '--branch', pr.headRefName, '--json', 'conclusion,createdAt', '--limit', '100'], storeRoot);
    if (!runsJson) continue;
    const runs = JSON.parse(runsJson).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const firstSuccess = runs.findIndex((runInfo) => runInfo.conclusion === 'success');
    const considered = firstSuccess === -1 ? runs : runs.slice(0, firstSuccess);
    change.ciFailures = considered.filter((runInfo) => runInfo.conclusion === 'failure').length;
    found += 1;
  }
  return { collected: true, found };
}

function csvValue(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(changes) {
  const rows = changes.map((change) => [
    change.name, change.state, change.created, change.approved, change.archived,
    change.waitDays, change.execDays, change.leadDays,
    change.requirements, change.scenarios, change.tasks, change.tasksDone,
    change.rework, change.verification?.critical, change.verification?.warnings,
    change.verification?.suggestions, change.verification?.unverified,
    change.ciFailures,
  ].map(csvValue).join(','));
  return `﻿${[columns.join(','), ...rows].join('\n')}\n`;
}

function show(value, suffix = '') {
  return value === null || value === undefined ? '—' : `${value}${suffix}`;
}

// Claude Code names a project's session folder after its working directory, with every character
// outside [A-Za-z0-9] replaced by "-"; the drive letter case varies, so the match ignores case.
function sessionFolders(paths, usageDir) {
  const available = existsSync(usageDir) ? readdirSync(usageDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()) : [];
  const folders = [];
  let missing = 0;
  for (const target of paths) {
    const name = path.resolve(target).replace(/[^A-Za-z0-9]/g, '-').toLowerCase();
    const match = available.find((entry) => entry.name.toLowerCase() === name);
    if (match) folders.push(path.join(usageDir, match.name));
    else missing += 1;
  }
  return { folders, missing };
}

// The change a session record belongs to: by branch name first, then by the date window of the changes.
function attribute(record, changes, today) {
  const segments = (record.branch ?? '').split('/').filter(Boolean);
  const last = segments.at(-1) ?? '';
  const byBranch = changes.filter((change) =>
    segments.includes(change.name) || last.endsWith(`-${change.name}`));
  if (byBranch.length === 1) return { change: byBranch[0] };
  if (!record.date) return { unattributed: true };
  const byWindow = changes.filter((change) =>
    change.created && change.created <= record.date && record.date <= (change.archived ?? today));
  if (byWindow.length === 1) return { change: byWindow[0] };
  return byWindow.length > 1 ? { ambiguous: true } : { unattributed: true };
}

// Reads only usage metadata from the session files and counts each response once, by message.id.
function readUsage(changes, paths, usageDir) {
  const { folders, missing } = sessionFolders(paths, usageDir);
  const today = new Date().toISOString().slice(0, 10);
  const totals = new Map(changes.map((change) => [change.name, { responses: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }]));
  const models = new Map();
  const seen = new Set();
  const counts = { responses: 0, ambiguous: 0, unattributed: 0, invalidLines: 0 };
  for (const folder of folders) {
    for (const file of readdirSync(folder).filter((name) => name.endsWith('.jsonl'))) {
      for (const line of readFileSync(path.join(folder, file), 'utf8').split('\n')) {
        if (!line.trim()) continue;
        let entry;
        try {
          entry = JSON.parse(line);
        } catch {
          counts.invalidLines += 1;
          continue;
        }
        const usage = entry?.message?.usage;
        if (entry?.type !== 'assistant' || !usage) continue;
        const key = entry.message.id ?? entry.requestId;
        if (key) {
          if (seen.has(key)) continue;
          seen.add(key);
        }
        const record = {
          date: typeof entry.timestamp === 'string' ? entry.timestamp.slice(0, 10) : null,
          branch: typeof entry.gitBranch === 'string' ? entry.gitBranch : '',
        };
        const tokens = {
          input: usage.input_tokens ?? 0,
          output: usage.output_tokens ?? 0,
          cacheRead: usage.cache_read_input_tokens ?? 0,
          cacheWrite: usage.cache_creation_input_tokens ?? 0,
        };
        counts.responses += 1;
        const model = typeof entry.message.model === 'string' ? entry.message.model : 'desconhecido';
        const modelTotals = models.get(model) ?? { responses: 0, output: 0, cacheRead: 0 };
        modelTotals.responses += 1;
        modelTotals.output += tokens.output;
        modelTotals.cacheRead += tokens.cacheRead;
        models.set(model, modelTotals);
        const result = attribute(record, changes, today);
        if (result.ambiguous) counts.ambiguous += 1;
        else if (result.unattributed) counts.unattributed += 1;
        else {
          const target = totals.get(result.change.name);
          target.responses += 1;
          target.input += tokens.input;
          target.output += tokens.output;
          target.cacheRead += tokens.cacheRead;
          target.cacheWrite += tokens.cacheWrite;
        }
      }
    }
  }
  return { collected: folders.length > 0, folders: folders.length, missing, totals, models, counts };
}

function toUsageCsv(changes, usage) {
  const header = 'change,respostas,tokens_entrada,tokens_saida,tokens_cache_leitura,tokens_cache_escrita';
  const rows = changes.map((change) => {
    const total = usage.collected ? usage.totals.get(change.name) : null;
    return [change.name, total?.responses, total?.input, total?.output, total?.cacheRead, total?.cacheWrite].map(csvValue).join(',');
  });
  return `﻿${[header, ...rows].join('\n')}\n`;
}

function usageSummary(usage) {
  const lines = ['', '## Consumo de IA', ''];
  if (!usage.collected) {
    lines.push(`- Não coletado: Nenhuma sessão encontrada para ${usage.missing} pasta(s) informada(s) com \`--usage\`.`);
  } else {
    if (usage.missing) lines.push(`- Nenhuma sessão encontrada para ${usage.missing} das pastas informadas com \`--usage\`.`);
    lines.push(`- Respostas lidas (cada uma contada uma vez): ${usage.counts.responses}`);
    lines.push(`- Respostas ambíguas (mais de uma change possível): ${usage.counts.ambiguous}`);
    lines.push(`- Respostas não atribuídas: ${usage.counts.unattributed}`);
    if (usage.counts.invalidLines) lines.push(`- Linhas ignoradas por não serem JSON válido: ${usage.counts.invalidLines}`);
    lines.push('', '| Modelo | Respostas | Tokens de saída | Tokens de leitura de cache |', '|---|---|---|---|');
    for (const [model, total] of [...usage.models.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      lines.push(`| ${model} | ${total.responses} | ${total.output} | ${total.cacheRead} |`);
    }
  }
  lines.push('', '- Só metadados de consumo são lidos; o conteúdo das conversas não é lido nem gravado.');
  lines.push('- Cobre só as sessões do Claude Code desta máquina.');
  return `${lines.join('\n')}\n`;
}

function toSummary(changes, context) {
  const archived = changes.filter((change) => change.state === 'arquivada');
  const active = changes.filter((change) => change.state === 'ativa');
  const dates = changes.flatMap((change) => [change.created, change.archived]).filter(Boolean).sort();
  const group = (key) => {
    const buckets = new Map();
    for (const change of archived) {
      const bucket = key(change.archived);
      if (!buckets.has(bucket)) buckets.set(bucket, []);
      buckets.get(bucket).push(change);
    }
    return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b));
  };
  const lines = [];
  lines.push('# Métricas de fluxo', '');
  lines.push(`Período coberto: ${dates.length ? `${dates[0]} a ${dates.at(-1)}` : 'sem datas'}. `
    + `Changes arquivadas: ${archived.length}. Changes ativas: ${active.length}.`, '');

  lines.push('## Vazão por mês', '');
  lines.push('| Mês | Changes arquivadas | Mediana do lead time (dias) |', '|---|---|---|');
  for (const [month, items] of group((date) => date.slice(0, 7))) {
    lines.push(`| ${month} | ${items.length} | ${show(median(items.map((change) => change.leadDays)))} |`);
  }
  lines.push('', '## Vazão por semana (ISO)', '');
  lines.push('| Semana | Changes arquivadas | Mediana do lead time (dias) |', '|---|---|---|');
  for (const [week, items] of group(isoWeek)) {
    lines.push(`| ${week} | ${items.length} | ${show(median(items.map((change) => change.leadDays)))} |`);
  }

  lines.push('', '## Tempos (mediana, dias)', '');
  lines.push(`- Espera até a aprovação: ${show(median(archived.map((change) => change.waitDays)))}`);
  lines.push(`- Execução (aprovação até o archive): ${show(median(archived.map((change) => change.execDays)))}`);
  lines.push(`- Lead time (criação até o archive): ${show(median(archived.map((change) => change.leadDays)))}`);

  lines.push('', '## Retrabalho', '');
  if (context.codeRepos === 0) {
    lines.push('- Não coletado: nenhum repositório de código informado com `--code`.');
  } else if (!context.rework.conventionFound) {
    lines.push('- Não coletado: nenhum commit com o trailer `OpenSpec-Change` nos repositórios informados.');
  } else {
    const total = archived.reduce((sum, change) => sum + (change.rework ?? 0), 0);
    lines.push(`- Commits \`fix\` depois do archive, com trailer: ${total}`);
    lines.push(`- Commits \`fix\` sem trailer (fora da medição): ${context.rework.fixesWithoutTrailer}`);
  }

  lines.push('', '## Qualidade (última verificação de cada change)', '');
  const verified = changes.filter((change) => change.verification);
  lines.push(`- Changes com \`verification.md\`: ${verified.length} de ${changes.length}`);
  lines.push(`- Com críticos na última verificação: ${verified.filter((change) => (change.verification.critical ?? 0) > 0).length}`);
  lines.push(`- Total de warnings na última verificação: ${verified.reduce((sum, change) => sum + (change.verification.warnings ?? 0), 0)}`);
  if (context.ci.collected) {
    const withCi = changes.filter((change) => change.ciFailures !== null);
    lines.push(`- Execuções da CI com falha antes do verde: ${withCi.reduce((sum, change) => sum + change.ciFailures, 0)}, em ${withCi.length} changes com PR encontrado (busca do PR por nome, heurística)`);
  }

  lines.push('', '## Limites', '');
  lines.push('- Criação, aprovação e archive guardam só a data: tempos em dias.');
  const withoutApproval = archived.filter((change) => !change.approved).length;
  if (withoutApproval) lines.push(`- ${withoutApproval} change(s) arquivada(s) sem a seção \`## Aprovação\`: espera e execução ficam vazias.`);
  if (context.codeRepos === 0) lines.push('- Retrabalho não coletado (sem `--code`).');
  for (const repo of context.unreadable) lines.push(`- Repositório de código ilegível, ignorado: ${path.basename(repo)}`);
  if (!context.ciRequested) lines.push('- CI não coletada (sem `--ci`).');
  else if (!context.ci.collected) lines.push(`- CI não coletada (${context.ci.reason}).`);
  lines.push('- Nenhum nome de pessoa é lido ou registrado.');
  return `${lines.join('\n')}\n`;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    return;
  }
  const storeRoot = path.resolve(options.store);
  if (!existsSync(path.join(storeRoot, 'openspec')) || !statSync(path.join(storeRoot, 'openspec')).isDirectory()) {
    throw new Error(`No openspec/ directory under ${storeRoot}. Pass the store with --store.`);
  }

  const changes = readChanges(storeRoot);
  const { commits, unreadable } = readCodeCommits(options.code.map((repo) => path.resolve(repo)));
  const rework = options.code.length > 0
    ? applyRework(changes, commits)
    : { conventionFound: false, fixesWithoutTrailer: 0 };
  const ci = options.ci ? applyCi(changes, storeRoot) : { collected: false };
  if (options.ci && !ci.collected) console.warn(`Warning: CI not collected (${ci.reason}).`);

  const outDir = path.resolve(options.out);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, 'metrics.csv'), toCsv(changes));
  let summary = toSummary(changes, {
    codeRepos: options.code.length, rework, unreadable, ci, ciRequested: options.ci,
  });
  if (options.usage.length > 0) {
    const usage = readUsage(changes, options.usage, path.resolve(options.usageDir));
    writeFileSync(path.join(outDir, 'uso-ia.csv'), toUsageCsv(changes, usage));
    summary += usageSummary(usage);
  }
  writeFileSync(path.join(outDir, 'resumo.md'), summary);
  console.log(`Wrote ${changes.length} changes to ${path.join(outDir, 'metrics.csv')} and ${path.join(outDir, 'resumo.md')}.`);
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
