# openspec-store-dotnet

Store OpenSpec para projetos web com .NET (8 LTS / 9).

## Stacks suportadas

- Minimal API
- Web API com Controllers
- Blazor Server / WebAssembly
- MVC

## Bancos de dados

- SQL Server (EF Core)
- PostgreSQL (EF Core + Npgsql)
- SQLite (EF Core)
- Dapper (acesso direto)

## Como usar em um novo projeto

### 1. Registrar o store (uma vez por máquina)

```bash
openspec store setup dotnet --url https://github.com/<seu-usuario>/openspec-store-dotnet
```

### 2. Iniciar um novo projeto

```bash
mkdir meu-projeto && cd meu-projeto
openspec init --store dotnet
```

### 3. Editar o contexto do projeto

Abra `openspec/project.md` e preencha:
- Visão do produto
- Arquitetura escolhida (Minimal API, Clean Architecture, Vertical Slice)
- Stack específica (banco, autenticação, testes)

Abra `openspec/config.yaml` e ajuste o `context` para refletir as escolhas do projeto.

### 4. Iniciar o fluxo de desenvolvimento

```bash
# Explorar e planejar
/opsx:explore

# Criar uma proposta de change
/opsx:propose add-nome-da-feature

# Implementar
/opsx:apply

# Arquivar após validação
/opsx:archive
```

## Estrutura

```
openspec-store-dotnet/
├── openspec/
│   ├── config.yaml       # Convenções e stack .NET
│   ├── project.md        # Template de visão do projeto
│   ├── specs/            # Fonte da verdade (preenchida após archives)
│   ├── changes/          # Changes em andamento
│   └── schemas/          # Schemas customizados
└── .claude/
    ├── commands/opsx/    # Slash commands
    └── skills/           # Skills dos agentes
```
