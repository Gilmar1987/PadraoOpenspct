# Spec Delta

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

## ADDED Requirements

### Requirement: Combinações de segurança na checagem de coerência

A checagem de coerência do `/opsx:init` SHALL avaliar também três combinações de segurança: auditoria de dependências "Não aplicável" num projeto com dependências de terceiros, varredura de secrets "Não aplicável" num projeto com credenciais, e dados pessoais ou sensíveis sem autenticação e sem proteção contra ataques.

#### Scenario: Auditoria de dependências desligada num projeto com dependências

- **WHEN** a stack escolhida usa dependências de terceiros e o responsável responde "Não aplicável" para a auditoria de dependências
- **THEN** o init aponta que vulnerabilidades conhecidas nessas dependências não serão detectadas e oferece registrar uma ferramenta do ecossistema ou adiar com justificativa

#### Scenario: Varredura de secrets desligada num projeto com credenciais

- **WHEN** o projeto usa credenciais (por exemplo, `.env` com senha do banco) e o responsável responde "Não aplicável" para a varredura de secrets
- **THEN** o init aponta que um secret commitado por engano não será detectado e oferece registrar uma ferramenta de varredura ou adiar com justificativa

#### Scenario: Dados pessoais sem autenticação nem proteção

- **WHEN** o produto trata dados pessoais ou sensíveis, não tem autenticação e não tem proteção contra ataques
- **THEN** o init aponta que qualquer pessoa com acesso lê e altera esses dados sem limite e oferece registrar no `project.md` a restrição a ambiente local com dados de teste, ou adotar autenticação e limite de requisições

### Requirement: Opção sem autenticação

A pergunta de autenticação do `/opsx:init` SHALL oferecer a opção "Sem autenticação no MVP", para que a decisão fique registrada sem depender de "Outro" e possa ser considerada pela checagem de coerência.

#### Scenario: Projeto sem login no MVP

- **WHEN** o responsável decide que o MVP não terá autenticação
- **THEN** existe uma opção que registra essa decisão, sem precisar de "Outro"
