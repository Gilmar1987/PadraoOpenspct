# Spec Delta

## ADDED Requirements

### Requirement: Controles de LGPD/GDPR no init

A pergunta 6.5 do `/opsx:init` SHALL aceitar mais de um controle de LGPD/GDPR, informados por números separados por vírgula, e a opção que escolhe todos SHALL abranger só os controles, nunca o "Não aplicável". Quando o 1.5 disser que o produto não lida com dados pessoais nem sensíveis, o init SHALL registrar a 6.5 como "Não aplicável" sem fazer a pergunta.

#### Scenario: Dois controles escolhidos

- **WHEN** o responsável responde `1,2` na 6.5
- **THEN** o init registra o consentimento com registro de aceite e o direito de exclusão como os controles do projeto

#### Scenario: Todos os controles

- **WHEN** o responsável escolhe a opção que abrange todos os controles
- **THEN** o init registra os quatro controles (consentimento, exclusão, exportação e anonimização) e não registra "Não aplicável"

#### Scenario: Produto sem dados pessoais

- **WHEN** o responsável responde no 1.5 que o produto não lida com dados pessoais nem sensíveis
- **THEN** o init não faz a pergunta 6.5 e registra "Não aplicável" para ela

## MODIFIED Requirements

### Requirement: Checagem de coerência das respostas

Antes da confirmação final, o `/opsx:init` SHALL listar as combinações incoerentes entre as respostas e pedir, para cada uma, que o responsável ajuste a resposta ou a mantenha com uma justificativa. O `project-setup.md` SHALL registrar cada combinação apontada e a decisão tomada. Sem combinações incoerentes, o init SHALL dizer isso e seguir. A combinação "dados pessoais ou sensíveis no 1.5 e nenhum controle de LGPD/GDPR no 6.5" SHALL estar entre as avaliadas.

#### Scenario: Aprovação de PR com uma pessoa só

- **WHEN** o responsável exige aprovação de PR e informa que só uma pessoa desenvolve e revisa
- **THEN** o init aponta que a plataforma não permite aprovar o próprio PR e oferece registrar a revisão por subagente (`requesting-code-review`) como substituta

#### Scenario: CI no PR sem remoto

- **WHEN** o responsável escolhe CI no GitHub Actions e "Sem remoto por enquanto"
- **THEN** o init aponta que o CI remoto não roda sem remoto e oferece registrar as verificações como locais até o remoto existir

#### Scenario: Fila sem processamento em background

- **WHEN** o responsável escolhe uma biblioteca de filas e responde que o sistema não tem jobs nem processamento em background
- **THEN** o init aponta a combinação e o responsável ajusta uma das respostas ou registra a justificativa

#### Scenario: Dados pessoais sem controles de LGPD

- **WHEN** o responsável responde no 1.5 que o produto coleta dados pessoais ou sensíveis e responde `0` (não aplicável) no 6.5
- **THEN** o init aponta que o produto trata dados pessoais sem nenhum controle e propõe ao menos o consentimento com registro de aceite e o direito de exclusão
