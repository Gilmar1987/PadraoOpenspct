# Spec Delta

## ADDED Requirements

### Requirement: Inferências marcadas no init

O `/opsx:init` SHALL marcar com `[INFERIDO: <base>]` o que os arquivos gerados afirmam sem ter vindo de uma resposta da entrevista ou do arquivo de respostas, e SHALL listar essas marcas no resumo final, pedindo a confirmação de cada uma. Uma marca confirmada perde o marcador; uma recusada sai do arquivo.

#### Scenario: Componente deduzido

- **WHEN** o `arquitetura.md` gerado cita um componente "fila de e-mails" que nenhuma resposta mencionou
- **THEN** a linha leva `[INFERIDO: <base>]`, e o resumo final pergunta se o componente fica
