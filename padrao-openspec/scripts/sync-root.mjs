#!/usr/bin/env node

// padrao-openspec/ is the single source of skills, OPSX commands, agents and ADR templates
// (ADR-0001). This script regenerates the copies at the repository root; never edit those copies.

import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.dirname(sourceRoot);

// Directories are mirrored exactly (orphans removed); files are copied one by one.
const mappings = [
  { type: 'dir', source: '.claude/skills', destination: '.claude/skills' },
  { type: 'dir', source: '.claude/commands/opsx', destination: '.claude/commands/opsx' },
  { type: 'dir', source: '.github/agents', destination: '.github/agents' },
  { type: 'file', source: 'openspec/adrs/README.md', destination: 'openspec/adrs/README.md' },
  { type: 'file', source: 'openspec/adrs/template.md', destination: 'openspec/adrs/template.md' },
];

function usage() {
  console.log(`Usage: node padrao-openspec/scripts/sync-root.mjs [--check]

Mirror padrao-openspec/ into the repository root:
${mappings.map(({ source, destination }) => `  padrao-openspec/${source} -> ${destination}`).join('\n')}

Options:
  --check     Compare only; exit 1 listing every divergent, missing or orphan path
  -h, --help  Show this help`);
}

function lstatIfPresent(candidate) {
  try {
    return lstatSync(candidate);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function assertNotLink(candidate) {
  if (lstatIfPresent(candidate)?.isSymbolicLink()) {
    throw new Error(`Refusing to follow a symbolic link/junction: ${candidate}`);
  }
}

function listFiles(root) {
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      assertNotLink(full);
      if (entry.isDirectory()) walk(full);
      else files.push(path.relative(root, full));
    }
  };
  if (existsSync(root)) {
    assertNotLink(root);
    walk(root);
  }
  return files.sort();
}

// Returns one { kind, relative, source, destination } per path that differs between source and root.
function compare() {
  const problems = [];
  for (const mapping of mappings) {
    const source = path.join(sourceRoot, mapping.source);
    const destination = path.join(repoRoot, mapping.destination);
    if (!existsSync(source)) throw new Error(`Source not found: ${source}`);

    const pairs = mapping.type === 'dir'
      ? listFiles(source).map((relative) => ({
        relative: path.join(mapping.destination, relative),
        source: path.join(source, relative),
        destination: path.join(destination, relative),
      }))
      : [{ relative: mapping.destination, source, destination }];

    for (const pair of pairs) {
      assertNotLink(pair.source);
      assertNotLink(pair.destination);
      if (!existsSync(pair.destination)) problems.push({ kind: 'missing', ...pair });
      else if (!readFileSync(pair.source).equals(readFileSync(pair.destination))) problems.push({ kind: 'diff', ...pair });
    }

    if (mapping.type === 'dir') {
      const expected = new Set(listFiles(source));
      for (const relative of listFiles(destination)) {
        if (!expected.has(relative)) {
          problems.push({
            kind: 'orphan',
            relative: path.join(mapping.destination, relative),
            destination: path.join(destination, relative),
          });
        }
      }
    }
  }
  return problems;
}

// Removes directories left empty after orphan files were deleted, up to the mapped root.
function pruneEmptyDirs(start, stop) {
  let dir = path.dirname(start);
  while (dir.startsWith(stop) && dir !== stop && existsSync(dir) && readdirSync(dir).length === 0) {
    rmSync(dir, { recursive: false, force: false });
    dir = path.dirname(dir);
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('-h') || args.includes('--help')) {
    usage();
    return;
  }
  const unknown = args.filter((arg) => arg !== '--check');
  if (unknown.length > 0) throw new Error(`Unknown option: ${unknown.join(' ')}`);
  const check = args.includes('--check');

  if (!existsSync(path.join(repoRoot, 'openspec', 'rules.md'))) {
    throw new Error(
      `${repoRoot} does not look like the PadraoOpenspct repository (openspec/rules.md not found); nothing was changed.`,
    );
  }

  const problems = compare();
  const label = (problem) => `  ${problem.kind.padEnd(7)} ${problem.relative.split(path.sep).join('/')}`;

  if (check) {
    if (problems.length === 0) {
      console.log('Root is in sync with padrao-openspec/.');
      return;
    }
    console.error(`Root diverges from padrao-openspec/ (${problems.length} paths):`);
    for (const problem of problems) console.error(label(problem));
    console.error('Edit the files under padrao-openspec/ and run: node padrao-openspec/scripts/sync-root.mjs');
    process.exitCode = 1;
    return;
  }

  for (const problem of problems) {
    if (problem.kind === 'orphan') {
      rmSync(problem.destination, { force: false });
      const mapping = mappings.find(({ destination }) =>
        problem.relative.startsWith(path.join(destination, path.sep)));
      pruneEmptyDirs(problem.destination, path.join(repoRoot, mapping.destination));
    } else {
      mkdirSync(path.dirname(problem.destination), { recursive: true });
      copyFileSync(problem.source, problem.destination);
    }
    console.log(label(problem));
  }
  console.log(problems.length === 0 ? 'Root already in sync.' : `Synced ${problems.length} paths.`);
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
