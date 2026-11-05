## MODIFIED Requirements

### Requirement: Mensagem final abre o projeto como workspace

Ao terminar, nos dois modos, o script SHALL mandar abrir a pasta do código (não a de cima) como workspace e o Claude Code nessa janela, mostrar `code "<pasta do código>"` se houver o `code` e avisar que, sem `/opsx`, o Claude Code está em outra pasta. Com o `code`, num console interativo e sem `--yes`, SHALL perguntar se abre o VS Code (padrão sim) e, com sim, rodar esse comando sem esperar; uma falha MUST NOT falhar o script, que SHALL avisar. Nos outros casos, MUST NOT abrir o VS Code.

#### Scenario: Projeto novo concluído

- **WHEN** o modo projeto novo termina sem erro
- **THEN** a mensagem final manda abrir a pasta do código como pasta do workspace, cita o `/opsx:init` e explica o que fazer se `/opsx` não aparecer

#### Scenario: Projeto em andamento concluído

- **WHEN** o modo projeto em andamento termina sem erro
- **THEN** a mensagem final manda abrir a pasta do código clonada como pasta do workspace e cita o `/opsx:propose`

#### Scenario: Dev aceita abrir o VS Code

- **WHEN** o script termina num PowerShell com o `code` instalado, pergunta "Abrir o VS Code na pasta do código agora? [S/n]" e o dev tecla Enter
- **THEN** o VS Code abre com a pasta do código como workspace, e a mensagem final continua com o comando e o aviso sobre `/opsx`

#### Scenario: Execução sem interação

- **WHEN** o script roda com `--yes`
- **THEN** ele não faz a pergunta nem abre o VS Code, e a mensagem final é a de hoje

#### Scenario: VS Code não abre

- **WHEN** o dev responde sim e o `code` sai com erro
- **THEN** o script avisa que não conseguiu abrir, termina com sucesso e mostra o comando para abrir à mão
