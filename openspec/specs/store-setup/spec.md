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

### Requirement: Setup sem preset de stack

O setup SHALL deixar `openspec/project.md` e `openspec/config.yaml` do store com o conteúdo neutro, alterando apenas o marcador `{{Nome do Projeto}}` quando o nome for informado. O setup SHALL recusar a opção `--stack` antes de alterar qualquer arquivo, com uma mensagem que oriente a definir a stack pelo `/opsx:init`.

#### Scenario: Setup com nome do projeto

- **WHEN** o setup roda com `--name "Livraria"` num store recém-clonado
- **THEN** o `project.md` do store troca `{{Nome do Projeto}}` por `Livraria` e continua igual ao neutro no resto, e o `config.yaml` não muda

#### Scenario: Automação antiga com --stack

- **WHEN** o setup roda com `--stack nextjs`
- **THEN** ele termina com código diferente de zero antes de instalar skills, a mensagem cita o `/opsx:init`, e nenhum arquivo do store ou do repositório de código é alterado
