# Verificações — data-de-publicacao-da-versao

## 2026-10-23

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: —
- Cobertura fora da suíte: notas da Release v1.12.0 conferidas com `gh release view`
- Avaliação: Nenhum crítico. Todas as checagens aplicáveis rodaram.

Itens: nenhum

Comandos:

- `openspec instructions apply --change data-de-publicacao-da-versao --json` → 2/2 (`progress` do CLI, exit 0)
- PR #41, run 39977636668 (head 7a3ca88) → store (ubuntu-latest), store (windows-latest) e root = success
- "Versão e changelog" e "Smoke test do changelog-range" → PASS (número da seção igual ao `VERSION`)
- `gh release view v1.12.0` → notas com "## 1.12.0 — 2026-10-23", anexo `comecar.mjs`, tag inalterada
- Requisito "Data da versão na publicação" → passo 2 do "Como publicar uma release" no README e a data corrigida da 1.12.0
- `review.md` → não aplicável (só texto)
