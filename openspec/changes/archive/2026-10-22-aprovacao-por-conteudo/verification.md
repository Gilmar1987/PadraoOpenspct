# Verificações — aprovacao-por-conteudo

## 2026-10-22

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: o comportamento dos agentes diante dos trechos novos (propose resolvendo inferências antes de selar, update pedindo a reconfirmação, init com a etapa "Inferências"), que é texto de prompt (a CI confere a presença dos trechos); uma reconfirmação real feita por um responsável num projeto
- Cobertura fora da suíte: fluxo de ponta a ponta num projeto temporário (tarefa 3.2) e o selo no PowerShell com CRLF e LF (tarefa 2.1)
- Avaliação: Nenhum crítico nas checagens que rodaram. Não verificados: os fluxos de prompt em uso real.

Itens: nenhum

Comandos:

- `openspec instructions apply --change aprovacao-por-conteudo --json` → 6/6 (`progress` do CLI, exit 0)
- Suíte local (Git Bash, Windows) → `store` 22/22 e `root` 5/5 PASS; 0 ids `ci-*` no registro
- PR #35, run 39885706984 → store (ubuntu-latest), store (windows-latest) e root = success
- "Smoke test do portão" → selo estável com caixas e evidências, tarefa nova → "venceu", reconfirmação → libera, sem selo → `avisos`, `[INFERIDO:` no design → `design.md:3`, entre crases → libera, CRLF = LF, "Aprovação anterior" depois da nova aprovação → libera, `.inputs/` e `review.md` não mudam o selo, marca confirmada não muda o selo, `Conteudo: sha256:deadbeef` → "ilegível"
- Requisitos: "Aprovação presa ao conteúdo" → `selo`, checagem e casos do smoke; "Reconfirmação depois de uma correção" → trecho do update e caso de reconfirmação; "Inferência declarada bloqueia o apply" → checagem de marcas e casos; "Mudança de escopo zera a aprovação" (MODIFIED) → trecho do update (a correção pede reconfirmação, a mudança de escopo guarda o selo antigo em "Aprovação anterior"); "Inferências marcadas no init" → regra e etapa "Inferências" no `init.md`
- `review.md` → 16a810d..a881770, subagente requesting-code-review; correções em cce145f
