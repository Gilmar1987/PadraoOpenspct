# Spec Delta

## ADDED Requirements

### Requirement: Portão de apply

O portão `apply <change>` SHALL terminar com código 0 só quando a seção `## Aprovação` do proposal da change tiver Responsável diferente de `Pendente` e Data, Escopo (`apply` ou `archive`) e Origem preenchidos. Em qualquer outro caso, SHALL terminar com código 1 e listar os motivos. Quando o portão existir no repositório de código, o `/opsx:apply` SHALL rodá-lo antes da primeira escrita de código e parar se ele não liberar.

#### Scenario: Aprovação pendente

- **WHEN** o portão roda `apply estrutura-inicial` e o proposal tem `Responsável: Pendente`
- **THEN** ele termina com código 1 e cita a aprovação pendente

#### Scenario: Aprovação completa

- **WHEN** o proposal tem Responsável, Data, `Escopo: apply` e Origem preenchidos
- **THEN** o portão termina com código 0

### Requirement: Portão de archive

O portão `archive <change>` SHALL terminar com código 0 só quando a aprovação tiver `Escopo: archive` ou um item `Archive:`, todas as tarefas estiverem marcadas, existir `verification.md` e, numa change com commits de código, existir `review.md`. Em qualquer outro caso, SHALL terminar com código 1 e listar os motivos. Quando o portão existir no repositório de código, o `/opsx:archive` SHALL rodá-lo antes de mover a change e parar se ele não liberar.

#### Scenario: Archive com tarefas pendentes e sem verificação

- **WHEN** a change tem uma tarefa sem marcar e nenhum `verification.md`
- **THEN** o portão termina com código 1 e cita as duas faltas

#### Scenario: Change pronta para arquivar

- **WHEN** a aprovação tem `Escopo: archive`, as tarefas estão marcadas, e existem `verification.md` e `review.md`
- **THEN** o portão termina com código 0

### Requirement: Erro de ambiente no portão

Quando a change não existir ou o store não puder ser resolvido, o portão SHALL terminar com código 2 e dizer o que corrigir, incluindo o uso de `--store <id>`.

#### Scenario: Store não resolvido

- **WHEN** o portão roda numa pasta sem declaração de store e sem `--store`
- **THEN** ele termina com código 2 e sugere declarar o store ou passar `--store <id>`
