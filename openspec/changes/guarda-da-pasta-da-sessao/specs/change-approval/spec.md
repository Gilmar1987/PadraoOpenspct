## MODIFIED Requirements

### Requirement: Etapa pedida pelo nome fora do Claude Code

Num agente sem suporte a comandos (Copilot, Codex, Cursor, Gemini e afins), o equivalente ao comando SHALL ser o dev pedir a etapa pelo nome, e o agente SHALL seguir o arquivo `.claude/commands/opsx/<etapa>.md`. A ativação de uma skill ou de um fluxo pelo próprio agente MUST NOT valer como o comando. No Claude Code, essa exceção MUST NOT valer: um `/opsx:*` que chega como texto, sem ser expandido, quer dizer que a sessão foi aberta fora da pasta do código. Nesse caso, o agente MUST parar, MUST NOT seguir o arquivo de comando à mão e SHALL pedir para abrir a pasta que contém `.claude/commands/opsx/` numa janela nova, mostrando o caminho.

#### Scenario: Agente sem comandos

- **WHEN** o dev escreve a aprovação do verify e "rode o verify" num agente sem `/opsx:*`
- **THEN** o agente segue o `verify.md` e, ao fim, mostra a aprovação e o pedido da próxima etapa

#### Scenario: Skill ativada pelo modelo

- **WHEN** o dev escreve só a aprovação do apply e o modelo ativa a skill do apply por conta própria
- **THEN** o agente não começa o apply e mostra o comando a digitar

#### Scenario: Claude Code aberto na pasta acima do código

- **WHEN** o Claude Code foi aberto em `C:\projetos\clinica`, o dev digita `/opsx:init` e o comando chega como texto, porque `.claude/commands/opsx/` só existe em `C:\projetos\clinica\clinica-app`
- **THEN** o agente não segue o `init.md` à mão, diz que a sessão está fora da pasta do código e pede para abrir `C:\projetos\clinica\clinica-app` numa janela nova

#### Scenario: Pedido da etapa pelo nome no Claude Code

- **WHEN** o dev, no Claude Code aberto fora da pasta do código, escreve "siga o `.claude/commands/opsx/propose.md` da pasta clinica-app"
- **THEN** o agente responde que, no Claude Code, a etapa só roda pela pasta do código, e mostra como abri-la
