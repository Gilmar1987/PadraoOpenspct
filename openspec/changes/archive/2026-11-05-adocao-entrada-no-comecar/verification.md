# Verificações — adocao-entrada-no-comecar

## 2026-11-05

- Críticos: 0
- Warnings: 1
- Sugestões: 2
- Não verificado: Varredura de secrets (Adiado no `project.md`)
- Camadas: — (sem matriz no project.md)
- Cobertura fora da suíte: "Adoção de um código local" no Windows interativo e `/opsx` no Claude Code do projeto adotado, e "Árvore suja" (evidência da tarefa 4.5; rodado pelo responsável, Gilmar Campelo, no Prompt de Comando, com `--origem C:\tmp\padrao-teste-adocao`: branch criada, commit só com os 75 arquivos do padrão, "/opsx apareceu"; com alteração sem commit, "Há alterações sem commit em app.js" e nada criado)
- Avaliação: nenhum crítico nas conferências que rodaram; 1 warning e 2 sugestões; varredura de secrets não verificada (Adiado no `project.md`)

Itens:

- [warning] O D2 diz que um caminho relativo no `--codigo` é resolvido a partir da pasta base, mas, desde a 3.4, o código é perguntado antes da pasta base e o caminho relativo é resolvido a partir do `--pasta`, quando há, ou da pasta atual (`padrao-openspec/scripts/comecar.mjs`, `adoptProject`); ajustar a frase do D2 no archive ou numa próxima change
- [sugestão] O requisito "Branch de adoção com nome trocável" recusa um nome que o Git não aceita (`checkBranchName`), mas a CI não tem um caso com nome inválido; acrescentar um `--branch 'a..b'` às recusas do "Smoke test do script de entrada"
- [sugestão] O cenário "Tech lead com um projeto sem o padrão" (seção "Projeto que nunca usou o padrão" do `COMECE-AQUI.md`) é conferido só por leitura; o passo "Guia de primeiros passos" poderia conferir o título da seção e o `--modo adotar`

Comandos:

- `openspec instructions apply --change adocao-entrada-no-comecar --json` → 13/13 tarefas, `all_done` (exit 0)
- `review.md` → 3af2eca..5db4d9f, subagente requesting-code-review; 0 críticos; I1 e I3 corrigidos em 67c8b7d, I2 corrigido em 1a402f9 depois do `/opsx:update` (e451041); fechamento sem crítico ou importante em aberto. Os commits de código depois da revisão (67c8b7d e 1a402f9) são as correções que ela lista
- `node --check` em `comecar.mjs`, `install-skills.mjs` e `setup-project.mjs` → ok (exit 0)
- `openspec validate adocao-entrada-no-comecar --strict` → válida (exit 0)
- Suíte local dos jobs `store` e `root` em 1a402f9 → 24 PASS, 1 pulado (só Linux) e o "Smoke test dos hooks do Claude Code" intermitente (passou na repetição, em arquivos que esta change não toca), incluindo "Smoke test do script de entrada" com os 16 cenários dos requisitos novos de `project-onboarding` e `skill-installation`, "Smoke test do instalador" e "Guia de primeiros passos" (exit 0; reaproveitado do apply, tarefa 4.3; depois dele só mudaram `tasks.md` e `review.md`)
- `openspec validate --all --strict` → 23 passed; `sync-root.mjs --check` → em dia; `markdownlint-cli2@0.23.2` → 0 issues nos dois lugares (exit 0; reaproveitado do apply, tarefa 4.3)
- Conferências negativas vistas falhando (tarefas 3.3 e 3.4 e `review.md`): cada uma das recusas removida por vez → exit 1; limpo → exit 0; aviso de não rastreados removido → exit 1
- `git log --oneline HEAD..origin/main` → vazio (exit 0)
