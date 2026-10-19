# Design

## Context

- A seção 3 do `rules.md` desenha o ciclo começando no explore e diz "MUST NOT pular etapas".
- A seção 4 tem uma tabela por subagente VS Code, com uma nota de que os limites valem para o papel equivalente.
- O README das ADRs (fonte em `padrao-openspec/openspec/adrs/README.md`, espelhado na raiz) diz: "A aprovação é a revisão do pull request que muda o status para `Accepted`".
- O comando e a skill de verify têm a seção "Verification Heuristics", idêntica nos dois. O comando e a skill de archive têm a seção "Output On Success", que serve de âncora.
- O passo de CI "Trechos customizados das skills" protege os trechos próprios do padrão nas skills geradas pelo CLI.

## Architecture Decisions

Não há ADR nova: são regras de processo, registradas no `rules.md` e nas skills. A mudança segue a [ADR-0001](../../../adrs/0001-padrao-openspec-fonte-unica.md) e não contraria a ADR-0002.

## Goals / Non-Goals

**Goals:**

- Nenhuma das ambiguidades que o teste encontrou exige interpretação do agente.

**Non-Goals:**

- Mudar o schema do OpenSpec ou os artefatos de uma change.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `openspec/rules.md` | seções 3 e 4 | stubs de cada ferramenta (apontam para o arquivo, sem mudança) |
| `padrao-openspec/openspec/adrs/README.md` | aprovação sem PR | espelho `openspec/adrs/README.md` (sync) |
| `padrao-openspec/.claude/commands/opsx/verify.md`, `skills/openspec-verify-change/SKILL.md` | heurística "Evidence reuse" | espelhos (sync); passo de CI |
| `padrao-openspec/.claude/commands/opsx/archive.md`, `skills/openspec-archive-change/SKILL.md` | fechamento "Update the project overview" | espelhos (sync); passo de CI |
| `.github/workflows/validate.yml` | marcadores novos | job `store` |
| `README.md` | archive × CLI; trechos customizados | nenhum |

## Decisions

### D1. Seção 3

O diagrama vira `[/opsx:explore] → /opsx:propose → /opsx:apply → /opsx:verify → /opsx:archive`, com o explore entre colchetes e uma frase: o explore é opcional e recomendado quando problema, escopo ou abordagem não estão claros; as demais etapas são obrigatórias e nessa ordem. Os três "MUST NOT" atuais continuam.

### D2. Seção 4 por papel

Tabela com as colunas Papel, Pode, Não pode e Subagente VS Code:

| Papel | Pode | Não pode | Subagente VS Code |
|---|---|---|---|
| Planejar | Analisar e rascunhar artefatos de planejamento | Escrever código | `spec-architect`, `task-planner` |
| Implementar | Implementar tarefas aprovadas e marcá-las com evidência | Arquivar, fazer push ou deploy sem pedido | `code-implementer` |
| Verificar | Validar e gerar relatório | Corrigir código ou artefatos, arquivar | `qa-validator` |
| Revisar consistência | Revisar e reportar conflitos | Editar arquivos | `consistency-guardian` |
| Ingerir material | Extrair objetivos, atores, regras e dúvidas | Alterar arquivos ou copiar documentos brutos para specs | `business-requirements-ingestor` |

Abaixo da tabela, duas regras:

- um mesmo agente pode assumir papéis diferentes em etapas diferentes, mas respeita os limites do papel da etapa em que está;
- ajustar um artefato de change depois do verify passa pelo `/opsx:update`.

### D3. Aprovação de ADR sem PR

O item do README das ADRs passa a ter duas frases:

- **com PR:** a aprovação é a revisão do pull request que muda o status;
- **sem PR:** a aprovação é a declaração explícita do responsável, citada na mensagem do commit que muda o status para `Accepted`.

Uma terceira frase cobre o `/opsx:init`: as ADRs fundacionais nascem `Accepted` porque as respostas da entrevista foram confirmadas bloco a bloco.

### D4. Evidence reuse no verify

Item novo em "Verification Heuristics", com o mesmo texto no comando e na skill:

> **Evidence reuse**: Reuse a result recorded during apply only when it names the command and its exit code and no code file changed after it (check with `git log`/`git status`); otherwise run the command again. A check kept outside the repository (a manual run, a script in a temp folder) is not automated coverage: report the scenario as covered outside the suite.

### D5. Update the project overview no archive

Bloco novo antes de "Output On Success", com o mesmo texto no comando e na skill:

> **Update the project overview**: If the archived change created or modified capabilities and `<planningHome.root>/openspec/project.md` has a capabilities table, update it: add each new capability with its state and the archived change, and update the state of modified ones. Mention the update in the summary. If the file has no such table, skip this step and say so.

### D6. README

Uma linha na tabela de comandos: o `/opsx:archive` é o fluxo do agente (avaliação de sincronização, confirmação e atualização do `project.md`), e o `openspec archive` é o comando mecânico do CLI. Use um dos dois por change. Os dois trechos novos entram na tabela de trechos customizados.

## Risks / Trade-offs

- **[Explore opcional pode levar a propostas mal entendidas]** → o propose já obriga a perguntar sobre ambiguidade material, e a regra recomenda o explore quando houver dúvida.
- **[A verificação de "código não mudou" depende do agente]** → a heurística diz como conferir (`git log`/`git status`), e a evidência registrada fica visível no `verification.md`.
