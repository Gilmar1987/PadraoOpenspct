# Verificações — brief-visual-obrigatorio

## 2026-10-22

- Críticos: 0
- Warnings: 1
- Sugestões: 0
- Não verificado: o efeito real dos trechos de prompt (o propose escrevendo o `design.md` com o brief numa change com telas; o verify perguntando ao responsável); a CI confere só a presença dos trechos
- Cobertura fora da suíte: —
- Avaliação: Nenhum crítico. Um warning aguardando a resposta do responsável. Não verificados: os fluxos de prompt em uso real, como previsto nas tarefas.

Itens:

- [warning] Screens without visual brief: disparado por "tela", "formulário" e `interface-quality` em `tasks.md`, `design.md` e nas delta specs; pergunta feita ao responsável em 2026-10-22 ("esta change tem telas?"), aguardando a resposta antes do archive.

Comandos:

- `openspec instructions apply --change brief-visual-obrigatorio --json` → 4/4 (`progress` do CLI, exit 0)
- Suíte local (Git Bash, Windows) → 27 passos PASS; 0 ids `ci-*`
- PR #36, run 39887206712 → store (ubuntu-latest), store (windows-latest) e root = success
- "Trechos customizados das skills" → "Interface brief" no par do propose e "Screens without visual brief" no par do verify; `sync-root --check` → em dia
- Requisitos: "Brief visual no design" (MODIFIED) → trecho "Interface brief" e exceção no passo 6b do propose; "Telas sem brief no verify" → caso novo no "Interface quality gate"
- `review.md` → f721366..69d2802, subagente requesting-code-review; correções em 5d2320e (após o rebase; era 20d2f76)
