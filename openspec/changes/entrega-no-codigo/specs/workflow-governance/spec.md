# Spec Delta

## ADDED Requirements

### Requirement: Alternativas numeradas no explore

Quando o `/opsx:explore` faz uma pergunta com alternativas ("isto ou aquilo"), o agente SHALL numerar as opções e pedir o número, como a entrevista do init. Uma resposta que não indica a alternativa (por exemplo, "sim") SHALL ser tratada como ambígua, e o agente SHALL perguntar de novo antes de registrar a decisão.

#### Scenario: Pergunta com duas alternativas

- **WHEN** o agente precisa saber se o material é fixo por serviço ou varia por lavagem
- **THEN** ele pergunta com as opções "1) fixo por serviço" e "2) varia por lavagem" e pede o número

#### Scenario: Resposta ambígua

- **WHEN** o usuário responde "sim" a uma pergunta "isto ou aquilo"
- **THEN** o agente não registra a decisão e repete a pergunta com as opções numeradas
