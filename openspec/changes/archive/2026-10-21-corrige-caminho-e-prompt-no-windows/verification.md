# Verificações — corrige-caminho-e-prompt-no-windows

## 2026-10-21

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: "Perguntas visíveis no console" (o redesenho só acontece num console interativo real; é a condição da aprovação, a cargo do responsável antes da release); comandos de verificação do projeto (o `openspec/project.md` não tem a seção "Comandos de verificação"; usada a CI do `validate.yml`)
- Cobertura fora da suíte: "Pasta base digitada em minúscula" e "Drive em minúscula no Windows" (`drivetest.sh` no scratchpad, Git Bash no Windows, rodado pelo agente; a CI roda em Ubuntu, onde não há letra de drive); linha `code "<pasta>"` com o VS Code instalado (mesma execução)
- Avaliação: Nenhum crítico nas checagens que rodaram. Não verificados: perguntas visíveis no console real (teste do responsável) e comandos de verificação do projeto (não registrados).

Itens: nenhum

Comandos:

- `openspec instructions apply --change corrige-caminho-e-prompt-no-windows --json` → `all_done`, 5/5 (exit 0)
- `python runstep.py . store` e `python runstep.py . root` → 19 `[PASS]` (exit 0; reaproveitado da 3.2; depois dele só mudou o `comecar.mjs` em 8a40403, coberto pelos passos abaixo)
- `python runstep.py . store "Sintaxe" "script de entrada" "Lint de Markdown"` depois de 8a40403 → 3 `[PASS]` (exit 0)
- `bash drivetest.sh` com `--pasta "c:\..."` depois de 8a40403 → `novo exit=0`, `existente exit=0`; antes da correção, exit 1 nos dois com "not this store"
- `node padrao-openspec/scripts/sync-root.mjs --check` → "Root is in sync with padrao-openspec/." (exit 0)
- `review.md` → 3db93f5..fcd3c03, subagente requesting-code-review; ajustes em 8a40403, sem commits de código depois
