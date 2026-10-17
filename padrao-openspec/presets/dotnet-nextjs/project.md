# {{Nome do Projeto}} — Project Overview

> Preset .NET + Next.js. Preencha este documento na inicialização do projeto. Cada linha da Stack Summary traz as opções usuais na coluna Observações: registre a escolha real na coluna do meio, ou `A definir` enquanto estiver em aberto. Apague as opções não escolhidas e os comentários quando decidir.

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

<!-- Ajuste ao projeto. Estilo do back-end, contrato entre as partes e fluxo de autenticação merecem ADRs em openspec/adrs/. -->

**Repositórios:** A definir (monorepo com as duas partes, ou um repositório para cada)

**Estilo do back-end:** A definir (projeto único por feature, Clean Architecture, Vertical Slice)

```text
backend/                  # Solução .NET
├── src/                  # API e camadas conforme o estilo escolhido
└── tests/                # Testes unitários e de integração
frontend/                 # Aplicação Next.js
├── src/app/              # Rotas, layouts, páginas, Server Components
├── src/modules/          # Um módulo por capability (cliente da API, actions)
└── src/components/       # Componentes de UI reutilizáveis
```

### Componentes e limites

| Componente | Responsabilidade | Dependências |
|---|---|---|
| API .NET | Regras de negócio, dados, autorização | Banco, serviços externos |
| Front-end Next.js | Interface, sessão do usuário, chamadas à API | API .NET |

### Fluxo de dados e integrações

<!-- Como o front-end chama a API (direto do navegador, pelo servidor Next.js ou ambos), como a autenticação flui entre as partes e quais sistemas externos existem. -->

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

### Back-end

| Área | Escolha do projeto | Observações |
|---|---|---|
| Runtime/SDK | A definir | Preferir a LTS vigente (ex.: .NET 10); fixar em `global.json` |
| Linguagem | C# com nullable reference types | |
| Tipo de projeto | A definir | Minimal API ou Web API com Controllers |
| Persistência | A definir | SQL Server, PostgreSQL ou SQLite |
| Acesso a dados | A definir | EF Core (migrations) ou Dapper |
| Validação | A definir | FluentValidation ou Data Annotations |
| Testes | A definir | xUnit, NUnit ou MSTest; NSubstitute, Moq ou FakeItEasy; `WebApplicationFactory`; Testcontainers |
| Documentação de API | A definir | OpenAPI nativo (`Microsoft.AspNetCore.OpenApi`), com Scalar ou Swagger UI |
| Logging/observabilidade | A definir | `Microsoft.Extensions.Logging`, Serilog, OpenTelemetry |

### Front-end

| Área | Escolha do projeto | Observações |
|---|---|---|
| Framework | Next.js, versão A definir | Registrar a versão exata; App Router ou Pages Router |
| Linguagem | TypeScript strict | |
| Gerenciador de pacotes | A definir | npm, pnpm, Yarn ou Bun |
| Estilização e UI | A definir | Tailwind CSS, CSS Modules; shadcn/ui, Radix UI, próprios |
| Validação | A definir | Zod ou Valibot |
| Data fetching e estado | A definir | Server Components, TanStack Query, SWR |
| Testes | A definir | Vitest ou Jest com Testing Library; Playwright ou Cypress para E2E |

### Integração e operação

| Área | Escolha do projeto | Observações |
|---|---|---|
| Contrato da API | A definir | REST com OpenAPI; cliente TypeScript gerado (ex.: openapi-typescript, Orval, Kiota) ou escrito à mão |
| Autenticação/autorização | A definir | OpenID Connect (Entra ID, Auth0, Keycloak…), ASP.NET Core Identity, Auth.js no front-end com JWT validado pela API |
| Deploy/infraestrutura | A definir | Contêineres, Azure App Service, Vercel para o front-end |

## Development Conventions

<!-- As sugestões abaixo vêm do preset; confirme ou substitua. -->

- **Idioma do código:** inglês (sugestão)
- **Idioma dos textos visíveis ao usuário:** A definir
- **Organização e estilo:** `dotnet format` no back-end; ESLint e formatador no front-end; regras de negócio só no back-end (sugestão)
- **Git e revisão:** trunk-based, pull request obrigatório, Conventional Commits (sugestão)
- **Testes e critérios de qualidade:** teste unitário para regras de negócio, integração para endpoints, E2E para fluxos críticos, cobertura mínima de 80% em domínio e serviços (sugestão)
- **Segurança e tratamento de dados:** segredos em user-secrets ou no cofre do ambiente; nada sensível em variáveis `NEXT_PUBLIC_` (sugestão)

## Open Questions

- <!-- Decisões pendentes que possam afetar escopo, comportamento ou arquitetura -->
