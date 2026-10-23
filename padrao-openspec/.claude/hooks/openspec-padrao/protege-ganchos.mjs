#!/usr/bin/env node

// PreToolUse hook (Bash|PowerShell) from the code repository's .claude/settings.json (ADR-0006), for the
// main agent and every subagent. It denies the shell forms that switch off the standard's commit-msg hook:
// `--no-verify` (or a prefix git accepts, like `--no-verif`) on any git command, `-n` on `git commit`,
// and any write of core.hooksPath (`git config`, `git config set|unset`, `git -c`, `--config-env`, the
// GIT_CONFIG_* variables). Reading core.hooksPath stays allowed.
//
// Declared limit: a heuristic over the command text, like the other role hooks; `git` reached through a
// variable, an alias, `bash -c "..."` or `$( )` is not modelled. The commit-msg hook stays the main barrier.

import path from 'node:path';
import { deny, readPayload, shellCommands } from './comum.mjs';

const hookName = 'protege-ganchos';
const reason = 'O hook commit-msg do padrão confere a change de cada commit (trailer OpenSpec-Change) e não pode ser pulado nem desligado. Se ele estiver recusando um commit legítimo, mostre ao usuário a mensagem dele.';
// Words that run the command after them: the git call is the first word that is not one of these.
const commandPrefixes = new Set(['env', 'sudo', 'command', 'nohup', 'exec', 'time', 'nice', 'xargs', 'then', 'do', 'else', '!']);
// Global options that take a separate value, before the subcommand.
const valueOptions = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--exec-path', '--config-env', '--super-prefix']);
// `git commit` short options whose value may come glued (-mtext, -uno) or as the next word.
const commitValueLetters = 'mFcCtuS';
// `git config` options that take a separate value, so that value is not read as the key.
const configValueOptions = new Set(['-f', '--file', '--blob', '--type', '--default', '--comment', '--value']);
const configWriteOptions = new Set(['--unset', '--unset-all', '--add', '--replace-all', '--rename-section', '--remove-section', '--edit', '-e']);
const configReadOptions = new Set(['--get', '--get-all', '--get-regexp', '--get-urlmatch', '--get-color', '--get-colorbool', '--list', '-l']);

const isHooksPath = (value) => /^core\.hookspath$/i.test(String(value));
const setsHooksPath = (value) => /^core\.hookspath(=|$)/i.test(String(value));
const noVerify = (arg) => /^--no-veri(f|fy)?$/.test(arg);

// Drops environment assignments and wrapper commands; an assignment of a GIT_CONFIG_* variable that names
// core.hooksPath already switches the hook off.
function gitCall(words) {
  let index = 0;
  let viaEnvironment = false;
  while (index < words.length) {
    const word = words[index];
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(word)) {
      if (/^GIT_CONFIG_/i.test(word) && /core\.hookspath/i.test(word)) viaEnvironment = true;
      index += 1;
    } else if (commandPrefixes.has(word) || (index > 0 && words[index - 1] === 'env' && word.startsWith('-'))) {
      index += 1;
    } else {
      break;
    }
  }
  const program = path.basename(String(words[index] ?? '').replace(/\\/g, '/')).toLowerCase();
  if (program !== 'git' && program !== 'git.exe') return null;
  return { args: words.slice(index + 1), viaEnvironment };
}

function commitSkipsHook(rest) {
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === '--') break;
    if (/^-[a-zA-Z]+$/.test(arg)) {
      for (let position = 1; position < arg.length; position += 1) {
        const letter = arg[position];
        if (letter === 'n') return true;
        if (commitValueLetters.includes(letter)) {
          // Value glued to the letter (-mtexto, -uno) or, when the letter ends the word, the next word.
          if (position === arg.length - 1 && 'mFcCt'.includes(letter)) index += 1;
          break;
        }
      }
    }
  }
  return false;
}

function configWritesHooksPath(rest) {
  const positional = [];
  let write = false;
  let read = false;
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (configValueOptions.has(arg)) index += 1;
    else if (configWriteOptions.has(arg)) write = true;
    else if (configReadOptions.has(arg)) read = true;
    else if (!arg.startsWith('-')) positional.push(arg);
  }
  // Subcommand syntax (git 2.46+): git config set|unset <key> ..., git config get|list ...
  if (['set', 'unset', 'rename-section', 'remove-section', 'edit'].includes(positional[0])) {
    return positional.slice(1).some(isHooksPath);
  }
  if (['get', 'list'].includes(positional[0])) return false;
  const [key, value] = positional;
  if (!isHooksPath(key) || read) return false;
  return write || value !== undefined;
}

function switchesHooksOff(words) {
  const call = gitCall(words);
  if (!call) return false;
  if (call.viaEnvironment) return true;
  const { args } = call;
  let index = 0;
  while (index < args.length && args[index].startsWith('-')) {
    const option = args[index];
    if (option === '-c' && setsHooksPath(args[index + 1])) return true;
    if (option === '--config-env' && /^core\.hookspath=/i.test(args[index + 1] ?? '')) return true;
    if (/^--config-env=core\.hookspath=/i.test(option)) return true;
    index += valueOptions.has(option) ? 2 : 1;
  }
  const sub = args[index];
  const rest = args.slice(index + 1);
  if (rest.some(noVerify)) return true;
  if (sub === 'commit' && commitSkipsHook(rest)) return true;
  if (sub === 'config' && configWritesHooksPath(rest)) return true;
  return false;
}

const payload = readPayload(hookName);
const command = payload?.tool_input?.command;
if (typeof command === 'string' && shellCommands(command).some(switchesHooksOff)) deny(reason);
