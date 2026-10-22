# Verificações — guardas-mecanicas

## 2026-10-22

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: comportamento de outro agente diante do bloco novo (o texto é um prompt; o portão em si é determinístico e está coberto pela CI); primeira execução real do workflow de release (acontece na publicação da v1.9.0)
- Cobertura fora da suíte: —
- Avaliação: Nenhum crítico nas checagens que rodaram. Não verificados: a reação de outro agente ao bloco e o workflow de release em produção, conferido na publicação.

Itens: nenhum

Comandos:

- `openspec instructions apply --change guardas-mecanicas --json` → 5/5 (`progress` do CLI, exit 0)
- Passos do `validate.yml` → locais e no PR #28 (run 39836966024), os três jobs → pass
- "Smoke test do portão" → apply pendente, "Pendente (…)", aprovação de apply, escopo archive entre crases, tarefa pendente, falta de `verification.md`, prefixo de nome sem `review.md`, commit da change exigindo `review.md`, change inexistente, nome inválido e store não resolvido (saída 2 com `motivos` no JSON), hook recusando commit de código pendente e aceitando retrabalho, commit sem trailer e commit só em `openspec/`
- `openspec validate --all --strict` → 17 passed; `sync-root --check` → em dia
- `review.md` → 9732533..e10e926, subagente requesting-code-review; correções no commit seguinte
