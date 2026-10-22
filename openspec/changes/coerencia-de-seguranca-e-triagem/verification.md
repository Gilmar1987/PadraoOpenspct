# Verificações — coerencia-de-seguranca-e-triagem

## 2026-10-22

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: comportamento do agente numa entrevista real com o `init.md` novo e num verify real com relatório externo (os arquivos são prompts; não há execução automatizada); varredura de secrets (o `openspec/project.md` registra "Adiado")
- Cobertura fora da suíte: —
- Avaliação: Nenhum crítico nas checagens que rodaram. Não verificado: entrevista e triagem reais com os prompts novos, e varredura de secrets (adiada no `project.md`).

Itens: nenhum

Comandos:

- `openspec instructions apply --change coerencia-de-seguranca-e-triagem --json` → `all_done`, 5/5 (exit 0)
- `python run-ci-steps.py validate.yml store .` e `... root .` (comandos de verificação do `openspec/project.md`), depois das correções da revisão → 23 `[PASS]`, 18 do job `store` e 5 do `root`, lint e marcadores novos incluídos (exit 0)
- `openspec validate --all --strict` → 17 passed (exit 0)
- `node padrao-openspec/scripts/sync-root.mjs --check` → em dia (exit 0)
- `grep` no `init.md` → opção 0 da 3.6 (linha 300), três combinações novas (715 a 717), linha de LGPD mantida (712), restrição levada ao `project.md` (725)
- `grep` nos dois arquivos de verify → heurística "External report triage" com as quatro classes, "never lower it", "stays not verified" e a classe `não verificado (<motivo>)` no formato, texto idêntico nos dois
- `review.md` → 94a1e27..45029c6, subagente requesting-code-review; correções em 0c5f21d
