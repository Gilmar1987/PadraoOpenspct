# Spec Delta

## MODIFIED Requirements

### Requirement: Instalação dos comandos OPSX

O instalador SHALL copiar todos os arquivos de comando de `padrao-openspec/.claude/commands/opsx/` para `.claude/commands/opsx/` do projeto consumidor, independentemente do valor de `--target`, incluindo `init.md` e `ingest.md`.

#### Scenario: Instalação em projeto vazio

- **WHEN** o instalador roda em um repositório Git vazio sem opções
- **THEN** `.claude/commands/opsx/` do consumidor contém `apply.md`, `archive.md`, `discover.md`, `explore.md`, `ingest.md`, `init.md`, `propose.md`, `sync.md`, `update.md` e `verify.md`, idênticos à fonte

#### Scenario: Comando customizado no consumidor

- **WHEN** `.claude/commands/opsx/propose.md` do consumidor difere da fonte e o instalador roda sem `--force`
- **THEN** o instalador termina com erro listando o caminho em conflito e nada é copiado
