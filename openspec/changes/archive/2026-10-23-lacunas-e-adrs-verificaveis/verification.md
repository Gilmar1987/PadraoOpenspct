# Verificações — lacunas-e-adrs-verificaveis

## 2026-10-23

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: comportamento do agente ao seguir as heurísticas "Declared gaps" e "ADR verification" e o item `verificacao` do propose numa sessão real (os arquivos são prompts; não há execução automatizada); varredura de secrets (o `openspec/project.md` registra "Adiado")
- Cobertura fora da suíte: —
- Avaliação: Nenhum crítico nas checagens que rodaram. Não verificado: o comportamento do agente com as heurísticas novas, e a varredura de secrets.

Itens: nenhum

Comandos:

- `openspec instructions apply --change lacunas-e-adrs-verificaveis --json` → `all_done`, 14/14 (exit 0)
- `git rebase origin/main` (bd41892, com a `aprovacao-por-conteudo` e a `brief-visual-obrigatorio`) → conflitos só aditivos no `CHANGELOG.md` e nos marcadores do `validate.yml`, mantidos os dois lados
- `node padrao-openspec/scripts/sync-root.mjs --check` → em dia (exit 0)
- `openspec validate --all --strict` → 19 passed (exit 0)
- `python run-ci-steps.py validate.yml store .` com "Smoke test do registro de lacunas", "Trechos customizados das skills", "Lint de Markdown", "Sintaxe dos scripts", "Versão e changelog", "Config base carrega sem avisos" e "Smoke test das métricas de fluxo" → 7 `[PASS]` (exit 0), depois do último rebase
- `python run-ci-steps.py validate.yml root .` com "Raiz em dia", "Lint de Markdown da raiz" e "Guia de primeiros passos" → 3 `[PASS]` (exit 0)
- Suíte local completa dos jobs `store` e `root` → 29 `[PASS]` antes das correções da revisão (tarefa 5.3); os passos afetados rodaram de novo depois delas e depois de cada rebase
- `node padrao-openspec/scripts/lacunas.mjs` no próprio padrão → "ok: 0 lacunas, 0 fontes" (exit 0)
- Casos de borda do `lacunas.mjs` à mão → data 2026-02-30, caminho fora da base, pasta como fonte, linha com 4 colunas e raiz sem `openspec/` rejeitados; comentário antes da tabela com o número de linha certo
- `diff` das heurísticas "Declared gaps" e "ADR verification" entre `verify.md` e a skill → iguais
- `node padrao-openspec/scripts/portao.mjs archive lacunas-e-adrs-verificaveis` → bloqueado só pelo escopo de archive e pela falta deste `verification.md`, com aviso de aprovação sem selo (exit 1)
- ADR-0007 → `status: Accepted`, aprovada pelo responsável em 2026-10-23
- `review.md` → d0b18b0..fd7ec0f (antes dos rebases), subagente requesting-code-review; correções no commit hoje 9e48c39
