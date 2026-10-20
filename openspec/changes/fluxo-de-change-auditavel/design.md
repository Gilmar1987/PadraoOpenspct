# Design

## Context

- `openspec-propose` (skill e comando) define o registro de aprovação ("Approval record") e a exceção de autorização prévia; não commita nada.
- `openspec-apply-change` confere a aprovação ("Check the approval record"), define o trailer `OpenSpec-Change` para commits de código e manda marcar o checkbox de cada tarefa; não diz como registrar a evidência nem o que é pedido de push.
- `openspec-archive-change` sincroniza specs, move a change e atualiza o `project.md`; não confere a `## Aprovação` nem commita.
- O `rules.md` diz que o papel Implementar não pode "arquivar, fazer push ou deploy sem pedido", e que Origem cita a declaração do usuário.
- O `init.md` gera, para projetos sem E2E, a orientação "Cobrir cenários de interface com verificação em navegador versionada no repositório, já que o projeto decidiu não ter E2E".
- `flow-metrics.mjs` lê da `## Aprovação` só a linha `- Data:`.

## Architecture Decisions

Não há ADR nova: as mudanças detalham regras já existentes (aprovação, rastreabilidade da [ADR-0002](../../adrs/0002-rastreabilidade-commit-change.md), papéis). Segue a [ADR-0003](../../adrs/0003-padrao-sem-stack-embutida.md).

## Goals / Non-Goals

**Goals:**

- O histórico do store mostra o planejamento antes do código e o archive como commit próprio.
- Toda aprovação e toda confirmação de archive ficam no proposal, com a citação que as justifica.
- Cada tarefa marcada traz a evidência de como foi verificada.

**Non-Goals:**

- Push automático ou abertura automática de PR.
- Commits do código por grupo de tarefas.

## Decisions

Os textos abaixo entram iguais na skill e no comando correspondentes.

### D1. Commit do planejamento (propose)

Depois do passo que confere a conclusão dos artefatos, entra:

> **Commit the planning**: when `git -C "<planningHome.root>" rev-parse --is-inside-work-tree` succeeds, commit only the change folder: `git -C "<planningHome.root>" add -- "<changeRoot>"`, then `git -C "<planningHome.root>" commit -m "docs: propõe <change-name>" -m "OpenSpec-Change: <change-name>" -- "<changeRoot>"`. Committing with the pathspec keeps out anything else the user has staged. If the root is not in a git repository, say the planning was not committed and continue. Never push.

### D2. Archive: autorização e commit

Novo passo antes de "Perform the archive":

> **Check the archive authorization**: read the `## Aprovação` section of `proposal.md`.
>
> - Missing section or `Responsável: Pendente`: stop; the change was never approved.
> - `Escopo: archive`: check every `Condições` item; if one fails, stop and report it.
> - `Escopo: apply`: ask the user to confirm the archive explicitly. When they do, append `- Archive: <YYYY-MM-DD>; Origem: "<their words>"` as the last item of the section, quoting your question too when their answer only makes sense with it. Do not change the other items. Without that confirmation, do not archive.

Depois de "Perform the archive", antes de "Display summary":

> **Commit the archive**: when the planning root is in a git repository, stage and commit the archive move, the main specs and the project overview: `git -C "<planningHome.root>" add -A -- openspec/changes openspec/specs openspec/project.md`, then `git -C "<planningHome.root>" commit -m "chore: archive <change-name>" -m "OpenSpec-Change: <change-name>" -- openspec/changes openspec/specs openspec/project.md`. Otherwise say the archive was not committed. Never push.

O item `Archive:` não altera `- Data:`, que as métricas leem.

### D3. Origem com a pergunta

- Propose ("Approval record" e "Prior authorization exception"), apply ("Check the approval record") e archive (D2): "quote their message" passa a "quote their message, and also your question when their answer only makes sense with it".
- Regra do proposal no `config.yaml` base: "Origem (citação da declaração explícita do usuário e, quando a resposta depende dela, da pergunta)".
- `rules.md`, seção 2: o mesmo complemento na descrição de Origem.

### D4. Pedido explícito de push

No apply, no fim do passo 6:

> **Push only on explicit request**: push, open a pull request or deploy only when the user asks for it explicitly in this conversation, or when a `Condições` item in `## Aprovação` includes it. A repository URL, a newly created repository or a request to configure the remote is not a push request: configure the remote, then ask before publishing.

No `rules.md`, seção 4, depois da tabela: "Pedido de push, PR ou deploy é uma frase explícita do usuário (por exemplo, \"faça push\", \"abra o PR\") ou uma condição registrada na aprovação. Passar a URL de um repositório ou pedir para configurar o remoto não é pedido de push."

### D5. Evidência por tarefa

No apply, depois de "Mark the task complete":

> **Record task evidence**: right below the marked task, add an indented line `  - Evidência: <command> → <relevant result> (exit <code>)`. If the written criterion could not be followed as is (a port in use, a tool version that is not installed, a step that depends on something missing), say what you did instead and why. A task whose criterion cannot be met at all stays unmarked: report it instead.

Uma sub-linha indentada não muda a contagem de tarefas do CLI (conferido nas changes anteriores desta branch).

### D6. Verificação em navegador (init)

A orientação gerada para projetos sem E2E passa a ser:

> Cobrir cenários de interface com um roteiro de verificação em navegador versionado no repositório, já que o projeto decidiu não ter E2E. Se a execução for automatizada, versionar o script junto do roteiro. Registrar no roteiro quem executou (pessoa ou agente), quando e o resultado de cada passo. Dados criados pelo roteiro levam um marcador, e o roteiro termina removendo-os.

### D7. CI e documentação

- Trechos customizados: propose exige "Commit the planning"; apply exige "Record task evidence" e "Push only on explicit request"; archive exige "Check the archive authorization" e "Commit the archive".
- Tabela de trechos customizados do `README.md` com os marcadores novos.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/.claude/skills/openspec-propose/SKILL.md`, `commands/opsx/propose.md` | D1, D3 | espelhos |
| `padrao-openspec/.claude/skills/openspec-apply-change/SKILL.md`, `commands/opsx/apply.md` | D3, D4, D5 | espelhos |
| `padrao-openspec/.claude/skills/openspec-archive-change/SKILL.md`, `commands/opsx/archive.md` | D2, D3 | espelhos; `flow-metrics.mjs` (lê `- Data:`) |
| `padrao-openspec/.claude/commands/opsx/init.md` | D6 | espelho |
| `padrao-openspec/openspec/config.yaml` | D3 | CI de config base |
| `openspec/rules.md` | D3, D4 | stubs de agentes (só apontam para o arquivo) |
| `.github/workflows/validate.yml`, `README.md` | D7 | nenhum |

## Risks / Trade-offs

- [Commit automático levar arquivos que o usuário preparou] → commit com pathspec, só das pastas da change ou do archive.
- [Archive travado por falta de confirmação] → é o comportamento desejado com escopo `apply`; a pergunta diz o que responder.
- [Evidência longa demais no tasks.md] → uma linha, só o resultado relevante.

## Migration Plan

Changes em andamento seguem o novo fluxo a partir da próxima etapa. Rollback: reverter os commits.

## Open Questions

Nenhuma.
