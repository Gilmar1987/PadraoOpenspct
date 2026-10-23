# Spec Delta

## Purpose

Registrar no store o que o projeto ainda não cumpre de uma fonte de referência, com motivo, data e o hash da fonte, e cobrar esse registro nas duas direções no verify, para que uma divergência conhecida seja decidida e não esquecida.

## ADDED Requirements

### Requirement: Registro de lacunas declaradas

O padrão SHALL fornecer o modelo `openspec/lacunas.md` do store, com uma linha por lacuna: a fonte de referência, o SHA-256 da fonte, o item não cumprido, o motivo, a data e o encaminhamento. Motivo e data MUST estar preenchidos. Fonte de referência é uma spec principal, uma ADR `Accepted` ou um documento de referência do projeto, como um modelo de dados ou um contrato.

#### Scenario: Lacuna declarada com motivo

- **WHEN** o projeto decide não implementar ainda uma tabela do modelo de dados de referência
- **THEN** o registro ganha uma linha com o caminho do modelo, o SHA-256 dele, a tabela, o motivo, a data e o encaminhamento

#### Scenario: Linha sem motivo

- **WHEN** uma linha do registro tem o motivo vazio
- **THEN** a conferência do registro falha e aponta a linha

### Requirement: Conferência mecânica do registro

O padrão SHALL fornecer um script sem dependências externas que confere o registro de lacunas: campos obrigatórios preenchidos, data válida, fonte existente e SHA-256 registrado igual ao do conteúdo atual da fonte. Quando o SHA-256 diverge, o script MUST falhar e dizer que a declaração daquela fonte precisa ser relida inteira contra a versão nova, e não só ter o hash atualizado.

#### Scenario: Registro em dia

- **WHEN** todas as linhas estão completas e os hashes conferem com as fontes
- **THEN** o script sai com código 0 e informa quantas lacunas e fontes conferiu

#### Scenario: Fonte alterada

- **WHEN** o modelo de dados de referência mudou depois da declaração
- **THEN** o script sai com erro, nomeia a fonte e as lacunas declaradas sobre ela e orienta a reler a declaração inteira

#### Scenario: Fonte ausente

- **WHEN** uma linha cita uma fonte que não existe no caminho registrado
- **THEN** o script sai com erro e aponta a linha

### Requirement: Lacunas cobradas pelo verify nas duas direções

Quando o store tem o registro de lacunas, o `/opsx:verify` SHALL apontar como crítico, para as fontes de referência que a change toca: (a) uma divergência que a change introduziu ou revelou e que não está corrigida nem declarada; (b) uma lacuna declarada que a change fechou sem remover ou reescrever a linha do registro.

#### Scenario: Lacuna nova sem declaração

- **WHEN** a change deixa de implementar uma coluna exigida pelo modelo de referência e não declara a lacuna
- **THEN** o verify registra um crítico que pede corrigir ou declarar a lacuna com motivo

#### Scenario: Lacuna fechada sem atualizar o registro

- **WHEN** a change implementa uma tabela que estava declarada como lacuna e a linha continua no registro
- **THEN** o verify registra um crítico que pede reescrever a declaração daquela fonte

### Requirement: Conferência de lacunas no verify

Quando o store tem o registro de lacunas, o `/opsx:verify` SHALL rodar a conferência mecânica do registro e registrar o resultado; uma falha SHALL ser crítica. Quando o `project.md` registra um comando de conferência de lacunas em "Comandos de verificação", o verify SHALL rodá-lo também. Sem registro, o verify SHALL seguir sem essa checagem.

#### Scenario: Comando do projeto registrado

- **WHEN** o `project.md` registra um teste que compara o modelo de dados com o esquema do banco como "Conferência de lacunas"
- **THEN** o verify roda o teste e o registra em `Comandos:`

#### Scenario: Projeto sem registro

- **WHEN** o store não tem `openspec/lacunas.md`
- **THEN** o verify não cobra lacunas e não registra item por isso
