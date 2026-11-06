## ADDED Requirements

### Requirement: Ganchos executáveis por qualquer agente

Cada entrada de gancho do padrão no `.claude/settings.json` SHALL ser um comando único em texto, sem o campo `args`: `node` seguido do caminho do script entre aspas, a partir de `${CLAUDE_PROJECT_DIR}`. Um agente que execute o `command` das entradas desse arquivo SHALL rodar o gancho do padrão com o payload que recebe na entrada.

#### Scenario: Gancho no Claude Code

- **WHEN** o Claude Code, aberto na pasta do código, roda `git commit --allow-empty --no-verify -m teste`
- **THEN** o gancho do padrão nega o comando, citando o hook commit-msg

#### Scenario: Comando de leitura no Copilot CLI

- **WHEN** o Copilot CLI, aberto na pasta do código com o `.claude/settings.json` do padrão, roda `openspec context --json`
- **THEN** o comando roda, sem a negação "hook errored"

#### Scenario: Negação no Copilot CLI

- **WHEN** o Copilot CLI, aberto na pasta do código, roda `git commit --allow-empty --no-verify -m teste`
- **THEN** o gancho do padrão nega o comando, citando o hook commit-msg

#### Scenario: Gancho rodado pelo comando do template

- **WHEN** a CI roda cada entrada do template exatamente pelo `command`, sem `args`, com um payload simulado
- **THEN** cada gancho dá a mesma resposta que dá quando chamado com o caminho do script

### Requirement: Falha interna do gancho não bloqueia o agente

Um gancho do padrão que encontra um erro interno não tratado SHALL terminar com código 0 e escrever um aviso na saída de erro com o nome do gancho. Negar ou pedir confirmação MUST acontecer só pela resposta JSON do gancho, nunca por um código de saída diferente de 0.

#### Scenario: Exceção dentro do gancho

- **WHEN** um gancho do padrão lança uma exceção não tratada ao processar a chamada
- **THEN** ele sai com código 0, a saída de erro cita o gancho, e a chamada segue sem checagem

#### Scenario: Negação continua negando

- **WHEN** o gancho de ganchos do Git recebe `git commit --no-verify -m x`
- **THEN** ele responde a negação em JSON e sai com código 0

### Requirement: Suporte dos ganchos declarado por agente

O guia do padrão e o `COMECE-AQUI.md` SHALL dizer, para cada agente da tabela "Usar com outros agentes", se os ganchos do padrão foram verificados nele. Um agente só SHALL constar como verificado depois de um roteiro real registrado no `verification.md` de uma change. Os demais constam como "regras e portão; ganchos não verificados".

#### Scenario: Agente sem roteiro

- **WHEN** o dev consulta a tabela de agentes do guia para o Cursor
- **THEN** a linha diz "regras e portão; ganchos não verificados"

#### Scenario: Agentes verificados

- **WHEN** o dev consulta a tabela de agentes do guia para o Claude Code e para o GitHub Copilot
- **THEN** as duas linhas dizem que os ganchos foram verificados, com a versão do agente usada no roteiro
