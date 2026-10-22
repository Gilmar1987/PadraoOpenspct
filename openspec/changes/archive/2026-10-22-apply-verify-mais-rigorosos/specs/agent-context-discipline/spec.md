# Spec Delta

## ADDED Requirements

### Requirement: Contagens vindas do CLI ou de lista

Toda contagem que o agente anunciar ao usuário (tarefas, achados, arquivos, itens) SHALL vir do OpenSpec CLI (por exemplo, `progress.total`) ou de uma lista montada na mesma resposta, e MUST NOT ser estimada de memória.

#### Scenario: Total de tarefas

- **WHEN** o agente informa quantas tarefas a change tem
- **THEN** o número é o `progress.total` das instruções de apply, e não uma estimativa
