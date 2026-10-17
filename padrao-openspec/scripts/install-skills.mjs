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

// Stack-specific skills are installed only when requested with --stack; every other skill is always installed.
const stacks = {
  dotnet: {
    skill: 'dotnet-implementation',
    officialSkills: 'Official .NET skills: /plugin marketplace add dotnet/skills, then /plugin install <plugin>@dotnet-agent-skills (https://github.com/dotnet/skills)',
  },
  nextjs: {
    skill: 'nextjs-implementation',
    officialSkills: 'Vercel React/Next.js skills: npx skills add vercel-labs/agent-skills (https://github.com/vercel-labs/agent-skills)',
  },
};
const stackSkillNames = new Set(Object.values(stacks).map(({ skill }) => skill));

function usage() {
  console.log(`Usage: node scripts/install-skills.mjs <consumer-project> [options]

Install bundled skills, OPSX slash commands and VS Code agents into a consumer project, and ignore its local
openspec/ directory in Git.

Arguments:
  <consumer-project>  Path to the target project directory

Options:
  --target <agents|claude|both>  Skill destination (default: both); OPSX commands always go to
                                 .claude/commands/opsx and VS Code agents to .github/agents
  --stack <dotnet|nextjs>        Also install the stack implementation skill; repeat or use a comma list
                                 (e.g. --stack dotnet,nextjs). Without it, only stack-neutral skills are installed
  --force                        Overwrite colliding files; unrelated files are preserved
  -h, --help                      Show this help`);
}

function parseArgs(args) {
  const options = { project: null, target: 'both', stacks: [], force: false };

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
      const value = args[index + 1];
      if (value === undefined || value.startsWith('-')) {
        throw new Error(`--stack requires a value: ${Object.keys(stacks).join(', ')}.`);
      }
      const requested = value.split(',').map((item) => item.trim()).filter(Boolean);
      if (requested.length === 0) {
        throw new Error(`--stack requires a value: ${Object.keys(stacks).join(', ')}.`);
      }
      for (const stack of requested) {
        if (!Object.hasOwn(stacks, stack)) {
          throw new Error(`Invalid stack "${stack}". Use ${Object.keys(stacks).join(', ')}.`);
        }
        if (!options.stacks.includes(stack)) options.stacks.push(stack);
      }
      index += 1;
    } else if (arg === '--force') {
      options.force = true;
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
  const nonemptyLines = original.split(/\r?\n/).filter((line) => line.length > 0);
  const lastLine = nonemptyLines.at(-1)?.replace(/[ \t]+$/, '');
  const precedingLine = nonemptyLines.at(-2)?.replace(/[ \t]+$/, '');
  const alreadyIgnored = precedingLine === marker && lastLine === '/openspec/';
  if (alreadyIgnored) {
    console.log('Unchanged: .gitignore already excludes the project openspec/ directory.');
  } else {
    const eol = original.includes('\r\n') ? '\r\n' : '\n';
    // Drop earlier copies of the managed block so moving it to the end does not accumulate duplicates.
    const previousBlocks = new RegExp(`^${escapeRegExp(marker)}[ \\t]*\\r?\\n/openspec/[ \\t]*(?:\\r?\\n|$)`, 'gm');
    const cleaned = original.replace(previousBlocks, '');
    const separator = cleaned.length === 0 || cleaned.endsWith('\n') || cleaned.endsWith('\r') ? '' : eol;
    const block = [marker, '/openspec/'].join(eol);
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
      console.log('Updated: .gitignore excludes /openspec/.');
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

  const availableSkills = listSkills();
  const selectedStackSkills = new Set(options.stacks.map((stack) => stacks[stack].skill));
  for (const name of selectedStackSkills) {
    if (!availableSkills.some((skill) => skill.name === name)) {
      throw new Error(`Stack skill "${name}" was not found under ${sourceSkills}`);
    }
  }
  const skills = availableSkills.filter(({ name }) =>
    !stackSkillNames.has(name) || selectedStackSkills.has(name));
  if (skills.length === 0) {
    throw new Error(`No skills containing SKILL.md were found under ${sourceSkills}`);
  }
  listAgents();
  assertCommands();

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
  ];

  for (const { source, destination } of operations) {
    assertSafeDestination(projectRoot, destination, source);
  }

  const conflicts = operations.filter(({ source, destination }) =>
    existsSync(destination) && !filesAreIdentical(source, destination) && !options.force);

  if (conflicts.length > 0) {
    const details = conflicts
      .map(({ name, destination }) => `  ${name}: ${destination}`)
      .join('\n');
    throw new Error(
      `Existing customization files differ from the store; nothing was copied. Review these paths, ` +
      `or rerun with --force to overwrite matching files (extra files are preserved):\n${details}`,
    );
  }

  cleanStaleInstallerFiles(projectRoot, [...new Set(operations.map(({ destination }) => path.dirname(destination)))]);
  ensureConsumerGitignore(projectRoot);

  let installed = 0;
  let unchanged = 0;
  for (const { source, destination, label } of operations) {
    if (filesAreIdentical(source, destination)) {
      console.log(`Unchanged: ${label}`);
      unchanged += 1;
      continue;
    }

    assertSafeDestination(projectRoot, destination, source);
    const parent = path.dirname(destination);
    mkdirSync(parent, { recursive: true });
    assertSafeDestination(projectRoot, destination, source);
    installTree(source, destination, projectRoot);
    console.log(`Installed: ${label}`);
    installed += 1;
  }

  console.log(`\nDone. ${installed} installed, ${unchanged} already current.`);

  if (options.stacks.length > 0) {
    console.log('\nThe stack skills defer framework guidance to the official skills, which are installed separately:');
    for (const stack of options.stacks) {
      console.log(`  ${stack}: ${stacks[stack].officialSkills}`);
    }
  }
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
