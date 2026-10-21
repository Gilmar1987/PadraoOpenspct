# Spec Delta

## ADDED Requirements

### Requirement: Escolha do caminho no guia

O `COMECE-AQUI.md` SHALL começar com um aviso de que o clone do padrão serve para ler o guia e não deve virar store, seguido da escolha entre dois caminhos: projeto novo e projeto em andamento. Para cada caminho, o guia SHALL listar o que o dev precisa receber de quem lidera o projeto antes de começar.

#### Scenario: Dev que só rodou o git clone

- **WHEN** um dev clona o padrão sem parâmetros e abre o `COMECE-AQUI.md`
- **THEN** antes de qualquer comando o guia diz que esse clone não é o store do projeto e manda escolher entre o caminho do projeto novo e o do projeto em andamento

#### Scenario: Dev sem as informações do projeto

- **WHEN** o dev vai seguir um dos caminhos e não sabe o nome do projeto nem as URLs dos repositórios
- **THEN** o guia lista o que pedir ao tech lead: no projeto novo, o nome do projeto, quem responde a entrevista do `/opsx:init` e as permissões para criar os repositórios; no projeto em andamento, as URLs do repositório de código e do store

### Requirement: Entrada em projeto em andamento

O `COMECE-AQUI.md` SHALL ter um caminho para entrar num projeto já configurado: clonar o repositório de código e o store do projeto, ler o id na linha `store:` do `openspec/config.yaml` do código, registrar a pasta `padrao-openspec` do store com esse id e conferir pelo CLI, a partir do código, que a raiz resolvida é esse store. O caminho MUST NOT mandar clonar o padrão, rodar o setup ou rodar o `/opsx:init`.

#### Scenario: Dev entra num projeto configurado

- **WHEN** um dev recebe as URLs do código e do store de um projeto configurado e segue o caminho do projeto em andamento
- **THEN** o OpenSpec CLI, rodado no repositório de código, resolve como raiz a pasta `padrao-openspec` do store clonado, e o dev pode rodar o `/opsx:propose` sem setup nem `/opsx:init`

#### Scenario: Store registrado com o id errado

- **WHEN** o dev registra o store com um id diferente do que está na linha `store:` do código
- **THEN** a tabela de problemas comuns mostra o sintoma e o comando para registrar com o id certo

### Requirement: Cuidados com a pasta do store

O caminho do projeto novo SHALL avisar que cada projeto tem o próprio clone do padrão como store e que a pasta do store MUST NOT ser movida nem renomeada depois do setup, e SHALL dizer como refazer o registro se isso acontecer.

#### Scenario: Store movido depois do setup

- **WHEN** o dev move a pasta do store depois do setup e o CLI deixa de encontrá-lo a partir do código
- **THEN** o guia mostra o comando de registro que aponta para o novo caminho

### Requirement: Comandos para macOS e Linux

O `COMECE-AQUI.md` SHALL ter uma nota para macOS e Linux com o equivalente dos comandos do guia: caminhos de pasta, continuação de linha e leitura do id do store.

#### Scenario: Dev no macOS

- **WHEN** um dev no macOS segue o caminho do projeto novo ou do projeto em andamento
- **THEN** ele encontra na nota os comandos equivalentes sem precisar adaptar a sintaxe do PowerShell sozinho

### Requirement: Entrada pelo guia do projeto

O guia entregue ao repositório de código (`docs/openspec-padrao.md`) SHALL ter uma seção "Entrar neste projeto", antes de "Primeiros passos", com os passos para clonar e registrar o store e conferir o vínculo, e um link para o caminho do projeto em andamento no `COMECE-AQUI.md`.

#### Scenario: Dev chega pelo repositório de código

- **WHEN** um dev clona o repositório de código de um projeto configurado e abre o `docs/openspec-padrao.md`
- **THEN** a primeira seção depois da introdução diz como clonar o store, registrá-lo com o id da linha `store:` e conferir o vínculo

## MODIFIED Requirements

### Requirement: README aponta para o guia

O `README.md` da raiz SHALL apontar para o `COMECE-AQUI.md` antes de qualquer outra seção, citando os caminhos do projeto novo e do projeto em andamento, e todo exemplo de início de projeto no README MUST incluir o `/opsx:init` depois do setup. A orientação do README para quem clona um repositório de código já configurado MUST apontar para o caminho do projeto em andamento.

#### Scenario: Leitor do README no GitHub

- **WHEN** alguém abre o README do padrão no GitHub
- **THEN** a primeira orientação depois do título é o link para o `COMECE-AQUI.md`, com os dois caminhos

#### Scenario: Exemplo copiado do README

- **WHEN** o dev copia o exemplo de início de projeto do README
- **THEN** o exemplo inclui o `/opsx:init` depois do setup

#### Scenario: Leitor que vai entrar num projeto existente

- **WHEN** o leitor do README procura como trabalhar num projeto já configurado
- **THEN** o README o leva ao caminho do projeto em andamento do `COMECE-AQUI.md`

### Requirement: Guia protegido pela CI

A CI SHALL falhar quando o `COMECE-AQUI.md` não existir, quando o README não o linkar, quando o guia deixar de citar o `setup-project.mjs`, o `/opsx:init` ou o caminho do projeto em andamento com o comando `openspec store register`, ou quando o guia do projeto perder a seção "Entrar neste projeto".

#### Scenario: Guia removido por engano

- **WHEN** um PR apaga o `COMECE-AQUI.md`
- **THEN** a CI falha no passo do guia de primeiros passos

#### Scenario: Caminho do projeto em andamento removido

- **WHEN** um PR tira do `COMECE-AQUI.md` o caminho do projeto em andamento, ou do template do guia do projeto a seção "Entrar neste projeto"
- **THEN** a CI falha no passo do guia de primeiros passos
