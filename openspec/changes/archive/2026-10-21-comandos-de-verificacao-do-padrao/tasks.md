# Tasks

## 1. Comandos de verificação

- [x] 1.1 Acrescentar a seção "Comandos de verificação" ao `openspec/project.md` da raiz, depois da "Stack Summary", com a mesma tabela do `project.md` neutro, preenchida com os comandos da CI e a varredura de secrets como "Adiado". Verificar rodando cada comando registrado (exit 0) e o lint da raiz sem issues.
  - Evidência: seção "Comandos de verificação" no `openspec/project.md` da raiz; cada comando rodado → `node --check` nos 6 scripts (exit 0), `sync-root.mjs --check` → "Root is in sync", `openspec validate --all --strict` → 17 passed na raiz e "No items found" em `padrao-openspec/` (exit 0), `markdownlint-cli2@0.23.2 "**/*.md"` → 0 issues nos dois lugares, `openspec --version` → 1.14.2. Os testes (passos do `validate.yml`) passaram por inteiro no código publicado na v1.3.1, e esta change não muda código.

## 2. Registros de download

- [x] 2.1 Acrescentar uma entrada datada ao `verification.md` de `archive/2026-10-21-guia-de-entrada-do-dev` e de `archive/2026-10-21-corrige-caminho-e-prompt-no-windows`, com a conferência do download da release correspondente. Verificar com o lint da raiz sem issues e `openspec validate --all --strict` passando.
  - Evidência: entradas "depois da publicação" nos `verification.md` de `2026-10-21-guia-de-entrada-do-dev` (v1.3.0, SHA-256 `d6287dcb…`) e `2026-10-21-corrige-caminho-e-prompt-no-windows` (v1.3.1, SHA-256 `4926c37e…`, e o teste do responsável no console); lint da raiz → 0 issues; `openspec validate --all --strict` → 17 passed (exit 0).
