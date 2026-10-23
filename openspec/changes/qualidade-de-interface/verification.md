# Verificações — qualidade-de-interface

## 2026-10-22

- Críticos: 0
- Warnings: 1
- Sugestões: 0
- Não verificado: o trecho "Interface quality gate" rodado pelo `/opsx:verify` numa change real com telas (é texto de prompt; a CI confere a presença do trecho); a pergunta 3.2 do `/opsx:init` gerando a linha "Validação de interface" num projeto novo (idem); o subagente com o tipo `openspec-validador-de-interface` carregado, com o hook somente leitura agindo de verdade (a 3.3 usou um subagente geral com as mesmas instruções, porque o tipo novo não estava carregado nesta sessão; o hook está coberto pelo smoke com `agent_type`)
- Cobertura fora da suíte: página real de exemplo (agendamento com brief e três jornadas) validada pelo script e pelo subagente na tarefa 3.3; execução do script no Windows (npm por shell, navegador próprio) nas tarefas 2.1 e 3.3
- Avaliação: Nenhum crítico. Um warning: o cenário "Change com tela nova" depende de a skill `interface-quality` ser carregada pelo agente no propose, porque o comando do propose não cita o brief. Não verificados: os textos de prompt do verify e do init em uso real e o subagente com o tipo próprio.

Itens:

- [warning] Cenário "Change com tela nova" coberto em parte: o brief é pedido pela skill `interface-quality` (disparada pela `description`) e pelo `operations.apply.guidance` gerado no init, mas `commands/opsx/propose.md` não o cita; uma change com telas proposta sem a skill escapa do gate, que só olha changes com "Brief visual". Recomendação: numa change própria, citar o brief no propose e fazer o verify avisar quando tarefas ou design mencionam telas sem brief (decisão de spec, levada ao responsável).

Comandos:

- `openspec instructions apply --change qualidade-de-interface --json` → 7/7 (`progress` do CLI, exit 0)
- Suíte local (Git Bash, Windows) → `store` 22/22 e `root` 5/5 PASS; 0 ids `ci-*` no registro
- PR #33, run 39875699297 → store (ubuntu-latest), store (windows-latest) e root = pass; "Smoke test da validação de interface" = success no Ubuntu
- "Smoke test da validação de interface" → boa: saída 0, nota médio ou bom, 4 jornadas aprovadas (inclusive o 422 esperado e o botão atrasado), capturas nas três larguras e por estado; ruim: saída 1, `image-alt`, `console.error`, `/promocoes.html` e `faltando.png` no relatório; porta fechada: saída 2; lint dos relatórios sem issues
- "Smoke test dos hooks do Claude Code" → validador negado em `echo x > a.txt` e `rm -rf interface`, liberado em `node docs/openspec-validar-interface.mjs ...`
- "Paridade de papéis", "Trechos customizados das skills" (Interface quality gate, linhas do init), "Smoke test do instalador" (`cmp` do script entregue, skill instalada), `sync-root --check` → pass
- Requisitos: "Brief visual no design" → skill e gate do verify (parcial, ver warning); "Validação de interface no navegador" → script e smoke; "Nota do validador de interface" → subagente, hook e tarefa 3.3 (automática "bom", final "médio" com 10 correções); "Comandos de interface no init" → `init.md` e trecho na CI; "Nota mínima de interface no verify" → trecho "Interface quality gate"
- `review.md` → 958baf1..739045a, subagente requesting-code-review; correções em 3b122b3
