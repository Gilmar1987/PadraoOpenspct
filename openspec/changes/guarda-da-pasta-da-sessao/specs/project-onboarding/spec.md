## MODIFIED Requirements

### Requirement: Mensagem final abre o projeto como workspace

Ao terminar, nos dois modos, o script SHALL dizer para abrir a pasta do código como pasta do workspace, e não a pasta acima dela, e para abrir o Claude Code nessa janela. Quando o comando `code` existir na máquina, SHALL mostrar `code "<pasta do código>"`. SHALL dizer também que, se `/opsx` não aparecer, o Claude Code foi aberto em outra pasta. Quando o comando `code` existir e o script rodar num console interativo, sem `--yes`, ele SHALL perguntar se abre o VS Code na pasta do código agora, com "sim" como padrão; com a resposta sim, SHALL rodar `code "<pasta do código>"` sem esperar a janela fechar. Uma falha ao abrir MUST NOT falhar o script: ele SHALL avisar e manter a mensagem com o comando. Com `--yes`, sem o `code` ou com a resposta não, o script MUST NOT abrir o VS Code.

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
