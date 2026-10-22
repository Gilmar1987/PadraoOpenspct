#!/usr/bin/env node

// Stop hook from the code repository's .claude/settings.json (ADR-0006). Before the turn ends, it
// looks at the changes of the OpenSpec root the CLI resolves from here (the store declared in
// openspec/config.yaml, or a local openspec/) and blocks the stop once when a task is marked done
// without an "Evidência:" line right below it, as the apply workflow requires.
//
// It runs at the end of every turn of every conversation, so it stays cheap and narrow: one CLI call,
// a timeout, and only the tasks.md files changed since this conversation started (another person's
// change, or one older than the rule, never blocks this conversation).
//
// Any environment failure (no CLI, no root, unreadable files) lets the turn end with a warning on
// stderr: blocking on a broken environment would stall every conversation.

import { existsSync, openSync, readSync, closeSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { blockStop, idPattern, openspecJson, readPayload } from './comum.mjs';

const hookName = 'cobra-evidencia';
const checkedLine = /^\s*-\s*\[[xX]\]\s/;
const evidenceLine = /^\s+-\s*Evid[êe]ncia:/;

// When this conversation started: the timestamp of the transcript's first entry. null when unknown,
// and then every change is checked.
function sessionStart(transcriptPath) {
  if (typeof transcriptPath !== 'string' || !existsSync(transcriptPath)) return null;
  const buffer = Buffer.alloc(65536);
  const fd = openSync(transcriptPath, 'r');
  let read = 0;
  try {
    read = readSync(fd, buffer, 0, buffer.length, 0);
  } finally {
    closeSync(fd);
  }
  for (const line of buffer.toString('utf8', 0, read).split('\n')) {
    try {
      const time = Date.parse(JSON.parse(line).timestamp);
      if (Number.isFinite(time)) return time;
    } catch {
      // A partial or non-JSON line: try the next one.
    }
  }
  return null;
}

function hasEvidence(lines, index) {
  // The task's own sub-items are the indented lines that follow it, up to the next unindented line.
  for (let next = index + 1; next < lines.length; next += 1) {
    const line = lines[next];
    if (line.trim() === '') continue;
    if (!/^\s/.test(line)) return false;
    if (evidenceLine.test(line)) return true;
  }
  return false;
}

function missingEvidence(change, tasksPath) {
  const lines = readFileSync(tasksPath, 'utf8').split(/\r?\n/);
  const missing = [];
  lines.forEach((line, index) => {
    if (checkedLine.test(line) && !hasEvidence(lines, index)) {
      missing.push(`${change}: ${line.replace(checkedLine, '').split(/\s+/).slice(0, 8).join(' ')}`);
    }
  });
  return missing;
}

const payload = readPayload(hookName);
if (payload && payload.stop_hook_active !== true) {
  const cwd = typeof payload.cwd === 'string' && payload.cwd ? payload.cwd : process.cwd();
  try {
    const list = openspecJson(['list'], cwd);
    const root = typeof list?.root?.path === 'string' ? list.root.path : null;
    const since = sessionStart(payload.transcript_path);
    const missing = [];
    for (const change of list?.changes ?? []) {
      if (!idPattern.test(change.name ?? '') || (change.completedTasks ?? 0) === 0 || !root) continue;
      // The default spec-driven schema tracks openspec/changes/<change>/tasks.md.
      const tasksPath = path.join(root, 'openspec', 'changes', change.name, 'tasks.md');
      if (!existsSync(tasksPath)) continue;
      if (since !== null && statSync(tasksPath).mtimeMs < since) continue;
      missing.push(...missingEvidence(change.name, tasksPath));
    }
    if (missing.length > 0) {
      blockStop(
        `Tarefas marcadas sem a linha "Evidência:" logo abaixo (padrão OpenSpec):\n- ${missing.join('\n- ')}\n` +
        'Se você marcou a tarefa nesta conversa, acrescente a evidência (comando → resultado (exit N)) ou ' +
        'desmarque-a se não foi verificada. Se a tarefa não é desta conversa, não altere o tasks.md: só avise o usuário.',
      );
    }
  } catch (error) {
    process.stderr.write(`[${hookName}] ${error.message}; o turno segue sem checagem.\n`);
  }
}
