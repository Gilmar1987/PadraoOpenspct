#!/usr/bin/env node

// PreToolUse hook (Bash|PowerShell) from the code repository's .claude/settings.json (ADR-0006).
// It acts only on `openspec archive <change>`: when the repository has the standard's gate
// (docs/openspec-portao.mjs), it runs `archive <change>` there and denies the command unless the gate
// allows it; without the gate, it asks the user. The archive rules live in the gate, not here.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { ask, deny, idPattern, readPayload, repositoryRoot, segments, unquoted } from './comum.mjs';

const hookName = 'portao-do-archive';
const viaWorkflow = 'Rode /opsx:archive, que confere aprovação, tarefas, verify e revisão antes de arquivar.';

// The change and the --store of an `openspec archive` command, or null when the line has none.
function archiveCall(command) {
  for (const segment of segments(unquoted(command))) {
    const words = segment.split(/\s+/);
    const at = words.findIndex((word, index) => /^openspec(\.cmd)?$/i.test(path.basename(word)) && words[index + 1] === 'archive');
    if (at === -1) continue;
    let change = null;
    let store = null;
    for (let index = at + 2; index < words.length; index += 1) {
      if (words[index] === '--store') {
        store = words[index + 1] ?? null;
        index += 1;
      } else if (!words[index].startsWith('-') && change === null) {
        change = words[index];
      }
    }
    return { change, store };
  }
  return null;
}

const payload = readPayload(hookName);
const command = payload?.tool_input?.command;
const call = typeof command === 'string' ? archiveCall(command) : null;
if (call) {
  const cwd = typeof payload.cwd === 'string' && payload.cwd ? payload.cwd : process.cwd();
  const root = repositoryRoot(cwd) ?? cwd;
  const gate = path.join(root, 'docs', 'openspec-portao.mjs');
  if (!call.change) {
    ask(`openspec archive sem o nome da change. ${viaWorkflow}`);
  } else if (!existsSync(gate)) {
    ask(`Arquivar ${call.change} direto pelo CLI pula as checagens do fluxo. ${viaWorkflow}`);
  } else if (!idPattern.test(call.change) || (call.store !== null && !idPattern.test(call.store))) {
    deny(`Nome de change ou de store inválido em "openspec archive": ${call.change}. ${viaWorkflow}`);
  } else {
    const args = [gate, 'archive', call.change, '--json', ...(call.store ? ['--store', call.store] : [])];
    const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8' });
    if (result.status !== 0) {
      let reasons = [];
      try {
        reasons = JSON.parse(result.stdout).motivos ?? [];
      } catch {
        reasons = [`${result.stderr ?? ''}${result.stdout ?? ''}`.trim() || `o portão saiu com ${result.status}`];
      }
      deny(`O portão do padrão bloqueou o archive de ${call.change}:\n- ${reasons.join('\n- ')}\n${viaWorkflow}`);
    }
  }
}
