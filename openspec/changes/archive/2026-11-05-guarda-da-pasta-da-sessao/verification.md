# Verificações — guarda-da-pasta-da-sessao

## 2026-11-05

- Críticos: 0
- Warnings: 1
- Sugestões: 0
- Não verificado: Varredura de secrets (Adiado no `project.md`)
- Camadas: — (sem matriz no project.md)
- Cobertura fora da suíte: "Dev aceita abrir o VS Code" e "Projeto novo concluído" no Windows interativo (evidência da tarefa 3.2; rodado pelo responsável, Gilmar Campelo: "teste 1 aceitei e o VS code foi aberto", o `/opsx` "mostrou todos os comandos"; "teste 2 não aceitei e não ocorreu nada", com o comando `code "C:\teste003\planta002\planta003"` acima da pergunta)
- Avaliação: nenhum crítico nas conferências que rodaram; 1 warning; varredura de secrets não verificada (Adiado no `project.md`)

Itens:

- [warning] Os cenários de comportamento do agente (guarda na pasta errada, conferência das proteções, pedido pelo nome no Claude Code) são cobertos pela presença do texto nos 17 arquivos, conferida pela CI, e não por uma sessão real na pasta errada; o risco foi aceito no design ("Agente que ignora o texto")

Comandos:

- `openspec instructions apply --change guarda-da-pasta-da-sessao --json` → 13/13 tarefas, `all_done` (exit 0)
- `review.md` → 2026-10-30: d0045d7..a0916b3 e 49de00f..e2ac6e0, subagente requesting-code-review; 0 críticos, importantes corrigidos ou resolvidos pelo `/opsx:update` (fechamento em 9ce6b66); 2026-11-05: rebase sem mudança de código, SHAs anteriores na branch `backup/guarda-antes-rebase-1-18`
- `grep -l 'Session folder guard'` nos comandos `opsx` e nas skills `openspec-*` de `padrao-openspec/` → 17 arquivos (exit 0)
- `grep -l 'Session protections check'` → 6 arquivos: comando e skill do apply, do verify e do archive (exit 0)
- `grep -l 'nor is a request for this stage by name'` → 10 comandos (exit 0); `rules.md` §3 e `templates/agents-block.md` com a exceção restrita a agentes que não são o Claude Code
- `comecar.mjs`: `offerToOpenVsCode()` só com `rl`, sem `--yes` e com o `code`; aviso com o comando quando o `code` falha (`padrao-openspec/scripts/comecar.mjs:260-274`)
- Suíte local dos jobs `store` e `root` → 25 PASS, 1 pulado (só Linux), 0 falhas, com "Trechos customizados das skills", "Smoke test do script de entrada" e "Versão do OpenSpec CLI coerente" (exit 0; reaproveitado do apply, tarefa 4.2, sem arquivo de código alterado depois)
- `openspec validate --all --strict` na raiz → 23 passed; `sync-root.mjs --check` → em dia; `markdownlint-cli2@0.23.2` nos dois lugares → 0 issues (exit 0; reaproveitado do apply, tarefa 4.2)
- `git log --oneline HEAD..origin/main` → vazio (exit 0)
