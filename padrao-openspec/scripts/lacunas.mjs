#!/usr/bin/env node

// Checks the store's register of declared gaps, openspec/lacunas.md (ADR-0007): every row has an id,
// a reason and a date, its source exists, and the SHA-256 recorded for the source still matches the
// source's content. A changed source fails on purpose: the declaration must be read again against the
// new version, not just get a new hash. No dependencies besides Node.js.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
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

// The data rows of the register's table, skipping the header, the separator and HTML comments.
function readRows(text) {
  const withoutComments = text.replace(/<!--[\s\S]*?-->/g, '');
  const rows = [];
  let header = null;
  withoutComments.split(/\r?\n/).forEach((line, index) => {
    if (!line.trim().startsWith('|')) return;
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
    if (!id) problems.push(`${where}: falta o ID`);
    else if (ids.has(id)) problems.push(`${where}: ID repetido (já usado na linha ${ids.get(id)})`);
    else ids.set(id, line);
    if (!item) problems.push(`${where}: falta o item não cumprido`);
    if (!reason) problems.push(`${where}: falta o motivo`);
    if (!datePattern.test(since) || Number.isNaN(Date.parse(`${since}T00:00:00Z`))) {
      problems.push(`${where}: "Desde" precisa de uma data AAAA-MM-DD válida`);
    }
    const source = stripCode(sourceCell);
    if (!source) {
      problems.push(`${where}: falta a fonte`);
      continue;
    }
    let file;
    if (source.startsWith(codePrefix)) {
      if (!options.code) {
        problems.push(`${where}: a fonte ${source} é do repositório de código; informe --codigo <dir>`);
        continue;
      }
      file = path.resolve(options.code, source.slice(codePrefix.length));
    } else {
      file = path.resolve(options.root, source);
    }
    if (!existsSync(file)) {
      problems.push(`${where}: fonte ausente: ${source}`);
      continue;
    }
    if (!bySource.has(source)) bySource.set(source, { file, rows: [] });
    bySource.get(source).rows.push({ where, id, hash: stripCode(hash) });
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
  console.log(`ok: ${rows.length} lacunas, ${bySource.size} fontes`);
  return 0;
}

try {
  process.exitCode = main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 2;
}
