# AgendaFácil — Project Overview

## Product Vision

Plataforma de autoagendamento online para pequenos negócios de serviço (clínicas, salões,
estúdios) com 1 a 20 profissionais. Elimina o agendamento por telefone e WhatsApp, reduz
faltas com lembretes automáticos e dá ao cliente autonomia 24h para marcar, cancelar e
remarcar.

## System Boundaries

**Dentro do escopo:**
- Página pública de agendamento por negócio (sem conta do cliente)
- Catálogo de serviços e profissionais com vínculo de quem executa o quê
- Cálculo de disponibilidade em tempo real (jornada − bloqueios − agendamentos)
- Prevenção de conflitos de horário, inclusive sob concorrência
- Painel da equipe com papéis `owner` e `staff`
- Notificações de confirmação e lembrete por e-mail (WhatsApp via feature flag)
- Isolamento total de dados entre negócios

**Fora do escopo (próximas propostas):**
- Pagamento online
- Lista de espera
- Relatórios e métricas
- Multiunidade
- App nativo
- Importação via CSV
- Agendamentos recorrentes

## Architecture

Monólito modular em Next.js 15 (App Router) + TypeScript strict, com módulos isolados
por capability em `src/modules/<capability>` (domain/, service/, api/).

```
src/modules/
├── catalog/        # Serviços e profissionais
├── availability/   # Jornada, bloqueios e cálculo de horários
├── booking/        # Ciclo de vida dos agendamentos
├── notifications/  # Confirmações e lembretes
└── auth/           # Login da equipe e papéis
```

Regras de negócio ficam nos serviços, nunca em componentes ou rotas.
Entradas validadas com Zod. Datas armazenadas em UTC, exibidas no fuso do negócio.

**Banco:** PostgreSQL 16 + Prisma. Constraint de exclusão (`btree_gist`) sobre
`(staff_id, tstzrange(starts_at, ends_at))` garante zero sobreposições no nível do banco.

**Jobs:** pg-boss para confirmações e lembretes assíncronos (sem Redis no MVP).

**Auth:** Auth.js com bloqueio após 5 tentativas falhas.

## Domain Model

| Entidade | Responsabilidade |
|---|---|
| `Business` | Fuso, antecedências mínimas, slug público |
| `Staff` | Jornada semanal, bloqueios, vínculo com serviços |
| `Service` | Duração (múltiplo de 15 min), preço, ativo/inativo |
| `Booking` | Cliente + serviço + profissional + horário, sem sobreposição |
| `Customer` | Nome e telefone; sem conta; link assinado para autogestão |
| `TimeOff` | Bloqueios de agenda do profissional |
| `NotificationLog` | Rastreabilidade de envios e reenvios |

**Regra central:** um horário só é disponível se o profissional está em jornada,
sem bloqueio e sem agendamento confirmado sobreposto.

## Capabilities

| Capability | Estado | Change |
|---|---|---|
| `catalog` | Em especificação | add-online-booking-mvp |
| `availability` | Em especificação | add-online-booking-mvp |
| `booking` | Em especificação | add-online-booking-mvp |
| `notifications` | Em especificação | add-online-booking-mvp |
| `staff-access` | Em especificação | add-online-booking-mvp |

## Key Constraints

- **Concorrência:** nunca dois agendamentos sobrepostos para o mesmo profissional,
  garantido por constraint no banco, não por lock na aplicação.
- **Performance:** página pública em menos de 2s em 4G (p95).
- **LGPD:** finalidade declarada no agendamento; exclusão de dados do cliente disponível.
- **Fuso:** todo cálculo de disponibilidade considera o fuso do negócio; testes cobrem
  virada de dia e horário de verão.
- **Escala MVP:** até ~20 profissionais por negócio; cálculo sob demanda sem materialização.

## Stack Summary

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript strict |
| Banco | PostgreSQL 16 + Prisma |
| Jobs | pg-boss |
| Auth | Auth.js |
| E-mail | Resend |
| Mensageria | Interface `MessageSender` (WhatsApp/SMS via feature flag) |
| UI | Tailwind + shadcn/ui |
| Testes | Vitest (unitário/integração) + Playwright (E2E) |
| Deploy | Docker |

## Git & Process

- Trunk-based development, PR obrigatório
- Conventional Commits
- Toda mudança de comportamento passa por `/opsx:propose` antes do código
- Cobertura mínima de 80% nos módulos `availability` e `booking`
