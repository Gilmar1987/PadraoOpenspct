# change-traceability Specification

## Purpose

Liga cada commit de código à change OpenSpec que o originou, para que o histórico do repositório de código seja rastreável até o planejamento e para que o retrabalho possa ser medido.

## Requirements

### Requirement: Trailer de change nos commits de código

Todo commit de código feito durante o `/opsx:apply` de uma change SHALL conter o trailer git `OpenSpec-Change: <nome-da-change>`, com o nome exato da change, no bloco de trailers da mensagem.

#### Scenario: Commit de implementação

- **WHEN** o agente faz um commit de código durante o apply da change `add-catalogo`
- **THEN** `git log -1 --format=%(trailers:key=OpenSpec-Change,valueonly)` retorna `add-catalogo`

### Requirement: Trailer em correções posteriores

Um commit que corrige um comportamento entregue por uma change já arquivada SHALL usar o tipo `fix` e o trailer `OpenSpec-Change` com o nome dessa change.

#### Scenario: Correção depois do archive

- **WHEN** o agente corrige um defeito do comportamento entregue pela change arquivada `add-catalogo`
- **THEN** o commit tem a mensagem do tipo `fix:` e o trailer `OpenSpec-Change: add-catalogo`

### Requirement: Commit do planejamento no store

Ao terminar os artefatos de uma change, o propose SHALL commitar no repositório git da raiz OpenSpec só os arquivos da pasta da change, com o trailer `OpenSpec-Change: <nome-da-change>`. Se a raiz não estiver num repositório git, o propose SHALL dizer isso e seguir sem commitar.

#### Scenario: Store versionado

- **WHEN** o propose termina os artefatos da change `add-catalogo` num store que é repositório git
- **THEN** existe um commit com os arquivos de `openspec/changes/add-catalogo/` e o trailer `OpenSpec-Change: add-catalogo`, e arquivos já preparados fora da change não entram nele

#### Scenario: Store sem git

- **WHEN** a raiz OpenSpec não está num repositório git
- **THEN** o propose informa que não commitou e não cria repositório

### Requirement: Commit do archive no store

Depois de arquivar, o archive SHALL commitar no repositório git da raiz OpenSpec a change arquivada, as specs atualizadas e o `project.md`, com o trailer `OpenSpec-Change: <nome-da-change>`.

#### Scenario: Archive concluído

- **WHEN** a change `add-catalogo` é arquivada num store versionado
- **THEN** existe um commit com `changes/archive/<data>-add-catalogo/`, as specs alteradas e o `project.md`, com o trailer da change
