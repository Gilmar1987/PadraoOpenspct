# Spec Delta

## ADDED Requirements

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
