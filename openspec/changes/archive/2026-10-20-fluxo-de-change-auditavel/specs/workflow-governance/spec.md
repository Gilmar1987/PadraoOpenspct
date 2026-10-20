# Spec Delta

## ADDED Requirements

### Requirement: Pedido explícito de push

O agente SHALL fazer push, abrir pull request ou fazer deploy somente com pedido explícito do usuário na conversa ou quando uma condição registrada na `## Aprovação` os incluir. Fornecer a URL de um repositório, criar um repositório ou pedir para configurar o remoto MUST NOT ser tratado como pedido de push: o agente configura o remoto e pergunta antes de publicar.

#### Scenario: Usuário passa a URL do repositório

- **WHEN** o usuário informa a URL do repositório remoto recém-criado
- **THEN** o agente configura o remoto e pergunta se deve fazer push, sem publicar nada

#### Scenario: Usuário pede o PR

- **WHEN** o usuário escreve "faça push e abra o PR"
- **THEN** o agente faz o push e abre o PR

### Requirement: Evidência registrada na tarefa

Ao marcar uma tarefa como concluída, o apply SHALL registrar logo abaixo dela uma linha `Evidência:` com o comando executado e o resultado relevante. Quando o critério escrito não pôde ser seguido como estava, a linha MUST dizer o que foi feito no lugar e por quê.

#### Scenario: Critério seguido

- **WHEN** o agente conclui uma tarefa verificada por `pytest -q`
- **THEN** a tarefa marcada tem abaixo a linha `Evidência:` com `pytest -q` e o resultado

#### Scenario: Critério adaptado

- **WHEN** a tarefa pede "web respondendo em localhost:8000" e a porta 8000 está ocupada por outro processo
- **THEN** a linha `Evidência:` registra a porta usada, o motivo da troca e o resultado da checagem
