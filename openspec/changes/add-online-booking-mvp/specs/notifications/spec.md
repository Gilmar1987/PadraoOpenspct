# Spec Delta

## Purpose

Garante que o cliente receba confirmações e lembretes dos seus agendamentos, com rastreabilidade e reenvio em caso de falha.

## ADDED Requirements

### Requirement: Confirmação de agendamento
O sistema SHALL enviar uma confirmação ao cliente em até 1 minuto após a criação
do agendamento, com data, horário, serviço, profissional e o link de gerenciamento.

#### Scenario: Cliente com e-mail
- **WHEN** um agendamento é criado para um cliente com e-mail
- **THEN** um e-mail de confirmação é enviado
- **AND** o envio é registrado em `notification_log`

### Requirement: Lembrete antes do atendimento
O sistema SHALL enviar um lembrete 24h antes do horário agendado e SHALL deixar de
enviá-lo se o agendamento for cancelado ou remarcado.

#### Scenario: Agendamento remarcado
- **WHEN** um agendamento é remarcado de segunda-feira para quarta-feira
- **THEN** o lembrete de segunda-feira é cancelado
- **AND** um novo lembrete é programado para 24h antes do horário de quarta-feira

#### Scenario: Agendamento criado com menos de 24h de antecedência
- **WHEN** um agendamento é criado para daqui a 5h
- **THEN** nenhum lembrete de 24h é enviado, apenas a confirmação

### Requirement: Resiliência no envio
O sistema SHALL tentar reenviar uma notificação até 3 vezes, com intervalo
crescente entre as tentativas, e SHALL registrar a falha definitiva para a equipe.

#### Scenario: Provedor indisponível
- **WHEN** o provedor de e-mail falha nas 3 tentativas
- **THEN** o registro fica com status `failed`
- **AND** o painel exibe um alerta no agendamento correspondente
