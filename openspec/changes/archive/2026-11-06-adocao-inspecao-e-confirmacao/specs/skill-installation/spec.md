## ADDED Requirements

### Requirement: Script de inspeção entregue ao código

O instalador SHALL entregar ao repositório de código o script de inspeção como o arquivo gerenciado `docs/openspec-inspecionar-codigo.mjs`, idêntico a `padrao-openspec/scripts/inspecionar-codigo.mjs` da versão instalada, e listá-lo em `managedFiles` do manifesto.

#### Scenario: Instalação do padrão

- **WHEN** o instalador roda num repositório de código
- **THEN** o código tem `docs/openspec-inspecionar-codigo.mjs` igual ao script do padrão, e o manifesto o lista
