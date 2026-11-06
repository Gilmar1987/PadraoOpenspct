## ADDED Requirements

### Requirement: Marca de adoção no manifesto

Quando o setup roda com a marca de adoção, o instalador SHALL gravar `"adoption": true` no `.openspec-padrao.json`. Uma reinstalação ou atualização (`--update`) SHALL manter a marca de um manifesto que já a tem, mesmo sem a opção. Sem a marca e sem manifesto anterior que a tenha, o manifesto MUST NOT ter o campo.

#### Scenario: Setup de adoção

- **WHEN** o setup roda com `--adoption` num código existente
- **THEN** o `.openspec-padrao.json` do código tem `"adoption": true`

#### Scenario: Atualização de um projeto adotado

- **WHEN** um projeto com `"adoption": true` no manifesto roda o `install-skills.mjs --update` de uma versão nova
- **THEN** o manifesto atualizado continua com `"adoption": true`

#### Scenario: Projeto novo

- **WHEN** o setup roda sem `--adoption` num código sem manifesto
- **THEN** o `.openspec-padrao.json` não tem o campo `adoption`
