#!/usr/bin/env node

// Checks the store's register of declared gaps, openspec/lacunas.md (ADR-0007): every row has an id,
// a reason and a date, its source exists, and the SHA-256 recorded for the source still matches the
// source's content. A changed source fails on purpose: the declaration must be read again against the
// new version, not just get a new hash. No dependencies besides Node.js.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The store's OpenSpec root is the padrao-openspec folder that holds this script (scripts/..).
const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registerPath = ['openspec', 'lacunas.md'];
const columns = ['ID', 'Fonte', 'SHA-256 da fonte', 'Item não cumprido', 'Motivo', 'Desde', 'Encaminhamento'];
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const hashPattern = /^[0-9a-f]{64}$/i;
const codePrefix = 'codigo:';

function usage() {
  console.log(`Usage: node padrao-openspec/scripts/lacunas.mjs [--raiz <dir>] [--codigo <dir>]

Check openspec/lacunas.md, the register of declared gaps (ADR-0007): required fields, valid dates,
existing sources and the SHA-256 of each source. Exit code 0 when the register is current (or absent),
1 when something must be fixed, 2 on a usage error.

Options:
  --raiz <dir>     Store folder that holds openspec/ (default: the padrao-openspec of this script)
  --codigo <dir>   Code repository, for sources written as codigo:<path>
  -h, --help       Show this help`);
}

function parseArgs(args) {
  const options = { root: defaultRoot, code: null };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '-h' || arg === '--help') options.help = true;
    else if (arg === '--raiz' || arg === '--codigo') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`${arg} needs a directory.`);
      if (arg === '--raiz') options.root = path.resolve(value);
      else options.code = path.resolve(value);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

// The cells of a Markdown table row, trimmed, without the outer pipes. "\|" stays inside a cell.
function cells(line) {
  const inner = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return inner.split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, '|'));
}

function stripCode(value) {
  return value.replace(/^`(.*)`$/, '$1').trim();
}

// The data rows of the register's first table, skipping the header, the separator, HTML comments
// and fenced code blocks. Comments keep their line breaks, so reported line numbers match the file.
function readRows(text) {
  const withoutComments = text.replace(/<!--[\s\S]*?-->/g, (comment) => comment.replace(/[^\n]/g, ''));
  const rows = [];
  let header = null;
  let inFence = false;
  let done = false;
  withoutComments.split(/\r?\n/).forEach((line, index) => {
    if (done) return;
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    if (!line.trim().startsWith('|')) {
      if (header !== null && line.trim() !== '') done = true;
      return;
    }
    const values = cells(line);
    if (header === null) {
      header = values;
      return;
    }
    if (values.every((value) => /^:?-+:?$/.test(value))) return;
    rows.push({ line: index + 1, values });
  });
  return { header, rows };
}

// A real calendar date: 2026-02-30 is rejected, not rolled over to March.
function validDate(value) {
  if (!datePattern.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Sources are relative and stay inside their base, written with "/" so the register works on any OS.
function resolveSource(base, written) {
  const normalized = written.replace(/\\/g, '/');
  if (path.isAbsolute(normalized) || /^[a-z]:/i.test(normalized)) return { error: 'use um caminho relativo' };
  const file = path.resolve(base, normalized);
  const relative = path.relative(base, file);
  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) return { error: 'o caminho sai da pasta base' };
  return { file, key: normalized };
}

// SHA-256 of the content with CRLF normalized to LF, so Windows and Linux checkouts agree.
function contentHash(file) {
  const text = readFileSync(file).toString('utf8').replace(/\r\n/g, '\n');
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    return 0;
  }
  if (!existsSync(path.join(options.root, 'openspec'))) {
    throw new Error(`raiz sem openspec/: ${options.root} (use a pasta padrao-openspec do store, a "root" de openspec list --json)`);
  }
  if (options.code && !existsSync(options.code)) throw new Error(`--codigo aponta para uma pasta que não existe: ${options.code}`);
  const register = path.join(options.root, ...registerPath);
  if (!existsSync(register)) {
    console.log('sem registro de lacunas');
    return 0;
  }
  const { header, rows } = readRows(readFileSync(register, 'utf8'));
  const problems = [];
  if (header === null) {
    console.log('ok: 0 lacunas, 0 fontes');
    return 0;
  }
  if (header.join('|') !== columns.join('|')) {
    problems.push(`cabeçalho da tabela diferente do modelo: esperado | ${columns.join(' | ')} |`);
  }
  const ids = new Map();
  const bySource = new Map();
  for (const { line, values } of rows) {
    const [id = '', sourceCell = '', hash = '', item = '', reason = '', since = ''] = values;
    const where = `linha ${line}${id ? ` (${id})` : ''}`;
    if (values.length !== columns.length) {
      problems.push(`${where}: a linha tem ${values.length} colunas; o modelo tem ${columns.length}`);
      continue;
    }
    if (!id) problems.push(`${where}: falta o ID`);
    else if (ids.has(id)) problems.push(`${where}: ID repetido (já usado na linha ${ids.get(id)})`);
    else ids.set(id, line);
    if (!item) problems.push(`${where}: falta o item não cumprido`);
    if (!reason) problems.push(`${where}: falta o motivo`);
    if (!validDate(since)) {
      problems.push(`${where}: "Desde" precisa de uma data AAAA-MM-DD válida`);
    }
    const source = stripCode(sourceCell);
    if (!source) {
      problems.push(`${where}: falta a fonte`);
      continue;
    }
    const fromCode = source.startsWith(codePrefix);
    if (fromCode && !options.code) {
      problems.push(`${where}: a fonte ${source} é do repositório de código; informe --codigo <dir>`);
      continue;
    }
    const resolved = fromCode
      ? resolveSource(options.code, source.slice(codePrefix.length))
      : resolveSource(options.root, source);
    if (resolved.error) {
      problems.push(`${where}: fonte inválida (${resolved.error}): ${source}`);
      continue;
    }
    const key = fromCode ? `${codePrefix}${resolved.key}` : resolved.key;
    if (!existsSync(resolved.file)) {
      problems.push(`${where}: fonte ausente: ${key}`);
      continue;
    }
    if (!statSync(resolved.file).isFile()) {
      problems.push(`${where}: a fonte não é um arquivo: ${key}`);
      continue;
    }
    if (!bySource.has(key)) bySource.set(key, { file: resolved.file, rows: [] });
    bySource.get(key).rows.push({ where, id, hash: stripCode(hash) });
  }
  for (const [source, entry] of bySource) {
    const current = contentHash(entry.file);
    const invalid = entry.rows.filter((row) => !hashPattern.test(row.hash));
    for (const row of invalid) {
      problems.push(`${row.where}: SHA-256 ausente ou inválido para ${source}; o atual é ${current}`);
    }
    const changed = entry.rows.filter((row) => hashPattern.test(row.hash) && row.hash.toLowerCase() !== current);
    if (changed.length > 0) {
      const which = changed.map((row) => row.id || row.where).join(', ');
      problems.push(
        `fonte alterada: ${source} (lacunas ${which}) — releia a declaração inteira contra a versão nova; ` +
        `não troque só o hash (o atual é ${current})`,
      );
    }
  }
  if (problems.length > 0) {
    for (const problem of problems) console.log(problem);
    return 1;
  }
  const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;
  console.log(`ok: ${plural(rows.length, 'lacuna', 'lacunas')}, ${plural(bySource.size, 'fonte', 'fontes')}`);
  return 0;
}

try {
  process.exitCode = main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 2;
}
