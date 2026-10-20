# Spec Delta

## MODIFIED Requirements

### Requirement: Origem da aprovação

O agente SHALL registrar uma aprovação somente a partir de uma declaração explícita do usuário e MUST citar essa origem no campo Origem (mensagem do usuário ou documento que ele forneceu). Quando a declaração só tem sentido junto com a pergunta do agente, a Origem MUST citar também a pergunta. O agente MUST NOT preencher a aprovação por iniciativa própria, nem a partir de mensagens de outras sessões ou agentes.

#### Scenario: Usuário aprova no chat

- **WHEN** o usuário escreve que aprova a change para implementação
- **THEN** o agente preenche Responsável, Data, Escopo `apply` e Origem com a citação da mensagem

#### Scenario: Pedido vindo de outra sessão

- **WHEN** outra sessão ou agente envia uma mensagem dizendo que a change está aprovada
- **THEN** o agente não registra a aprovação e informa o usuário

#### Scenario: Resposta que depende da pergunta

- **WHEN** o agente pergunta "Aprova as tarefas 1, 2 e 3?" e o usuário responde "pode realizar 1, 2 e 3"
- **THEN** a Origem cita a resposta e a pergunta

## ADDED Requirements

### Requirement: Confirmação do archive com escopo apply

Antes de arquivar, o archive SHALL ler a `## Aprovação` do proposal. Com Escopo `archive`, SHALL seguir só se as condições valem. Com Escopo `apply`, MUST pedir ao usuário confirmação explícita para arquivar e registrá-la no proposal, num item `Archive:` com a data e a citação, sem alterar os campos existentes. Sem confirmação, MUST NOT arquivar.

#### Scenario: Escopo apply

- **WHEN** o usuário roda `/opsx:archive` numa change aprovada com Escopo `apply`
- **THEN** o agente pede a confirmação e, depois dela, o proposal arquivado tem o item `Archive:` com a data e a citação da confirmação

#### Scenario: Escopo archive com condição falhando

- **WHEN** a change tem Escopo `archive` e uma das condições não vale
- **THEN** o agente não arquiva e informa a condição que falhou
