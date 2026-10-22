# Spec Delta

## ADDED Requirements

### Requirement: Suíte sem recursos compartilhados

Os passos da CI que registram stores SHALL usar ids com um sufixo único por execução e SHALL desregistrá-los no fim, mesmo quando falham. A instalação do OpenSpec CLI SHALL ser pulada quando a versão exigida já estiver instalada, e MUST NOT reinstalar o CLI por cima de uma instalação igual.

#### Scenario: Duas execuções ao mesmo tempo na mesma máquina

- **WHEN** duas execuções locais da suíte rodam ao mesmo tempo
- **THEN** cada uma registra e desregistra só os próprios ids, e uma não remove o registro da outra

#### Scenario: Passo que falha no meio

- **WHEN** o passo da declaração do store falha depois de registrar o id
- **THEN** o id é desregistrado no fim do passo

#### Scenario: CLI já instalado

- **WHEN** o OpenSpec CLI `1.14.2` já está instalado
- **THEN** o passo de instalação não roda o `npm install -g`

### Requirement: Ids de teste conferidos

A CI SHALL falhar quando um passo usar um id de store de teste sem o sufixo de execução num `--register-id`, num `--id` ou num `store unregister`.

#### Scenario: Id fixo esquecido

- **WHEN** um passo novo registra o store com `--register-id ci-novo`
- **THEN** a checagem de ids falha citando a linha
