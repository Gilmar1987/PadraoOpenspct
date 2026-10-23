# Spec Delta

## ADDED Requirements

### Requirement: Precedência entre documentos

As regras do padrão e o modelo de `project.md` SHALL definir a ordem de precedência entre documentos num conflito: contrato de interface, specs principais, arquitetura (`arquitetura.md` e `project.md`), ADRs `Accepted` e, por último, o código. Código que diverge de um documento MUST convergir para ele, a menos que a divergência esteja declarada no registro de lacunas. O projeto MAY ajustar a ordem no próprio `project.md`, que então prevalece.

#### Scenario: Código diverge de uma spec

- **WHEN** o agente encontra no código um comportamento diferente do que a spec principal descreve e a divergência não está declarada
- **THEN** ele trata o código como o que precisa mudar e reporta a divergência, em vez de alterar a spec para combinar com o código

#### Scenario: Ordem própria do projeto

- **WHEN** o `project.md` do projeto põe as ADRs antes da arquitetura na precedência
- **THEN** o agente segue a ordem do `project.md`

### Requirement: Divergência entre documentos

Uma divergência entre o contrato de interface e as specs principais MUST ser reportada ao responsável, e o agente MUST NOT escolher sozinho qual dos dois seguir. Uma divergência entre outros documentos MUST ser reportada, e o trabalho em curso segue o de maior precedência.

#### Scenario: Contrato e spec divergem

- **WHEN** o contrato de interface declara um campo obrigatório que a spec principal descreve como opcional
- **THEN** o agente para, mostra a divergência ao responsável e não implementa nenhuma das duas versões até a decisão

#### Scenario: Divergência entre arquitetura e ADR

- **WHEN** o `arquitetura.md` descreve uma fila em Redis e a ADR `Accepted` de filas escolheu uma tabela no banco
- **THEN** o agente reporta a divergência e segue o `arquitetura.md`, que tem maior precedência, até o responsável corrigir um dos dois
