# Spec Delta

## MODIFIED Requirements

### Requirement: Guia de primeiros passos na raiz

O repositório do padrão SHALL ter na raiz um guia de primeiros passos, `COMECE-AQUI.md`, com: os pré-requisitos (Git, Node.js 18 ou mais recente e o OpenSpec CLI, com o comando de instalação e como conferir as versões); como descobrir a última release publicada, cloná-la pela tag e criar a branch `main` a partir dela; os passos até o `/opsx:init`; o que commitar no store e no repositório de código; como criar o remoto do store; e o primeiro ciclo de uma change, da proposta ao archive.

#### Scenario: Dev sem o OpenSpec CLI

- **WHEN** um dev sem o OpenSpec CLI instalado segue o guia desde o início
- **THEN** o guia mostra o comando de instalação do CLI e como conferir a versão antes de rodar o setup

#### Scenario: Primeiro dia completo

- **WHEN** o dev segue o guia do clone até o fim
- **THEN** ele chega ao `/opsx:init`, commita os dois repositórios e sabe como criar a primeira change e aprová-la

#### Scenario: Projeto novo começa de uma release

- **WHEN** existem as releases `v1.0.0` e `v1.2.0` e o dev segue o passo de clone do guia
- **THEN** o store fica na tag `v1.2.0`, numa branch `main` (não em HEAD destacado), e o manifesto instalado pelo setup registra a versão `1.2.0`
