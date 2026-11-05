# Spec Delta

## MODIFIED Requirements

### Requirement: Conferência do ambiente pelo script

Antes de qualquer pergunta sobre o projeto, o script SHALL conferir Git, Node.js 18 ou mais recente e o OpenSpec CLI. Quando o CLI faltar, o script SHALL oferecer instalar a versão `1.15.0`; quando Git ou Node.js faltarem ou estiverem abaixo do mínimo, SHALL parar dizendo o que instalar, sem criar nada.

#### Scenario: CLI ausente

- **WHEN** o dev roda o script numa máquina sem o OpenSpec CLI e aceita a instalação
- **THEN** o script instala o `@fission-ai/openspec@1.15.0` e segue para as perguntas do projeto

#### Scenario: Git ausente

- **WHEN** o dev roda o script numa máquina sem Git
- **THEN** o script termina com código diferente de zero, diz para instalar o Git e não cria pastas
