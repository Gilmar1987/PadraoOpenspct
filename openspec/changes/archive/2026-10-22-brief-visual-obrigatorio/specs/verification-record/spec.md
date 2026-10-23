# Spec Delta

## ADDED Requirements

### Requirement: Telas sem brief no verify

Quando a change não tiver `design.md`, ou o `design.md` não tiver "Brief visual", e as tarefas, o design ou as delta specs citarem tela, página, formulário, layout, componente visual, front-end ou interface de usuário, ou a change tiver `interface/jornadas.json`, o verify SHALL registrar um warning que cita o que o disparou e perguntar ao responsável se a change tem telas. Com a confirmação, SHALL registrar um crítico e indicar o update; sem resposta, MUST NOT seguir para o archive.

#### Scenario: Formulário sem brief

- **WHEN** as tarefas citam "criar o formulário de cadastro" e o `design.md` não tem "Brief visual"
- **THEN** o verify registra o warning "Screens without visual brief" e pergunta ao responsável se a change tem telas

#### Scenario: Responsável confirma a tela

- **WHEN** o responsável responde que a change tem telas
- **THEN** o verify registra um crítico e indica o `/opsx:update` para acrescentar o brief e a validação
