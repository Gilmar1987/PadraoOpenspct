## ADDED Requirements

### Requirement: Guarda do clone do store protegida pela CI

A CI SHALL falhar quando um dos 10 comandos `.claude/commands/opsx/*.md` ou uma das 7 skills `openspec-*` perder o parágrafo da guarda do clone do store ou o tiver depois da guarda da pasta da sessão, quando o `rules.md` ou o bloco de agentes perderem a frase do clone com "em qualquer agente", ou quando o repositório do padrão tiver `padrao-openspec/.openspec-store/`.

#### Scenario: Skill sem a guarda do clone

- **WHEN** uma mudança remove o parágrafo da guarda do clone do store de `.claude/skills/openspec-apply-change/SKILL.md`
- **THEN** o passo "Trechos customizados das skills" falha citando o arquivo

#### Scenario: Guarda do clone depois da guarda da sessão

- **WHEN** uma mudança move o parágrafo da guarda do clone do store para depois do `**Session folder guard**` em `.claude/commands/opsx/init.md`
- **THEN** o passo "Trechos customizados das skills" falha citando o arquivo

#### Scenario: Marcador de store no repositório do padrão

- **WHEN** alguém registra o próprio repositório do padrão como store e o `padrao-openspec/.openspec-store/store.yaml` entra num commit
- **THEN** a CI falha citando o arquivo

#### Scenario: Regras sem a frase do clone

- **WHEN** uma mudança remove do `rules.md` a frase sobre o clone do store
- **THEN** o passo "Trechos customizados das skills" falha citando o `rules.md`
