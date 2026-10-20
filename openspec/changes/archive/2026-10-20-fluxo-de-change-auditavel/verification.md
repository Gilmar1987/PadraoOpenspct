# Verificações — fluxo-de-change-auditavel

## 2026-10-20

- Críticos: 0
- Warnings: 0
- Sugestões: 1
- Não verificado: CI no GitHub (sem push, por pedido do responsável); comportamento dos agentes numa sessão real (verificado só pelo texto das skills e comandos)
- Cobertura fora da suíte: —
- Avaliação: No critical issues found in the checks that ran. CI no GitHub e comportamento em sessão real não verificados. 1 suggestion(s) to consider.

Itens:

- [sugestão] Repetir o teste de ponta a ponta numa sessão nova para observar o commit do planejamento, a confirmação do archive com escopo apply e a linha `Evidência:` nas tarefas.

Comandos:

- Passos do job `store` do `validate.yml` no Git Bash → 12 PASS (exit 0)
- Passos do job `root` do `validate.yml` no Git Bash → 2 PASS e 1 FAIL (MD038), depois `markdownlint-cli2 "**/*.md"` → 0 issues (exit 0)
- `openspec instructions apply --change fluxo-de-change-auditavel --json` → all_done, 7/7 (exit 0)
