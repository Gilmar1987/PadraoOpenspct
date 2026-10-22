# Spec Delta

## MODIFIED Requirements

### Requirement: Espelhamento da fonte única

O script de sincronização SHALL tornar os destinos da raiz idênticos às origens em `padrao-openspec/`: `.claude/skills/`, `.claude/commands/opsx/`, `.github/agents/` os arquivos `README.md` e `template.md` de `openspec/adrs/` e o `openspec/rules.md`. Arquivos de destino sem origem correspondente SHALL ser removidos.

#### Scenario: Skill editada na fonte

- **WHEN** `padrao-openspec/.claude/skills/openspec-propose/SKILL.md` é alterado e o sync roda
- **THEN** `.claude/skills/openspec-propose/SKILL.md` da raiz fica byte a byte igual à fonte

#### Scenario: Arquivo órfão na raiz

- **WHEN** existe `.claude/commands/opsx/obsoleto.md` na raiz sem correspondente na fonte e o sync roda
- **THEN** o arquivo é removido da raiz

#### Scenario: Arquivos fora dos destinos gerenciados

- **WHEN** o sync roda
- **THEN** `.claude/CLAUDE.md`, `.github/copilot-instructions.md`, ADRs numeradas em `openspec/adrs/` e demais arquivos fora da lista gerenciada permanecem inalterados

#### Scenario: Regra editada na fonte

- **WHEN** `padrao-openspec/openspec/rules.md` é alterado e o sync roda
- **THEN** `openspec/rules.md` da raiz fica byte a byte igual à fonte
