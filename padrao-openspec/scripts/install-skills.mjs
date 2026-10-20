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
const sourceTemplates = path.join(sourceRoot, 'templates');
const versionFile = path.join(sourceRoot, 'VERSION');
const manifestName = '.openspec-padrao.json';
const defaultSourceUrl = 'https://github.com/Gilmar1987/PadraoOpenspct';
const standardRepoPattern = /[/:]PadraoOpenspct(?:\.git)?\/?$/i;

// Single files delivered to the consumer besides the skill, command and agent trees (ADR-0004).
const templateFiles = [
  { source: 'openspec-padrao-update.yml', destination: '.github/workflows/openspec-padrao-update.yml', label: 'standard update workflow' },
  { source: 'openspec-padrao.md', destination: 'docs/openspec-padrao.md', label: 'standard guide' },
];

// The standard has no stack skills (ADR-0003); old automations that still pass --stack must fail loudly.
const stackRemovedMessage =
  "--stack was removed: the standard has no stack skills. Record the project's validation commands " +
  'in openspec/project.md (see /opsx:init).';

function usage() {
  console.log(`Usage: node scripts/install-skills.mjs <consumer-project> [options]

Install bundled skills, OPSX slash commands, VS Code agents, the standard update workflow and guide into a
consumer project, record the installed version in ${manifestName}, and ignore its local openspec/ directory in Git.

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
    ...parents.map((dir) => ({ dir, pattern: new RegExp(`^\\.skill-tree-${uuidPattern}\\.tmp$`, 'i') })),
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
  return { commit: commit || null, source: remote ? remote.replace(/\.git$/i, '').replace(/\/$/, '') : defaultSourceUrl };
}

function relativeFiles(root, base = root) {
  const info = lstatSync(root);
  if (!info.isDirectory()) return [path.relative(base, root)];
  return readdirSync(root, { withFileTypes: true })
    .flatMap((entry) => relativeFiles(path.join(root, entry.name), base));
}

function sameContent(source, destination) {
  if (!existsSync(destination)) return false;
  if (statSync(source).isDirectory()) return filesAreIdentical(source, destination);
  return statSync(destination).isFile() && readFileSync(source).equals(readFileSync(destination));
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

function readManifest(projectRoot) {
  try {
    return JSON.parse(readFileSync(path.join(projectRoot, manifestName), 'utf8'));
  } catch {
    return null;
  }
}

// Rewrites the manifest only when something besides the date changed, so a no-op reinstall stays clean.
function writeManifest(projectRoot, manifest) {
  const previous = readManifest(projectRoot);
  const comparable = ({ installedAt, ...rest } = {}) => JSON.stringify(rest);
  if (previous && comparable(previous) === comparable(manifest)) return false;
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
  for (const file of templateFiles) {
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

  // Installed files that would change: rewriting them needs an explicit mode (ADR-0004).
  const changing = operations.filter(({ source, destination }) =>
    existsSync(destination) && !sameContent(source, destination));
  if (changing.length > 0 && !options.update && !options.inPlace) {
    const details = changing.map(({ name, destination }) => `  ${name}: ${destination}`).join('\n');
    throw new Error(
      'The project already has standard files that would change; nothing was copied. Rerun with ' +
      '--update (new branch chore/padrao-vX.Y.Z and a commit, recommended) or --in-place (write to the ' +
      `current branch without committing):\n${details}`,
    );
  }

  const manifestPaths = [
    ...operations.flatMap(({ source, destination, file }) => (file
      ? [destination]
      : relativeFiles(source).map((relative) => path.join(destination, relative))))
      .map((absolute) => path.relative(projectRoot, absolute).split(path.sep).join('/')),
    manifestName,
  ].sort();
  const { commit, source } = sourceInfo();
  const manifest = {
    version,
    commit,
    source,
    target: options.target,
    installedAt: new Date().toISOString().slice(0, 10),
    managedFiles: manifestPaths,
  };

  let branch = null;
  if (options.update) {
    requireCleanRepository(projectRoot);
    const previous = readManifest(projectRoot);
    const missing = operations.some(({ destination }) => !existsSync(destination));
    if (changing.length === 0 && !missing && previous?.version === version) {
      console.log(`Already at v${version}; nothing to update.`);
      return;
    }
    branch = `chore/padrao-v${version}`;
    if (tryGit(projectRoot, ['rev-parse', '--verify', '--quiet', `refs/heads/${branch}`])) {
      throw new Error(`Branch ${branch} already exists; delete it or merge it before updating again.`);
    }
    gitIn(projectRoot, ['checkout', '-q', '-b', branch]);
  }

  cleanStaleInstallerFiles(projectRoot, [...new Set(operations.map(({ destination }) => path.dirname(destination)))]);
  ensureConsumerGitignore(projectRoot);

  let installed = 0;
  let unchanged = 0;
  for (const { source, destination, label, file } of operations) {
    if (sameContent(source, destination)) {
      console.log(`Unchanged: ${label}`);
      unchanged += 1;
      continue;
    }

    assertSafeDestination(projectRoot, destination, source);
    mkdirSync(path.dirname(destination), { recursive: true });
    assertSafeDestination(projectRoot, destination, source);
    if (file) installFile(source, destination);
    else installTree(source, destination, projectRoot);
    console.log(`Installed: ${label}`);
    installed += 1;
  }
  if (writeManifest(projectRoot, manifest)) console.log(`Recorded: ${manifestName} (v${version})`);

  console.log(`\nDone. ${installed} installed, ${unchanged} already current.`);

  if (branch) {
    const paths = ['.gitignore', manifestName, ...new Set(manifestPaths.map((file) => file.split('/').slice(0, 2).join('/')))];
    gitIn(projectRoot, ['add', '-A', '--', ...paths]);
    gitIn(projectRoot, [
      'commit', '-q', '-m', `chore: atualiza padrão OpenSpec para v${version}`, '-m', `Padrao-OpenSpec: v${version}`, '--', ...paths,
    ]);
    console.log(`Committed the update on branch ${branch}. Push it and open a pull request to review it.`);
  }
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
