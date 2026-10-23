#!/usr/bin/env node

import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceSkills = path.join(sourceRoot, '.claude', 'skills');
const sourceAgents = path.join(sourceRoot, '.github', 'agents');
const sourceCommands = path.join(sourceRoot, '.claude', 'commands', 'opsx');
// Claude Code layer (ADR-0006): subagents, hook scripts and the managed entries of .claude/settings.json.
const sourceClaudeAgents = path.join(sourceRoot, '.claude', 'agents');
const sourceClaudeHooks = path.join(sourceRoot, '.claude', 'hooks', 'openspec-padrao');
const settingsTemplate = 'claude-settings.json';
const settingsPath = '.claude/settings.json';
const hookPathMarker = '.claude/hooks/openspec-padrao/';
const permissionLists = ['allow', 'ask', 'deny'];
const sourceTemplates = path.join(sourceRoot, 'templates');
const versionFile = path.join(sourceRoot, 'VERSION');
const manifestName = '.openspec-padrao.json';
const defaultSourceUrl = 'https://github.com/Gilmar1987/PadraoOpenspct';
const standardRepoPattern = /[/:]PadraoOpenspct(?:\.git)?\/?$/i;

// Single files delivered to the consumer besides the skill, command and agent trees (ADR-0004).
const templateFiles = [
  { source: 'openspec-padrao-update.yml', destination: '.github/workflows/openspec-padrao-update.yml', label: 'standard update workflow' },
  { source: 'openspec-padrao.md', destination: 'docs/openspec-padrao.md', label: 'standard guide' },
  { source: '../openspec/rules.md', destination: 'docs/openspec-regras.md', label: 'standard rules' },
  { source: '../scripts/portao.mjs', destination: 'docs/openspec-portao.mjs', label: 'standard gate' },
  { source: '../scripts/validar-interface.mjs', destination: 'docs/openspec-validar-interface.mjs', label: 'interface validation' },
];

// Agent instruction files that carry the standard's managed block (ADR-0005). Only the text between
// the markers belongs to the standard; the rest of each file belongs to the project.
const blockBegin = '<!-- BEGIN:openspec-padrao -->';
const blockEnd = '<!-- END:openspec-padrao -->';
const blockTemplate = 'agents-block.md';
const instructionFiles = [
  { path: 'AGENTS.md', body: 'rules' },
  // Claude Code reads CLAUDE.md and imports other files with @path.
  { path: 'CLAUDE.md', body: 'import' },
  { path: 'GEMINI.md', body: 'rules' },
  { path: '.github/copilot-instructions.md', body: 'rules' },
  { path: '.amazonq/rules/openspec-padrao.md', body: 'rules' },
];

// The standard has no stack skills (ADR-0003); old automations that still pass --stack must fail loudly.
const stackRemovedMessage =
  "--stack was removed: the standard has no stack skills. Record the project's validation commands " +
  'in openspec/project.md (see /opsx:init).';

function usage() {
  console.log(`Usage: node scripts/install-skills.mjs <consumer-project> [options]

Install bundled skills, OPSX slash commands, VS Code agents, Claude Code subagents and hooks, the standard update
workflow, guide and rules into a consumer project, keep the standard's block in the agents' instruction files
(${instructionFiles.map((file) => file.path).join(', ')}) and its entries in ${settingsPath},
record the installed version in ${manifestName}, and ignore its local openspec/ directory in Git.

A first install writes to the working tree. Reinstalling over files that would change needs a mode:
--update (new branch chore/padrao-vX.Y.Z and a commit; requires a clean working tree) or --in-place.

Arguments:
  <consumer-project>  Path to the target project directory

Options:
  --target <agents|claude|both>  Skill destination (default: both); OPSX commands always go to
                                 .claude/commands/opsx and VS Code agents to .github/agents
  --update                       Install on a new branch chore/padrao-vX.Y.Z and commit (recommended)
  --in-place                     Overwrite installed files on the current branch, without committing
  -h, --help                      Show this help`);
}

function parseArgs(args) {
  const options = { project: null, target: 'both', force: false, update: false, inPlace: false };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--target') {
      const value = args[index + 1];
      if (value === undefined || value.startsWith('-')) {
        throw new Error('--target requires a value: agents, claude, or both.');
      }
      options.target = value;
      index += 1;
    } else if (arg === '--stack') {
      throw new Error(stackRemovedMessage);
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--update') {
      options.update = true;
    } else if (arg === '--in-place') {
      options.inPlace = true;
    } else if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    } else if (options.project === null) {
      options.project = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }

  if (!['agents', 'claude', 'both'].includes(options.target)) {
    throw new Error(`Invalid target "${options.target}". Use agents, claude, or both.`);
  }
  if (options.update && options.inPlace) {
    throw new Error('Use either --update or --in-place, not both.');
  }

  return options;
}

function listSkills() {
  if (!existsSync(sourceSkills)) {
    throw new Error(`Skill source directory not found: ${sourceSkills}`);
  }

  return readdirSync(sourceSkills, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: entry.name,
      source: path.join(sourceSkills, entry.name),
    }))
    .filter(({ source }) => existsSync(path.join(source, 'SKILL.md')));
}

function listAgents() {
  if (!existsSync(sourceAgents)) {
    throw new Error(`Custom agent source directory not found: ${sourceAgents}`);
  }

  const entries = readdirSync(sourceAgents, { withFileTypes: true });
  const invalidEntries = entries.filter((entry) =>
    !entry.isFile() || !entry.name.endsWith('.agent.md'));
  if (invalidEntries.length > 0) {
    throw new Error(
      `Only .agent.md files are allowed under ${sourceAgents}; unexpected entries: ` +
      invalidEntries.map((entry) => entry.name).join(', '),
    );
  }
  if (entries.length === 0) {
    throw new Error(`No .agent.md files were found under ${sourceAgents}`);
  }
  return entries;
}

function assertCommands() {
  if (!existsSync(sourceCommands)) {
    throw new Error(`OPSX command source directory not found: ${sourceCommands}`);
  }

  const entries = readdirSync(sourceCommands, { withFileTypes: true });
  const invalidEntries = entries.filter((entry) => !entry.isFile() || !entry.name.endsWith('.md'));
  if (invalidEntries.length > 0) {
    throw new Error(
      `Only .md files are allowed under ${sourceCommands}; unexpected entries: ` +
      invalidEntries.map((entry) => entry.name).join(', '),
    );
  }
  if (entries.length === 0) {
    throw new Error(`No command files were found under ${sourceCommands}`);
  }
}

function filesAreIdentical(source, destination) {
  if (!existsSync(destination) || !statSync(source).isDirectory() || !statSync(destination).isDirectory()) {
    return false;
  }

  const sourceEntries = readdirSync(source, { withFileTypes: true });
  const destinationEntries = readdirSync(destination, { withFileTypes: true });
  if (sourceEntries.length !== destinationEntries.length) return false;

  return sourceEntries.every((entry) => {
    const sourceEntry = path.join(source, entry.name);
    const destinationEntry = path.join(destination, entry.name);
    const matchingEntry = destinationEntries.find((candidate) => candidate.name === entry.name);
    if (!matchingEntry || matchingEntry.isDirectory() !== entry.isDirectory()) return false;

    if (entry.isDirectory()) return filesAreIdentical(sourceEntry, destinationEntry);
    return readFileSync(sourceEntry).equals(readFileSync(destinationEntry));
  });
}

function isWithinDirectory(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (
    relative !== '..' &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
}

function lstatIfPresent(candidate) {
  try {
    return lstatSync(candidate);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

// On Windows, antivirus and indexing services briefly lock freshly written files and folders,
// making rename fail with EPERM/EACCES/EBUSY. Retry with a short backoff before giving up.
function renameWithRetry(from, to) {
  const transient = new Set(['EPERM', 'EACCES', 'EBUSY']);
  const delays = process.platform === 'win32' ? [50, 100, 200, 400, 800, 1600] : [];
  for (let attempt = 0; ; attempt += 1) {
    try {
      renameSync(from, to);
      return;
    } catch (error) {
      if (!transient.has(error.code) || attempt >= delays.length) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delays[attempt]);
    }
  }
}

function assertSafeTree(source, destination) {
  const sourceInfo = lstatSync(source);
  if (sourceInfo.isSymbolicLink()) {
    throw new Error(`Skill source contains a symbolic link: ${source}`);
  }

  const destinationInfo = lstatIfPresent(destination);
  if (destinationInfo?.isSymbolicLink()) {
    throw new Error(`Destination contains a symbolic link/junction: ${destination}`);
  }

  if (sourceInfo.isDirectory()) {
    for (const entry of readdirSync(source, { withFileTypes: true })) {
      assertSafeTree(
        path.join(source, entry.name),
        path.join(destination, entry.name),
      );
    }
  }
}

function assertSafeDestination(projectRoot, destination, source) {
  if (!isWithinDirectory(projectRoot, destination)) {
    throw new Error(`Skill destination escapes the consumer project: ${destination}`);
  }

  let current = projectRoot;
  const relative = path.relative(projectRoot, destination);
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    if (lstatIfPresent(current)?.isSymbolicLink()) {
      throw new Error(`Destination path contains a symbolic link/junction: ${current}`);
    }
  }

  assertSafeTree(source, destination);
}

function overlayTree(source, destination) {
  const sourceInfo = lstatSync(source);
  if (sourceInfo.isDirectory()) {
    mkdirSync(destination, { recursive: true });
    for (const entry of readdirSync(source, { withFileTypes: true })) {
      overlayTree(
        path.join(source, entry.name),
        path.join(destination, entry.name),
      );
    }
    return;
  }

  const tempPath = path.join(path.dirname(destination), `.skill-file-${randomUUID()}.tmp`);
  try {
    cpSync(source, tempPath, { errorOnExist: true, force: false });
    if (existsSync(destination)) {
      rmSync(destination, { force: false });
    }
    renameWithRetry(tempPath, destination);
  } finally {
    if (existsSync(tempPath)) rmSync(tempPath, { force: true });
  }
}

function installTree(source, destination, projectRoot) {
  const parent = path.dirname(destination);
  const stagedPath = path.join(parent, `.skill-tree-${randomUUID()}.tmp`);
  const backupPath = path.join(parent, `.skill-tree-${randomUUID()}.bak`);
  let backupExists = false;
  let committed = false;

  try {
    if (existsSync(destination)) {
      cpSync(destination, stagedPath, { recursive: true, errorOnExist: true, force: false });
    } else {
      mkdirSync(stagedPath);
    }
    overlayTree(source, stagedPath);

    assertSafeDestination(projectRoot, destination, source);
    assertSafeDestination(projectRoot, stagedPath, source);
    if (existsSync(destination)) {
      renameWithRetry(destination, backupPath);
      backupExists = true;
    }
    try {
      renameWithRetry(stagedPath, destination);
      committed = true;
    } catch (error) {
      if (backupExists) {
        try {
          renameWithRetry(backupPath, destination);
          backupExists = false;
        } catch (rollbackError) {
          throw new Error(
            `Installation failed and rollback also failed. The previous skill is preserved at ${backupPath}.`,
            { cause: new AggregateError([error, rollbackError]) },
          );
        }
      }
      throw error;
    }
  } finally {
    if (existsSync(stagedPath)) rmSync(stagedPath, { recursive: true, force: true });
    if (committed && backupExists && existsSync(backupPath)) {
      try {
        rmSync(backupPath, { recursive: true, force: false });
      } catch (error) {
        console.warn(`Warning: new skill installed, but old backup could not be removed: ${backupPath}`);
        console.warn(`Cleanup error: ${error.message}`);
      }
    }
  }
}

const uuidPattern = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

// Force untranslated Git messages so error detection does not depend on the user's locale.
const gitEnv = { ...process.env, LC_ALL: 'C', LANGUAGE: 'C' };

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Staged copies left by an interrupted run are never the only copy of anything, so they are
// removed. Backups may be the only copy of a previous skill, so they are only reported.
function cleanStaleInstallerFiles(projectRoot, parents) {
  const stale = [
    { dir: projectRoot, pattern: new RegExp(`^\\.gitignore-${uuidPattern}\\.tmp$`, 'i') },
    ...parents.map((dir) => ({ dir, pattern: new RegExp(`^\\.(?:skill-tree|skill-file|openspec-block)-${uuidPattern}\\.tmp$`, 'i') })),
  ];
  const backupPattern = new RegExp(`^\\.skill-tree-${uuidPattern}\\.bak$`, 'i');

  for (const { dir, pattern } of stale) {
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      const candidate = path.join(dir, name);
      if (pattern.test(name)) {
        if (lstatSync(candidate).isSymbolicLink()) {
          console.warn(`Warning: skipped stale installer entry that is a symbolic link: ${candidate}`);
          continue;
        }
        rmSync(candidate, { recursive: true, force: true });
        console.log(`Removed stale installer file: ${path.relative(projectRoot, candidate)}`);
      } else if (backupPattern.test(name)) {
        console.warn(`Found preserved skill backup for manual review: ${candidate}`);
      }
    }
  }
}

function ensureConsumerGitignore(projectRoot) {
  const gitignorePath = path.join(projectRoot, '.gitignore');
  let existingInfo = lstatIfPresent(gitignorePath);
  const pendingBackups = readdirSync(projectRoot)
    .filter((name) => /^\.gitignore-[0-9a-f-]+\.bak$/i.test(name))
    .map((name) => path.join(projectRoot, name));

  if (!existingInfo && pendingBackups.length === 1) {
    const backup = pendingBackups[0];
    const backupInfo = lstatIfPresent(backup);
    if (!backupInfo?.isFile() || backupInfo.isSymbolicLink()) {
      throw new Error(`Refusing to restore an unsafe .gitignore backup: ${backup}`);
    }
    renameWithRetry(backup, gitignorePath);
    existingInfo = lstatSync(gitignorePath);
    console.warn(`Recovered .gitignore from an interrupted bootstrap backup: ${backup}`);
  } else if (!existingInfo && pendingBackups.length > 1) {
    throw new Error(
      `Multiple .gitignore backups need manual review before bootstrap: ${pendingBackups.join(', ')}`,
    );
  } else if (existingInfo && pendingBackups.length > 0) {
    console.warn(`Found preserved .gitignore backup(s) for manual review: ${pendingBackups.join(', ')}`);
  }

  if (existingInfo?.isSymbolicLink() || (existingInfo && !existingInfo.isFile())) {
    throw new Error(`Refusing to modify a non-regular .gitignore: ${gitignorePath}`);
  }

  const original = existingInfo ? readFileSync(gitignorePath, 'utf8') : '';
  const marker = '# OpenSpec planning artifacts are maintained in the separate planning store.';
  // The contents of openspec/ stay local, but openspec/config.yaml carries the store declaration and is
  // versioned. "/openspec/*" ignores the contents, not the folder, so the negation can re-include the file.
  const managedLines = [marker, '/openspec/*', '!/openspec/config.yaml'];
  const nonemptyLines = original.split(/\r?\n/).filter((line) => line.length > 0);
  const tail = nonemptyLines.slice(-managedLines.length).map((line) => line.replace(/[ \t]+$/, ''));
  const alreadyIgnored = tail.length === managedLines.length && tail.every((line, index) => line === managedLines[index]);
  if (alreadyIgnored) {
    console.log('Unchanged: .gitignore already excludes the local openspec/ contents and keeps the store declaration.');
  } else {
    const eol = original.includes('\r\n') ? '\r\n' : '\n';
    // Drop earlier copies of the managed block, including the legacy one that ignored /openspec/ entirely,
    // so moving it to the end does not accumulate duplicates.
    const previousBlocks = new RegExp(
      `^${escapeRegExp(marker)}[ \\t]*\\r?\\n(?:/openspec/[ \\t]*(?:\\r?\\n|$)|/openspec/\\*[ \\t]*\\r?\\n!/openspec/config\\.yaml[ \\t]*(?:\\r?\\n|$))`,
      'gm',
    );
    const cleaned = original.replace(previousBlocks, '');
    const separator = cleaned.length === 0 || cleaned.endsWith('\n') || cleaned.endsWith('\r') ? '' : eol;
    const block = managedLines.join(eol);
    const updated = `${cleaned}${separator}${block}${eol}`;
    const stagedPath = path.join(projectRoot, `.gitignore-${randomUUID()}.tmp`);
    const backupPath = path.join(projectRoot, `.gitignore-${randomUUID()}.bak`);
    let backupExists = false;

    try {
      writeFileSync(stagedPath, updated, { mode: existingInfo?.mode ?? 0o666 });
      if (existingInfo) {
        renameWithRetry(gitignorePath, backupPath);
        backupExists = true;
      }
      try {
        renameWithRetry(stagedPath, gitignorePath);
      } catch (error) {
        if (backupExists) {
          try {
            renameWithRetry(backupPath, gitignorePath);
            backupExists = false;
          } catch (rollbackError) {
            throw new Error(
              `Could not update .gitignore or restore its backup. Original preserved at ${backupPath}.`,
              { cause: new AggregateError([error, rollbackError]) },
            );
          }
        }
        throw error;
      }
      if (backupExists) {
        try {
          rmSync(backupPath, { force: false });
        } catch (error) {
          console.warn(`Warning: .gitignore updated, but old backup could not be removed: ${backupPath}`);
          console.warn(`Cleanup error: ${error.message}`);
        }
      }
      console.log('Updated: .gitignore excludes the local openspec/ contents and keeps openspec/config.yaml.');
    } finally {
      if (existsSync(stagedPath)) rmSync(stagedPath, { force: true });
    }
  }

  let isGitWorkTree = false;
  try {
    execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
      cwd: projectRoot,
      env: gitEnv,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    isGitWorkTree = true;
  } catch (error) {
    const details = `${error.stderr ?? ''} ${error.message ?? ''}`;
    if (!/not a git repository|not a git work tree/i.test(details)) {
      console.warn(`Warning: could not determine whether the consumer is a Git worktree: ${details.trim()}`);
    }
  }

  if (isGitWorkTree) {
    try {
      const tracked = execFileSync('git', ['ls-files', '--cached', '--', 'openspec/'], {
        cwd: projectRoot,
        env: gitEnv,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
      if (tracked) {
        console.warn('Warning: openspec/ already contains Git-tracked files. .gitignore does not untrack them; review and remove them from the index deliberately if desired.');
      }
    } catch {
      console.warn('Warning: could not check whether openspec/ already has Git-tracked files.');
    }
  }
}

function readVersion() {
  if (!existsSync(versionFile)) throw new Error(`Standard version file not found: ${versionFile}`);
  const version = readFileSync(versionFile, 'utf8').trim();
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`Invalid standard version in ${versionFile}: "${version}"`);
  return version;
}

function gitIn(cwd, args) {
  return execFileSync('git', args, { cwd, env: gitEnv, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function tryGit(cwd, args) {
  try {
    return gitIn(cwd, args);
  } catch {
    return null;
  }
}

// Where the standard came from: the clone's "padrao" or "origin" remote when it points to PadraoOpenspct.
function sourceInfo() {
  const commit = tryGit(sourceRoot, ['rev-parse', 'HEAD']);
  const remote = ['padrao', 'origin']
    .map((name) => tryGit(sourceRoot, ['remote', 'get-url', name]))
    .find((url) => url && standardRepoPattern.test(url));
  return { commit: commit || null, source: remote ? httpsUrl(remote) : defaultSourceUrl };
}

function httpsUrl(url) {
  const ssh = /^(?:ssh:\/\/)?git@github\.com[:/](.+?)(?:\.git)?\/?$/i.exec(url);
  if (ssh) return `https://github.com/${ssh[1]}`;
  return url.replace(/\.git$/i, '').replace(/\/$/, '');
}

function relativeFiles(root, base = root) {
  const info = lstatSync(root);
  if (!info.isDirectory()) return [path.relative(base, root)];
  return readdirSync(root, { withFileTypes: true })
    .flatMap((entry) => relativeFiles(path.join(root, entry.name), base));
}

function sameFile(source, destination) {
  return existsSync(destination) && statSync(destination).isFile() && readFileSync(source).equals(readFileSync(destination));
}

// Overlay semantics: every source file must match; extra files in the destination are preserved
// by the installer and do not count as a change.
function sameContent(source, destination) {
  if (!existsSync(destination)) return false;
  if (!statSync(source).isDirectory()) return sameFile(source, destination);
  if (!statSync(destination).isDirectory()) return false;
  return relativeFiles(source).every((relative) => sameFile(path.join(source, relative), path.join(destination, relative)));
}

function installFile(source, destination) {
  mkdirSync(path.dirname(destination), { recursive: true });
  const tempPath = path.join(path.dirname(destination), `.skill-file-${randomUUID()}.tmp`);
  try {
    cpSync(source, tempPath, { errorOnExist: true, force: false });
    if (existsSync(destination)) rmSync(destination, { force: false });
    renameWithRetry(tempPath, destination);
  } finally {
    if (existsSync(tempPath)) rmSync(tempPath, { force: true });
  }
}

// Returns the file content with the managed block in place. A file without markers gets the block at
// the end; a file with one BEGIN followed by one END gets only that span replaced; anything else is
// refused, so a hand-edited file is never guessed at.
function withManagedBlock(original, body, file) {
  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  const block = [blockBegin, body, blockEnd].join('\n').replace(/\n/g, eol);
  const begins = original.split(blockBegin).length - 1;
  const ends = original.split(blockEnd).length - 1;
  if (begins === 0 && ends === 0) {
    if (original.replace(/^\uFEFF/, '').length === 0) return `${original}${block}${eol}`;
    const separator = original.endsWith('\n') ? eol : `${eol}${eol}`;
    return `${original}${separator}${block}${eol}`;
  }
  const start = original.indexOf(blockBegin);
  const end = original.indexOf(blockEnd);
  if (begins !== 1 || ends !== 1 || end < start) {
    throw new Error(
      `${file}: the openspec-padrao markers are broken (expected one ${blockBegin} followed by one ${blockEnd}); ` +
      'fix the file by hand. Nothing was changed.',
    );
  }
  return `${original.slice(0, start)}${block}${original.slice(end + blockEnd.length)}`;
}

// A file the project ignores (for example, a personal CLAUDE.md) is left alone: writing it would
// leave an untracked file behind, and --update could not commit it.
function isIgnoredByProject(projectRoot, relativePath) {
  if (tryGit(projectRoot, ['rev-parse', '--is-inside-work-tree']) !== 'true') return false;
  if (tryGit(projectRoot, ['ls-files', '--error-unmatch', '--', relativePath]) !== null) return false;
  return tryGit(projectRoot, ['check-ignore', '-q', '--', relativePath]) !== null;
}

function planInstructionBlocks(projectRoot) {
  const templatePath = path.join(sourceTemplates, blockTemplate);
  const rules = readFileSync(templatePath, 'utf8').replace(/\r\n/g, '\n').trim();
  const normalize = (text) => text.replace(/\r\n/g, '\n');
  return instructionFiles.map((file) => {
    const destination = path.join(projectRoot, ...file.path.split('/'));
    const info = lstatIfPresent(destination);
    // A symlinked instruction file (for example, CLAUDE.md -> AGENTS.md) gets the block through its target.
    if (info?.isSymbolicLink()) return { ...file, destination, skip: 'is a symbolic link; its target carries the block' };
    if (isIgnoredByProject(projectRoot, file.path)) return { ...file, destination, skip: 'is ignored by the project (.gitignore)' };
    assertSafeDestination(projectRoot, destination, templatePath);
    if (info && !info.isFile()) throw new Error(`Refusing to modify a non-regular file: ${destination}`);
    const original = info ? readFileSync(destination, 'utf8') : '';
    const desired = withManagedBlock(original, file.body === 'import' ? '@AGENTS.md' : rules, file.path);
    return {
      ...file,
      destination,
      desired,
      mode: info?.mode,
      exists: Boolean(info),
      hadBlock: original.includes(blockBegin),
      // Line endings alone are not a change, so a file that mixes LF and CRLF stays current.
      changed: normalize(desired) !== normalize(original),
    };
  });
}

function writeInstructionBlock(plan) {
  mkdirSync(path.dirname(plan.destination), { recursive: true });
  const tempPath = path.join(path.dirname(plan.destination), `.openspec-block-${randomUUID()}.tmp`);
  try {
    writeFileSync(tempPath, plan.desired, plan.mode === undefined ? undefined : { mode: plan.mode });
    renameWithRetry(tempPath, plan.destination);
  } finally {
    if (existsSync(tempPath)) rmSync(tempPath, { force: true });
  }
}

// A project agent named like the standard's subagents would be overwritten: refuse unless a previous
// install of the standard already manages it.
function assertNoForeignClaudeAgents(projectRoot, previous) {
  const directory = path.join(projectRoot, '.claude', 'agents');
  if (!existsSync(directory)) return;
  const managed = new Set(previous?.managedFiles ?? []);
  const foreign = readdirSync(directory)
    .filter((name) => /^openspec-.*\.md$/i.test(name) && !managed.has(`.claude/agents/${name}`));
  if (foreign.length > 0) {
    throw new Error(
      `.claude/agents/ already has ${foreign.join(', ')}, which the standard did not install; the openspec- ` +
      'prefix is reserved for the standard\'s subagents. Rename those files. Nothing was changed.',
    );
  }
}

// Subagents and hook scripts a previous version installed and the current one no longer ships. They are
// the standard's, so they go away with the update instead of being taken for project files.
function retiredClaudeFiles(projectRoot, previous, manifestPaths) {
  const current = new Set(manifestPaths);
  return (previous?.managedFiles ?? [])
    .filter((file) => /^\.claude\/agents\/openspec-[^/]+\.md$/i.test(file) || file.startsWith(hookPathMarker))
    .filter((file) => !current.has(file) && existsSync(path.join(projectRoot, ...file.split('/'))));
}

function isStandardHook(entry) {
  const parts = [entry?.command, ...(Array.isArray(entry?.args) ? entry.args : [])];
  return parts.some((part) => typeof part === 'string' && part.replace(/\\/g, '/').includes(hookPathMarker));
}

// Removes the standard's hook entries from settings.hooks and puts the template's back at the position
// of the first one removed, so a reinstall of the same version leaves the file byte for byte as it was.
function mergeHooks(settings, template) {
  const hooks = settings.hooks ?? {};
  for (const event of new Set([...Object.keys(hooks), ...Object.keys(template.hooks ?? {})])) {
    const groups = hooks[event] ?? [];
    let insertAt = -1;
    const kept = [];
    for (const group of groups) {
      const entries = Array.isArray(group?.hooks) ? group.hooks : [];
      const own = entries.filter(isStandardHook);
      if (own.length === 0) {
        kept.push(group);
        continue;
      }
      if (insertAt === -1) insertAt = kept.length;
      const others = entries.filter((entry) => !isStandardHook(entry));
      if (others.length > 0) kept.push({ ...group, hooks: others });
    }
    const added = structuredClone(template.hooks?.[event] ?? []);
    kept.splice(insertAt === -1 ? kept.length : insertAt, 0, ...added);
    if (kept.length > 0) hooks[event] = kept;
    else delete hooks[event];
  }
  if (Object.keys(hooks).length > 0) settings.hooks = hooks;
  else delete settings.hooks;
}

// Same for the permission rules the standard added before (manifest managedSettings); a rule the
// project already has is the project's and is never recorded as the standard's.
function mergePermissions(settings, template, previousManaged) {
  const permissions = settings.permissions ?? {};
  const managed = {};
  for (const list of permissionLists) {
    const wanted = template.permissions?.[list] ?? [];
    const before = permissions[list] ?? [];
    const ownBefore = new Set(previousManaged?.[list] ?? []);
    let insertAt = -1;
    const kept = [];
    for (const rule of before) {
      if (ownBefore.has(rule)) {
        if (insertAt === -1) insertAt = kept.length;
      } else {
        kept.push(rule);
      }
    }
    const added = wanted.filter((rule) => !kept.includes(rule));
    kept.splice(insertAt === -1 ? kept.length : insertAt, 0, ...added);
    if (added.length > 0) managed[list] = added;
    if (kept.length > 0) permissions[list] = kept;
    else delete permissions[list];
  }
  if (Object.keys(permissions).length > 0) settings.permissions = permissions;
  else delete settings.permissions;
  return managed;
}

// Plans the standard's entries in .claude/settings.json (ADR-0006). The rest of the file belongs to the
// project and is kept as it is; a file that is not valid JSON stops the install with nothing changed.
function planClaudeSettings(projectRoot, previous) {
  const templatePath = path.join(sourceTemplates, settingsTemplate);
  const template = JSON.parse(readFileSync(templatePath, 'utf8'));
  const destination = path.join(projectRoot, ...settingsPath.split('/'));
  const info = lstatIfPresent(destination);
  if (info?.isSymbolicLink()) return { destination, skip: 'is a symbolic link; edit its target by hand' };
  if (isIgnoredByProject(projectRoot, settingsPath)) return { destination, skip: 'is ignored by the project (.gitignore)' };
  assertSafeDestination(projectRoot, destination, templatePath);
  if (info && !info.isFile()) throw new Error(`Refusing to modify a non-regular file: ${destination}`);
  const original = info ? readFileSync(destination, 'utf8') : '';
  let parsed = {};
  if (original.trim()) {
    try {
      parsed = JSON.parse(original.replace(/^﻿/, ''));
    } catch (error) {
      throw new Error(`${settingsPath} is not valid JSON (${error.message}); fix it by hand. Nothing was changed.`);
    }
    const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
    let shapeError = null;
    if (!isObject(parsed)) shapeError = 'the file must hold a JSON object';
    else if (parsed.hooks !== undefined
      && (!isObject(parsed.hooks) || Object.values(parsed.hooks).some((groups) => !Array.isArray(groups)))) {
      shapeError = '"hooks" must map each event to a list';
    } else if (parsed.permissions !== undefined && (!isObject(parsed.permissions)
      || permissionLists.some((list) => parsed.permissions[list] !== undefined && !Array.isArray(parsed.permissions[list])))) {
      shapeError = '"permissions.allow", "ask" and "deny" must be lists';
    }
    if (shapeError) throw new Error(`${settingsPath}: ${shapeError}; fix it by hand. Nothing was changed.`);
  }
  const before = JSON.stringify(parsed);
  // An install that already recorded managedSettings counts as having the entries, even if someone
  // deleted them by hand: putting them back is then a change that needs --update or --in-place.
  const hadEntries = previous?.managedSettings !== undefined
    || JSON.stringify(parsed.hooks ?? {}).includes(hookPathMarker);
  const desired = structuredClone(parsed);
  mergeHooks(desired, template);
  const managedSettings = mergePermissions(desired, template, previous?.managedSettings);
  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  const indent = original.replace(/^﻿/, '').match(/^[{[][^\n]*\n([ \t]+)\S/)?.[1] ?? '  ';
  const bom = original.startsWith('﻿') ? '﻿' : '';
  return {
    destination,
    desired: `${bom}${JSON.stringify(desired, null, indent)}\n`.replace(/\n/g, eol),
    mode: info?.mode,
    exists: Boolean(info),
    hadEntries,
    changed: JSON.stringify(desired) !== before,
    managedSettings,
  };
}

function writeClaudeSettings(plan) {
  writeInstructionBlock(plan);
}

function readManifest(projectRoot) {
  try {
    return JSON.parse(readFileSync(path.join(projectRoot, manifestName), 'utf8'));
  } catch {
    return null;
  }
}

// The install date alone is not a change.
function comparableManifest({ installedAt, ...rest } = {}) {
  return JSON.stringify(rest);
}

// Rewrites the manifest only when something besides the date changed, so a no-op reinstall stays clean.
function writeManifest(projectRoot, manifest) {
  const previous = readManifest(projectRoot);
  if (previous && comparableManifest(previous) === comparableManifest(manifest)) return false;
  writeFileSync(path.join(projectRoot, manifestName), `${JSON.stringify(manifest, null, 2)}\n`);
  return true;
}

function requireCleanRepository(projectRoot) {
  if (tryGit(projectRoot, ['rev-parse', '--is-inside-work-tree']) !== 'true') {
    throw new Error('--update needs the consumer project to be a Git repository.');
  }
  const pending = gitIn(projectRoot, ['status', '--porcelain']);
  if (pending) {
    throw new Error(`--update needs a clean working tree; commit or stash these changes first:\n${pending}`);
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    return;
  }
  if (!options.project) {
    usage();
    throw new Error('Consumer project path is required.');
  }

  const requestedProjectRoot = path.resolve(options.project);
  if (!existsSync(requestedProjectRoot) || !statSync(requestedProjectRoot).isDirectory()) {
    throw new Error(`Consumer project directory does not exist: ${requestedProjectRoot}`);
  }
  const projectRoot = realpathSync(requestedProjectRoot);
  if (isWithinDirectory(projectRoot, sourceRoot) || isWithinDirectory(sourceRoot, projectRoot)) {
    throw new Error('The consumer project must be separate from the padrao-openspec store directory.');
  }

  const version = readVersion();
  const skills = listSkills();
  if (skills.length === 0) {
    throw new Error(`No skills containing SKILL.md were found under ${sourceSkills}`);
  }
  listAgents();
  assertCommands();
  for (const directory of [sourceClaudeAgents, sourceClaudeHooks]) {
    if (!existsSync(directory)) throw new Error(`Claude Code source directory not found: ${directory}`);
  }
  for (const file of [...templateFiles, { source: blockTemplate }, { source: settingsTemplate }]) {
    if (!existsSync(path.join(sourceTemplates, file.source))) {
      throw new Error(`Template not found: ${path.join(sourceTemplates, file.source)}`);
    }
  }

  const targets = options.target === 'both'
    ? ['.agents/skills', '.claude/skills']
    : [options.target === 'claude' ? '.claude/skills' : '.agents/skills'];

  const operations = [
    ...targets.flatMap((target) => skills.map((skill) => ({
      name: skill.name,
      label: `${target}/${skill.name}`,
      source: skill.source,
      destination: path.join(projectRoot, target, skill.name),
    }))),
    {
      name: 'OPSX slash commands',
      label: '.claude/commands/opsx (OPSX slash commands)',
      source: sourceCommands,
      destination: path.join(projectRoot, '.claude', 'commands', 'opsx'),
    },
    {
      name: 'VS Code custom agents',
      label: '.github/agents (VS Code custom agents)',
      source: sourceAgents,
      destination: path.join(projectRoot, '.github', 'agents'),
    },
    {
      name: 'Claude Code subagents',
      label: '.claude/agents (Claude Code subagents)',
      source: sourceClaudeAgents,
      destination: path.join(projectRoot, '.claude', 'agents'),
    },
    {
      name: 'Claude Code hooks',
      label: '.claude/hooks/openspec-padrao (Claude Code hooks)',
      source: sourceClaudeHooks,
      destination: path.join(projectRoot, '.claude', 'hooks', 'openspec-padrao'),
    },
    ...templateFiles.map((file) => ({
      name: file.label,
      label: `${file.destination} (${file.label})`,
      source: path.join(sourceTemplates, file.source),
      destination: path.join(projectRoot, ...file.destination.split('/')),
      file: true,
    })),
  ];

  for (const { source, destination } of operations) {
    assertSafeDestination(projectRoot, destination, source);
  }
  // Planned before anything is written, so broken markers, a foreign openspec-* agent or an invalid
  // settings.json stop the install with no changes.
  const blocks = planInstructionBlocks(projectRoot);
  const previous = readManifest(projectRoot);
  assertNoForeignClaudeAgents(projectRoot, previous);
  const settings = planClaudeSettings(projectRoot, previous);

  if (options.force) {
    console.warn('Warning: --force is ignored; reinstalling over changed files needs --update or --in-place.');
  }

  const manifestPaths = [...new Set([
    ...operations.flatMap(({ source, destination, file }) => (file
      ? [destination]
      : relativeFiles(source).map((relative) => path.join(destination, relative))))
      .map((absolute) => path.relative(projectRoot, absolute).split(path.sep).join('/')),
    manifestName,
  ])].sort();
  const { commit, source } = sourceInfo();
  const manifest = {
    version,
    commit,
    source,
    target: options.target,
    installedAt: new Date().toISOString().slice(0, 10),
    managedFiles: manifestPaths,
    managedBlocks: instructionFiles.map((file) => file.path),
    managedSettings: settings.skip ? (previous?.managedSettings ?? {}) : settings.managedSettings,
  };
  const manifestChanged = previous !== null && comparableManifest(previous) !== comparableManifest(manifest);
  const retired = retiredClaudeFiles(projectRoot, previous, manifestPaths);

  // Installed files that would change, or a different recorded version: rewriting them needs an
  // explicit mode (ADR-0004).
  const changing = operations.filter(({ source: from, destination }) =>
    existsSync(destination) && !sameContent(from, destination));
  // A block the standard already wrote counts like a managed file; adding a missing block does not.
  const changingBlocks = blocks.filter((block) => !block.skip && block.hadBlock && block.changed);
  const changingSettings = !settings.skip && settings.hadEntries && settings.changed;
  if ((changing.length > 0 || changingBlocks.length > 0 || changingSettings || retired.length > 0 || manifestChanged) && !options.update && !options.inPlace) {
    const details = [
      ...changing.map(({ name, destination }) => `  ${name}: ${destination}`),
      ...changingBlocks.map(({ destination }) => (previous === null
        ? `  existing openspec-padrao block, not written by this installer (it would be replaced): ${destination}`
        : `  openspec-padrao block: ${destination}`)),
      ...(changingSettings ? [`  openspec-padrao entries: ${settings.destination}`] : []),
      ...retired.map((file) => `  retired by the standard (will be removed): ${file}`),
      ...(manifestChanged ? [`  ${manifestName}: v${previous.version ?? '?'} -> v${version}`] : []),
    ].join('\n');
    throw new Error(
      'The project already has standard files that would change; nothing was copied. Rerun with ' +
      '--update (new branch chore/padrao-vX.Y.Z and a commit, recommended) or --in-place (write to the ' +
      `current branch without committing):\n${details}`,
    );
  }

  const install = () => {
    cleanStaleInstallerFiles(projectRoot, [...new Set([
      ...operations.map(({ destination }) => path.dirname(destination)),
      ...blocks.map(({ destination }) => path.dirname(destination)),
    ])]);
    ensureConsumerGitignore(projectRoot);

    let installed = 0;
    let unchanged = 0;
    for (const { source: from, destination, label, file } of operations) {
      if (sameContent(from, destination)) {
        console.log(`Unchanged: ${label}`);
        unchanged += 1;
        continue;
      }

      assertSafeDestination(projectRoot, destination, from);
      mkdirSync(path.dirname(destination), { recursive: true });
      assertSafeDestination(projectRoot, destination, from);
      if (file) installFile(from, destination);
      else installTree(from, destination, projectRoot);
      console.log(`Installed: ${label}`);
      installed += 1;
    }
    for (const block of blocks) {
      if (block.skip) {
        console.log(`Skipped: ${block.path} ${block.skip}`);
        continue;
      }
      if (!block.changed) {
        console.log(`Unchanged: ${block.path} (openspec-padrao block)`);
        unchanged += 1;
        continue;
      }
      writeInstructionBlock(block);
      console.log(`${block.exists ? 'Updated' : 'Created'}: ${block.path} (openspec-padrao block)`);
      installed += 1;
    }
    for (const file of retired) {
      rmSync(path.join(projectRoot, ...file.split('/')), { force: true });
      console.log(`Removed: ${file} (no longer part of the standard)`);
      installed += 1;
    }
    if (settings.skip) {
      console.log(`Skipped: ${settingsPath} ${settings.skip}`);
    } else if (!settings.changed) {
      console.log(`Unchanged: ${settingsPath} (openspec-padrao entries)`);
      unchanged += 1;
    } else {
      writeClaudeSettings(settings);
      console.log(`${settings.exists ? 'Updated' : 'Created'}: ${settingsPath} (openspec-padrao entries)`);
      installed += 1;
    }
    if (writeManifest(projectRoot, manifest)) console.log(`Recorded: ${manifestName} (v${version})`);
    console.log(`\nDone. ${installed} installed, ${unchanged} already current.`);
  };

  if (!options.update) {
    install();
    return;
  }

  const missing = operations.some(({ destination }) => !existsSync(destination))
    || blocks.some((block) => !block.skip && block.changed)
    || (!settings.skip && settings.changed)
    || retired.length > 0;
  if (previous !== null && changing.length === 0 && !missing && !manifestChanged) {
    console.log(`Already at v${version}; nothing to update.`);
    return;
  }
  requireCleanRepository(projectRoot);
  const branch = `chore/padrao-v${version}`;
  if (tryGit(projectRoot, ['rev-parse', '--verify', '--quiet', `refs/heads/${branch}`])) {
    throw new Error(`Branch ${branch} already exists; delete it or merge it before updating again.`);
  }
  const original = gitIn(projectRoot, ['rev-parse', '--abbrev-ref', 'HEAD']);
  gitIn(projectRoot, ['checkout', '-q', '-b', branch]);

  // The tree was clean before the branch was created, so any failure from here on is undone by
  // discarding the working tree and returning to the original branch.
  const rollback = () => {
    tryGit(projectRoot, ['reset', '-q', '--hard']);
    tryGit(projectRoot, ['clean', '-fdq']);
    tryGit(projectRoot, ['checkout', '-q', original]);
    tryGit(projectRoot, ['branch', '-q', '-D', branch]);
  };
  try {
    install();
    const paths = [...new Set([
      '.gitignore', manifestName,
      ...manifestPaths.map((file) => file.split('/').slice(0, 2).join('/')),
      ...blocks.filter((block) => !block.skip).map((block) => block.path),
      ...(settings.skip ? [] : [settingsPath]),
    ])];
    gitIn(projectRoot, ['add', '-A', '--', ...paths]);
    if (tryGit(projectRoot, ['diff', '--cached', '--quiet']) !== null) {
      rollback();
      console.log(`Nothing to update: the files already match v${version}. Stayed on ${original}.`);
      return;
    }
    gitIn(projectRoot, [
      'commit', '-q', '-m', `chore: atualiza padrão OpenSpec para v${version}`, '-m', `Padrao-OpenSpec: v${version}`, '--', ...paths,
    ]);
  } catch (error) {
    rollback();
    const details = `${error.stderr ?? ''}`.trim();
    throw new Error(`--update failed and was rolled back to ${original}: ${error.message}${details ? `\n${details}` : ''}`);
  }
  console.log(`Committed the update on branch ${branch}. Push it and open a pull request to review it.`);
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
