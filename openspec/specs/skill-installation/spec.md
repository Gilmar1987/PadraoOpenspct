# skill-installation Specification

## Purpose

Define o que o instalador do store distribui a um projeto consumidor (skills, comandos `/opsx:*` e agentes), em quais destinos e com quais padrões.

## Requirements

### Requirement: Instalação dos comandos OPSX

O instalador SHALL copiar todos os arquivos de comando de `padrao-openspec/.claude/commands/opsx/` para `.claude/commands/opsx/` do projeto consumidor, independentemente do valor de `--target`, incluindo `init.md` e `ingest.md`.

#### Scenario: Instalação em projeto vazio

- **WHEN** o instalador roda em um repositório Git vazio sem opções
- **THEN** `.claude/commands/opsx/` do consumidor contém `apply.md`, `archive.md`, `explore.md`, `ingest.md`, `init.md`, `propose.md`, `sync.md`, `update.md` e `verify.md`, idênticos à fonte

#### Scenario: Comando customizado no consumidor

- **WHEN** `.claude/commands/opsx/propose.md` do consumidor difere da fonte e o instalador roda sem `--force`
- **THEN** o instalador termina com erro listando o caminho em conflito e nada é copiado

### Requirement: Destino padrão das skills

Sem `--target`, o instalador e o setup SHALL instalar as skills em `.agents/skills/` e em `.claude/skills/`. Com `--target agents` ou `--target claude`, SHALL instalar apenas no destino indicado.

#### Scenario: Padrão grava nos dois destinos

- **WHEN** o instalador roda sem `--target`
- **THEN** cada skill neutra existe em `.agents/skills/<skill>/SKILL.md` e em `.claude/skills/<skill>/SKILL.md`

#### Scenario: Destino explícito

- **WHEN** o instalador roda com `--target agents`
- **THEN** as skills existem em `.agents/skills/` e `.claude/skills/` não é criado pelo instalador

### Requirement: Conjunto de skills distribuído

O instalador SHALL distribuir, além das skills de stack pedidas com `--stack`, todas as skills neutras da fonte única, incluindo as versões completas das sete skills `openspec-*`, `docker`, `requesting-code-review` e `versioning-ci-cd`.

#### Scenario: Skills neutras presentes

- **WHEN** o instalador roda sem `--stack`
- **THEN** o consumidor recebe `docker`, `requesting-code-review` e `versioning-ci-cd`, e não recebe `dotnet-implementation` nem `nextjs-implementation`

#### Scenario: Skill de propose com checagem de ADR

- **WHEN** o instalador conclui a instalação
- **THEN** o `SKILL.md` de `openspec-propose` instalado é idêntico ao da fonte única, e o comando `propose.md` instalado contém a seção de checagem de decisão arquitetural

### Requirement: Recomendação de skills oficiais por stack

Ao concluir uma instalação com `--stack`, o instalador SHALL listar as skills oficiais externas recomendadas para cada stack pedida, com o comando de instalação, sem instalá-las. Para `nextjs`, a lista SHALL incluir as skills da Vercel e a skill `frontend-design`. Sem `--stack`, nenhuma recomendação SHALL ser exibida.

#### Scenario: Stack Next.js

- **WHEN** o instalador roda com `--stack nextjs`
- **THEN** a saída recomenda `npx skills add vercel-labs/agent-skills` e `npx skills add https://github.com/anthropics/skills --skill frontend-design`, e nenhuma pasta `frontend-design` é criada no consumidor

#### Scenario: Stack .NET

- **WHEN** o instalador roda com `--stack dotnet`
- **THEN** a saída recomenda as skills oficiais .NET e não menciona `frontend-design`

#### Scenario: Sem stack

- **WHEN** o instalador roda sem `--stack`
- **THEN** a saída não recomenda nenhuma skill oficial externa

### Requirement: Declaração do store versionada

O instalador SHALL manter no fim do `.gitignore` do projeto consumidor um bloco gerenciado que ignora o conteúdo de `openspec/`, exceto `openspec/config.yaml`. Um bloco gerenciado antigo, que ignorava `/openspec/` inteiro, MUST ser substituído pelo novo sem deixar duplicata.

#### Scenario: Instalação em repositório novo

- **WHEN** o instalador roda num repositório git sem `.gitignore`
- **THEN** `openspec/changes/demo/proposal.md` é ignorado pelo git e `openspec/config.yaml` não é ignorado

#### Scenario: Migração do bloco antigo

- **WHEN** o `.gitignore` do consumidor termina com o bloco antigo, que ignora `/openspec/`, e o instalador roda de novo
- **THEN** o `.gitignore` passa a ter só o bloco novo, a linha `/openspec/` deixa de existir e `openspec/config.yaml` não é mais ignorado

#### Scenario: Execução repetida

- **WHEN** o instalador roda duas vezes seguidas no mesmo repositório
- **THEN** o `.gitignore` contém uma única vez a linha `/openspec/*` e uma única vez a linha `!/openspec/config.yaml`
