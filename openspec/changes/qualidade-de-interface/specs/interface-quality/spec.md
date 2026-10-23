# Spec Delta

## Purpose

Garante que as telas entregues pelos projetos tenham direção visual definida no design e sejam validadas num navegador real, simulando um usuário, com uma nota mínima para que possam ser apresentadas a um cliente.

## ADDED Requirements

### Requirement: Brief visual no design

Numa change que cria ou muda telas, o `design.md` SHALL ter uma seção "Brief visual" com público e tom, paleta com contraste, tipografia, hierarquia e layout por largura, componentes, os estados de cada tela (carregando, vazio, erro e sucesso) e os textos reais.

#### Scenario: Change com tela nova

- **WHEN** o propose cria uma change que acrescenta uma tela
- **THEN** o `design.md` tem a seção "Brief visual" preenchida, e as tarefas citam os estados de cada tela

### Requirement: Validação de interface no navegador

O script de validação de interface SHALL abrir a URL informada num navegador real, sem instalar nada no projeto, e registrar no relatório: capturas de tela em 390, 768 e 1280 px; as violações de acessibilidade WCAG 2.2 AA encontradas pelo axe-core; os erros de console; os links internos quebrados; a presença de título, favicon e página 404; e o resultado de cada jornada do arquivo de jornadas, executada com cliques e digitação.

#### Scenario: Página com problemas plantados

- **WHEN** o script valida uma página com uma imagem sem texto alternativo, um erro de console e um link interno quebrado
- **THEN** o relatório lista os três problemas, e a nota automática fica abaixo de "médio"

#### Scenario: Jornada de cadastro

- **WHEN** o arquivo de jornadas descreve visitar o formulário, preencher os campos e conferir a mensagem de sucesso
- **THEN** o script executa os passos no navegador e registra cada um como aprovado ou reprovado, com a captura de tela do passo que falhou

### Requirement: Nota do validador de interface

O subagente validador de interface SHALL ler o relatório e as capturas de tela, avaliar a hierarquia visual, a consistência e a aderência ao brief, e atribuir uma nota final entre fraco, médio, bom e ótimo, nunca acima da nota automática mais um nível, com a lista de correções. O subagente MUST NOT editar arquivos de código.

#### Scenario: Página funcional sem acabamento

- **WHEN** a página passa nas jornadas, mas não segue o brief e tem espaçamento inconsistente
- **THEN** a nota final é no máximo "médio", com as correções listadas

### Requirement: Comandos de interface no init

Quando o projeto tem front-end, o `/opsx:init` SHALL registrar a validação de interface nos Comandos de verificação do `project.md` e orientar, no `config.yaml`, o uso da skill de qualidade de interface nas changes com telas.

#### Scenario: Projeto com front-end

- **WHEN** o responsável informa um front-end na pergunta 3.2
- **THEN** o `project.md` gerado tem a linha "Validação de interface" nos Comandos de verificação
