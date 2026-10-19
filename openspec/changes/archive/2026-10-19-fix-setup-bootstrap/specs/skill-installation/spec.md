# Spec Delta

## ADDED Requirements

### Requirement: Declaração do store versionada

O instalador SHALL manter no fim do `.gitignore` do projeto consumidor um bloco gerenciado que ignora o conteúdo de `openspec/`, exceto `openspec/config.yaml`. Um bloco gerenciado antigo, que ignorava `/openspec/` inteiro, MUST ser substituído pelo novo sem deixar duplicata.

#### Scenario: Instalação em repositório novo

- **WHEN** o instalador roda num repositório git sem `.gitignore`
- **THEN** `openspec/changes/demo/proposal.md` é ignorado pelo git e `openspec/config.yaml` não é ignorado

#### Scenario: Migração do bloco antigo

- **WHEN** o `.gitignore` do consumidor termina com o bloco antigo, que ignora `/openspec/`, e o instalador roda de novo
- **THEN** o `.gitignore` passa a ter só o bloco novo, a linha `/openspec/` deixa de existir e `openspec/config.yaml` não é mais ignorado

#### Scenario: Execução repetida

- **WHEN** o instalador roda duas vezes seguidas no mesmo repositório
- **THEN** o `.gitignore` contém uma única vez a linha `/openspec/*` e uma única vez a linha `!/openspec/config.yaml`
