// Shared helpers for the standard's Claude Code hooks (ADR-0006). A hook reads one JSON payload on
// stdin and answers on stdout; printing nothing lets the tool call or the stop go ahead.

import { readFileSync } from 'node:fs';

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
