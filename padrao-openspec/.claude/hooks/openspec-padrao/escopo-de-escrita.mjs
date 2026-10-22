#!/usr/bin/env node

// PreToolUse hook (Edit|Write) from the code repository's .claude/settings.json (ADR-0006). It acts only
// on calls made by the standard's implementer subagent (the payload's agent_type) and denies writes
// outside the repository and into the
// files the standard manages (.claude/, .github/agents/, docs/openspec-*, .openspec-padrao.json):
// those change through the standard's installer, not through a change's implementation.
//
// The repository root is the Git top level of the payload's cwd, so a subagent working in a
// worktree is scoped to that worktree (CLAUDE_PROJECT_DIR keeps pointing at the main checkout).

import path from 'node:path';
import { deny, readPayload, repositoryRoot } from './comum.mjs';

const hookName = 'escopo-de-escrita';
const implementerAgents = new Set(['openspec-code-implementer']);
const caseInsensitive = process.platform === 'win32';

function normalize(value) {
  const forward = value.split(path.sep).join('/').replace(/\\/g, '/');
  return caseInsensitive ? forward.toLowerCase() : forward;
}

function managedReason(relative) {
  if (relative.startsWith('.claude/')) return 'configuração do Claude Code gerenciada pelo padrão';
  if (relative.startsWith('.github/agents/')) return 'agentes do Copilot gerenciados pelo padrão';
  if (relative === '.openspec-padrao.json') return 'manifesto do padrão';
  if (/^docs\/openspec-[^/]+$/.test(relative)) return 'arquivo do padrão em docs/';
  return null;
}

const payload = readPayload(hookName);
const input = payload?.tool_input ?? {};
const target = input.file_path ?? input.notebook_path;
if (implementerAgents.has(payload?.agent_type) && typeof target === 'string' && target) {
  const cwd = typeof payload.cwd === 'string' && payload.cwd ? payload.cwd : process.cwd();
  const root = repositoryRoot(cwd) ?? path.resolve(process.env.CLAUDE_PROJECT_DIR || cwd);
  const absolute = path.resolve(cwd, target.replace(/\\/g, '/'));
  const relative = normalize(path.relative(root, absolute));
  if (relative === '' || relative.startsWith('../') || relative === '..' || path.isAbsolute(relative)) {
    deny(`Escrita fora do repositório (padrão OpenSpec): ${target}. O implementador só altera arquivos do repositório de código.`);
  } else {
    const reason = managedReason(relative);
    if (reason) {
      deny(`Escrita em ${relative} negada (padrão OpenSpec): ${reason}. Esses arquivos mudam pelo instalador do padrão; se a change precisar deles, devolva a questão ao agente coordenador.`);
    }
  }
}
