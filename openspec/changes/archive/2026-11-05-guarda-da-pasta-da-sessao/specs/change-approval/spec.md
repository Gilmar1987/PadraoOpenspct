## MODIFIED Requirements

### Requirement: Etapa pedida pelo nome fora do Claude Code

Num agente que não é o Claude Code (Copilot, Codex, Cursor, Gemini e afins), o equivalente ao comando SHALL ser o dev pedir a etapa pelo nome, e o agente SHALL seguir o arquivo `.claude/commands/opsx/<etapa>.md`. A ativação de uma skill ou de um fluxo pelo próprio agente MUST NOT valer como o comando.

#### Scenario: Agente sem comandos

- **WHEN** o dev escreve a aprovação do verify e "rode o verify" no Copilot
- **THEN** o agente segue o `verify.md` e, ao fim, mostra a aprovação e o pedido da próxima etapa

#### Scenario: Skill ativada pelo modelo

- **WHEN** o dev escreve só a aprovação do apply e o modelo ativa a skill do apply por conta própria
- **THEN** o agente não começa o apply e mostra o comando a digitar

## ADDED Requirements

### Requirement: Comando só no início da mensagem no Claude Code

No Claude Code, a exceção do pedido da etapa pelo nome MUST NOT valer: o pedido da etapa pelo nome e um `/opsx:*` que chega como texto, fora do início da mensagem, não são o comando, e o agente MUST NOT começar a etapa; ele SHALL pedir para reenviar só o comando no início de uma mensagem nova, mostrando o `/opsx:<etapa>`.

#### Scenario: Comando na linha de baixo da aprovação

- **WHEN** o dev, no Claude Code aberto na pasta do código, escreve "Eu aprovo fazer o apply" e, na linha de baixo da mesma mensagem, `/opsx:apply`
- **THEN** o agente não começa o apply nem diz que a sessão está na pasta errada, e pede para enviar só `/opsx:apply` no início de uma mensagem nova

#### Scenario: Pedido da etapa pelo nome no Claude Code

- **WHEN** o dev, no Claude Code, escreve "siga o `.claude/commands/opsx/propose.md`" em vez de digitar o comando
- **THEN** o agente responde que, no Claude Code, a etapa começa pelo comando digitado e mostra `/opsx:propose`
