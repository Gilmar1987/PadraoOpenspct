# Spec Delta

## ADDED Requirements

### Requirement: Versões consultadas no propose

Para cada dependência nova que o design acrescenta, o `/opsx:propose` SHALL consultar o registro do ecossistema no momento do propose e registrar no `design.md` o pacote, a versão escolhida, a fonte e a data da consulta e as restrições de runtime e de pares que o registro informa. Sem acesso ao registro, a versão MUST ficar marcada `[INFERIDO: sem consulta ao registro]`.

#### Scenario: Biblioteca npm nova

- **WHEN** o design acrescenta o Vitest a um projeto Node.js
- **THEN** o `design.md` tem uma linha com `vitest`, a versão exata escolhida, "npm view vitest dist-tags engines peerDependencies" com a data e as restrições de `engines.node`

#### Scenario: Sem rede

- **WHEN** o agente não consegue consultar o registro
- **THEN** a versão aparece com `[INFERIDO: sem consulta ao registro]`, e o portão de apply bloqueia até o responsável confirmar

### Requirement: Versão exata e estável

A versão escolhida no propose SHALL ser exata e estável. Uma pré-release (`rc`, `beta`, `alpha`, `preview`, `next`, `canary` ou `dev`) MUST NOT ser escolhida, mesmo quando a tag `latest` aponta para ela. A tarefa que instala a dependência SHALL citar a versão exata.

#### Scenario: Latest aponta para uma RC

- **WHEN** `npm view prisma dist-tags` devolve `latest: 8.0.0-rc.24` e a estável mais recente é a 7.10.1
- **THEN** o design registra a 7.10.1, diz por que recusou a RC, e a tarefa instala `prisma@7.10.1`

### Requirement: ADR do propose no commit do planejamento

Quando o `/opsx:propose` cria uma ADR em `openspec/adrs/`, o commit do planejamento SHALL incluir essa ADR, além da pasta da change, com pathspec explícito para cada arquivo, e MUST NOT incluir outros arquivos.

#### Scenario: Change com ADR nova

- **WHEN** o propose cria `openspec/adrs/0012-cache-distribuido.md` com `status: Proposed`
- **THEN** o commit `docs: propõe <change>` contém a pasta da change e esse arquivo, e nada mais
