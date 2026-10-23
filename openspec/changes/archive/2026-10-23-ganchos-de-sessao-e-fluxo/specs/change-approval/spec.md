# Spec Delta

## ADDED Requirements

### Requirement: Estado das changes no portão

O comando `estado` do portão SHALL listar as changes ativas com o progresso das tarefas, a situação da aprovação (pendente, apply ou archive), o selo de conteúdo (válido, vencido ou ausente), as inferências não confirmadas e o próximo passo do fluxo, e SHALL terminar com código 0. Em erro de ambiente, SHALL terminar com código 2, como os outros comandos.

#### Scenario: Duas changes ativas

- **WHEN** há uma change pendente de aprovação e outra aprovada para archive com todas as tarefas marcadas e sem `verification.md`
- **THEN** o `estado` mostra a primeira como pendente, com o próximo passo "pedir a aprovação", e a segunda com o próximo passo `/opsx:verify`
