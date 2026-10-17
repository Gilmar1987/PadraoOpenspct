# Proposal

## Why

Pequenos negócios de serviço (clínicas, salões, estúdios) ainda agendam por telefone
e WhatsApp, o que gera retrabalho, conflitos de horário e faltas estimadas em 15–25%.
Um MVP de autoagendamento com lembretes automáticos resolve as duas maiores dores e
valida o produto com negócios-piloto.

## What Changes

- Catálogo de serviços e profissionais do negócio, com vínculo de quem executa cada serviço.
- Jornada semanal, bloqueios de agenda e cálculo de horários livres.
- Página pública de agendamento por negócio, sem criar conta, com link para cancelar ou remarcar.
- Painel da equipe para ver, criar, remarcar, cancelar e marcar falta.
- Confirmação imediata e lembrete 24h antes, por e-mail (WhatsApp atrás de feature flag).
- Login da equipe com papéis `owner` e `staff`, com isolamento de dados entre negócios.

**Fora do escopo** (próximas propostas): pagamento online, lista de espera, relatórios,
multiunidade, app nativo, importação via CSV.

## Capabilities

### New Capabilities
- `catalog`: serviços oferecidos pelo negócio e profissionais habilitados para cada um.
- `availability`: jornada, bloqueios e regras que definem quais horários podem ser reservados.
- `booking`: criação, cancelamento, remarcação e gestão de agendamentos, sem conflitos.
- `notifications`: confirmações e lembretes enviados ao cliente, com reenvio em caso de falha.
- `staff-access`: autenticação da equipe, papéis e isolamento entre negócios.

### Modified Capabilities
<!-- Nenhuma: projeto greenfield, ainda não existem specs em openspec/specs/. -->

## Impact

- **Código**: novo app Next.js com módulos `catalog`, `availability`, `booking`,
  `notifications` e `auth`.
- **Banco**: PostgreSQL com 9 tabelas novas (ver design.md).
- **Infra**: worker de jobs (pg-boss), conta Resend, provedor de WhatsApp opcional.
- **Equipe e prazo**: 2 devs full-stack + designer (meio período) + PO; 8 semanas de
  desenvolvimento e 2 semanas de piloto com 3 a 5 negócios.
- **Sucesso do piloto**: ≥ 50% dos agendamentos feitos pela página pública e queda de
  no-show ≥ 30% em relação à linha de base.
