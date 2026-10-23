#!/usr/bin/env node

// PreToolUse hook (Edit|Write) from the code repository's .claude/settings.json (ADR-0006), for the main
// agent and every subagent. A write inside the repository and outside openspec/ needs an active change
// that is approved, with its seal valid (or absent, for older approvals) and no pending inference. Without
// one, the hook asks the user instead of denying: the standard's rule is that code goes through a change,
// but only the person can tell whether this edit was asked outside the flow.
//
// Only a positive answer is cached, per session and for 60 seconds, so the 2–3 s of the OpenSpec CLI are
// not paid on every edit; a negative one is never cached, so an approval recorded a moment ago counts.
// Without the gate, or when the gate fails, the hook stays silent.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ask, idPattern, readPayload, repositoryRoot } from './comum.mjs';

const hookName = 'exige-change';
const cacheMs = 60 * 1000;
const caseInsensitive = process.platform === 'win32';
const question = 'Nenhuma change ativa aprovada (ou a aprovação venceu, ou há inferências a confirmar). No padrão, toda mudança de código passa por uma change: /opsx:propose, aprovação e /opsx:apply. Confirme só se o usuário pediu esta edição fora do fluxo.';

function normalize(value) {
  const forward = value.split(path.sep).join('/').replace(/\\/g, '/');
  return caseInsensitive ? forward.toLowerCase() : forward;
}

// Real path of the nearest existing ancestor, so a link, a junction or a short 8.3 name does not make a
// file inside the repository look like it is outside.
function realPath(value) {
  let current = path.resolve(value);
  const tail = [];
  while (!existsSync(current)) {
    const parent = path.dirname(current);
    if (parent === current) return path.resolve(value);
    tail.unshift(path.basename(current));
    current = parent;
  }
  try {
    return path.join(realpathSync.native(current), ...tail);
  } catch {
    return path.resolve(value);
  }
}

function approvedChangeExists(gate, cwd) {
  const result = spawnSync(process.execPath, [gate, 'estado', '--json'], { cwd, encoding: 'utf8', timeout: 20000 });
  if (result.error || result.status !== 0) return null;
  try {
    const state = JSON.parse(result.stdout);
    if (!Array.isArray(state.changes)) return null;
    return state.changes.some((item) => ['apply', 'archive'].includes(item.aprovacao)
      && ['valido', 'ausente'].includes(item.selo) && !item.inferencias);
  } catch {
    return null;
  }
}

const payload = readPayload(hookName);
const input = payload?.tool_input ?? {};
const target = input.file_path ?? input.notebook_path;
if (typeof target === 'string' && target) {
  const cwd = typeof payload.cwd === 'string' && payload.cwd ? payload.cwd : process.cwd();
  const root = repositoryRoot(cwd);
  const gate = root ? path.join(root, 'docs', 'openspec-portao.mjs') : null;
  const relative = root ? normalize(path.relative(realPath(root), realPath(path.resolve(cwd, target.replace(/\\/g, '/'))))) : '';
  const inside = root && relative && !relative.startsWith('../') && relative !== '..' && !path.isAbsolute(relative);
  if (inside && !relative.startsWith('openspec/') && existsSync(gate)) {
    const session = typeof payload.session_id === 'string' && idPattern.test(payload.session_id) ? payload.session_id : null;
    const cacheFile = session ? path.join(os.tmpdir(), 'openspec-padrao', `estado-${session}.json`) : null;
    let cached = false;
    try {
      cached = Boolean(cacheFile && existsSync(cacheFile)
        && Date.now() - JSON.parse(readFileSync(cacheFile, 'utf8')).em < cacheMs);
    } catch {
      cached = false;
    }
    if (!cached) {
      const approved = approvedChangeExists(gate, cwd);
      if (approved === false) {
        ask(question);
      } else if (approved && cacheFile) {
        try {
          mkdirSync(path.dirname(cacheFile), { recursive: true });
          writeFileSync(cacheFile, JSON.stringify({ em: Date.now() }));
        } catch {
          // A cache that cannot be written only costs another CLI call next time.
        }
      }
    }
  }
}
