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

O instalador SHALL distribuir todas as skills da fonte única, que são todas neutras quanto à stack, incluindo as versões completas das sete skills `openspec-*`, `docker`, `requesting-code-review` e `versioning-ci-cd`. A fonte única MUST NOT conter skills específicas de uma stack.

#### Scenario: Skills neutras presentes

- **WHEN** o instalador roda
- **THEN** o consumidor recebe `docker`, `requesting-code-review` e `versioning-ci-cd`, e não recebe `dotnet-implementation` nem `nextjs-implementation`

#### Scenario: Skill de propose com checagem de ADR

- **WHEN** o instalador conclui a instalação
- **THEN** o `SKILL.md` de `openspec-propose` instalado é idêntico ao da fonte única, e o comando `propose.md` instalado contém a seção de checagem de decisão arquitetural

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

### Requirement: Opção de stack rejeitada

O instalador SHALL recusar a opção `--stack` com uma mensagem que explique que o padrão não tem skills de stack e que os comandos de verificação do projeto ficam no `project.md`. Ao recusar, o instalador MUST NOT alterar nenhum arquivo do consumidor.

#### Scenario: Automação antiga com --stack

- **WHEN** o instalador roda com `--stack dotnet`
- **THEN** ele termina com código diferente de zero, a mensagem cita a remoção de `--stack`, e o consumidor continua sem `.agents/` e sem `.claude/`

### Requirement: Manifesto da versão instalada

Ao instalar, o instalador SHALL gravar `.openspec-padrao.json` na raiz do repositório de código, com a versão do padrão, o commit e o repositório de origem quando disponíveis, o destino das skills, a data e a lista de arquivos que ele gerencia.

#### Scenario: Primeira instalação

- **WHEN** o instalador roda num repositório git vazio a partir do padrão `1.0.0`
- **THEN** o repositório passa a ter `.openspec-padrao.json` com a versão `1.0.0`, o destino `both` e a lista dos arquivos instalados

### Requirement: Reinstalação só com modo explícito

Quando uma reinstalação mudaria arquivos já gerenciados no repositório de código, o instalador SHALL exigir `--update` ou `--in-place` e, sem nenhum dos dois, MUST terminar com erro antes de alterar qualquer arquivo. Uma primeira instalação e uma reinstalação sem nenhuma mudança MUST continuar funcionando sem flag.

#### Scenario: Reinstalação com mudanças, sem modo

- **WHEN** o projeto tem skills de uma versão anterior e o instalador roda sem `--update` nem `--in-place`
- **THEN** o instalador termina com erro citando os dois modos, e nenhum arquivo muda

#### Scenario: Reinstalação sem mudanças

- **WHEN** o instalador roda duas vezes seguidas da mesma versão
- **THEN** a segunda execução termina com sucesso e informa que nada mudou

### Requirement: Modo de atualização em branch própria

Com `--update`, o instalador SHALL exigir que o repositório de código não tenha alterações não commitadas, criar a branch `chore/padrao-vX.Y.Z` a partir da branch atual, instalar, atualizar o manifesto e commitar só os arquivos gerenciados, com a mensagem `chore: atualiza padrão OpenSpec para vX.Y.Z`. Com alterações não commitadas, MUST terminar com erro sem alterar nada.

#### Scenario: Atualização num repositório limpo

- **WHEN** o instalador roda com `--update` num repositório limpo na branch `main`
- **THEN** existe a branch `chore/padrao-vX.Y.Z` com um commit da atualização, e a `main` não muda

#### Scenario: Repositório com alterações pendentes

- **WHEN** o instalador roda com `--update` e há um arquivo alterado sem commit
- **THEN** o instalador termina com erro, cita as alterações pendentes, e nenhum arquivo nem branch muda

### Requirement: Workflow e documentação de atualização distribuídos

O instalador SHALL entregar ao repositório de código o workflow de atualização do padrão em `.github/workflows/` e o guia `docs/openspec-padrao.md`, com a versão instalada, como atualizar, o que o workflow faz e a permissão de Actions que ele exige. Os dois arquivos MUST entrar na lista de arquivos gerenciados do manifesto.

#### Scenario: Projeto novo pelo setup

- **WHEN** o setup roda para um projeto novo
- **THEN** o repositório de código já tem o workflow de atualização, o guia e o manifesto, sem passo manual
