# Design

## Context

Projeto greenfield; a motivação está em proposal.md (Why). O núcleo crítico é o
cálculo de disponibilidade e a garantia de que não existam agendamentos sobrepostos
para o mesmo profissional. O restante é CRUD e integração com provedores de mensagem.
Restrições: equipe de 2 devs, LGPD e página pública carregando em menos de 2s em 4G.

## Goals / Non-Goals

**Goals:**
- Zero agendamentos sobrepostos, inclusive sob concorrência.
- O mínimo possível de infraestrutura para operar (um app e um banco).
- Lembretes que acompanham remarcações e cancelamentos.

**Non-Goals:**
- Escalar além de cerca de 20 profissionais por negócio no MVP.
- Agendamentos recorrentes.

## Decisions

### 1. Monólito modular em Next.js (App Router) + TypeScript
Um único deploy, com módulos isolados por capability em `src/modules/<capability>`.
- Alternativa: API NestJS + SPA separada. Rejeitada porque dobra o deploy e a
  infraestrutura para uma equipe pequena.

### 2. Disponibilidade calculada sob demanda
`horários = jornada − bloqueios − agendamentos confirmados`, fatiados em passos de 15 min.
- Alternativa: tabela de horários pré-gerados. Rejeitada porque dessincroniza quando
  a jornada ou a duração dos serviços muda.

### 3. Prevenção de conflito no PostgreSQL
Constraint de exclusão (`btree_gist`) sobre `(staff_id, tstzrange(starts_at, ends_at))`
para agendamentos `confirmed`. A violação vira HTTP 409.
- Alternativa: lock na aplicação. Rejeitada porque não protege contra múltiplas
  instâncias do app.

### 4. Jobs com pg-boss
Confirmação e lembrete são enfileirados na criação do agendamento; o lembrete usa
`startAfter = starts_at − 24h`. Cancelar ou remarcar cancela o job e, se necessário,
cria outro.
- Alternativa: BullMQ + Redis. Rejeitada para não adicionar mais um serviço no MVP.

### 5. Cliente sem conta, com link assinado
O cliente se identifica por nome e telefone; para gerenciar o agendamento, recebe um
link `/b/{token}` assinado (HMAC), válido até o horário do atendimento.

### 6. Datas em UTC
Tudo é armazenado em UTC e exibido no `timezone` do negócio (padrão `America/Sao_Paulo`).

### Modelo de dados
```
business(id, name, slug, timezone, min_notice_minutes, cancel_notice_minutes)
staff(id, business_id, name, user_id?)
service(id, business_id, name, duration_min, price_cents, active)
staff_service(staff_id, service_id)
working_hours(staff_id, weekday, start_time, end_time)
time_off(id, staff_id, starts_at, ends_at, reason)
customer(id, business_id, name, phone, email?)
booking(id, business_id, staff_id, service_id, customer_id, starts_at, ends_at,
        status[confirmed|cancelled|completed|no_show], source[public|staff])
notification_log(id, booking_id, channel, type, status, attempts, sent_at)
```

## Risks / Trade-offs

- [Cálculo sob demanda lento com muitos profissionais] → medir no teste de carga;
  materializar por dia se necessário.
- [Aprovação de templates de WhatsApp demorada] → e-mail é o canal garantido;
  WhatsApp fica atrás de feature flag.
- [Erros de fuso e de horário de verão] → testes unitários específicos de fuso.
- [Escopo crescer durante o MVP] → todo pedido novo vira uma proposta separada.

## Migration Plan

Greenfield, sem migração de dados. Rollback: desligar a página pública do negócio
com uma flag por negócio.

## Open Questions

- Texto final dos templates de e-mail e WhatsApp (não altera specs nem tarefas).
