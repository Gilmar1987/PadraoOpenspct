# store-setup Specification

## Purpose

Garante que, ao configurar um projeto, o repositório de código saiba qual store OpenSpec usar e que o CLI consiga resolvê-lo de dentro desse repositório.

## Requirements

### Requirement: Declaração do store no repositório de código

Quando o setup registra o store, ele SHALL gravar a declaração `store: <id>` em `openspec/config.yaml` do repositório de código, criando o arquivo se ele não existir. Se o arquivo existir e declarar outro store, o setup SHALL falhar sem alterá-lo, a menos que `--force` seja usado.

#### Scenario: Repositório de código sem config

- **WHEN** o setup roda com `--register-id meu-projeto` em um repositório de código sem `openspec/config.yaml`
- **THEN** o repositório de código passa a ter `openspec/config.yaml` com `store: meu-projeto`

#### Scenario: Declaração conflitante

- **WHEN** `openspec/config.yaml` do repositório de código já declara `store: outro` e o setup roda com `--register-id meu-projeto` sem `--force`
- **THEN** o setup termina com erro citando a declaração existente e o arquivo não é alterado

#### Scenario: Sem registro

- **WHEN** o setup roda com `--no-register`
- **THEN** nenhuma declaração de store é gravada no repositório de código e a mensagem final explica como registrar e declarar depois

### Requirement: Verificação de resolução do store

Após registrar e declarar o store, o setup SHALL executar o OpenSpec CLI de dentro do repositório de código e confirmar que a raiz resolvida é o store configurado. Se a resolução falhar ou apontar para outra raiz, o setup SHALL terminar com código diferente de zero e exibir o comando que corrige o problema.

#### Scenario: Store resolvido

- **WHEN** o registro e a declaração são concluídos
- **THEN** o setup informa que o CLI resolveu o store a partir do repositório de código e termina com código zero

#### Scenario: Registro falhou

- **WHEN** `openspec store register` falha durante o setup
- **THEN** o setup termina com código diferente de zero e exibe o comando `openspec store register` a executar

### Requirement: Resolução de raiz nos comandos init e ingest

`/opsx:init` e `/opsx:ingest` SHALL resolver a raiz OpenSpec pelo CLI, respeitando `--store` e a declaração `store:` do projeto, antes de ler ou gravar arquivos em `openspec/`.

#### Scenario: Init a partir do repositório de código

- **WHEN** `/opsx:init` é executado em um repositório de código cujo `openspec/config.yaml` declara um store registrado
- **THEN** `project.md`, `config.yaml`, `project-setup.md` e as ADRs são gravados no store resolvido, e não no `openspec/` local do repositório de código

### Requirement: Backup apenas de arquivos editados

Antes de substituir `openspec/project.md` e `openspec/config.yaml` pelo preset, o setup SHALL criar backup `.bak` somente quando o arquivo difere da versão commitada desse mesmo arquivo e de todos os presets. Isso MUST valer quando o store é a raiz do repositório git e quando é uma subpasta dele.

#### Scenario: Store como subpasta de um repositório

- **WHEN** o setup roda num clone do PadraoOpenspct, com o store em `padrao-openspec/` e `project.md` e `config.yaml` iguais aos commitados
- **THEN** o preset é aplicado e nenhum arquivo `.bak` é criado em `padrao-openspec/openspec/`

#### Scenario: Arquivo editado localmente

- **WHEN** o `config.yaml` do store tem uma edição local não commitada, diferente de todos os presets, e o setup roda com `--force`
- **THEN** o setup cria um `.bak` do `config.yaml` antes de aplicar o preset
