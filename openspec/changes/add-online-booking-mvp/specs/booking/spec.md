# Spec Delta

## Purpose

Rege o ciclo de vida de um agendamento (criação, cancelamento, remarcação e conclusão) pelo cliente e pela equipe, sem conflitos de horário.

## ADDED Requirements

### Requirement: Agendamento público sem conta
O sistema SHALL permitir que um cliente agende pela página pública do negócio
informando nome e telefone (e-mail opcional), sem criar conta.

#### Scenario: Agendamento realizado
- **WHEN** o cliente escolhe serviço, profissional, horário livre e informa seus dados
- **THEN** o agendamento é criado com status `confirmed`
- **AND** o cliente vê uma tela de confirmação com um link para gerenciar o agendamento

#### Scenario: Dados obrigatórios ausentes
- **WHEN** o cliente não informa o telefone
- **THEN** o sistema não cria o agendamento e destaca o campo obrigatório

### Requirement: Ausência de conflitos
O sistema MUST impedir dois agendamentos confirmados sobrepostos para o mesmo
profissional, inclusive quando as requisições chegam ao mesmo tempo.

#### Scenario: Corrida pelo mesmo horário
- **WHEN** dois clientes confirmam o mesmo horário com o mesmo profissional ao mesmo tempo
- **THEN** apenas um agendamento é criado
- **AND** o outro cliente recebe a mensagem "Este horário acabou de ser ocupado" com novas sugestões

### Requirement: Cancelamento e remarcação pelo cliente
O sistema SHALL permitir que o cliente cancele ou remarque pelo link recebido,
respeitando a antecedência de cancelamento configurada pelo negócio.

#### Scenario: Cancelamento dentro do prazo
- **WHEN** o cliente cancela 24h antes e o prazo mínimo é de 4h
- **THEN** o status passa para `cancelled` e o horário volta a ficar disponível

#### Scenario: Cancelamento fora do prazo
- **WHEN** o cliente tenta cancelar 1h antes e o prazo mínimo é de 4h
- **THEN** o sistema bloqueia a ação e mostra o contato do negócio

### Requirement: Gestão da agenda pela equipe
O sistema SHALL oferecer à equipe uma visão diária e semanal da agenda por
profissional, com ações de criar, remarcar, cancelar e marcar como `no_show` ou
`completed`.

#### Scenario: Staff vê apenas a própria agenda
- **WHEN** um usuário com papel `staff` acessa o painel
- **THEN** ele vê e altera apenas os seus próprios agendamentos

#### Scenario: Marcar falta
- **WHEN** a equipe marca um agendamento passado como `no_show`
- **THEN** o status é atualizado e passa a contar nas métricas de faltas
