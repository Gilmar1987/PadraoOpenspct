#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The CHANGELOG lives at the repository root, two levels above this script (padrao-openspec/scripts/).
const defaultFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'CHANGELOG.md');
const semver = /^v?(\d+)\.(\d+)\.(\d+)$/;

function usage() {
  console.log(`Usage: node scripts/changelog-range.mjs --from <version> --to <version> [options]

Print the CHANGELOG sections after --from up to and including --to, in file order (ADR-0004).

Options:
  --from <version>   Installed version (excluded); "v" prefix optional
  --to <version>     Target version (included); must exist in the file
  --file <path>      CHANGELOG to read (default: the repository's CHANGELOG.md)
  --actions          Print only the "Ações no projeto" items, tagged with their version,
                     skipping "Nenhuma"
  -h, --help         Show this help`);
}

function parseArgs(args) {
  const options = { from: null, to: null, file: defaultFile, actions: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = () => {
      const next = args[index + 1];
      if (next === undefined || next.startsWith('--')) throw new Error(`${arg} requires a value.`);
      index += 1;
      return next;
    };
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--from') options.from = value();
    else if (arg === '--to') options.to = value();
    else if (arg === '--file') options.file = value();
    else if (arg === '--actions') options.actions = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  return options;
}

function parseVersion(text, flag) {
  const match = semver.exec(text ?? '');
  if (!match) throw new Error(`${flag} must be a version like 1.2.0 or v1.2.0.`);
  return match.slice(1).map(Number);
}

function compare(a, b) {
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

// Splits the file into "## X.Y.Z" sections; text before the first section is ignored.
function sections(content) {
  const result = [];
  let current = null;
  for (const line of content.replace(/\r\n/g, '\n').split('\n')) {
    const heading = /^## (\d+\.\d+\.\d+)\b/.exec(line);
    if (heading) {
      current = { version: heading[1].split('.').map(Number), label: heading[1], lines: [line] };
      result.push(current);
    } else if (current) {
      current.lines.push(line);
    }
  }
  return result;
}

// List items under "### Ações no projeto", including wrapped continuation lines.
function actionItems(section) {
  const items = [];
  let inActions = false;
  for (const line of section.lines) {
    if (/^### /.test(line)) {
      inActions = line.trim() === '### Ações no projeto';
      continue;
    }
    if (!inActions) continue;
    if (/^- /.test(line)) items.push(line.slice(2).trim());
    else if (/^\s+\S/.test(line) && items.length > 0) items[items.length - 1] += ` ${line.trim()}`;
  }
  return items.filter((item) => !/^nenhuma\.?$/i.test(item));
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    return;
  }
  const from = parseVersion(options.from, '--from');
  const to = parseVersion(options.to, '--to');
  if (!existsSync(options.file)) throw new Error(`CHANGELOG not found: ${options.file}`);

  const all = sections(readFileSync(options.file, 'utf8'));
  if (!all.some((section) => compare(section.version, to) === 0)) {
    throw new Error(`Version ${options.to} is not in ${options.file}.`);
  }
  const selected = all.filter((section) => compare(section.version, from) > 0 && compare(section.version, to) <= 0);

  if (options.actions) {
    for (const section of selected) {
      for (const item of actionItems(section)) console.log(`- **${section.label}:** ${item}`);
    }
    return;
  }
  const text = selected.map((section) => section.lines.join('\n').trimEnd()).join('\n\n');
  if (text) console.log(text);
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
