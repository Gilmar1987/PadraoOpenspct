#!/usr/bin/env node

// PreToolUse hook (Edit|Write) from the code repository's .claude/settings.json (ADR-0006). It acts only
// on calls made by the standard's implementer subagent (the payload's agent_type) and denies writes
// outside the repository and into the files the standard manages (.claude/, .github/agents/,
// docs/openspec-*, .openspec-padrao.json): those change through the standard's installer, not through
// a change's implementation.
//
// The repository root is the Git top level of the payload's cwd, so a subagent working in a
// worktree is scoped to that worktree (CLAUDE_PROJECT_DIR keeps pointing at the main checkout).

import { lstatSync, readlinkSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { deny, readPayload, repositoryRoot } from './comum.mjs';

const hookName = 'escopo-de-escrita';
const implementerAgents = new Set(['openspec-code-implementer']);
const caseInsensitive = process.platform === 'win32';

// The real, long form of a path, so that a Windows short name (C:/Users/RUNNER~1) and the long one
// Git prints (C:/Users/runneradmin) compare equal. A file that does not exist yet is resolved through
// its nearest existing parent; a dangling link is followed to where a write would land.
function canonical(value, depth = 0) {
  try {
    return realpathSync.native(value);
  } catch (error) {
    if (!['ENOENT', 'ENOTDIR'].includes(error.code) || depth > 40) return path.resolve(value);
    try {
      if (lstatSync(value).isSymbolicLink()) {
        return canonical(path.resolve(path.dirname(value), readlinkSync(value)), depth + 1);
      }
    } catch {
      // Not there at all: resolve through the parent below.
    }
    const parent = path.dirname(value);
    return parent === value ? value : path.join(canonical(parent, depth + 1), path.basename(value));
  }
}

function insideRelative(root, absolute) {
  const relative = normalize(path.relative(root, absolute));
  return relative === '' || relative === '..' || relative.startsWith('../') || path.isAbsolute(relative) ? null : relative;
}

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
  const root = canonical(repositoryRoot(cwd) ?? path.resolve(process.env.CLAUDE_PROJECT_DIR || cwd));
  // Two views of the target: where the write really lands (links followed), which decides "outside the
  // repository", and the path as written under the real cwd, so that a managed folder that is itself a
  // link (.claude -> cfg) is still recognized as managed.
  const written = target.replace(/\\/g, '/');
  const real = insideRelative(root, canonical(path.resolve(cwd, written)));
  const lexical = insideRelative(root, path.isAbsolute(written) ? path.resolve(written) : path.resolve(canonical(cwd), written));
  if (real === null) {
    deny(`Escrita fora do repositório (padrão OpenSpec): ${target}. O implementador só altera arquivos do repositório de código.`);
  } else {
    const shown = [lexical, real].find((relative) => relative !== null && managedReason(relative));
    if (shown) {
      deny(`Escrita em ${shown} negada (padrão OpenSpec): ${managedReason(shown)}. Esses arquivos mudam pelo instalador do padrão; se a change precisar deles, devolva a questão ao agente coordenador.`);
    }
  }
}
