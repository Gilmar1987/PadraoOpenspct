# {{Nome do Projeto}} — Project Overview

> Preset .NET. Preencha este documento na inicialização do projeto. Cada linha da Stack Summary traz as opções usuais na coluna Observações: registre a escolha real na coluna do meio, ou `A definir` enquanto estiver em aberto. Apague as opções não escolhidas e os comentários quando decidir.

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

<!-- Registre o estilo escolhido e apague os demais. Um estilo transversal como este merece uma ADR em openspec/adrs/. -->

**Estilo:** A definir

Opções usuais:

- **Projeto único com pastas por feature**: poucos endpoints, domínio simples.

  ```text
  src/
  ├── Program.cs          # Registro de endpoints e serviços
  ├── Endpoints/          # Handlers organizados por feature
  ├── Domain/             # Entidades e regras de negócio
  ├── Infrastructure/     # EF Core, repositórios, integrações
  └── Contracts/          # DTOs de request/response
  ```

- **Clean Architecture**: domínio complexo, regras isoladas de infraestrutura.

  ```text
  src/
  ├── Api/                # Controllers ou endpoints Minimal API
  ├── Application/        # Casos de uso, commands e queries
  ├── Domain/             # Entidades, value objects, interfaces
  └── Infrastructure/     # EF Core, repositórios, serviços externos
  ```

- **Vertical Slice**: organização por feature, cada fatia com seu endpoint, handler e validação.

  ```text
  src/
  ├── Features/
  │   └── NomeDaFeature/  # Endpoint, request, handler, validação
  └── Infrastructure/
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
| Runtime/SDK | A definir | Preferir a LTS vigente (ex.: .NET 10); fixar em `global.json` |
| Linguagem | C# com nullable reference types | |
| Tipo de projeto | A definir | Minimal API, Web API com Controllers, Blazor (Server/WebAssembly/Auto), MVC, Worker Service |
| Persistência | A definir | SQL Server, PostgreSQL ou SQLite; ou não aplicável |
| Acesso a dados | A definir | EF Core (migrations) ou Dapper |
| Autenticação/autorização | A definir | ASP.NET Core Identity, JWT Bearer, OpenID Connect (Microsoft.Identity.Web, Entra ID) |
| Validação | A definir | FluentValidation ou Data Annotations |
| Testes | A definir | xUnit, NUnit ou MSTest; NSubstitute, Moq ou FakeItEasy; `WebApplicationFactory`; Testcontainers |
| Documentação de API | A definir | OpenAPI nativo (`Microsoft.AspNetCore.OpenApi`), com Scalar ou Swagger UI; ou não aplicável |
| Logging/observabilidade | A definir | `Microsoft.Extensions.Logging`, Serilog, OpenTelemetry |
| Build/execução | `dotnet build` / `dotnet test` | Registrar aqui comandos adicionais (format, analyzers) |
| Deploy/infraestrutura | A definir | Azure App Service, contêiner, Kubernetes, IIS; ou não aplicável |

## Development Conventions

<!-- As sugestões abaixo vêm do preset; confirme ou substitua. -->

- **Idioma do código:** inglês (sugestão)
- **Idioma dos textos visíveis ao usuário:** A definir
- **Organização e estilo:** `.editorconfig` e `dotnet format`; regras de negócio fora de controllers e endpoints (sugestão)
- **Git e revisão:** trunk-based, pull request obrigatório, Conventional Commits (sugestão)
- **Testes e critérios de qualidade:** teste unitário para regras de negócio, teste de integração para endpoints, cobertura mínima de 80% em domínio e serviços (sugestão)
- **Segurança e tratamento de dados:** segredos em user-secrets local e no cofre do ambiente; nunca em `appsettings*.json` (sugestão)

## Open Questions

- <!-- Decisões pendentes que possam afetar escopo, comportamento ou arquitetura -->
