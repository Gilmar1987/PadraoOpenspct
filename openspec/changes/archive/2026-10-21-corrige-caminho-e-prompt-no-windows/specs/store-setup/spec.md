# Spec Delta

## MODIFIED Requirements

### Requirement: Verificação de resolução do store

Após registrar e declarar o store, o setup SHALL executar o OpenSpec CLI de dentro do repositório de código e confirmar que a raiz resolvida é o store configurado, tratando como iguais caminhos para a mesma pasta que só diferem na caixa da letra do drive. Se a resolução falhar ou apontar para outra raiz, o setup SHALL terminar com código diferente de zero e exibir o comando que corrige o problema.

#### Scenario: Store resolvido

- **WHEN** o registro e a declaração são concluídos
- **THEN** o setup informa que o CLI resolveu o store a partir do repositório de código e termina com código zero

#### Scenario: Registro falhou

- **WHEN** `openspec store register` falha durante o setup
- **THEN** o setup termina com código diferente de zero e exibe o comando `openspec store register` a executar

#### Scenario: Drive em minúscula no Windows

- **WHEN** o setup roda no Windows com o repositório de código e o store informados como `c:\...` e o CLI devolve a raiz como `C:\...`
- **THEN** o setup informa que o CLI resolveu o store e termina com código zero
