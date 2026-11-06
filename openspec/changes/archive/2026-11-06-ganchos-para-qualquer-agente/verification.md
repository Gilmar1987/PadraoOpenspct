# Verificações — ganchos-para-qualquer-agente

## 2026-11-06

- Críticos: 1
- Warnings: 0
- Sugestões: 1
- Não verificado: —
- Camadas: — (sem matriz no project.md)
- Cobertura fora da suíte: "Gancho no Claude Code" (`claude -p` numa pasta de teste, Claude Code 2.1.243; evidência das tarefas 4.1 e 4.4; executado pelo agente); "Comando de leitura no Copilot CLI" e "Negação no Copilot CLI" (roteiro no Copilot CLI 1.0.100-1 do VS Code, pasta `C:\tmp\copilot-ganchos`; log `~/.copilot/session-state/9579f20d-1c36-4abc-a1f9-69a86391fca6/events.jsonl`; executado pelo responsável, Gilmar Campelo, tarefa 4.2); "Atualização de um projeto da v1.18.0" com `--update` e "Reinstalação sem modo" com as entradas da v1.18.0 (rodados à mão nesta verificação, numa pasta temporária, pelo agente)
- Avaliação: 1 problema crítico: a tarefa 5.3 (promover a ADR-0012 e marcar a ADR-0006 como `Superseded`) está aberta; corrigir antes do archive

Itens:

- [crítico] Tarefa 5.3 aberta: a ADR-0012 ainda está `Proposed` e a ADR-0006 ainda está `Accepted` (`openspec/adrs/0012-ganchos-em-forma-neutra-de-agente.md:3`, `openspec/adrs/0006-camada-do-claude-code-por-entradas-gerenciadas.md:3`); a tarefa previa a promoção no PR, mas o fluxo deste repositório fecha o archive antes do PR, então a promoção precisa da declaração explícita do responsável e de um apply curto, como na ADR-0008 (`imposicao-e-catraca`)
- [sugestão] O caso "Atualização de um projeto da v1.18.0" do "Smoke test da camada do Claude Code no instalador" usa `--in-place`, e o cenário cita `--update`; os dois passam pela mesma mescla (`mergeHooks`), e o `--update` e a reinstalação sem modo foram conferidos à mão nesta verificação; acrescentar à CI um `--update` com as entradas da v1.18.0 se a mescla mudar no futuro

Comandos:

- `openspec instructions apply --change ganchos-para-qualquer-agente --json` → 18/19 tarefas, aberta a 5.3 (exit 0)
- `review.md` → e7f6c52..1f0523b e 1f0523b..f966ad8, subagente requesting-code-review; críticos 0; importantes 3, todos corrigidos (f966ad8 e 4878807); depois de f966ad8 só o commit de correção listado (4878807) e commits de documentação
- `git log --oneline 4878807..HEAD` → só 3189b9a, 61714f0 e 11ea060, sem código (`review.md`, `tasks.md` e a linha da tabela do guia) (exit 0)
- `git status --short` no worktree → limpo (exit 0)
- `openspec validate --all --strict` na raiz → 23 passed, 0 failed (exit 0)
- `node padrao-openspec/scripts/sync-root.mjs --check` → em dia (exit 0; reused from apply, 5.1)
- lint de Markdown na raiz e em `padrao-openspec/` → 0 issues (exit 0; reused from apply, 5.1 e 4.3)
- "Smoke test dos hooks do Claude Code" com `RUNNER_OS=Windows`, em 4878807 → exit 0, com cada entrada pelo `bash` fora do projeto e pelo `powershell` com e sem a variável, e a falha interna pelo lançador (reused from apply, revisão 2)
- "Smoke test da camada do Claude Code no instalador" → exit 0 (reused from apply, 2.5; o passo não mudou depois)
- "Smoke test do instalador" sozinho → exit 0, 56 s (reused from apply, 5.1)
- suíte local completa dos jobs `store` e `root` em f966ad8 → 29 PASS, 2 SKIP (`uses` e só Linux), 1 FAIL por tempo no "Smoke test do instalador", que passou sozinho; nenhum `ci-*` no registro (reused from apply, 5.1)
- verificação da ADR-0012 (`consultivo`, Proposed) → o bloco do smoke foi visto reprovando antes da troca (tarefa 1.2: 18 `::error::`; tarefa 1.4: 30 `::error::` pelo PowerShell) e passando depois (2.2 e 2.5); a verificação do nome no aviso pelo lançador foi vista reprovando à mão (sem `currentHook = hookName`, o aviso sai `[gancho]`)
- instalação da v1.18.0 (`git archive ee9db20`) numa pasta temporária → 7 entradas com `args`; `install-skills.mjs` desta branch sem modo → exit 1, citando `--update` e as entradas do `openspec-padrao`, e o `settings.json` igual (`cmp`); com `--update` depois do commit da instalação → exit 0, branch `chore/padrao-v1.19.0`, 0 `args` e 7 `node -e`
- varredura de secrets → não verificada (o `project.md` a registra como adiada); auditoria de dependências → não se aplica (nenhuma dependência nova)

## 2026-11-06

- Críticos: 0
- Warnings: 0
- Sugestões: 1
- Não verificado: —
- Camadas: — (sem matriz no project.md)
- Cobertura fora da suíte: "Gancho no Claude Code" (`claude -p` numa pasta de teste, Claude Code 2.1.243; evidência das tarefas 4.1 e 4.4; executado pelo agente); "Comando de leitura no Copilot CLI" e "Negação no Copilot CLI" (roteiro no Copilot CLI 1.0.100-1 do VS Code; log `~/.copilot/session-state/9579f20d-1c36-4abc-a1f9-69a86391fca6/events.jsonl`; executado pelo responsável, Gilmar Campelo, tarefa 4.2); "Atualização de um projeto da v1.18.0" com `--update` e "Reinstalação sem modo" com as entradas da v1.18.0 (rodados à mão na verificação anterior, pelo agente; nenhum código mudou depois)
- Avaliação: nenhum problema crítico nem warning; 1 sugestão; pronta para o archive (com a melhoria anotada)

Itens:

- [sugestão] O caso "Atualização de um projeto da v1.18.0" do "Smoke test da camada do Claude Code no instalador" usa `--in-place`, e o cenário cita `--update`; os dois passam pela mesma mescla (`mergeHooks`), e o `--update` foi conferido à mão; acrescentar à CI um `--update` com as entradas da v1.18.0 se a mescla mudar no futuro

Comandos:

- `openspec instructions apply --change ganchos-para-qualquer-agente --json` → `all_done`, 19/19 tarefas (exit 0)
- `git log --oneline d94db70..HEAD` → só d8adfd8, que muda as ADRs 0006 e 0012 e o `tasks.md`, sem código (exit 0); `git status --short` → limpo
- `grep -n "^status\|^superseded_by" openspec/adrs/0006-*.md openspec/adrs/0012-*.md` → ADR-0006 `Superseded` com `superseded_by: ADR-0012`; ADR-0012 `Accepted` (exit 0)
- `openspec validate --all --strict` na raiz → 23 passed, 0 failed (exit 0)
- lint de Markdown de `openspec/adrs/*.md` → 0 issues (exit 0)
- `review.md` → e7f6c52..1f0523b e 1f0523b..f966ad8, subagente requesting-code-review; importantes 3, todos corrigidos; depois só o commit de correção listado (4878807) e commits de documentação
- ADR-0012 (`consultivo`, Accepted nesta change): "Smoke test dos hooks do Claude Code" com `RUNNER_OS=Windows`, em 4878807 → exit 0 (reused from apply; nenhum código mudou depois); vista reprovando antes da troca (tarefas 1.2 e 1.4) e passando depois (2.2 e 2.5), sem sobra da violação injetada no diff
- demais resultados reaproveitados da verificação anterior desta data (suíte, lint, `sync-root --check`, smoke do instalador e da camada, instalação da v1.18.0 com e sem modo), porque nenhum código mudou desde então
