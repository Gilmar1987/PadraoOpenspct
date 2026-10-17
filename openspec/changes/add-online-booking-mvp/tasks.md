# Tasks

## 1. Fundação (Sprint 1)

- [ ] 1.1 Criar app Next.js + TypeScript strict, ESLint, Prettier e pipeline de CI — verificar: CI verde em um PR vazio
- [ ] 1.2 Configurar PostgreSQL + Prisma com o schema do design.md e a extensão btree_gist — verificar: `prisma migrate dev` aplica sem erro
- [ ] 1.3 Implementar login da equipe com bloqueio após 5 falhas — verificar: testes dos cenários de `staff-access`
- [ ] 1.4 Implementar papéis owner/staff e isolamento entre negócios — verificar: teste que acessa um recurso de outro negócio retorna 404
- [ ] 1.5 Onboarding do negócio (nome, slug, fuso, antecedências) — verificar: negócio criado aparece em `/{slug}`

## 2. Catálogo (Sprint 1)

- [ ] 2.1 CRUD de serviços com duração em múltiplos de 15 min — verificar: testes dos cenários de `catalog`
- [ ] 2.2 CRUD de profissionais e vínculo com serviços — verificar: teste em que só profissionais vinculados são listados

## 3. Disponibilidade (Sprint 2)

- [ ] 3.1 Cadastro de jornada semanal com múltiplos intervalos por dia — verificar: teste do cenário de intervalo de almoço
- [ ] 3.2 Cadastro de bloqueios de agenda — verificar: teste do cenário de folga
- [ ] 3.3 Cálculo de horários livres (passo de 15 min, serviço cabendo inteiro, opção "qualquer profissional") — verificar: testes unitários de todos os cenários de `availability`
- [ ] 3.4 Antecedência mínima e conversão de fuso — verificar: testes com relógio fixo, incluindo virada de dia
- [ ] 3.5 Constraint `no_overlap` no banco — verificar: teste de concorrência com 2 inserts simultâneos resulta em apenas 1 agendamento

## 4. Agendamento (Sprint 3)

- [ ] 4.1 Página pública: serviço → profissional → horário → dados do cliente — verificar: E2E Playwright do fluxo completo
- [ ] 4.2 Endpoint de criação com resposta 409 e novas sugestões em caso de conflito — verificar: teste de integração do cenário de corrida
- [ ] 4.3 Link assinado para o cliente cancelar ou remarcar, respeitando o prazo — verificar: testes dos cenários de cancelamento dentro e fora do prazo
- [ ] 4.4 Painel da equipe: agenda diária/semanal, criar, remarcar, cancelar, no-show e concluído — verificar: E2E em que staff vê apenas a própria agenda

## 5. Notificações (Sprint 4)

- [ ] 5.1 Worker pg-boss e interface `MessageSender` — verificar: job de teste executado localmente
- [ ] 5.2 Confirmação por e-mail em até 1 min com registro em `notification_log` — verificar: teste de integração com provedor fake
- [ ] 5.3 Lembrete 24h antes, cancelado ou recriado ao remarcar/cancelar — verificar: testes dos cenários de remarcação e de agendamento com menos de 24h
- [ ] 5.4 Reenvio com backoff (3 tentativas) e alerta no painel — verificar: teste com provedor que sempre falha
- [ ] 5.5 Canal WhatsApp atrás de feature flag — verificar: com a flag desligada, nenhum envio por WhatsApp

## 6. Hardening (Sprint 4)

- [ ] 6.1 LGPD: consentimento na página pública e exclusão de dados do cliente — verificar: dados do cliente removidos após a exclusão
- [ ] 6.2 Logs estruturados e alerta de falhas de envio — verificar: falha simulada gera alerta
- [ ] 6.3 Teste de carga da página pública — verificar: p95 < 2s em perfil 4G
- [ ] 6.4 Rodar `openspec validate add-online-booking-mvp --strict` e `/opsx:verify` — verificar: nenhum erro e todos os requisitos com implementação correspondente

## Workflow follow-up

- Piloto de 2 semanas com 3 a 5 negócios e coleta de métricas (adoção da página pública, no-show).
- `/opsx:archive add-online-booking-mvp` após o verify: incorpora as 5 specs em `openspec/specs/`.
- Abrir propostas seguintes (pagamentos, lista de espera, relatórios) com `/opsx:propose`.
