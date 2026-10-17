# {{Nome do Projeto}} — Project Overview

> Preset Next.js. Preencha este documento na inicialização do projeto. Cada linha da Stack Summary traz as opções usuais na coluna Observações: registre a escolha real na coluna do meio, ou `A definir` enquanto estiver em aberto. Apague as opções não escolhidas e os comentários quando decidir.

## Product Vision

<!-- Que problema o produto resolve, para quem e qual resultado pretende alcançar? -->

## System Boundaries

**Dentro do escopo:**

- <!-- Capacidades incluídas -->

**Fora do escopo:**

- <!-- Itens adiados ou explicitamente excluídos -->

## Users and Stakeholders

| Perfil | Necessidades e responsabilidades |
|---|---|
| | |

## Architecture

<!-- Ajuste a estrutura ao projeto. Decisões transversais (ex.: onde ficam as regras de negócio) merecem uma ADR em openspec/adrs/. -->

**Estrutura:** A definir

Estrutura usual com App Router:

```text
src/
├── app/                  # Rotas, layouts, páginas, Server Components
├── modules/              # Um módulo por capability (domain/, service/, actions/)
├── components/           # Componentes de UI reutilizáveis
├── lib/                  # Clientes, utilitários, helpers server-only
└── styles/               # Estilos globais
```

### Componentes e limites

| Componente | Responsabilidade | Dependências |
|---|---|---|
| | | |

### Fluxo de dados e integrações

<!-- Registre os fluxos e sistemas externos relevantes. -->

## Domain Model

| Conceito | Responsabilidade | Regras importantes |
|---|---|---|
| | | |

## Capabilities

| Capability | Estado | Change relacionada |
|---|---|---|
| | | |

## Key Constraints

- <!-- Regras de negócio, segurança, privacidade, desempenho, disponibilidade ou compliance -->

## Stack Summary

| Área | Escolha do projeto | Observações |
|---|---|---|
| Framework | Next.js, versão A definir | Registrar a versão exata; App Router ou Pages Router |
| Linguagem | TypeScript strict | |
| Gerenciador de pacotes | A definir | npm, pnpm, Yarn ou Bun |
| Estilização | A definir | Tailwind CSS, CSS Modules, Sass |
| Componentes de UI | A definir | shadcn/ui (requer Tailwind), Radix UI, Headless UI, próprios |
| Persistência | A definir | PostgreSQL, MySQL ou SQLite; serviço gerenciado (Neon, Supabase…); ou não aplicável |
| Acesso a dados | A definir | Prisma ou Drizzle |
| Autenticação/autorização | A definir | Auth.js, Clerk, Supabase Auth, própria |
| Validação | A definir | Zod ou Valibot |
| Data fetching e estado | A definir | Server Components, TanStack Query, SWR; Zustand ou Context para estado de cliente |
| Jobs/filas | A definir | Inngest, Trigger.dev, BullMQ, pg-boss; ou não aplicável |
| Testes | A definir | Vitest ou Jest com Testing Library; Playwright ou Cypress para E2E |
| Build/execução | Scripts do `package.json` | Registrar aqui os scripts de lint, typecheck, test, build e e2e |
| Deploy/infraestrutura | A definir | Vercel, contêiner, Node server; ou não aplicável |
| Observabilidade | A definir | |

## Development Conventions

<!-- As sugestões abaixo vêm do preset; confirme ou substitua. -->

- **Idioma do código:** inglês (sugestão)
- **Idioma dos textos visíveis ao usuário:** A definir
- **Organização e estilo:** ESLint e formatador do projeto; regras de negócio em módulos server-side, nunca em componentes (sugestão)
- **Git e revisão:** trunk-based, pull request obrigatório, Conventional Commits (sugestão)
- **Testes e critérios de qualidade:** teste unitário para regras de negócio, E2E para fluxos críticos, cobertura mínima de 80% nos módulos de domínio críticos (sugestão)
- **Segurança e tratamento de dados:** segredos só no servidor; nada sensível em variáveis `NEXT_PUBLIC_`; módulos sensíveis com `server-only` (sugestão)

## Open Questions

- <!-- Decisões pendentes que possam afetar escopo, comportamento ou arquitetura -->
