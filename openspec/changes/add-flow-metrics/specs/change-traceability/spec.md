# Spec Delta

## Purpose

Liga cada commit de código à change OpenSpec que o originou, para que o histórico do repositório de código seja rastreável até o planejamento e para que o retrabalho possa ser medido.

## ADDED Requirements

### Requirement: Trailer de change nos commits de código

Todo commit de código feito durante o `/opsx:apply` de uma change SHALL conter o trailer git `OpenSpec-Change: <nome-da-change>`, com o nome exato da change, no bloco de trailers da mensagem.

#### Scenario: Commit de implementação

- **WHEN** o agente faz um commit de código durante o apply da change `add-catalogo`
- **THEN** `git log -1 --format=%(trailers:key=OpenSpec-Change,valueonly)` retorna `add-catalogo`

### Requirement: Trailer em correções posteriores

Um commit que corrige um comportamento entregue por uma change já arquivada SHALL usar o tipo `fix` e o trailer `OpenSpec-Change` com o nome dessa change.

#### Scenario: Correção depois do archive

- **WHEN** o agente corrige um defeito do comportamento entregue pela change arquivada `add-catalogo`
- **THEN** o commit tem a mensagem do tipo `fix:` e o trailer `OpenSpec-Change: add-catalogo`
