## ADDED Requirements

### Requirement: Guarda do clone do store protegida pela CI

A CI SHALL falhar quando um dos 10 arquivos de comando `.claude/commands/opsx/*.md` ou uma das 7 skills `openspec-*` do padrão perder o parágrafo da guarda do clone do store, ou quando o `rules.md` ou o bloco de agentes perderem a frase que manda parar no clone do store.

#### Scenario: Skill sem a guarda do clone

- **WHEN** uma mudança remove o parágrafo da guarda do clone do store de `.claude/skills/openspec-apply-change/SKILL.md`
- **THEN** o passo "Trechos customizados das skills" falha citando o arquivo

#### Scenario: Regras sem a frase do clone

- **WHEN** uma mudança remove do `rules.md` a frase sobre o clone do store
- **THEN** o passo "Trechos customizados das skills" falha citando o `rules.md`
