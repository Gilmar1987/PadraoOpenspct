# Spec Delta

## ADDED Requirements

### Requirement: Camada do Claude Code distribuída

O instalador SHALL copiar `padrao-openspec/.claude/agents/` para `.claude/agents/` e `padrao-openspec/.claude/hooks/openspec-padrao/` para `.claude/hooks/openspec-padrao/` do repositório de código, e listar esses arquivos em `managedFiles`. Se `.claude/agents/` já tiver um arquivo `openspec-*.md` que nenhum manifesto anterior lista, o instalador MUST parar antes de alterar qualquer arquivo.

#### Scenario: Primeira instalação

- **WHEN** o setup instala o padrão num repositório de código novo
- **THEN** o código tem os subagentes `openspec-*` e os scripts de hook, e o manifesto os lista

#### Scenario: Agente do projeto com nome reservado

- **WHEN** o código já tem `.claude/agents/openspec-revisor.md` criado pelo time e o instalador roda
- **THEN** o instalador termina com erro citando o arquivo, e nada muda

### Requirement: Entradas gerenciadas no settings.json

O instalador SHALL manter no `.claude/settings.json` do código só as entradas de hook e de permissão do padrão. Um hook é do padrão quando o comando aponta para `.claude/hooks/openspec-padrao/`, e uma permissão é do padrão quando está listada em `managedSettings` do manifesto. O instalador MUST NOT alterar nem remover outras entradas e MUST parar sem nenhuma mudança quando o arquivo não for JSON válido.

#### Scenario: Settings do projeto preservado

- **WHEN** o `.claude/settings.json` tem `allow: ["Bash(npm test)"]` e um hook próprio, e o instalador roda
- **THEN** o arquivo mantém a permissão e o hook do projeto e ganha as entradas do padrão

#### Scenario: Atualização que retira uma permissão

- **WHEN** uma versão nova do padrão deixa de pedir `ask` para `gh release` e o instalador roda com `--update`
- **THEN** a entrada sai do arquivo e de `managedSettings`, e as entradas do projeto não mudam

#### Scenario: JSON inválido

- **WHEN** o `.claude/settings.json` do projeto tem uma vírgula sobrando
- **THEN** o instalador termina com erro citando o arquivo, e nenhum arquivo muda

### Requirement: Mudança no settings.json só com modo explícito

Quando uma reinstalação mudaria as entradas do padrão no `.claude/settings.json` de uma instalação anterior, o instalador SHALL exigir `--update` ou `--in-place`, como para os outros arquivos gerenciados, e MUST terminar com erro antes de alterar qualquer arquivo quando nenhum dos dois for passado.

#### Scenario: Nova entrada sem modo

- **WHEN** o projeto tem as entradas da versão anterior, a versão nova acrescenta um hook e o instalador roda sem modo
- **THEN** o instalador termina com erro citando `--update` e `--in-place`, e o `settings.json` não muda
