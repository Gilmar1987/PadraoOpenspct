# Proposal

## Why

O repositório mantém skills, comandos e agentes em quatro cópias divergentes. A cópia que o instalador distribui (`padrao-openspec/`) é a mais pobre: skills de 20 a 30 linhas, sem `/opsx:init`, sem `/opsx:ingest` e sem a checagem de ADR do `/opsx:propose`. O `config.yaml` do store manda o agente rodar `/opsx:init`, mas esse comando nunca chega ao projeto consumidor. A CI que validaria tudo isso está em `padrao-openspec/.github/workflows/` e não roda neste repositório. Um teste de clone feito em `C:\teste-openspec` confirmou na prática que o fluxo não roda de forma autônoma: as skills ficam em `.agents/skills` (que o Claude Code não lê) e o repositório de código não consegue resolver o store.

## What Changes

- `padrao-openspec/` passa a ser a **fonte única** de skills, comandos `/opsx:*`, agentes e modelos de ADR. Recebe as versões completas das skills `openspec-*`, os nove comandos (`apply`, `archive`, `explore`, `ingest`, `init`, `propose` com checagem de ADR, `sync`, `update`, `verify`) e as skills `docker` e `requesting-code-review`.
- O instalador passa a instalar os comandos em `.claude/commands/opsx/` do projeto consumidor.
- **BREAKING** — o instalador e o setup passam a usar `--target both` por padrão, gravando as skills em `.agents/skills` e em `.claude/skills`. Quem dependia de gravar só em `.agents/skills` passa a usar `--target agents` explicitamente.
- Novo script de sincronização que espelha a fonte única em `.claude/skills`, `.claude/commands/opsx`, `.github/agents` e `openspec/adrs` da raiz. Tem um modo de checagem que falha quando há divergência.
- A raiz ganha `openspec/adrs/` (README e template), espelhada pelo sync, porque `rules.md`, `/opsx:init` e `/opsx:propose` dependem dela.
- A CI vai para `.github/workflows/validate.yml` na raiz. Executa os passos atuais dentro de `padrao-openspec/` e acrescenta a checagem do sync, a validação OpenSpec da raiz e o lint do Markdown da raiz.
- **BREAKING** — remoção de `openspec-store-dotnet/` e `openspec-store-nextjs/`. Os casos são cobertos por `padrao-openspec` com `--stack dotnet`/`--stack nextjs`.
- Quando registra o store, o setup grava no repositório de código a declaração `store: <id>` em `openspec/config.yaml`. Em seguida, confirma de dentro desse repositório que o CLI resolve o store e falha com instrução clara se não resolver.
- `/opsx:init` e `/opsx:ingest` passam a resolver a raiz OpenSpec pelo CLI (store-aware), como os demais comandos.
- `rules.md`, seção 4: passa a indicar onde os agentes vivem (VS Code/Copilot em `.github/agents`) e inclui o Business Requirements Ingestor.
- READMEs (raiz, `padrao-openspec`, `presets`) e `test-setup.ps1`: removidas as referências ao AgendaFácil e aos stores removidos, com o fluxo de clone e setup alinhado à nova estrutura.
- A pasta vazia e não versionada `openspec/schemas/` é removida.

### Fora do escopo

- **Estrutura aninhada de stores.** A raiz `openspec/` e o store interno `padrao-openspec/openspec/` convivem no mesmo repositório, e o setup aplica o preset no próprio template. Isso exige decidir um layout de store único por projeto e fica para uma change própria (itens 2 e 3 do relatório de teste).
- **Divergência entre `project.md` "A definir" e decisões de design/ADR** (item 4 do relatório): change própria sobre `/opsx:init`/`/opsx:verify`.
- **Stubs de regras no repositório de código** (`CLAUDE.md`, `AGENTS.md`, `copilot-instructions.md`; item 6 do relatório): exige definir onde `rules.md` vive no consumidor, o que depende do layout de store único.
- **Detecção de tarefas `[x]` sem evidência** (item 7 do relatório): mudança de comportamento do `/opsx:verify` e dos agentes QA, em change própria.
- **Redução do `init.md`** com extração para arquivos de referência: os arquivos de referência precisam de um local legível tanto pelo store quanto pelo consumidor, o que também depende do layout de store único.
- Conversão dos agentes VS Code para o formato de subagentes do Claude Code (`.claude/agents`).
- Correção de lint nas skills e comandos gerados pelo OpenSpec CLI: eles são tratados como conteúdo de terceiros e excluídos do lint.

## Capabilities

### New Capabilities

- `skill-installation`: o que o instalador distribui ao projeto consumidor (skills, comandos, agentes), os destinos e os padrões.
- `source-sync`: espelhamento da fonte única `padrao-openspec/` na raiz do repositório e detecção de divergência.
- `store-setup`: setup de um projeto, com a declaração do store no repositório de código e a verificação de que o CLI o resolve.
- `continuous-validation`: validações automáticas executadas em pull requests e na `main` deste repositório.

### Modified Capabilities

Nenhuma; `openspec/specs/` ainda não tem capabilities.

## Impact

- **Scripts:** `padrao-openspec/scripts/install-skills.mjs`, `setup-project.mjs`, `test-setup.ps1` e o novo `padrao-openspec/scripts/sync-root.mjs`.
- **CI:** `padrao-openspec/.github/workflows/validate.yml` é movido para `.github/workflows/validate.yml`; novo `.markdownlint-cli2.jsonc` na raiz; o `.markdownlint-cli2.jsonc` de `padrao-openspec` é ajustado.
- **Conteúdo:**
  - `padrao-openspec/.claude/skills/*` e o novo `padrao-openspec/.claude/commands/opsx/*`;
  - `.claude/skills/*`, `.claude/commands/opsx/*`, `.github/agents/*` e `openspec/adrs/*` da raiz, que passam a ser gerados;
  - `openspec/rules.md`;
  - `README.md`, `padrao-openspec/README.md`, `padrao-openspec/presets/README.md`.
- **Removidos:** `openspec-store-dotnet/`, `openspec-store-nextjs/` e `openspec/schemas/` (vazia).
- **Riscos:**
  - Dados pessoais e autenticação: não se aplicam.
  - Não há esquema de dados nem segredos novos.
  - **Compatibilidade:**
    - quem clona os stores removidos perde o caminho;
    - o novo padrão `--target both` grava também em `.claude/skills`, que pode conflitar com customizações existentes. O instalador mantém a checagem de conflito, que não copia nada sem `--force`.
    - projetos já instalados recebem os comandos novos só quando reinstalarem.
