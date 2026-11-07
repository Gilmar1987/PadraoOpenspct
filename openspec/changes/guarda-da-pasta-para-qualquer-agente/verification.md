# Verificações — guarda-da-pasta-para-qualquer-agente

## 2026-11-06

- Críticos: 0
- Warnings: 0
- Sugestões: 1
- Não verificado: —
- Camadas: — (sem matriz no project.md)
- Cobertura fora da suíte: "Copilot no clone do store" (roteiro no Copilot CLI 1.0.100-1 do VS Code, clone de teste `C:\tmp\clone-teste-openspec`; log `~/.copilot/session-state/35bbbab2-797d-4d62-a2da-86f519f159f3/events.jsonl`; executado pelo responsável, Gilmar Campelo, tarefa 3.2); "Claude Code no clone do store", "Pasta padrao-openspec do clone" e "Pasta do código" (`claude -p`, Claude Code 2.1.243, clones `C:\tmp\clone-teste-openspec` e `C:\tmp\clone-teste2-openspec` e pasta `C:\tmp\copilot-ganchos`; tarefas 3.1 e 3.4; executados pelo agente); "Agente que lê só as regras" (`claude -p` com um pedido em texto livre no clone, nesta verificação, pelo agente)
- Avaliação: nenhum problema crítico nem warning; 1 sugestão; pronta para o archive (com a melhoria anotada)

Itens:

- [sugestão] O cenário "Agente que lê só as regras" foi conferido com um pedido em texto livre ("Inicialize o projeto: preencha o openspec/project.md..."), mas o Claude Code ativou por conta própria a skill de init, cuja guarda o parou; nenhum agente seguiu só as regras. A frase está nas regras e no bloco de agentes, e a CI a protege. Um roteiro num agente sem skills (por exemplo, o Copilot com um pedido sem citar o comando) daria a prova direta

Comandos:

- `openspec instructions apply --change guarda-da-pasta-para-qualquer-agente --json` → `all_done`, 11/11 tarefas (exit 0)
- `review.md` → 2f81802..88ae213 e bed644e..f8de91b, subagente requesting-code-review; críticos 0; importantes 5 (4 corrigidos, 1 justificado: tarefas em aberto); depois de f8de91b, só o commit de correção listado (66c9321) e commits de documentação (5ae796a, be83f42 e 19e9f82)
- `git status --short` no worktree → limpo; `git diff --stat f8de91b..HEAD` fora das changes → só o `validate.yml`, o `CHANGELOG.md` e o `COMECE-AQUI.md` de 66c9321 (exit 0)
- `grep -c "Store clone guard"` nos 10 comandos e nas 7 skills de `padrao-openspec/.claude/` → 1 em cada (exit 0)
- "Trechos customizados das skills" e "Repositório do padrão sem marcador de store" em 66c9321 → exit 0; este, visto falhando com o marcador criado à mão na raiz e em `padrao-openspec/` (reused from apply, 1.3 e revisão 2)
- `sync-root.mjs --check` → em dia; `openspec validate --all --strict` na raiz → 23 passed, 0 failed, e em `padrao-openspec/` → sem itens; lint nos dois lugares → 0 issues (reused from apply, 3.3; depois só mudaram o `tasks.md` e o `review.md`)
- suíte local completa dos jobs `store` e `root` em 5ae796a → 30 PASS, 2 SKIP (`uses` e só Linux), 1 FAIL por tempo no "Smoke test do script de entrada", que passou sozinho (783 s); os dois `ci-*` que ele deixou foram tirados do registro (reused from apply, 3.3)
- `claude -p "Inicialize o projeto: preencha o openspec/project.md com um sistema de agenda de quadras."` em `C:\tmp\clone-teste2-openspec` → o agente ativou a skill de init, achou `padrao-openspec/.openspec-store/store.yaml` (`id: clone-teste`) e parou sem gravar ("This directory ... is itself **the clone of an OpenSpec store**, not the code project"); `git status --short` do clone → limpo (exit 0)
- ADRs: a change não cita nem altera ADR (a ADR-0009 e a ADR-0012 não são tocadas); varredura de secrets → não verificada (adiada no `project.md`); auditoria de dependências → não se aplica
