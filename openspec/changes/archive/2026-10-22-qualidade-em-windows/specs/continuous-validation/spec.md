# Spec Delta

## ADDED Requirements

### Requirement: Validações do store também no Windows

As validações do store SHALL rodar em Linux e em Windows a cada pull request, e uma falha em qualquer um dos dois sistemas SHALL reprovar a CI. No Windows, a CI SHALL rodar o script de entrada nos dois modos com a pasta base em letra de drive minúscula e conferir que o OpenSpec CLI resolve o store a partir do código.

#### Scenario: Defeito só no Windows

- **WHEN** uma mudança faz um script falhar só no Windows (por exemplo, comparando caminhos com diferença de caixa na letra do drive)
- **THEN** a execução do job de validação do store no Windows falha e o pull request fica reprovado, mesmo com a execução no Linux passando

#### Scenario: Drive em minúscula

- **WHEN** o script de entrada roda no Windows com `--pasta` em letra minúscula, nos modos projeto novo e projeto em andamento
- **THEN** os dois modos terminam com código zero, e o CLI rodado no código resolve a pasta `padrao-openspec` do store

#### Scenario: Defeito só no Linux

- **WHEN** uma mudança faz um passo falhar só no Linux (por exemplo, um commit sem identidade Git configurada)
- **THEN** a execução no Linux falha e o pull request fica reprovado, mesmo com a execução no Windows passando
