# Tasks

## 1. Skill nextjs-implementation

- [x] 1.1 Atualizar o typecheck na seção 5 de `padrao-openspec/.claude/skills/nextjs-implementation/SKILL.md` (D1). Verificar com `grep -n "next typegen"`.
- [x] 1.2 Acrescentar a subseção "Rendering model in Next.js 16" na seção 4 (D2). Verificar com `grep -n "cacheComponents"` e `grep -n "node_modules/next/dist/docs"` na subseção.
- [x] 1.3 Atualizar a tabela e as regras da seção 3 (D3). Verificar com `grep -n "not a raw HTTP POST"` e `grep -n "decided against E2E"`.
- [x] 1.4 Acrescentar a regra de versão de dependência existente (D4) e o item de criação do app na seção 1 (D5). Verificar com `grep -n "smallest compatible"` e `grep -n "temporary folder"`.

## 2. Espelhamento e integração

- [x] 2.1 Rodar `node padrao-openspec/scripts/sync-root.mjs` e verificar que `--check` sai com código 0.
- [x] 2.2 Rodar `openspec validate --all --strict` e o lint da raiz e de `padrao-openspec/`. Verificar que todos saem com código 0.
