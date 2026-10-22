# Verificações — apply-verify-mais-rigorosos

## 2026-10-22

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: comportamento de um agente seguindo os trechos novos numa change real (os arquivos são prompts; a CI só confere que os trechos existem)
- Cobertura fora da suíte: —
- Avaliação: Nenhum crítico nas checagens que rodaram. Não verificado: a eficácia dos trechos num agente real, que aparece no próximo projeto de teste.

Itens: nenhum

Comandos:

- `openspec instructions apply --change apply-verify-mais-rigorosos --json` → `all_done`, 7/7 (exit 0; `progress.total` do CLI)
- Passos do `validate.yml` (comandos de verificação do `openspec/project.md`) → locais antes e depois do rebase, como na evidência da 3.3; no PR #27 (run 39820322412), os três jobs → pass
- `openspec validate --all --strict` → 17 passed; `sync-root --check` → em dia (exit 0)
- `grep` nos 6 arquivos → os 10 trechos em cada par, com o texto idêntico entre comando e skill; no verify, o "External report triage" da 1.7.0 e o passo 2a desta change convivem
- `review.md` → c7cdec8..ba4f9d6 (antes do rebase), subagente requesting-code-review; correções no commit seguinte
