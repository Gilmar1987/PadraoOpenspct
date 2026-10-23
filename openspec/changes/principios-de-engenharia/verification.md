# Verificações — principios-de-engenharia

## 2026-10-23

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: comportamento do agente ao seguir a pergunta 7.4 do init, a heurística "Engineering principles" do verify e o bloco da revisão numa sessão real (os arquivos são prompts; não há execução automatizada); varredura de secrets (o `openspec/project.md` registra "Adiado")
- Camadas: — (sem matriz no project.md do próprio padrão)
- Cobertura fora da suíte: —
- Avaliação: Nenhum crítico nas checagens que rodaram. Não verificado: o comportamento do agente com a 7.4, a heurística nova e o bloco da revisão, e a varredura de secrets.

Itens: nenhum

Comandos:

- `openspec instructions apply --change principios-de-engenharia --json` → `all_done`, 9/9 (exit 0)
- `git log --oneline HEAD..origin/main` → vazio (a branch está sobre 85122da, release v1.13.0); a change abre a `## 1.14.0` e sobe o `VERSION` para 1.14.0, pelo modelo de versão acumulada
- `node padrao-openspec/scripts/sync-root.mjs --check` → em dia (exit 0)
- `openspec validate --all --strict` → 21 passed (exit 0); `openspec validate principios-de-engenharia --strict` → válida
- Suíte local completa dos jobs `store` e `root` → 28 `[PASS]` (tarefa 5.2); o "Smoke test dos hooks do Claude Code" falhou só pelo executor local (`bash -c` no Windows, também na `main`) e passou com o script em arquivo
- Depois das correções da revisão: `run-ci-steps.py` com "Trechos customizados das skills", "Lint de Markdown", "Paridade de papéis", "Smoke test das métricas de fluxo", "Config base" e "Versão e changelog" (store) e "Raiz em dia", "Lint de Markdown da raiz" e "Guia de primeiros passos" (root) → `[PASS]` (exit 0)
- `diff` da heurística "Engineering principles" e do Scenario Coverage entre `verify.md` e a skill do verify → iguais
- Requisitos × implementação: design na revisão (`code-reviewer.md` e `openspec-code-reviewer.md`); contrato de entrada (`config.yaml`, design); log de três estados, validação e erro sem vazamento (`rules.md` seção 5 e heurística do verify, com a exceção só para o log); teste rastreável (`config.yaml`, Scenario Coverage e heurística do verify); Why ligado ao objetivo (`config.yaml`); convenção no init (7.4 e linha do modelo de `project.md`)
- Coerência: proposal, design (D5), spec, `rules.md`, init, CHANGELOG e modelo de `project.md` dizem que só o log de três estados aceita "Não aplicável"
- `review.md` → f024a09~1..6d4a8cd, subagente requesting-code-review; correções em ca7238b e 28ea5b4
