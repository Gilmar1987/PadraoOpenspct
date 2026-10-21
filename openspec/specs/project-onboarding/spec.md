# project-onboarding Specification

## Purpose

Garante que quem clona o padrão para iniciar um projeto encontre, num lugar só, os pré-requisitos, os passos até a primeira change e o que fazer depois, e que o repositório de código receba um resumo desses próximos passos.

## Requirements

### Requirement: Guia de primeiros passos na raiz

O repositório do padrão SHALL ter na raiz um guia de primeiros passos, `COMECE-AQUI.md`, com: os pré-requisitos (Git, Node.js 18 ou mais recente e o OpenSpec CLI, com o comando de instalação e como conferir as versões); os passos até o `/opsx:init`; o que commitar no store e no repositório de código; como criar o remoto do store; e o primeiro ciclo de uma change, da proposta ao archive.

#### Scenario: Dev sem o OpenSpec CLI

- **WHEN** um dev sem o OpenSpec CLI instalado segue o guia desde o início
- **THEN** o guia mostra o comando de instalação do CLI e como conferir a versão antes de rodar o setup

#### Scenario: Primeiro dia completo

- **WHEN** o dev segue o guia do clone até o fim
- **THEN** ele chega ao `/opsx:init`, commita os dois repositórios e sabe como criar a primeira change e aprová-la

### Requirement: README aponta para o guia

O `README.md` da raiz SHALL apontar para o `COMECE-AQUI.md` antes de qualquer outra seção, e todo exemplo de início de projeto no README MUST incluir o `/opsx:init` depois do setup.

#### Scenario: Leitor do README no GitHub

- **WHEN** alguém abre o README do padrão no GitHub
- **THEN** a primeira orientação depois do título é o link para o `COMECE-AQUI.md`

#### Scenario: Exemplo copiado do README

- **WHEN** o dev copia o exemplo de início de projeto do README
- **THEN** o exemplo inclui o `/opsx:init` depois do setup

### Requirement: Primeiros passos no guia do projeto

O guia entregue ao repositório de código (`docs/openspec-padrao.md`) SHALL ter uma seção "Primeiros passos" com o `/opsx:init`, o que commitar e o ciclo de uma change, antes das seções sobre atualização do padrão. A mensagem final do setup SHALL citar esse guia.

#### Scenario: Projeto recém-configurado

- **WHEN** o setup termina para um projeto novo
- **THEN** a mensagem final cita o `docs/openspec-padrao.md`, e o guia começa pela seção "Primeiros passos"

### Requirement: Guia protegido pela CI

A CI SHALL falhar quando o `COMECE-AQUI.md` não existir, quando o README não o linkar ou quando o guia deixar de citar o `setup-project.mjs` e o `/opsx:init`.

#### Scenario: Guia removido por engano

- **WHEN** um PR apaga o `COMECE-AQUI.md`
- **THEN** a CI falha no passo do guia de primeiros passos
