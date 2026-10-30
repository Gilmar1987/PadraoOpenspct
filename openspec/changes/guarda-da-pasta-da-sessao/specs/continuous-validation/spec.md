## ADDED Requirements

### Requirement: Guarda da pasta da sessão protegida pela CI

A CI SHALL falhar quando um dos 10 arquivos de comando `.claude/commands/opsx/*.md` ou uma das skills `openspec-*` do padrão perder o bloco de guarda da pasta da sessão, quando o apply, o verify ou o archive (comando e skill) perderem a conferência do contexto do hook de início, ou quando o `rules.md` ou o bloco de agentes voltarem a autorizar seguir o arquivo de comando à mão sem restringir isso a agentes sem suporte a comandos.

#### Scenario: Comando sem a guarda

- **WHEN** uma mudança remove o bloco de guarda de `.claude/commands/opsx/sync.md`
- **THEN** o passo "Trechos customizados das skills" falha citando o arquivo

#### Scenario: Exceção larga de volta

- **WHEN** o `rules.md` volta a dizer "num agente sem os comandos `/opsx:*`, aceitar como comando o pedido da etapa pelo nome", sem a restrição a agentes sem suporte a comandos
- **THEN** a CI falha citando o trecho antigo
