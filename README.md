# PadraoOpenspct

Repositório central de padrões e stores OpenSpec para desenvolvimento orientado a especificação (spec-driven development). Serve como ponto de partida para qualquer projeto novo, garantindo que o agente de IA tenha contexto preciso, regras claras e fluxo de trabalho padronizado antes de tocar no código.

## O que está aqui

```
PadraoOpenspct/
├── padrao-openspec/          # Store neutro completo com scripts de setup, subagentes e presets
├── openspec-store-dotnet/    # Store para projetos .NET (Web API, Minimal API, Blazor, MVC)
├── openspec-store-nextjs/    # Store para projetos Next.js 15 (neutro, sem opiniões de UI/testes)
├── openspec/                 # Projeto de referência: AgendaFácil (exemplo real em andamento)
├── .amazonq/rules/           # Stub de regras para Amazon Q
├── .claude/                  # Slash commands, skills e stub de regras para Claude Code
├── .github/                  # Stub de regras para GitHub Copilot
├── .cursorrules              # Stub de regras para Cursor
└── .windsurfrules            # Stub de regras para Windsurf
```

---

## Qual store usar

| Situação | Store recomendado |
|---|---|
| Projeto novo, stack ainda não definida | `padrao-openspec` |
| Projeto .NET (qualquer variante) | `openspec-store-dotnet` |
| Projeto Next.js 15 | `openspec-store-nextjs` |
| Full-stack .NET + Next.js | `padrao-openspec` com preset `dotnet-nextjs` |

---

## Como iniciar um projeto novo

### Fluxo validado (recomendado)

```powershell
# 1. Clone o store com o nome do projeto (sufixo -openspec por convenção)
git clone https://github.com/Gilmar1987/PadraoOpenspct C:\openspec\<projeto>-openspec

# 2. Crie e inicialize o repositório de código
mkdir C:\openspec\<projeto>
cd C:\openspec\<projeto>
git init

# 3. Rode o setup
node C:\openspec\<projeto>-openspec\padrao-openspec\scripts\setup-project.mjs `
  C:\openspec\<projeto> `
  --stack <dotnet|nextjs|dotnet-nextjs> `
  --name "<Nome do Projeto>" `
  --no-register `
  --yes
```

Exemplo real (projeto Livraria, stack Next.js):

```powershell
git clone https://github.com/Gilmar1987/PadraoOpenspct C:\openspec\livraria-openspec
mkdir C:\openspec\livraria && cd C:\openspec\livraria && git init
node C:\openspec\livraria-openspec\padrao-openspec\scripts\setup-project.mjs `
  C:\openspec\livraria `
  --stack nextjs `
  --name "Livraria" `
  --no-register `
  --yes
```

O setup:
- instala as skills e subagentes em `C:\openspec\<projeto>\.agents\skills\` e `.github\agents\`
- aplica o preset da stack em `<projeto>-openspec\padrao-openspec\openspec\project.md` e `config.yaml`
- adiciona `/openspec/` ao `.gitignore` do repositório de código

Resultado final:

| Pasta | Conteúdo |
|---|---|
| `C:\openspec\<projeto>-openspec\` | Store OpenSpec (specs, changes, config, rules) |
| `C:\openspec\<projeto>\` | Código da aplicação (skills e subagentes instalados) |

Sem terminal interativo (CI, agentes):

```powershell
node C:\openspec\<projeto>-openspec\padrao-openspec\scripts\setup-project.mjs `
  C:\openspec\<projeto> --stack dotnet --name "Meu Projeto" --no-register --yes
```

---

## Fluxo de trabalho

Todo projeto que usa este padrão segue o mesmo ciclo:

```
/opsx:explore   →   /opsx:propose   →   /opsx:apply   →   /opsx:verify   →   /opsx:archive
```

| Comando | O que faz |
|---|---|
| `/opsx:explore` | Explora o problema, limites e critérios de sucesso sem implementar nada |
| `/opsx:propose <nome>` | Cria os artefatos de planejamento: proposal, delta specs, design e tasks |
| `/opsx:apply` | Implementa as tarefas guiadas pelos artefatos |
| `/opsx:verify` | Confere conclusão de tarefas, requisitos, cenários e decisões de design |
| `/opsx:archive` | Aplica as delta specs à fonte da verdade e arquiva a change |
| `/opsx:update` | Revisa artefatos de uma change existente |
| `/opsx:sync` | Aplica deltas às specs principais sem arquivar |

> Toda mudança de comportamento passa por `/opsx:propose` antes do código.

---

## Skills disponíveis

### Skills de workflow OpenSpec (todos os stores)

| Skill | Papel |
|---|---|
| `openspec-explore` | Exploração sem implementação |
| `openspec-propose` | Planejamento da change |
| `openspec-apply-change` | Implementação guiada por tasks |
| `openspec-verify-change` | Verificação baseada em evidências |
| `openspec-archive-change` | Sync e arquivo com confirmação |
| `openspec-sync-specs` | Sync sem arquivar |
| `openspec-update-change` | Revisão de artefatos existentes |
| `requesting-code-review` | Revisão de código via subagente isolado |
| `docker` | Containerização com Dockerfile, docker-compose e boas práticas |

### Skills de stack (via `padrao-openspec`)

| Skill | Quando instalar |
|---|---|
| `dotnet-implementation` | Projetos .NET — `--stack dotnet` |
| `nextjs-implementation` | Projetos Next.js — `--stack nextjs` |
| `versioning-ci-cd` | Qualquer projeto com CI/CD |

### Skills oficiais externas (instalação separada)

| Stack | Comando |
|---|---|
| .NET | `/plugin marketplace add dotnet/skills` |
| Next.js | `npx skills add vercel-labs/agent-skills` |

---

## Subagentes VS Code / GitHub Copilot

Disponíveis em `padrao-openspec/.github/agents/`:

| Subagente | Responsabilidade |
|---|---|
| `spec-architect` | Analisa specs, impactos e prepara drafts de proposal/specs/design |
| `task-planner` | Deriva checklist atômico e verificável dos artefatos aprovados |
| `code-implementer` | Executa tarefas aprovadas, testa e atualiza o progresso |
| `qa-validator` | Avalia tarefas, requisitos, cenários e decisões de design |
| `consistency-guardian` | Detecta contradições, duplicações e ambiguidades entre changes e specs |
| `business-requirements-ingestor` | Extrai objetivos, atores e regras de materiais de negócio |

---

## Regras globais de agentes

Todas as regras que governam o comportamento dos agentes de IA estão em uma única
fonte da verdade:

```
openspec/rules.md    ← fonte única, agnóstica de agente
```

Cada agente carrega automaticamente um stub mínimo que aponta para esse arquivo:

| Agente | Arquivo carregado automaticamente |
|---|---|
| Amazon Q | `.amazonq/rules/openspec-rules.md` |
| Claude Code | `.claude/CLAUDE.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Cursor | `.cursorrules` |
| Windsurf | `.windsurfrules` |

Para atualizar uma regra, edite apenas `openspec/rules.md`. Os stubs não precisam
ser alterados.

---

## Estrutura de um store

```
store/
├── openspec/
│   ├── config.yaml       # Stack, convenções e regras injetadas no agente
│   ├── project.md        # Visão do produto, arquitetura e limites do sistema
│   ├── rules.md          # Fonte única de regras globais para todos os agentes
│   ├── specs/            # Fonte da verdade (preenchida após /opsx:archive)
│   ├── changes/          # Changes ativas e arquivadas
│   └── adrs/             # Decisões de arquitetura duradouras (padrao-openspec)
└── .claude/
    ├── commands/opsx/    # Slash commands carregados no prompt do agente
    └── skills/           # Skills detectadas automaticamente
```

---

## Validação contínua (padrao-openspec)

```powershell
# Validar estrutura e requisitos SHALL/MUST
npx @fission-ai/openspec@1.14.2 validate --all --strict

# Lint de Markdown
npx markdownlint-cli2@0.23.2 "**/*.md"
```

O CI roda automaticamente em PRs via `.github/workflows/validate.yml`.

---

## Projeto de referência

A pasta `openspec/` na raiz é o projeto **AgendaFácil** — um exemplo real e completo de como o padrão é aplicado em produção, com change ativa (`add-online-booking-mvp`), delta specs por domínio, `config.yaml` preenchido e `project.md` detalhado.
