#!/usr/bin/env node

// PreToolUse hook (Bash|PowerShell) from the code repository's .claude/settings.json (ADR-0006), for the
// main agent and every subagent. It denies the shell forms that switch off the standard's commit-msg hook:
// `--no-verify` on any git command, `-n` on `git commit`, and any write of core.hooksPath (`git config`,
// `git -c`). Reading core.hooksPath stays allowed.
//
// Declared limit: a heuristic over the command text, like the other role hooks; `git` reached through a
// variable or `$( )` is not modelled. The commit-msg hook stays the main barrier.

import path from 'node:path';
import { deny, readPayload, shellCommands } from './comum.mjs';

const hookName = 'protege-ganchos';
const reason = 'O hook commit-msg do padrão confere a change de cada commit (trailer OpenSpec-Change) e não pode ser pulado nem desligado. Se ele estiver recusando um commit legítimo, mostre ao usuário a mensagem dele.';
// Global options that take a separate value, before the subcommand.
const valueOptions = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--exec-path', '--config-env']);
const configReads = new Set(['--get', '--get-all', '--get-regexp', '--list', '-l', '--show-origin', '--show-scope']);

function hooksPathSetting(value) {
  return /^core\.hookspath(=|$)/i.test(String(value));
}

function switchesHooksOff(words) {
  let index = 1;
  while (index < words.length && words[index].startsWith('-')) {
    const option = words[index];
    if (option === '-c' && hooksPathSetting(words[index + 1])) return true;
    if (/^--config-env=/i.test(option) && /core\.hookspath/i.test(option)) return true;
    index += valueOptions.has(option) ? 2 : 1;
  }
  const sub = words[index];
  const rest = words.slice(index + 1);
  if (rest.includes('--no-verify')) return true;
  if (sub === 'commit') {
    for (const arg of rest) {
      if (arg === '--') break;
      // Grouped short options: -n alone or among others (-an, -nm). After -m, -F or -c the rest is a value.
      if (/^-[a-zA-Z]+$/.test(arg)) {
        for (const letter of arg.slice(1)) {
          if (letter === 'n') return true;
          if ('mFcCt'.includes(letter)) break;
        }
      }
    }
  }
  if (sub === 'config') {
    const key = rest.find((arg) => !arg.startsWith('-'));
    if (key && hooksPathSetting(key) && !rest.some((arg) => configReads.has(arg))) return true;
  }
  return false;
}

const payload = readPayload(hookName);
const command = payload?.tool_input?.command;
if (typeof command === 'string') {
  const blocked = shellCommands(command).some((words) => {
    const program = path.basename(String(words[0] ?? '').replace(/\\/g, '/')).toLowerCase();
    return (program === 'git' || program === 'git.exe') && switchesHooksOff(words);
  });
  if (blocked) deny(reason);
}
