# Spec Delta

## ADDED Requirements

### Requirement: Changes concorrentes apontadas no propose

Ao criar uma change, o `/opsx:propose` SHALL listar as outras changes ativas cujas delta specs tocam as mesmas capabilities da change nova, registrar cada uma numa linha "Changes concorrentes" do Impact do proposal e mostrá-las ao usuário antes da aprovação, com uma sugestão de ordem. Sem sobreposição, SHALL registrar "Changes concorrentes: nenhuma".

#### Scenario: Duas changes na mesma capability

- **WHEN** existe uma change ativa com delta em `project-initialization` e o usuário propõe outra que também modifica `project-initialization`
- **THEN** o proposal novo cita a change ativa em "Changes concorrentes", e o agente mostra a sobreposição e sugere a ordem antes de pedir a aprovação

#### Scenario: Sem sobreposição

- **WHEN** nenhuma change ativa toca as capabilities da change nova
- **THEN** o Impact registra "Changes concorrentes: nenhuma"

### Requirement: Trabalho em paralelo

As regras globais SHALL orientar que, com mais de uma sessão ou agente no mesmo repositório, cada change fique numa worktree e numa branch próprias, com uma sessão por worktree; que a versão e o número de uma ADR nova sejam combinados antes do apply; e que quem for rodar uma suíte que usa recursos compartilhados da máquina avise antes.

#### Scenario: Segunda sessão no mesmo repositório

- **WHEN** uma segunda sessão vai começar uma change num repositório em que outra sessão já trabalha
- **THEN** as regras orientam criar uma worktree e uma branch para a change e combinar a versão antes do apply
