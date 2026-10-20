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

> **Security checks**: when `openspec/project.md` records a secret scan command, run it before every code commit; if it finds a secret, do not commit: stop and show the user the file and line, never the value. When the change adds or updates dependencies and `project.md` records a dependency audit command, run it before the code review; fix or justify every high or critical vulnerability in `review.md`. A missing or postponed command is reported as not verified, never replaced by an invented one.

### D2. Revisão de código no apply

Novo passo depois do loop de tarefas, antes de mostrar o status final:

> **Request code review**: when the change altered code, get a review of its commit range before reporting the change as done. Use the `requesting-code-review` skill with `BASE_SHA` set to the commit before the change's first code commit (or `git merge-base` with the main branch) and `HEAD_SHA` to the current commit, and the proposal, specs and tasks as requirements. If you cannot dispatch a subagent, ask the user for a human review or a review in another session. Fix every Critical and Important finding, or justify it with technical reasoning, then write `review.md` in the change directory:
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
> A change that touched only documentation or planning artifacts writes a `review.md` entry with `- Revisão: não aplicável (<reason>)`. Append a new `##` entry on every new review; never rewrite earlier ones.

### D3. Cobrança no verify

Em "Verify Completeness", depois de Task Completion:

> **Code review record**: if the change altered code, read `review.md` in the change directory. Missing file, or a Critical or Important finding without a fix or a justification: add a CRITICAL issue "Code review missing or unresolved". A `não aplicável` entry for a change that did alter code is also CRITICAL. Report the review range and reviewer in the verification record's `Comandos:` or `Itens:` lists.

### D4. Init e project.md neutro

- O `project.md` neutro ganha duas linhas nos Comandos de verificação: "Auditoria de dependências" e "Varredura de secrets", com `<!-- A definir ou não aplicável -->`.
- O bloco 7.1 do init lista essas finalidades. Sugestões: auditoria — `npm audit`, `pip-audit`, `dotnet list package --vulnerable`, `osv-scanner`; varredura — `gitleaks detect`, `trufflehog git file://.`, `git-secrets --scan`.

### D5. Riscos e regras

- Regra de riscos do proposal no config base: acrescenta "Adiciona ou atualiza dependências?" à lista de perguntas.
- `rules.md` seção 5: novo item "Commitar sem rodar a varredura de secrets que o projeto registrou nos Comandos de verificação".

### D6. CI e documentação

- Trechos customizados: apply exige "Security checks" e "Request code review"; verify exige "Code review record".
- Tabela de trechos customizados do `README.md` com os marcadores novos; o README cita o `review.md` no fluxo.

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
