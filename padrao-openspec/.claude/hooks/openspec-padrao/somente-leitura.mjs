#!/usr/bin/env node

// PreToolUse hook (Bash|PowerShell) from the code repository's .claude/settings.json (ADR-0006). It acts
// only on calls made by the standard's verdict subagents, named in verdictAgents and identified by the
// payload's agent_type, and denies shell commands that write files or change the Git state, so a
// reviewer cannot alter what it reviews, while test, lint and build commands from project.md keep
// working. Calls from the main agent and from other subagents pass untouched.
//
// Declared limit: this is a heuristic over the command text, not a shell parser and not a sandbox.
// It catches the common, documented cases below; a command written to evade it (an absolute path to
// another interpreter, variable expansion, `$( )`, a .NET call from PowerShell) can get through.

import path from 'node:path';
import { deny, readPayload, shellCommands, unquoted } from './comum.mjs';

const hookName = 'somente-leitura';

// The subagents this hook restricts. A new verdict subagent of the standard joins this list.
const verdictAgents = new Set([
  'openspec-qa-validator', 'openspec-stage-reviewer', 'openspec-code-reviewer', 'openspec-validador-de-interface',
]);

// Redirection targets that do not write a file.
const harmlessTarget = /^(&\d|\/dev\/(null|stdout|stderr)|\$null|nul)$/i;

// Programs (and PowerShell cmdlets and aliases) that create, change, move or delete files.
const fileWriters = new Set([
  'rm', 'rmdir', 'mv', 'cp', 'tee', 'shred', 'truncate', 'dd', 'touch', 'mkdir', 'ln', 'install',
  'chmod', 'chown', 'unlink',
  'del', 'erase', 'copy', 'move', 'ren', 'rename', 'ni', 'md', 'rd', 'ri', 'mi', 'cpi', 'rni', 'sc', 'ac',
  'out-file', 'set-content', 'add-content', 'clear-content', 'new-item', 'remove-item', 'move-item',
  'copy-item', 'rename-item', 'tee-object',
]);

// Flags that run code given inline, per interpreter. They count only before the script or module.
const inlineFlags = {
  python: ['-c'], python3: ['-c'], py: ['-c'],
  node: ['-e', '--eval', '-p', '--print'], bun: ['-e', '--eval'],
  ruby: ['-e'], php: ['-r'], perl: ['-e', '-E'],
  bash: ['-c'], sh: ['-c'], zsh: ['-c'], dash: ['-c'],
  powershell: ['-c', '-command', '-encodedcommand', '-ec'], pwsh: ['-c', '-command', '-encodedcommand', '-ec'],
  cmd: ['/c', '/k'],
};
// Words that come before the command they run: privilege and environment wrappers, shell keywords
// (`then rm x`, `do rm x`, `! rm x`) and runners that take the command as arguments (`xargs rm`).
const commandPrefixes = new Set([
  'sudo', 'env', 'nohup', 'time', 'command', 'nice', 'exec', 'xargs',
  'then', 'do', 'else', 'elif', '!', '%', 'foreach-object',
]);

// Git subcommands that only read, or read in the forms allowed here.
function gitWrites(args) {
  let index = 0;
  while (index < args.length && args[index].startsWith('-')) {
    index += ['-C', '-c', '--git-dir', '--work-tree', '--namespace'].includes(args[index]) ? 2 : 1;
  }
  const sub = args[index];
  const rest = args.slice(index + 1);
  const has = (...flags) => rest.some((arg) => flags.includes(arg));
  const positional = rest.filter((arg) => !arg.startsWith('-'));
  switch (sub) {
    case 'commit': case 'push': case 'pull': case 'reset': case 'checkout': case 'restore': case 'switch':
    case 'merge': case 'rebase': case 'cherry-pick': case 'revert': case 'clean': case 'add': case 'rm':
    case 'mv': case 'apply': case 'am': case 'init': case 'clone': case 'gc': case 'prune': case 'update-ref':
      return true;
    case 'worktree': return rest[0] !== 'list';
    case 'stash': return !['list', 'show'].includes(rest[0]);
    case 'branch': return has('-d', '-D', '-m', '-M', '-c', '-C', '-f', '--delete', '--move', '--copy', '--force');
    case 'tag': {
      // Listing filters take a commit as their value: `git tag --contains HEAD@{1}` only reads.
      const listing = has('-l', '--list', '-n', '--contains', '--no-contains', '--points-at', '--merged', '--no-merged', '--sort', '--format');
      return has('-d', '--delete', '-a', '-s', '-f', '-m') || (positional.length > 0 && !listing);
    }
    case 'config': return !has('--get', '--get-all', '--get-regexp', '--list', '-l');
    case 'remote': return ['add', 'remove', 'rm', 'rename', 'set-url', 'set-head', 'prune'].includes(rest[0]);
    default: return false;
  }
}

function inlineCode(name, args) {
  const flags = inlineFlags[name];
  if (name === 'deno') return args[0] === 'eval';
  if (!flags) return false;
  for (const arg of args) {
    if (name.startsWith('py') && arg === '-m') return false;
    if (!arg.startsWith('-') && !(name === 'cmd' && arg.startsWith('/'))) return false;
    if (flags.includes(arg.toLowerCase())) return true;
  }
  return false;
}

function reasonFor(words) {
  let start = 0;
  while (start < words.length && (/^\w+=/.test(words[start]) || commandPrefixes.has(words[start]))) start += 1;
  if (start >= words.length) return null;
  const name = path.basename(words[start].replace(/\\/g, '/')).toLowerCase().replace(/\.(exe|cmd|bat)$/, '');
  const args = words.slice(start + 1);
  if (fileWriters.has(name)) return 'grava, move ou apaga arquivos';
  if (name === 'sed' && args.some((arg) => /^-[a-zA-Z]*i/.test(arg) || arg.startsWith('--in-place'))) return 'edita arquivo no lugar (sed -i)';
  if (name === 'perl' && args.some((arg) => /^-[a-zA-Z]*i/.test(arg))) return 'edita arquivo no lugar (perl -i)';
  if (name === 'find' && args.some((arg, index) => arg === '-delete'
    || (['-exec', '-execdir', '-ok'].includes(arg) && fileWriters.has(path.basename(args[index + 1] ?? '').toLowerCase())))) {
    return 'apaga ou altera arquivos (find)';
  }
  if (['eval', 'iex', 'invoke-expression'].includes(name)) return 'executa código montado em tempo de execução';
  if (inlineCode(name, args)) return 'executa código inline, que não dá para conferir antes';
  if (name === 'git' && gitWrites(args)) return 'altera o repositório Git';
  return null;
}

function redirection(text) {
  for (const match of text.matchAll(/(\d|&)?(>>?)(?!=)\s*(&\d|[^\s;|&()<>]+)?/g)) {
    const before = text[match.index - 1];
    if (before === '-' || before === '=' || before === '<') continue;
    const target = match[3] ?? '';
    if (target && harmlessTarget.test(target)) continue;
    return `redirecionamento para arquivo (${match[0].trim()})`;
  }
  return null;
}

function check(command) {
  const redirect = redirection(unquoted(command));
  if (redirect) return redirect;
  for (const words of shellCommands(command)) {
    const reason = reasonFor(words);
    if (reason) return `${reason}: ${words.slice(0, 3).join(' ')}`;
  }
  return null;
}

const payload = readPayload(hookName);
const command = payload?.tool_input?.command;
if (verdictAgents.has(payload?.agent_type) && typeof command === 'string') {
  const reason = check(command);
  if (reason) {
    deny(`Papel somente leitura (padrão OpenSpec): ${reason}. Rode só comandos de leitura e de verificação; se precisar alterar algo, devolva o achado ao agente coordenador.`);
  }
}
