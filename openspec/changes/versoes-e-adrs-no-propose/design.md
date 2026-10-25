# Design

## Context

- As "Artifact Creation Guidelines" do propose (comando e skill) têm trechos próprios do padrão: "Declared inference", "Interface contract first", "Related debts" e "Accepted failures". Nenhum deles trata das versões das dependências.
- O passo 8, "Commit the planning", commita só `<changeRoot>`, com pathspec. A ADR criada pelo "Architectural Decision Check" fica em `<planningHome.root>/openspec/adrs/`, fora do pathspec.
- O apply já tem "Revalidate requirements after a version change", e o verify tem "Dependencies in Impact". Esta change atua antes, no propose.
- O portão de apply já bloqueia com qualquer `[INFERIDO:` nos documentos de planejamento.

## Architecture Decisions

Não há ADR nova: é uma regra do fluxo de propose. A change segue a [ADR-0003](../../adrs/0003-padrao-sem-stack-embutida.md), com exemplos de consulta de vários ecossistemas.

## Goals / Non-Goals

**Goals:**

- Toda dependência nova chega ao apply com uma versão consultada, exata e estável.
- Nenhuma ADR do propose fica sem commit.

**Non-Goals:**

- Ferramenta própria de consulta de registros. O agente usa o CLI de cada ecossistema.

## Decisions

### D1. Trecho "Consulted dependency versions"

Item novo nas "Artifact Creation Guidelines", depois de "Interface contract first":

```text
- **Consulted dependency versions**: for each new dependency the design adds (library, package or tool), query its registry now, not from memory: for example `npm view <pkg> dist-tags engines peerDependencies`, `pip index versions <pkg>` (or the PyPI JSON API), `dotnet package search <pkg> --exact-match`, or the registry page for ecosystems without a CLI query. Pick an exact, stable version: never a pre-release (`rc`, `beta`, `alpha`, `preview`, `next`, `canary`, `dev`), even when the `latest` tag points to one; then take the newest stable and say why the pre-release was refused. Record in `design.md` a "Dependency versions" table: package, exact version, source and date of the query, and the runtime and peer constraints the registry reports. The task that installs the dependency names that exact version. When the registry cannot be reached, mark the version `[INFERIDO: sem consulta ao registro]`; the apply gate then waits for the user to confirm it.
```

### D2. ADR no commit do planejamento

O passo 8 passa a dizer:

```text
... commit only the change folder and the ADRs this workflow created: `git -C "<planningHome.root>" add -- "<changeRoot>" <each new ADR path>`, then `git -C "<planningHome.root>" commit -m "docs: propõe <change-name>" -m "OpenSpec-Change: <change-name>" -- "<changeRoot>" <each new ADR path>`.
```

Cada ADR entra pelo caminho dela, sem `openspec/adrs/` inteiro, para não levar ADRs alheias em andamento.

Alternativa descartada: commitar a ADR à parte, num segundo commit. Separaria o planejamento da decisão que o justifica.

### D3. CI e documentação

- **Marcadores** no comando e na skill do propose: `Consulted dependency versions` e `the ADRs this workflow created`.
- **README:** uma linha na tabela de trechos customizados.
- **CHANGELOG:** um item na 1.15.0, sem ação obrigatória.

## Risks / Trade-offs

- [O agente consulta, mas ignora a pré-release apontada pela `latest`] → O trecho cita explicitamente o caso da `latest` e pede o motivo da recusa no design.
- [Muitas dependências deixam o propose mais lento] → A consulta é por dependência nova, não pela árvore inteira.
- [Conflito textual com a change de aprovação por etapa no propose] → Trechos diferentes do arquivo; quem entrar por último faz o rebase.

## Migration Plan

Nenhuma migração. Os projetos recebem o propose novo na próxima atualização do padrão.
