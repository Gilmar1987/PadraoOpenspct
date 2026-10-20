# Spec Delta

## ADDED Requirements

### Requirement: Comandos de segurança do projeto

No registro dos comandos de verificação, o `/opsx:init` SHALL perguntar também o comando de auditoria de dependências e o de varredura de secrets, com sugestões de ao menos três ecossistemas ou ferramentas, além de "Não aplicável", "Adiar" e "Outro", e SHALL gravá-los na seção "Comandos de verificação" do `project.md`.

#### Scenario: Projeto Node.js

- **WHEN** a stack escolhida é TypeScript + Node.js
- **THEN** o init sugere `npm audit` para a auditoria de dependências e uma ferramenta de varredura de secrets, e grava a escolha no `project.md`

#### Scenario: Varredura adiada

- **WHEN** o responsável escolhe adiar a varredura de secrets
- **THEN** o `project.md` registra "Adiado: definir na primeira change que precisar" para a varredura
