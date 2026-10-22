#!/usr/bin/env node

// PreToolUse hook (Bash|PowerShell) declared in the frontmatter of the standard's verdict subagents
// (qa-validator, stage-reviewer, code-reviewer). It runs only while one of them is active and denies
// shell commands that write files or change the Git state, so a reviewer cannot alter what it
// reviews.
//
// Declared limit: this is a heuristic over the command text, not a shell parser and not a sandbox.
// It catches the common, documented cases below; a command written to evade it (an absolute path to
// another interpreter, variable expansion, `$( )`) can get through.

import { deny, readPayload, segments, unquoted } from './comum.mjs';

const hookName = 'somente-leitura';

// Redirection targets that do not write a file.
const harmlessTarget = /^(&\d|\/dev\/null|\$null|nul)$/i;

const rules = [
  { pattern: /^(sudo\s+)?(rm|rmdir|mv|tee|shred|truncate|dd)(\s|$)/i, reason: 'apaga, move ou grava arquivos' },
  { pattern: /^(sudo\s+)?sed\s(.*\s)?-[a-z]*i/i, reason: 'edita arquivo no lugar (sed -i)' },
  { pattern: /^perl\s(.*\s)?-[a-z]*i/i, reason: 'edita arquivo no lugar (perl -i)' },
  {
    pattern: /^(out-file|set-content|add-content|clear-content|new-item|remove-item|move-item|copy-item|rename-item|tee-object)(\s|$)/i,
    reason: 'grava, move ou apaga arquivos (PowerShell)',
  },
  {
    pattern: /^(python3?|py|node|deno|bun|ruby|perl|php)\s(.*\s)?(-c|-e|-p|-r|--eval|--print|eval)(\s|$)/i,
    reason: 'executa código inline, que não dá para conferir antes',
  },
  { pattern: /^(bash|sh|zsh|dash|powershell|pwsh|cmd)(\.exe)?\s(.*\s)?(-c|-command|-encodedcommand|\/c)(\s|$)/i, reason: 'executa código inline, que não dá para conferir antes' },
  { pattern: /^(eval|iex|invoke-expression)(\s|$)/i, reason: 'executa código montado em tempo de execução' },
  {
    pattern: /^git(\s+-[cC]\s+\S+)*\s+(commit|push|reset|checkout|restore|switch|merge|rebase|cherry-pick|revert|clean|add|rm|mv|stash|tag|apply|am)(\s|$)/i,
    reason: 'altera o repositório Git',
  },
];

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
  const text = unquoted(command);
  const redirect = redirection(text);
  if (redirect) return redirect;
  for (const segment of segments(text)) {
    // Leading variable assignments (FOO=bar cmd) are not the command.
    const commandText = segment.replace(/^(\w+=\S*\s+)+/, '');
    for (const rule of rules) {
      if (rule.pattern.test(commandText)) return `${rule.reason}: ${commandText.split(/\s+/).slice(0, 3).join(' ')}`;
    }
  }
  return null;
}

const payload = readPayload(hookName);
const command = payload?.tool_input?.command;
if (typeof command === 'string') {
  const reason = check(command);
  if (reason) {
    deny(`Papel somente leitura (padrão OpenSpec): ${reason}. Rode só comandos de leitura e de verificação; se precisar alterar algo, devolva o achado ao agente coordenador.`);
  }
}
