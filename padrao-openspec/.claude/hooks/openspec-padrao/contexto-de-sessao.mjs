#!/usr/bin/env node

// SessionStart hook from the code repository's .claude/settings.json (ADR-0006). When the repository has
// the standard's gate (docs/openspec-portao.mjs), it runs `estado` and hands the agent a short summary of
// the active changes, so the session starts from the real state of the flow instead of a guess. It never
// blocks: without the gate, or when the gate fails, it prints nothing.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { readPayload, repositoryRoot } from './comum.mjs';

const hookName = 'contexto-de-sessao';
const maxChanges = 20;

// The same wording as the gate's text output (stateLine in docs/openspec-portao.mjs).
function stateLine(item) {
  const approval = item.aprovacao === 'pendente' ? 'aprovação pendente' : `aprovada (${item.aprovacao})`;
  const sealWords = { valido: 'válido', vencido: 'vencido', 'ilegível': 'ilegível', ausente: 'ausente' };
  const seal = item.aprovacao === 'pendente' ? '' : `, selo ${sealWords[item.selo] ?? item.selo}`;
  const marks = item.inferencias ? `, ${item.inferencias} inferência(s) a confirmar` : '';
  return `- ${item.change}: ${item.tarefas.feitas}/${item.tarefas.total} tarefas, ${approval}${seal}${marks} → ${item.proximo}`;
}

const payload = readPayload(hookName);
const cwd = typeof payload?.cwd === 'string' && payload.cwd ? payload.cwd : process.cwd();
const root = repositoryRoot(cwd) ?? cwd;
const gate = path.join(root, 'docs', 'openspec-portao.mjs');
if (payload && existsSync(gate)) {
  const result = spawnSync(process.execPath, [gate, 'estado', '--json'], { cwd, encoding: 'utf8', timeout: 20000 });
  let state = null;
  try {
    state = result.status === 0 ? JSON.parse(result.stdout) : null;
  } catch {
    state = null;
  }
  if (state && Array.isArray(state.changes)) {
    const lines = ['Estado do fluxo OpenSpec (portão do padrão, no início desta sessão):'];
    if (!state.changes.length) {
      lines.push('Nenhuma change ativa: para mudar código, comece pelo /opsx:propose.');
    } else {
      lines.push(...state.changes.slice(0, maxChanges).map(stateLine));
      if (state.changes.length > maxChanges) lines.push(`- +${state.changes.length - maxChanges} change(s) ativas`);
      lines.push('Use este estado em vez de deduzir a fase; rode "node docs/openspec-portao.mjs estado" para atualizar.');
    }
    process.stdout.write(`${JSON.stringify({
      hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: lines.join('\n') },
    })}\n`);
  }
}
