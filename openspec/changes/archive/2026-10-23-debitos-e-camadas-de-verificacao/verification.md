# Verificações — debitos-e-camadas-de-verificacao

## 2026-10-23

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: comportamento do agente ao seguir o Arquivo 6 e a matriz do init e os trechos "Related debts", "Update the open debts" e "Verification layers" numa sessão real (os arquivos são prompts; não há execução automatizada); varredura de secrets (o `openspec/project.md` registra "Adiado")
- Camadas: — (sem matriz no project.md do próprio padrão)
- Cobertura fora da suíte: —
- Avaliação: Nenhum crítico nas checagens que rodaram. Não verificado: o comportamento do agente com o init e os trechos novos, e a varredura de secrets.

Itens: nenhum

Comandos:

- `openspec instructions apply --change debitos-e-camadas-de-verificacao --json` → `all_done`, 9/9 (exit 0)
- `git rebase origin/main` (bd0380c, release v1.12.0) → conflitos só no `CHANGELOG.md`, resolvidos com a versão da `main`; a change abre a `## 1.13.0` e sobe o `VERSION` para 1.13.0, pelo modelo de versão acumulada
- `node padrao-openspec/scripts/sync-root.mjs --check` → em dia (exit 0)
- `openspec validate --all --strict` → 21 passed (exit 0)
- Suíte local completa dos jobs `store` e `root` → 29 `[PASS]`, nenhum `ci-*` no registro (tarefa 4.2, antes das correções da revisão)
- Depois das correções e do rebase: `run-ci-steps.py` com "Versão e changelog", "Smoke test do changelog-range", "Trechos customizados das skills", "Lint de Markdown", "Sintaxe dos scripts", "Smoke test das métricas de fluxo" e "Config base" (store) e "Raiz em dia", "Lint de Markdown da raiz" e "Guia de primeiros passos" (root) → 10 `[PASS]` (exit 0)
- `diff` dos trechos "Related debts" (propose e explore), "Update the open debts" (archive) e "Verification layers" (verify) entre comando e skill → iguais
- `flow-metrics.mjs` lê os rótulos com âncora (`^- <rótulo>:`), e a linha `- Camadas:` não colide com eles (confirmado pela revisão e pelo smoke das métricas)
- `review.md` → b4fe159~1..a08220f, subagente requesting-code-review; correções no commit hoje 20ae2b1
