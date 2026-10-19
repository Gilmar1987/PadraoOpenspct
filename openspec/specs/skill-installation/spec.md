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
