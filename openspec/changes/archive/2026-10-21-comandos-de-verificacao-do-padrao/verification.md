# Verificações — comandos-de-verificacao-do-padrao

## 2026-10-21

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: —
- Cobertura fora da suíte: —
- Avaliação: All checks passed. Ready for archive.

Itens: nenhum

Comandos:

- `openspec instructions apply --change comandos-de-verificacao-do-padrao --json` → `all_done`, 2/2 (exit 0)
- `node --check` em `padrao-openspec/scripts/*.mjs` → exit 0 nos 6
- `node padrao-openspec/scripts/sync-root.mjs --check` → "Root is in sync" (exit 0)
- `openspec validate --all --strict` → 17 passed (exit 0)
- `npx markdownlint-cli2@0.23.2 "**/*.md"` → 0 issues na raiz e em `padrao-openspec/` (exit 0)
- `git diff --stat main...HEAD` → só `openspec/project.md`, artefatos desta change e dois `verification.md` arquivados; nenhum código alterado
