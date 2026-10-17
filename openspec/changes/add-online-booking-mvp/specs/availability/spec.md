# Spec Delta

## Purpose

Determina quais horários podem ser reservados, a partir da jornada, dos bloqueios, dos agendamentos existentes e das regras do negócio.

## ADDED Requirements

### Requirement: Jornada semanal do profissional
O sistema SHALL permitir definir, para cada profissional, um ou mais intervalos de
atendimento por dia da semana.

#### Scenario: Jornada com intervalo de almoço
- **WHEN** a jornada de segunda-feira é 09:00–12:00 e 13:00–18:00
- **THEN** nenhum horário entre 12:00 e 13:00 é oferecido na segunda-feira

### Requirement: Bloqueios de agenda
O sistema SHALL permitir registrar períodos de bloqueio (folga, férias, compromisso),
que removem esses horários da disponibilidade.

#### Scenario: Folga em um dia específico
- **WHEN** o profissional tem um bloqueio no dia 10 das 14:00 às 16:00
- **THEN** nenhum horário que se sobreponha a esse período é oferecido no dia 10

### Requirement: Cálculo de horários disponíveis
O sistema SHALL calcular os horários livres como jornada menos bloqueios menos
agendamentos confirmados, fatiados em passos de 15 min, de modo que o serviço
inteiro caiba no intervalo livre.

#### Scenario: Serviço não cabe antes do fim da jornada
- **WHEN** a jornada termina às 18:00 e o serviço dura 60 min
- **THEN** o último horário oferecido é 17:00

#### Scenario: Horário ocupado
- **WHEN** existe um agendamento confirmado das 10:00 às 10:30
- **THEN** um serviço de 30 min não é oferecido em 09:45, 10:00 nem 10:15

#### Scenario: Qualquer profissional
- **WHEN** o cliente escolhe "qualquer profissional"
- **THEN** são oferecidos os horários em que ao menos um profissional habilitado está livre

### Requirement: Antecedência mínima e fuso horário
O sistema SHALL ocultar horários que estejam dentro da antecedência mínima
configurada pelo negócio e SHALL exibir todos os horários no fuso do negócio.

#### Scenario: Antecedência de 2 horas
- **WHEN** são 14:10 e a antecedência mínima é de 120 min
- **THEN** o primeiro horário oferecido no mesmo dia é 16:15 ou mais tarde
