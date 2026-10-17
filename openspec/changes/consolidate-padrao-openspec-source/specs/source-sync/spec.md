# Spec Delta

## Purpose

Mantém a raiz do repositório como espelho gerado da fonte única `padrao-openspec/`, para que skills, comandos, agentes e modelos de ADR existam em uma só versão editável.

## ADDED Requirements

### Requirement: Espelhamento da fonte única

O script de sincronização SHALL tornar os destinos da raiz idênticos às origens em `padrao-openspec/`: `.claude/skills/`, `.claude/commands/opsx/`, `.github/agents/` e os arquivos `README.md` e `template.md` de `openspec/adrs/`. Arquivos de destino sem origem correspondente SHALL ser removidos.

#### Scenario: Skill editada na fonte

- **WHEN** `padrao-openspec/.claude/skills/openspec-propose/SKILL.md` é alterado e o sync roda
- **THEN** `.claude/skills/openspec-propose/SKILL.md` da raiz fica byte a byte igual à fonte

#### Scenario: Arquivo órfão na raiz

- **WHEN** existe `.claude/commands/opsx/obsoleto.md` na raiz sem correspondente na fonte e o sync roda
- **THEN** o arquivo é removido da raiz

#### Scenario: Arquivos fora dos destinos gerenciados

- **WHEN** o sync roda
- **THEN** `.claude/CLAUDE.md`, `.github/copilot-instructions.md`, ADRs numeradas em `openspec/adrs/` e demais arquivos fora da lista gerenciada permanecem inalterados

### Requirement: Detecção de divergência

Em modo de checagem, o script SHALL apenas comparar origem e destino, sem alterar arquivos, e SHALL terminar com código diferente de zero listando cada caminho divergente, ausente ou órfão.

#### Scenario: Raiz em dia

- **WHEN** a checagem roda logo após um sync
- **THEN** o script termina com código zero

#### Scenario: Edição direta na raiz

- **WHEN** `.claude/skills/docker/SKILL.md` da raiz é editado sem alterar a fonte e a checagem roda
- **THEN** o script termina com código diferente de zero, cita esse caminho e não altera nenhum arquivo
