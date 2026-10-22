# Verificações — subagentes-e-ganchos

## 2026-10-22

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: formato da saída do `openspec-stage-reviewer` e despacho do `openspec-code-reviewer` pela skill `requesting-code-review` numa sessão real (os prompts não têm execução automatizada); varredura de secrets (o `openspec/project.md` registra "Adiado")
- Cobertura fora da suíte: "Validador tenta gravar arquivo" e "Agente principal não é afetado" (roteiro manual no Claude Code 2.1.243, `claude -p` no repositório `C:\TesteOpenSpct\roteiro-camada`, executado pelo agente desta sessão); "Tarefa sem evidência" (roteiro no VS Code, executado por Gilmar Campelo); "Archive sem verificação" (roteiro com `claude -p`, executado pelo agente desta sessão)
- Avaliação: Nenhum crítico nas checagens que rodaram. Não verificado: saída do revisor de etapa e despacho do revisor de código numa sessão real, e varredura de secrets.

Itens: nenhum

Comandos:

- `openspec instructions apply --change subagentes-e-ganchos --json` → `all_done`, 14/14 (exit 0)
- `node padrao-openspec/scripts/portao.mjs archive subagentes-e-ganchos` → bloqueado só por falta deste `verification.md` (exit 1)
- `python run-ci-steps.py validate.yml store .` com "Paridade de papéis", "Smoke test dos hooks do Claude Code", "Smoke test da camada do Claude Code no instalador", "Trechos customizados das skills", "Lint de Markdown", "Versão e changelog" e "Sintaxe dos scripts" → 7 `[PASS]` (exit 0), depois do rebase em `041a92d`
- `python run-ci-steps.py validate.yml root .` com "Raiz em dia", "Lint de Markdown da raiz" e "Guia de primeiros passos" → 3 `[PASS]` (exit 0)
- `openspec validate --all --strict` → 17 passed (exit 0)
- `node padrao-openspec/scripts/sync-root.mjs --check` → em dia (exit 0)
- Suíte local completa dos jobs `store` e `root` → 26 `[PASS]` (exit 0; reaproveitada da tarefa 4.4, antes dos commits de correção, cujos passos afetados rodaram de novo acima)
- CI do GitHub → PR #30 verde em `2f4515c` (root, store no Ubuntu e no Windows); `main` verde em `041a92d`
- `grep` das 10 exigências das delta specs → todas presentes nas specs da change, com implementação nos hooks, nos subagentes, no template e no instalador
- `review.md` → três revisões (1dcbe3b..d9994e4; 2b4cc3b..e962c52; e478a05..2f4515c), subagente requesting-code-review; correções em 189d41a, e478a05 e c5dbae9 (rebaseado como 728f61b)
