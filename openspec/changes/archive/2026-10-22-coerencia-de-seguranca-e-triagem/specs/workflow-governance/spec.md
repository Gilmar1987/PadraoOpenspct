# Spec Delta

## ADDED Requirements

### Requirement: Triagem de relatório de ferramenta externa

Quando houver um relatório de ferramenta de análise externa sobre o código da change (SAST, scanner de dependências, revisão automatizada), o verify SHALL conferir cada achado no código e nas decisões registradas e classificá-lo como real, não se aplica, risco aceito ou falso positivo, sempre com evidência. Um achado confirmado MUST manter a severidade do relatório ou maior, e um achado não conferido MUST ficar como não verificado.

#### Scenario: Falso positivo de CSRF

- **WHEN** o relatório aponta CSRF numa view cujo formulário tem o token CSRF e cujo middleware de proteção está ativo
- **THEN** o verify classifica o achado como falso positivo e cita o arquivo e a linha do middleware e do token

#### Scenario: Dependência vulnerável confirmada

- **WHEN** o relatório aponta um CVE numa dependência e a versão fixada no projeto está na faixa afetada
- **THEN** o verify classifica o achado como real, mantém a severidade e registra a correção recomendada

#### Scenario: Risco já aceito

- **WHEN** o relatório aponta a falta de limite de requisições e o projeto registrou "sem proteção contra ataques no MVP"
- **THEN** o verify classifica o achado como risco aceito e cita a decisão registrada

#### Scenario: Achado sem evidência suficiente

- **WHEN** o verify não consegue confirmar nem descartar um achado
- **THEN** o achado fica como não verificado, com o motivo
