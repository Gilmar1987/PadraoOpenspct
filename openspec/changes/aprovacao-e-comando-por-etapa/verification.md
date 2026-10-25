# Verificações — aprovacao-e-comando-por-etapa

## 2026-10-25

- Críticos: 0
- Warnings: 1
- Sugestões: 0
- Não verificado: cenários de comportamento do agente ("Autorização prévia com condições", "Condição não atendida", "Aprovação sem comando", "Comando sem aprovação", "Fim do propose", "Ação sem comando", "Archive com escopo apply", "Verify com escopo apply", "Selo vencido", "Agente sem comandos", "Skill ativada pelo modelo"; os fluxos são prompts, sem execução automatizada, e a ADR-0009 é `norma`); varredura de secrets (o `openspec/project.md` registra "Adiado")
- Camadas: — (sem matriz no project.md)
- Cobertura fora da suíte: —
- Avaliação: Nenhum crítico nas checagens que rodaram; 1 warning. Não verificado: o comportamento do agente nos cenários (prompts) e a varredura de secrets.

Itens:

- [warning] A branch está atrás da `main` (o #49 entrou depois do último rebase): o rebase sobre a `main` atual, com conflitos de texto no `validate.yml`, no README, no `COMECE-AQUI.md` e no CHANGELOG, precisa acontecer antes do PR, seguido dos passos afetados da CI

Comandos:

- `openspec instructions apply --change aprovacao-e-comando-por-etapa --json` → `all_done`, 16/16 (exit 0)
- `review.md` → três rodadas, subagente requesting-code-review: 2904d77..1641e8a (hoje b8f6c7f..70b4fa0), f885026 e 088ca27; correções em f885026, 088ca27 e ad4bc39; depois de ad4bc39 só há commits de documentação e planejamento (`review.md`, `tasks.md`, ADR-0009), sem código
- `node padrao-openspec/scripts/sync-root.mjs --check` → em dia (exit 0)
- `openspec validate --all --strict` → 23 passed (exit 0); `openspec validate aprovacao-e-comando-por-etapa --strict` → válida (exit 0)
- Suíte local completa dos jobs `store` e `root`, sobre a base com o #48 e depois de ad4bc39 → 29 `[PASS]`; o "Smoke test do instalador" estourou o tempo limite (travamento intermitente desta máquina) e passou rodado sozinho em 1m15s (exit 0; reused from apply, tarefa 4.2); nenhum `ci-*` no registro
- Marcadores da CI vistos reprovando (tarefas 1.2, 1.3 e 1.4 e terceira revisão): únicos ("start only when the user has written the approval for this stage", "this workflow runs one stage only") e negativos ("Prior authorization exception", "without a new confirmation", "you may start the apply workflow in the same response", "is the confirmation this workflow asks for at this stage", "sem nova confirmação", "sem parar") → reprovam com o texto retirado ou reinserido em cópias e passam nos arquivos limpos
- Requisitos × implementação:
  - Escopos de aprovação (MODIFIED) → `rules.md` seção 2 (Escopo como limite) e apply 4a ("each after its own approval and command");
  - Aprovação e comando em cada etapa → `rules.md` seção 3 ("Aprovação e comando por etapa"), "Approval and command" nos cinco fluxos (comando e skill), `templates/agents-block.md` e hook `contexto-de-sessao.mjs` (asserções no "Smoke test dos hooks");
  - Próximo passo com aprovação e comando → "Stop and show the next step" nos cinco fluxos, "Prior authorization" no propose (sem começar o apply), "After archive, the next step is the pull request" no archive e passo 6 do update;
  - Aprovação da etapa como confirmação → frase própria do propose, do apply e do archive, nova rodada do portão no apply, `rules.md`;
  - Etapa pedida pelo nome fora do Claude Code → "Approval and command" ("asked for this stage by name", ativação da skill pelo modelo não vale) e `rules.md`
- `diff` dos trechos entre comando e skill nos cinco pares → iguais
- ADR-0009 → `status: Accepted` (40e77bb), `imposicao: norma`: sem verificação automática, como o "Limite" declara
- Lacunas declaradas, contratos de interface e falhas aceitas → não se aplicam (sem `openspec/lacunas.md`, sem contrato registrado, sem `openspec/estado-atual.md`)
