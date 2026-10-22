# Verificações — qualidade-em-windows

## 2026-10-22

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: —
- Cobertura fora da suíte: regressão do drive minúsculo conferida contra a v1.3.0 numa worktree local (pelo agente): o passo novo falha com "not this store"
- Avaliação: All checks passed. Ready for archive.

Itens: nenhum

Comandos:

- `openspec instructions apply --change qualidade-em-windows --json` → `all_done`, 3/3 (exit 0)
- `gh pr checks 24` (run 39782986831, depois dos ajustes da revisão) → `store (ubuntu-latest)` pass, `store (windows-latest)` pass, `root` pass
- Log do Windows (run 39781038915) → "Smoke test do drive minúsculo" com `c:\Users\RUNNER~1\...`, os dois modos concluídos; no Ubuntu, o passo é pulado
- `python runstep.py . store "Sintaxe" "drive minúsculo" "script de entrada"` (Git Bash, depois dos ajustes) → 3 `[PASS]`, nenhum id de teste registrado ao final (exit 0)
- `markdownlint-cli2` no `openspec/project.md` → 0 issues; `yaml.safe_load` do `validate.yml` → ok
- `gh api .../branches/main/protection` → "Branch not protected"; `.../rulesets` → nenhum: a troca do nome do job não exige ajuste
- `review.md` → 2138053..7c2138d, subagente requesting-code-review; ajustes em 8915771
