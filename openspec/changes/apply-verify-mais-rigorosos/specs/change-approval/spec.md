# Spec Delta

## ADDED Requirements

### Requirement: Mudança de escopo zera a aprovação

Quando o `/opsx:update` revisar uma change aprovada de um jeito que muda o escopo (o "What Changes" do proposal, requisitos ou cenários das delta specs, ou tarefas acrescentadas ou retiradas), ele SHALL voltar a seção `## Aprovação` para `Pendente`, guardando a aprovação anterior numa linha "Aprovação anterior". Correções de texto que não mudam o escopo MUST NOT zerar a aprovação.

#### Scenario: Requisito novo depois da aprovação

- **WHEN** o update acrescenta um requisito a uma change com `Responsável` preenchido
- **THEN** o proposal volta a `Responsável: Pendente`, mantém a aprovação anterior registrada, e o próximo `/opsx:apply` pede uma nova aprovação

#### Scenario: Correção de redação

- **WHEN** o update só corrige a redação de um cenário, sem mudar o que ele exige
- **THEN** a aprovação continua valendo
