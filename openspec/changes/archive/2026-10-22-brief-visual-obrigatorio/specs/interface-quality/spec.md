# Spec Delta

## MODIFIED Requirements

### Requirement: Brief visual no design

Numa change que cria ou muda telas, o propose SHALL escrever o `design.md`, mesmo onde o schema o trata como opcional, e o `design.md` SHALL ter uma seção "Brief visual" com público e tom, paleta com contraste, tipografia, hierarquia e layout por largura, componentes, os estados de cada tela (carregando, vazio, erro e sucesso) e os textos reais.

#### Scenario: Change com tela nova

- **WHEN** o propose cria uma change que acrescenta uma tela
- **THEN** o `design.md` tem a seção "Brief visual" preenchida, e as tarefas citam os estados de cada tela e a validação no navegador

#### Scenario: Change pequena com tela

- **WHEN** o propose cria uma change de uma tarefa que muda um formulário
- **THEN** o propose escreve o `design.md` com o "Brief visual" em vez de pulá-lo
