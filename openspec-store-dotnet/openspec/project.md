# {{Nome do Projeto}} — Project Overview

## Product Vision

<!-- Descreva o produto, o problema que resolve e para quem. -->

## System Boundaries

**Dentro do escopo:**
- <!-- liste as funcionalidades incluídas -->

**Fora do escopo (próximas propostas):**
- <!-- liste o que não será feito agora -->

## Architecture

<!-- Descreva o padrão arquitetural escolhido para este projeto. Exemplos: -->

**Opção A — Minimal API (simples, poucos endpoints)**
```
src/
├── Program.cs          # Registro de endpoints e serviços
├── Endpoints/          # Handlers organizados por feature
├── Domain/             # Entidades e regras de negócio
├── Infrastructure/     # EF Core, repositórios, integrações
└── Contracts/          # DTOs e modelos de request/response
```

**Opção B — Clean Architecture (domínio complexo)**
```
src/
├── Api/                # Controllers ou Minimal API endpoints
├── Application/        # Use cases, commands, queries (MediatR)
├── Domain/             # Entidades, value objects, interfaces
└── Infrastructure/     # EF Core, repositórios, serviços externos
```

**Opção C — Vertical Slice (feature-first)**
```
src/
├── Features/
│   ├── NomeDaFeature/
│   │   ├── Command.cs
│   │   ├── Handler.cs
│   │   └── Endpoint.cs
└── Infrastructure/
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
| Framework | .NET 8 LTS ou .NET 9 |
| Linguagem | C# com nullable reference types |
| Projeto web | Minimal API / Controllers / Blazor / MVC |
| Banco | SQL Server / PostgreSQL / SQLite |
| ORM | Entity Framework Core / Dapper |
| Autenticação | ASP.NET Core Identity / JWT / Azure AD |
| Validação | FluentValidation / Data Annotations |
| Testes | xUnit / NUnit + Moq / NSubstitute |
| Documentação | Swashbuckle (Swagger) / Scalar |
| Logging | Serilog / Microsoft.Extensions.Logging |

## Git & Process

- Trunk-based development, PR obrigatório
- Conventional Commits
- Toda mudança de comportamento passa por `/opsx:propose` antes do código
- Cobertura mínima de 80% nas camadas de domínio e serviço
