---
name: dotnet-implementation
description: "Use when planning, implementing, or verifying an OpenSpec change in a .NET/C# project (ASP.NET Core, Minimal API, Controllers, Blazor, MVC, workers, libraries). Maps specs and scenarios to .NET tests, validation commands, EF Core migrations, and project conventions. Detect the existing solution setup; do not assume one."
---

# .NET implementation for OpenSpec changes

Bridge the OpenSpec workflow to a .NET codebase. This skill does not replace the OpenSpec workflow skills (`openspec-propose`, `openspec-apply-change`, `openspec-verify-change`) or the official .NET skills; it tells you how to turn approved artifacts into .NET code, tests, and evidence.

## Relationship with other skills

- The OpenSpec workflow skills own status, artifacts, and task tracking. Follow them first; use this skill for the .NET-specific parts.
- If the official .NET team skills are available in this session (from the `dotnet/skills` marketplace, for example `dotnet`, `dotnet-aspnetcore`, `dotnet-data`, `dotnet-test`, `dotnet-blazor`), use them for language, framework, and API guidance, and prefer them over your own recollection of current C#/.NET features.
- If they are not available and the task would benefit from them, mention once that they can be installed (`/plugin marketplace add dotnet/skills`, then `/plugin install <plugin>@dotnet-agent-skills`). Do not install plugins yourself.

## 1. Discover the solution before planning or editing

Read, do not guess:

1. `global.json` (SDK pin), `*.sln`/`*.slnx`, every relevant `*.csproj` (`TargetFramework`, `Nullable`, `ImplicitUsings`, `TreatWarningsAsErrors`), `Directory.Build.props`, `Directory.Packages.props` (central package management), `.editorconfig`, and `NuGet.config`.
2. Project type and style already in use: Minimal API (`app.MapGet`…), Controllers (`ControllerBase`), Blazor (`*.razor`, render modes), MVC, Worker Service, class library.
3. Architecture already in use (Clean Architecture, Vertical Slice, N-Tier, single project) from folders, project references, and namespaces. Follow it; do not introduce a new one inside a change.
4. Data access: EF Core (`DbContext`, `Migrations/` folder, provider package), Dapper, or other. Note the provider (SQL Server, PostgreSQL, SQLite…).
5. Test projects and frameworks: xUnit, NUnit, or MSTest; mocking library (NSubstitute, Moq, FakeItEasy); assertion library; `Microsoft.AspNetCore.Mvc.Testing`; Testcontainers.
6. The validation commands the repository already uses: CI workflow files, scripts, README. These are the commands you run.

Record what you found in the design or in your report. If `openspec/project.md` or `config.yaml` states a stack decision that contradicts the code, report the contradiction instead of choosing silently.

## 2. Planning (proposal, design, tasks)

When helping `openspec-propose` or the Spec Architect:

- **Proposal:** name the project type, the affected projects in the solution, and the data store. Say whether the change alters a public contract (HTTP API, message, NuGet package, database schema).
- **Design:** for each decision state where the code lives in the existing architecture (endpoint/controller → application service/handler → domain → infrastructure). Cover the DI registration and lifetime of new services, the configuration they need (options class and section name), the persistence change and its migration, the error contract (ProblemDetails / status codes), and the authentication and authorization policy for each new endpoint.
- **Tasks:** each task names the projects it touches and an objective validation, normally a test class or test name plus the command that runs it, for example `dotnet test tests/Orders.Tests --filter "FullyQualifiedName~CreateOrder"`. Put a separate task for each EF Core migration and for each new configuration value that must exist in other environments.

## 3. From scenarios to tests

Each OpenSpec scenario needs evidence. Map it like this:

| Scenario is about | Test type | Typical tooling |
|---|---|---|
| Business rule, calculation, validation | Unit test of the domain or service, no I/O | The repository's test framework and mocking library |
| HTTP behavior: status, body, headers, auth | Integration test through the real pipeline | `WebApplicationFactory<Program>` from `Microsoft.AspNetCore.Mvc.Testing` |
| Query/persistence behavior, constraints, transactions | Integration test against the real database engine | Testcontainers or the database the repository already uses for tests |
| Blazor component rendering and interaction | Component test | bUnit, if the repository uses it |

Rules:

- Name tests after the scenario so verification can trace them (for example `CreateOrder_WhenStockIsInsufficient_Returns409`).
- Cover the error and boundary scenarios listed in the spec, not only the happy path.
- Do not use the EF Core InMemory provider to prove relational behavior (constraints, transactions, SQL translation); it is not a relational database.
- With top-level statements, `WebApplicationFactory<Program>` needs `Program` to be accessible to the test project. Use the mechanism the repository already uses (for example `public partial class Program { }` or `InternalsVisibleTo`).
- Replace external services in integration tests through `ConfigureTestServices`. Do not call real third-party services from tests.

## 4. Implementation rules

Follow the repository's conventions first. Where it has none, apply these:

- Business rules live in services/handlers/domain, never in controllers, endpoints, or Razor components. Validate input at the boundary (FluentValidation or Data Annotations, whichever the project uses) before it reaches the domain.
- Respect nullable reference types. Do not silence warnings with `!` or `#nullable disable` to make a build pass.
- Use `async`/`await` end to end for I/O and accept and pass on a `CancellationToken`. Never block with `.Result` or `.Wait()`.
- Register `DbContext` and services that depend on it as scoped. Never inject a scoped service into a singleton.
- Bind configuration with the options pattern. Secrets go in user-secrets locally and in the environment's secret store elsewhere, never in `appsettings*.json` or in code.
- Return errors with the project's error contract (ProblemDetails by default in ASP.NET Core). Do not leak exception details or stack traces in responses.
- Use structured logging with message templates (`logger.LogInformation("Order {OrderId} created", id)`), never string interpolation in templates. Do not log personal or secret data. This connects to the risk section of the proposal.
- Add a package only when the design justifies it, using central package management if the solution has it.

### EF Core migrations

- If the model changes, create a migration with the repository's convention, for example `dotnet ef migrations add <Name> --project <Infrastructure> --startup-project <Api>`, and review the generated file before marking the task done.
- On EF Core 8 or later, `dotnet ef migrations has-pending-model-changes` proves that no migration is missing. Use it as a task validation when available.
- Destructive operations (drop column, drop table, type narrowing) need an explicit design decision and data plan. Stop and ask if the design does not cover them.
- Apply migrations only to a local or test database. Do not run `dotnet ef database update` against shared, staging, or production databases.

## 5. Validation commands

Use the commands the repository defines. When it defines none, these are the standard local checks:

```text
dotnet restore
dotnet build --no-restore
dotnet test --no-build
dotnet format --verify-no-changes
```

- Run the narrowest relevant test filter while implementing a task, then the full test suite before marking the last task of a change complete.
- Treat new compiler and analyzer warnings in the code you touched as defects.
- Report each command and its result. A command you did not run is "not verified", never "passed".

## 6. Verification (before archive)

When helping `openspec-verify-change` or the QA Validator, provide for each ADDED/MODIFIED requirement the test names that cover each scenario and the command output that shows they pass. Also confirm that:

- the build has no new warnings in the files the change touched;
- `has-pending-model-changes` is clean, or no model changed;
- new configuration keys are documented, along with the environments that still need them;
- the API description (OpenAPI/Swagger) reflects new or changed endpoints, if the project publishes one.

## Stop conditions

Stop and ask when the solution's stack contradicts the artifacts, when a migration is destructive and the design does not cover it, when a public contract would break without a decision in the design, or when validation requires a real external service, a shared database, or a deployment.
