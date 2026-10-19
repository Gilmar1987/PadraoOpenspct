# Spec Delta

## ADDED Requirements

### Requirement: Confirmação de progresso por grupo de tarefas

Durante o apply, o agente SHALL marcar cada tarefa concluída no checkbox indicado pelo CLI e SHALL confirmar o progresso com o CLI ao terminar cada grupo de tarefas e ao final da change. O agente MUST NOT ser obrigado a consultar o CLI depois de cada tarefa individual.

#### Scenario: Grupo com três tarefas

- **WHEN** o agente conclui as três tarefas de um grupo do `tasks.md`
- **THEN** ele marca os três checkboxes e consulta o CLI uma vez, ao fim do grupo, para confirmar o progresso

#### Scenario: Final da change

- **WHEN** o agente conclui a última tarefa da change
- **THEN** ele consulta o CLI e confirma que o estado é `all_done` antes de reportar a conclusão
