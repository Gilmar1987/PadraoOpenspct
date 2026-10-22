# Spec Delta

## ADDED Requirements

### Requirement: Mensagem final abre o projeto como workspace

Ao terminar, nos dois modos, o script SHALL dizer para abrir a pasta do código como pasta do workspace, e não a pasta acima dela, e para abrir o Claude Code nessa janela. Quando o comando `code` existir na máquina, SHALL mostrar `code "<pasta do código>"`. SHALL dizer também que, se `/opsx` não aparecer, o Claude Code foi aberto em outra pasta.

#### Scenario: Projeto novo concluído

- **WHEN** o modo projeto novo termina sem erro
- **THEN** a mensagem final manda abrir a pasta do código como pasta do workspace, cita o `/opsx:init` e explica o que fazer se `/opsx` não aparecer

#### Scenario: Projeto em andamento concluído

- **WHEN** o modo projeto em andamento termina sem erro
- **THEN** a mensagem final manda abrir a pasta do código clonada como pasta do workspace e cita o `/opsx:propose`

### Requirement: Perguntas visíveis no console

Cada pergunta do script SHALL continuar visível enquanto o dev digita a resposta, num console interativo real, inclusive quando o terminal redesenha a linha.

#### Scenario: Dev digita a pasta base

- **WHEN** o dev, num PowerShell, chega à pergunta da pasta base e digita um caminho, inclusive apagando caracteres
- **THEN** o texto "Pasta onde os repositórios vão ficar [...]" continua na linha, antes da resposta

### Requirement: Caminhos comparados sem diferenciar a letra do drive

No modo projeto em andamento, a conferência de que o CLI resolve o store a partir do código SHALL tratar como iguais dois caminhos para a mesma pasta que só diferem na caixa da letra do drive.

#### Scenario: Pasta base digitada em minúscula

- **WHEN** o dev, no Windows, informa a pasta base como `c:\Projetos` e o CLI devolve `C:\Projetos\...`
- **THEN** o script reconhece o store e termina sem erro
