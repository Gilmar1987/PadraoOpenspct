# PadraoOpenspct

Repositório central de padrões OpenSpec para desenvolvimento orientado a especificação (spec-driven development). Serve como ponto de partida para qualquer projeto novo, garantindo que o agente de IA tenha contexto preciso, regras claras e fluxo de trabalho padronizado antes de tocar no código.

## O que está aqui

```text
PadraoOpenspct/
├── padrao-openspec/          # Fonte única: store neutro, skills, comandos /opsx:*, agentes, presets e scripts
├── openspec/                 # Raiz OpenSpec deste repositório: regras globais, ADRs e changes do próprio padrão
├── .claude/                  # Espelho gerado de padrao-openspec/.claude (+ CLAUDE.md)
├── .github/                  # Workflow de CI, agentes espelhados e stub de regras para GitHub Copilot
├── .amazonq/rules/           # Stub de regras para Amazon Q
├── .cursorrules              # Stub de regras para Cursor
└── .windsurfrules            # Stub de regras para Windsurf
```

`padrao-openspec/` é a única fonte editável de skills, comandos, agentes e modelos de ADR
([ADR-0001](openspec/adrs/0001-padrao-openspec-fonte-unica.md)). As cópias em `.claude/skills/`,
`.claude/commands/opsx/`, `.github/agents/` e `openspec/adrs/{README,template}.md` são geradas
por `padrao-openspec/scripts/sync-root.mjs`; veja [Manutenção do padrão](#manutenção-do-padrão).

---

## Qual preset usar

Todo projeto parte de `padrao-openspec`. A stack é escolhida no setup com `--stack`:

| Situação | `--stack` |
|---|---|
| Projeto novo, stack ainda não definida | `none` |
| Projeto .NET (qualquer variante) | `dotnet` |
| Projeto Next.js 15 | `nextjs` |
| Full-stack .NET + Next.js | `dotnet-nextjs` |

---

## Como iniciar um projeto novo

### Fluxo validado (recomendado)

```powershell
# 1. Clone o repositório com o nome do projeto (sufixo -openspec por convenção)
git clone https://github.com/Gilmar1987/PadraoOpenspct C:\openspec\<projeto>-openspec

# 2. Crie e inicialize o repositório de código
mkdir C:\openspec\<projeto>
cd C:\openspec\<projeto>
git init

# 3. Rode o setup
node C:\openspec\<projeto>-openspec\padrao-openspec\scripts\setup-project.mjs `
  C:\openspec\<projeto> `
  --stack <dotnet|nextjs|dotnet-nextjs|none> `
  --name "<Nome do Projeto>" `
  --register-id <projeto> `
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
  --register-id livraria `
  --yes
```

O setup:

- instala no repositório de código as skills em `.agents/skills/` e `.claude/skills/` (padrão `--target both`), os comandos `/opsx:*` em `.claude/commands/opsx/` e os subagentes em `.github/agents/`;
- aplica o preset da stack em `<projeto>-openspec\padrao-openspec\openspec\project.md` e `config.yaml`;
- acrescenta ao `.gitignore` do repositório de código um bloco que ignora o conteúdo local de `openspec/`, mas mantém no git o `openspec/config.yaml` com a declaração do store (commite esse arquivo);
- registra o store nesta máquina, grava `store: <projeto>` em `openspec/config.yaml` do repositório de código e confirma que o OpenSpec CLI encontra o store a partir dele.

Resultado final:

| Pasta | Conteúdo |
|---|---|
| `C:\openspec\<projeto>-openspec\padrao-openspec\` | Store OpenSpec do projeto (specs, changes, config, ADRs) |
| `C:\openspec\<projeto>\` | Código da aplicação (skills, comandos e subagentes instalados) |

**Projeto Next.js novo:** rode o `create-next-app` no repositório de código **antes** do
setup. Ele recusa pastas que já têm `.agents/`, `.github/` ou `openspec/`. Se o setup já
rodou, gere o app numa pasta temporária e copie os arquivos para o repositório de código.

Quem clona um repositório de código já configurado recebe o `openspec/config.yaml` com o
id do store. Para o CLI encontrar o store, clone o repositório do store e registre-o com o
mesmo id: `openspec store register <caminho-do-store> --id <projeto>`.

Sem registrar o store (por exemplo, em CI), troque `--register-id <projeto>` por
`--no-register`. O setup mostra ao final o comando de registro e a linha `store:` a
declarar quando você quiser ligar os dois repositórios. Use `--target agents` ou
`--target claude` para instalar as skills em um único destino.

---

## Fluxo de trabalho

Todo projeto que usa este padrão segue o mesmo ciclo:

```text
[/opsx:explore]   →   /opsx:propose   →   /opsx:apply   →   /opsx:verify   →   /opsx:archive
```

| Comando | O que faz |
|---|---|
| `/opsx:init` | Inicializa o projeto: entrevista estruturada, complementa os campos do preset que ficaram em aberto, gera `project.md`, `config.yaml` e ADRs fundacionais. Com `/opsx:init <arquivo>`, usa um arquivo de respostas pré-preenchidas (tabela `\| Pergunta \| Resposta \|`, mais `Responsável:` e `Confirmação final: sim`) e pergunta só o que faltar |
| `/opsx:ingest` | Ingere documentos externos (atas, requisitos, e-mails) e gera brief estruturado |
| `/opsx:explore` | Opcional: explora o problema, limites e critérios de sucesso sem implementar nada, quando algo ainda não está claro |
| `/opsx:propose <nome>` | Cria os artefatos de planejamento: proposal, delta specs, design e tasks |
| `/opsx:apply` | Implementa as tarefas guiadas pelos artefatos |
| `/opsx:verify` | Confere conclusão de tarefas, requisitos, cenários e decisões de design |
| `/opsx:archive` | Aplica as delta specs à fonte da verdade, atualiza a tabela de capabilities do `project.md` e arquiva a change. É o fluxo do agente, com avaliação da sincronização e confirmação; o `openspec archive` do CLI faz o mesmo de forma mecânica. Use um dos dois por change |
| `/opsx:update` | Revisa artefatos de uma change existente |
| `/opsx:sync` | Aplica deltas às specs principais sem arquivar |

> Toda mudança de comportamento passa por `/opsx:propose` antes do código.

Fluxo completo quando há documentos externos:

```text
/opsx:init → /opsx:ingest → [/opsx:explore] → /opsx:propose → /opsx:apply → /opsx:verify → /opsx:archive
```

---

## Skills disponíveis

Todas vivem em `padrao-openspec/.claude/skills/` e são instaladas pelo setup.

### Skills de workflow e engenharia (sempre instaladas)

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
| `versioning-ci-cd` | Versionamento, Git, CI, CD e deploy conforme a stack detectada |

### Skills de stack (instaladas com `--stack`)

| Skill | Quando instalar |
|---|---|
| `dotnet-implementation` | Projetos .NET — `--stack dotnet` |
| `nextjs-implementation` | Projetos Next.js — `--stack nextjs` |

### Skills oficiais externas (instalação separada)

| Stack | Comando |
|---|---|
| .NET | `/plugin marketplace add dotnet/skills` |
| Next.js | `npx skills add vercel-labs/agent-skills` |
| Next.js (interface nova ou redesenhada) | `npx skills add https://github.com/anthropics/skills --skill frontend-design` |

O instalador lista essas recomendações ao final da instalação com `--stack`, mas não
as instala. A `frontend-design` (Anthropic, Apache 2.0) orienta o design visual; a `nextjs-implementation`
pede que o plano visual de cada change com interface fique registrado no `design.md`.

---

## Subagentes VS Code / GitHub Copilot

Fonte em `padrao-openspec/.github/agents/`, espelhados em `.github/agents/`:

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

```text
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

```text
padrao-openspec/
├── openspec/
│   ├── config.yaml       # Stack, convenções e regras injetadas no agente
│   ├── project.md        # Visão do produto, arquitetura e limites do sistema
│   ├── specs/            # Fonte da verdade (preenchida após /opsx:archive)
│   ├── changes/          # Changes ativas e arquivadas
│   └── adrs/             # Decisões de arquitetura duradouras
├── .claude/
│   ├── commands/opsx/    # Slash commands /opsx:*
│   └── skills/           # Skills instaladas no repositório de código
├── .github/agents/       # Subagentes VS Code/Copilot
├── presets/              # project.md + config.yaml por stack
└── scripts/              # setup-project, install-skills, sync-root
```

---

## Manutenção do padrão

1. Edite skills, comandos, agentes e modelos de ADR **somente** em `padrao-openspec/`.
2. Regenere as cópias da raiz:

   ```powershell
   node padrao-openspec/scripts/sync-root.mjs
   ```

3. Confira antes do commit (a CI faz a mesma checagem e falha em qualquer divergência):

   ```powershell
   node padrao-openspec/scripts/sync-root.mjs --check
   ```

Mudanças no próprio padrão seguem o fluxo OpenSpec na raiz `openspec/` deste repositório.

As skills `openspec-*` e os comandos `/opsx:*` foram gerados pelo OpenSpec CLI 1.14.2 e
receberam trechos próprios do padrão. Ao regenerá-los com uma versão nova do CLI,
reaplique estes trechos (o passo "Trechos customizados das skills" da CI falha se algum
sumir):

| Trecho | Arquivos |
|---|---|
| "Architectural Decision Check" | `commands/opsx/propose.md` e `skills/openspec-propose/SKILL.md` |
| "Approval record" e "Prior authorization exception" | `commands/opsx/propose.md` e `skills/openspec-propose/SKILL.md` |
| "Check the approval record" e trailer "OpenSpec-Change:" | `commands/opsx/apply.md` e `skills/openspec-apply-change/SKILL.md` |
| "Write the verification record" e "Evidence reuse" | `commands/opsx/verify.md` e `skills/openspec-verify-change/SKILL.md` |
| "Update the project overview" | `commands/opsx/archive.md` e `skills/openspec-archive-change/SKILL.md` |
| Bloco "Store selection", "Project check" e "Raiz OpenSpec" | `commands/opsx/init.md` e `commands/opsx/ingest.md` |

---

## Validação contínua

O workflow `.github/workflows/validate.yml` roda em pull requests e na `main`, em dois jobs:

| Job | O que valida |
|---|---|
| `store` (em `padrao-openspec/`) | `openspec validate --all --strict`, configs e presets sem avisos, lint de Markdown, sintaxe dos scripts e smoke tests do instalador, do setup e da declaração do store |
| `root` | Raiz em dia com `padrao-openspec/` (`sync-root.mjs --check`), `openspec validate --all --strict` e lint de Markdown da raiz |

Para rodar localmente:

```powershell
node padrao-openspec/scripts/sync-root.mjs --check
npx @fission-ai/openspec@1.14.2 validate --all --strict
npx markdownlint-cli2@0.23.2 "**/*.md"
```

Skills e comandos gerados pelo OpenSpec CLI e a skill `requesting-code-review` ficam fora do lint.

---

## Migração dos stores removidos

`openspec-store-dotnet/` e `openspec-store-nextjs/` foram removidos: duplicavam o
`padrao-openspec` e divergiam dele. Quem os usava passa a clonar este repositório e
rodar o setup com `--stack dotnet` ou `--stack nextjs`. Projetos já configurados
recebem os comandos e as skills atualizados com:

```powershell
node C:\openspec\<projeto>-openspec\padrao-openspec\scripts\install-skills.mjs C:\openspec\<projeto> --force
```
