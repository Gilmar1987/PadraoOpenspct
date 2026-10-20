# Spec Delta

## ADDED Requirements

### Requirement: Tarefas que dependem de remoto

O `tasks.md` de uma change SHALL incluir tarefas que dependem de push, pull request ou CI remoto somente quando o `project.md` registra um remoto para o repositório de código. Sem remoto registrado, a tarefa MUST usar a verificação local equivalente e dizer qual é.

#### Scenario: Projeto sem remoto

- **WHEN** o `project.md` registra "sem remoto" e a change cria um workflow de CI
- **THEN** a tarefa verifica o workflow localmente (por exemplo, validando o YAML e rodando os mesmos comandos) e não exige "CI verde no PR"

#### Scenario: Projeto com remoto

- **WHEN** o `project.md` registra o GitHub como remoto
- **THEN** a change pode ter uma tarefa que exige o CI verde no PR
