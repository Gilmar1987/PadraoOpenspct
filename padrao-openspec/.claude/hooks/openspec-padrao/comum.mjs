// Shared helpers for the standard's Claude Code hooks (ADR-0006). A hook reads one JSON payload on
// stdin and answers on stdout; printing nothing lets the tool call or the stop go ahead.

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// Returns the parsed payload, or null when stdin is empty or not JSON. A hook that cannot read its
// input lets the call through: blocking on a broken environment would stall every conversation.
export function readPayload(hookName) {
  let raw = '';
  try {
    raw = readFileSync(0, 'utf8');
  } catch {
    raw = '';
  }
  try {
    // Windows PowerShell 5.1 prepends a byte order mark to text piped into a native program.
    const payload = JSON.parse(raw.replace(/^﻿/, ''));
    return payload && typeof payload === 'object' ? payload : null;
  } catch {
    process.stderr.write(`[${hookName}] entrada do hook ilegível; a chamada segue sem checagem.\n`);
    return null;
  }
}

function preToolUse(decision, reason) {
  process.stdout.write(`${JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: decision,
      permissionDecisionReason: reason,
    },
  })}\n`);
}

export function deny(reason) {
  preToolUse('deny', reason);
}

export function ask(reason) {
  preToolUse('ask', reason);
}

export function blockStop(reason) {
  process.stdout.write(`${JSON.stringify({ decision: 'block', reason })}\n`);
}

// Shell text with the quoted parts blanked out, so that `grep "a > b"` is not read as a redirection.
// A heuristic, not a shell parser: nested quoting, here-docs and `$( )` are not modelled.
export function unquoted(command) {
  return String(command)
    .replace(/'[^']*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""');
}

// The commands of a shell line: split on ;, &&, ||, |, & and new lines.
export function segments(text) {
  return text.split(/\|\||&&|[;|&\n]/).map((part) => part.trim()).filter(Boolean);
}

// Change and store ids follow OpenSpec's kebab-case names; checking them keeps them safe for the
// Windows shell below.
export const idPattern = /^[a-z0-9][a-z0-9-]*$/i;

// Runs `openspec <args> --json` from cwd and returns the parsed output, or null when the CLI is
// missing, fails or does not answer in JSON. On Windows the CLI is a .cmd shim that spawnSync can
// only start through a shell; callers pass only fixed words and ids checked against idPattern.
export function openspecJson(args, cwd) {
  const full = [...args, '--json'];
  const options = { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] };
  const result = process.platform === 'win32'
    ? spawnSync(['openspec', ...full.map((value) => `"${value}"`)].join(' '), { ...options, shell: true })
    : spawnSync('openspec', full, options);
  if (result.error || typeof result.stdout !== 'string') return null;
  try {
    return JSON.parse(result.stdout);
  } catch {
    return null;
  }
}

// Git top level of cwd; null outside a repository.
export function repositoryRoot(cwd) {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd, encoding: 'utf8' });
  return result.status === 0 && result.stdout.trim() ? path.resolve(result.stdout.trim()) : null;
}
