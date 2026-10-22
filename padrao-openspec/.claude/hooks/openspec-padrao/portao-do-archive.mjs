#!/usr/bin/env node

// PreToolUse hook (Bash|PowerShell) from the code repository's .claude/settings.json (ADR-0006).
// It acts only on `openspec archive <change>`: when the repository has the standard's gate
// (docs/openspec-portao.mjs), it runs `archive <change>` there and denies the command unless the gate
// allows it; without the gate, it asks the user. The archive rules live in the gate, not here.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { ask, deny, idPattern, readPayload, repositoryRoot, shellCommands } from './comum.mjs';

const hookName = 'portao-do-archive';
const viaWorkflow = 'Rode /opsx:archive, que confere aprovação, tarefas, verify e revisão antes de arquivar.';

// Every `openspec [global flags] archive ...` of the line, with its change and --store.
function archiveCalls(command) {
  const calls = [];
  for (const words of shellCommands(command)) {
    const at = words.findIndex((word) => /^openspec(\.cmd|\.exe)?$/i.test(path.basename(word.replace(/\\/g, '/'))));
    if (at === -1) continue;
    let index = at + 1;
    while (index < words.length && words[index].startsWith('-')) index += 1;
    if (words[index] !== 'archive') continue;
    let change = null;
    let store = null;
    for (index += 1; index < words.length; index += 1) {
      const word = words[index];
      if (word === '--store') {
        store = words[index + 1] ?? '';
        index += 1;
      } else if (word.startsWith('--store=')) {
        store = word.slice('--store='.length);
      } else if (!word.startsWith('-') && change === null) {
        change = word;
      }
    }
    calls.push({ change, store });
  }
  return calls;
}

function gateReasons(gate, call, cwd) {
  const args = [gate, 'archive', call.change, '--json', ...(call.store ? ['--store', call.store] : [])];
  const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', timeout: 30000 });
  if (result.status === 0) return [];
  try {
    const reasons = JSON.parse(result.stdout).motivos;
    if (Array.isArray(reasons) && reasons.length > 0) return reasons;
  } catch {
    // Not JSON: fall back to the raw output below.
  }
  return [`${result.stderr ?? ''}${result.stdout ?? ''}`.trim() || `o portão saiu com ${result.status ?? 'erro'}`];
}

const payload = readPayload(hookName);
const command = payload?.tool_input?.command;
const calls = typeof command === 'string' ? archiveCalls(command) : [];
if (calls.length > 0) {
  const cwd = typeof payload.cwd === 'string' && payload.cwd ? payload.cwd : process.cwd();
  const root = repositoryRoot(cwd) ?? cwd;
  const gate = path.join(root, 'docs', 'openspec-portao.mjs');
  const blocked = [];
  let needsConfirmation = null;
  for (const call of calls) {
    if (!call.change) {
      needsConfirmation = `openspec archive sem o nome da change. ${viaWorkflow}`;
    } else if (!idPattern.test(call.change) || (call.store !== null && !idPattern.test(call.store))) {
      blocked.push(`nome de change ou de store inválido: ${call.change}${call.store !== null ? ` (--store ${call.store})` : ''}`);
    } else if (!existsSync(gate)) {
      needsConfirmation = `Arquivar ${call.change} direto pelo CLI pula as checagens do fluxo. ${viaWorkflow}`;
    } else {
      blocked.push(...gateReasons(gate, call, cwd).map((reason) => `${call.change}: ${reason}`));
    }
  }
  if (blocked.length > 0) {
    deny(`O portão do padrão bloqueou o archive:\n- ${blocked.join('\n- ')}\n${viaWorkflow}`);
  } else if (needsConfirmation) {
    ask(needsConfirmation);
  }
}
