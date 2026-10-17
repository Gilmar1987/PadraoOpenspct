# {{Nome do Projeto}} — Project Overview

## Product Vision

<!-- Descreva o produto, o problema que resolve e para quem. -->

## System Boundaries

**Dentro do escopo:**
- <!-- liste as funcionalidades incluídas -->

**Fora do escopo (próximas propostas):**
- <!-- liste o que não será feito agora -->

## Architecture

<!-- Descreva o padrão arquitetural escolhido. Exemplo: -->

```
src/
├── app/                  # App Router (páginas, layouts, Server Components)
├── modules/              # Módulos por capability (domain/, service/, api/)
├── components/           # Componentes de UI reutilizáveis
├── lib/                  # Utilitários, clientes, helpers
└── styles/               # Estilos globais
```

## Domain Model

| Entidade | Responsabilidade |
|---|---|
| | |

## Capabilities

| Capability | Estado | Change |
|---|---|---|
| | | |

## Key Constraints

- <!-- Restrições de negócio, segurança, performance, compliance -->

## Stack Summary

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript strict |
| Estilização | <!-- Tailwind / CSS Modules / Styled Components / Sass --> |
| Componentes UI | <!-- shadcn/ui / Radix UI / Headless UI / Custom --> |
| Banco | <!-- PostgreSQL / MySQL / SQLite --> |
| ORM | <!-- Prisma / Drizzle --> |
| Autenticação | <!-- Auth.js / Clerk / Supabase Auth / Custom JWT --> |
| Validação | <!-- Zod / Valibot / Yup --> |
| Estado global | <!-- Zustand / Jotai / Redux Toolkit / Context API --> |
| Data fetching | <!-- TanStack Query / SWR / Server Components --> |
| Jobs/Filas | <!-- pg-boss / BullMQ / Inngest --> |
| Testes unitários | <!-- Vitest / Jest --> |
| Testes E2E | <!-- Playwright / Cypress --> |
| Deploy | <!-- Vercel / Docker / Railway --> |

## Git & Process

- Trunk-based development, PR obrigatório
- Conventional Commits
- Toda mudança de comportamento passa por `/opsx:propose` antes do código
- Cobertura mínima de 80% nos módulos de domínio críticos
