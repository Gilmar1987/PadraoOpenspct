#!/usr/bin/env node

// Stop hook from the code repository's .claude/settings.json (ADR-0006). Before the turn ends, it
// looks at the active changes of the OpenSpec root the CLI resolves from here (the store declared in
// openspec/config.yaml, or a local openspec/) and blocks the stop once when a task is marked done
// without an "Evidência:" line right below it, as the apply workflow requires.
//
// Any environment failure (no CLI, no root, unreadable files) lets the turn end with a warning on
// stderr: blocking on a broken environment would stall every conversation.

import { readFileSync } from 'node:fs';
import { blockStop, idPattern, openspecJson, readPayload } from './comum.mjs';

const hookName = 'cobra-evidencia';
const checkedLine = /^\s*-\s*\[[xX]\]\s/;
const evidenceLine = /^\s+-\s*Evid[êe]ncia:/;

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

function missingEvidence(change, cwd) {
  const apply = openspecJson(['instructions', 'apply', '--change', change], cwd);
  if (!apply || !Array.isArray(apply.tasks)) return null;
  const files = new Map();
  const missing = [];
  for (const task of apply.tasks) {
    if (!task.done || typeof task.sourcePath !== 'string' || !Number.isInteger(task.line)) continue;
    if (!files.has(task.sourcePath)) files.set(task.sourcePath, readFileSync(task.sourcePath, 'utf8').split(/\r?\n/));
    const lines = files.get(task.sourcePath);
    const index = task.line - 1;
    if (!checkedLine.test(lines[index] ?? '')) continue;
    if (!hasEvidence(lines, index)) missing.push(`${change}: ${String(task.description).split(/\s+/).slice(0, 8).join(' ')}`);
  }
  return missing;
}

const payload = readPayload(hookName);
if (payload && payload.stop_hook_active !== true) {
  const cwd = typeof payload.cwd === 'string' && payload.cwd ? payload.cwd : process.cwd();
  try {
    const list = openspecJson(['list'], cwd);
    const active = (list?.changes ?? []).filter((change) =>
      idPattern.test(change.name ?? '') && change.status !== 'complete' && (change.completedTasks ?? 0) > 0);
    const missing = [];
    for (const change of active) {
      const found = missingEvidence(change.name, cwd);
      if (found === null) {
        process.stderr.write(`[${hookName}] não consegui ler as tarefas de ${change.name}; o turno segue sem checagem.\n`);
      } else {
        missing.push(...found);
      }
    }
    if (missing.length > 0) {
      blockStop(`Tarefas marcadas sem a linha "Evidência:" logo abaixo (padrão OpenSpec):\n- ${missing.join('\n- ')}\nAcrescente a evidência de cada uma (comando → resultado (exit N)) ou desmarque a tarefa que não foi verificada.`);
    }
  } catch (error) {
    process.stderr.write(`[${hookName}] ${error.message}; o turno segue sem checagem.\n`);
  }
}
