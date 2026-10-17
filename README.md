# PadraoOpenspct

Repositório central de padrões e stores OpenSpec para desenvolvimento orientado a especificação (spec-driven development). Serve como ponto de partida para qualquer projeto novo, garantindo que o agente de IA tenha contexto preciso, regras claras e fluxo de trabalho padronizado antes de tocar no código.

## O que está aqui

```
PadraoOpenspct/
├── padrao-openspec/          # Store neutro completo com scripts de setup, subagentes e presets
├── openspec-store-dotnet/    # Store para projetos .NET (Web API, Minimal API, Blazor, MVC)
├── openspec-store-nextjs/    # Store para projetos Next.js 15 (neutro, sem opiniões de UI/testes)
└── openspec/                 # Projeto de referência: AgendaFácil (exemplo real em andamento)
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

### Opção A — Store neutro com setup interativo (recomendado)

```powershell
# 1. Clone o store neutro com o nome do seu projeto
git clone https://github.com/Gilmar1987/PadraoOpenspct padrao-openspec C:\openspec\meu-projeto-openspec

# 2. Rode o setup interativo
node C:\openspec\meu-projeto-openspec\padrao-openspec\scripts\setup-project.mjs
```

O setup pergunta a stack, o caminho do repositório de código e o nome do projeto, depois:
- aplica o preset da stack em `openspec/project.md` e `openspec/config.yaml`
- instala as skills e subagentes no repositório de código
- registra o store na máquina com `openspec store register`

Sem terminal interativo (CI, agentes):

```powershell
node padrao-openspec\scripts\setup-project.mjs C:\caminho\do\codigo --stack dotnet --name "Meu Projeto" --register-id meu-projeto --yes
```

### Opção B — Store de stack direto

```powershell
# Clone o store da stack desejada
git clone https://github.com/Gilmar1987/PadraoOpenspct C:\openspec\meu-projeto

# Registre o store na máquina
openspec store setup meu-projeto --url https://github.com/Gilmar1987/PadraoOpenspct

# No repositório de código, inicialize a integração com o agente
openspec init --tools github-copilot
```

Depois preencha `openspec/project.md` e ajuste o `context` em `openspec/config.yaml` com as escolhas reais do projeto.

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

## Estrutura de um store

```
store/
├── openspec/
│   ├── config.yaml       # Stack, convenções e regras injetadas no agente
│   ├── project.md        # Visão do produto, arquitetura e limites do sistema
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
