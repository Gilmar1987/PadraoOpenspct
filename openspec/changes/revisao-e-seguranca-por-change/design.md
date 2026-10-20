# Design

## Context

- A skill `requesting-code-review` dispara um subagente revisor sobre um intervalo `BASE_SHA..HEAD_SHA`, com o template `code-reviewer.md`. O revisor classifica os achados em Critical, Important e Minor; a skill manda corrigir os dois primeiros e permite contestar com razão técnica. Nenhum passo do apply ou do verify a chama.
- O apply já registra a evidência por tarefa (`Record task evidence`), só faz push com pedido explícito e confirma o progresso por grupo.
- O verify já usa os "Comandos de verificação" do `project.md` (`Project validation commands`) e grava itens e comandos no `verification.md`.
- O `project.md` neutro tem seis finalidades nos Comandos de verificação; o bloco 7.1 do init pergunta cada uma.
- A regra de riscos do config base pergunta sobre dados pessoais, autenticação, dados, configuração e compatibilidade, mas não sobre dependências.
- O `rules.md` seção 5 proíbe incluir secrets em arquivos, sem dizer como checar.

## Architecture Decisions

Não há ADR nova. A revisão por change e as checagens de segurança são regras de processo, sem decisão de stack. Seguem a [ADR-0003](../../adrs/0003-padrao-sem-stack-embutida.md): as ferramentas concretas ficam nos Comandos de verificação de cada projeto.

## Goals / Non-Goals

**Goals:**

- Nenhuma change com código chega ao archive sem revisão registrada.
- Nenhum secret encontrado pela varredura do projeto é commitado.
- Vulnerabilidades altas e críticas em dependências da change ficam corrigidas ou justificadas.

**Non-Goals:**

- Impor ferramenta de auditoria ou de varredura.
- Bloquear changes de projetos que não registraram esses comandos; o resultado vira "não verificado".

## Decisions

Os textos em inglês entram iguais na skill e no comando correspondentes.

### D1. Checagens de segurança no apply

No passo 6 do apply, depois de "Record task evidence":

> **Security checks**: when `openspec/project.md` records a secret scan command, run it on the staged content before every code commit of the change, review fixes included: stage the files, run the scan, and commit only if it is clean. If it finds a secret, do not commit: stop and show the user the file and line, never the value. Record the scan command and its result in the task's `Evidência:` line. When the change adds or updates dependencies and `project.md` records a dependency audit command, run it before the code review; fix or justify in `review.md` every high or critical vulnerability in a dependency the change added or updated, and list older findings as pre-existing. A missing or postponed command is reported as not verified, never replaced by an invented one.

### D2. Revisão de código no apply

Novo passo depois do loop de tarefas, antes de mostrar o status final:

> **Request code review**: when the change altered code (anything executed, loaded or interpreted by tools or agents: source, scripts, tests, CI, configuration, skills and commands), commit that code first, with the security checks above, and get a review of the change's commit range before reporting the change as done. Find the range with `git log --reverse --format=%H --grep "OpenSpec-Change: <change-name>"`: `BASE_SHA` is the parent of the first code commit and `HEAD_SHA` the last one. Use the `requesting-code-review` skill with that range and the proposal, specs and tasks as requirements. If you cannot dispatch a subagent, ask the user for a human review or a review in another session. Fix every Critical and Important finding, or justify it with technical reasoning, then write `review.md` in the change directory:
>
> ```markdown
> # Revisão de código — <change-name>
>
> ## YYYY-MM-DD
>
> - Intervalo: <BASE_SHA>..<HEAD_SHA>
> - Revisor: <subagente requesting-code-review | pessoa: nome>
> - Críticos: <n> (corrigidos <n>, justificados <n>)
> - Importantes: <n> (corrigidos <n>, justificados <n>)
> - Menores: <n>
> - Segurança: <dependency audit and secret scan results, or "não verificado (motivo)">
>
> Achados:
>
> - [crítico] <summary> — corrigido em <sha>
> - [importante] <summary> — justificado: <reason>
> ```
>
> A change that touched only its own planning artifacts and prose documentation (README, ADRs, guides) writes a `review.md` entry with `- Revisão: não aplicável (<reason>)`. Append a new `##` entry on every new review; never rewrite earlier ones.

### D3. Cobrança no verify

Em "Verify Completeness", depois de Task Completion:

> **Code review record**: decide whether the change altered code from its commits (the `OpenSpec-Change:` trailer) or its diff, with the definition of apply step 6a (anything executed, loaded or interpreted by tools or agents), never from what `review.md` claims. If it did, read `review.md` in the change directory. Missing file, or a Critical or Important finding without a fix or a justification: add a CRITICAL issue "Code review missing or unresolved". A `não aplicável` entry for a change that did alter code is also CRITICAL. If code commits of the change come after the last review's `HEAD_SHA`, other than the fix commits it lists, add a WARNING "Code review is stale". Report the review range and reviewer under `Comandos:` (for example, `review.md → <BASE_SHA>..<HEAD_SHA>, <reviewer>`); only a missing, unresolved or stale review becomes an `Itens:` line.

### D4. Init e project.md neutro

- O `project.md` neutro ganha duas linhas nos Comandos de verificação: "Auditoria de dependências" e "Varredura de secrets", com `<!-- A definir ou não aplicável -->`.
- O bloco 7.1 do init lista essas finalidades. Sugestões: auditoria — `npm audit`, `pip-audit`, `dotnet list package --vulnerable`, `osv-scanner`; varredura (conteúdo preparado para commit, não o histórico) — `gitleaks git --staged` (ou `gitleaks protect --staged` antes da 8.19), `trufflehog filesystem .`, `git secrets --scan`.

### D5. Riscos e regras

- Regra de riscos do proposal no config base: acrescenta "Adiciona ou atualiza dependências?" à lista de perguntas.
- `rules.md` seção 5: novo item "Commitar sem rodar a varredura de secrets que o projeto registrou nos Comandos de verificação".

### D6. CI e documentação

- Trechos customizados: apply exige "Security checks" e "Request code review"; verify exige "Code review record".
- Tabela de trechos customizados do `README.md` com os marcadores novos; o README cita o `review.md` no fluxo.

### D7. Ajustes da revisão de código

A revisão do intervalo `ef1e100..c732312` apontou cinco achados importantes, corrigidos nos textos do D1 a D4 acima: varredura sobre o conteúdo preparado (não sobre o histórico), código commitado antes da revisão e intervalo pelo trailer, definição de "alterou código", revisão limpa só em `Comandos:` e registro da varredura na evidência da tarefa. O passo 7 do apply deixa de tratar a revisão como opcional. Detalhes em `review.md`.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/.claude/skills/openspec-apply-change/SKILL.md`, `commands/opsx/apply.md` | D1, D2 | espelhos |
| `padrao-openspec/.claude/skills/openspec-verify-change/SKILL.md`, `commands/opsx/verify.md` | D3 | espelhos |
| `padrao-openspec/.claude/commands/opsx/init.md` | D4 | espelho |
| `padrao-openspec/openspec/project.md`, `config.yaml` | D4, D5 | smoke do setup (compara o `project.md` com o neutro); CI de config base |
| `openspec/rules.md` | D5 | stubs de agentes |
| `.github/workflows/validate.yml`, `README.md` | D6 | nenhum |

## Risks / Trade-offs

- [Revisão aumenta o tempo do apply] → uma revisão por change, não por tarefa.
- [Revisor erra] → a skill permite contestar com razão técnica; o `review.md` registra a justificativa.
- [Projeto sem ferramentas de segurança] → o resultado vira "não verificado (motivo)", sem bloquear.
- [A varredura mostrar o secret no chat] → a regra manda informar só arquivo e linha.

## Migration Plan

Changes em andamento passam a exigir `review.md` no próximo verify; projetos já configurados podem acrescentar as duas linhas aos Comandos de verificação do `project.md`. Rollback: reverter os commits.

## Open Questions

Nenhuma.
