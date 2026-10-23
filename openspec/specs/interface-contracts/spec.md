# interface-contracts Specification

## Purpose

Tratar o contrato de cada interface que o projeto expõe ou consome como fonte da verdade: registrado no init, atualizado antes do código, conferido contra a implementação e, quando é de terceiros, fixado por hash.

## Requirements

### Requirement: Contrato registrado no init

O `/opsx:init` SHALL perguntar se o projeto expõe ou consome uma API para outros sistemas e, se sim, o formato e o caminho do contrato no repositório de código. A resposta SHALL ir para a seção "Contratos de interface" do `project.md`. Sem API, a seção MUST registrar "Não aplicável".

#### Scenario: Projeto que expõe uma API REST

- **WHEN** o responsável informa que o projeto expõe uma API REST descrita em `api/openapi.yaml`
- **THEN** o `project.md` registra, em "Contratos de interface", a interface exposta, o formato OpenAPI e o caminho `api/openapi.yaml`

#### Scenario: Projeto sem API

- **WHEN** o responsável informa que o projeto não expõe nem consome API
- **THEN** a seção "Contratos de interface" registra "Não aplicável", e nada mais da entrevista muda

### Requirement: Comando do teste de contrato

Quando o projeto registrar um contrato de interface, o `/opsx:init` SHALL perguntar o comando que confere o contrato contra a implementação e SHALL gravá-lo na linha "Teste de contrato" dos Comandos de verificação do `project.md`. Um projeto sem esse teste MUST registrar "Adiado: definir na primeira change que precisar" ou "Não aplicável", nunca "A definir".

#### Scenario: Teste de contrato informado

- **WHEN** o projeto tem contrato OpenAPI e o responsável informa `pytest tests/test_contrato.py`
- **THEN** a linha "Teste de contrato" do `project.md` registra esse comando

#### Scenario: Teste adiado

- **WHEN** o projeto tem contrato, mas ainda não tem código, e o responsável escolhe adiar
- **THEN** a linha registra "Adiado: definir na primeira change que precisar"

### Requirement: Contrato antes do código

Uma change que cria, altera ou remove uma operação de interface registrada SHALL listar o arquivo de contrato no Impact do proposal e SHALL ter uma tarefa de atualizar o contrato antes das tarefas de implementação. No apply, o contrato MUST ser atualizado antes da implementação e commitado no mesmo commit que ela, e a implementação MUST NOT expor operação que o contrato não declara.

#### Scenario: Endpoint novo

- **WHEN** uma change acrescenta o endpoint `POST /reservas` num projeto com contrato OpenAPI registrado
- **THEN** o proposal cita o arquivo de contrato no Impact, o `tasks.md` atualiza o contrato antes de implementar, e o commit da implementação contém o contrato atualizado

#### Scenario: Operação implementada sem estar no contrato

- **WHEN** durante o apply a implementação precisa de uma operação que o contrato não declara
- **THEN** o agente para e trata a operação como escopo novo, em vez de implementá-la fora do contrato

#### Scenario: Projeto sem contrato registrado

- **WHEN** uma change mexe numa interface de um projeto cuja seção "Contratos de interface" não existe ou registra "Não aplicável"
- **THEN** o propose avisa que não há contrato registrado e segue, sem exigir a tarefa de contrato

### Requirement: Conferência do contrato no verify

Quando a change tocar uma interface com contrato registrado, o verify SHALL conferir o contrato e a implementação nas duas direções pelo comando "Teste de contrato" do `project.md`: operação declarada e não implementada, e operação implementada e não declarada. Um comando ausente ou adiado MUST ser reportado como não verificado, com o motivo. Uma divergência confirmada MUST ser reportada como crítica.

#### Scenario: Rota implementada fora do contrato

- **WHEN** o teste de contrato acusa uma rota implementada que o contrato não declara
- **THEN** o verify registra um item crítico com a rota e o arquivo de contrato

#### Scenario: Sem comando de teste de contrato

- **WHEN** a change toca uma interface e o `project.md` registra o teste de contrato como adiado
- **THEN** o verify registra a conferência do contrato como não verificada, com esse motivo, e não inventa um comando

### Requirement: Contrato de terceiros fixado por hash

Uma cópia versionada de contrato de terceiros SHALL ter, ao lado, um `ORIGEM.md` com a origem, a data da cópia, a versão do contrato e o SHA-256 do arquivo. Quando a change tocar essa cópia ou a integração com ela, o verify SHALL recalcular o SHA-256 e compará-lo com o registro. A divergência MUST ser reportada como crítica. A correção é atualizar a cópia e o registro juntos, relendo a integração contra o contrato novo.

#### Scenario: Cópia alterada sem registro

- **WHEN** o arquivo `contratos/pagamentos.yaml` mudou e o SHA-256 no `ORIGEM.md` continua o antigo
- **THEN** o verify registra um item crítico dizendo que a cópia diverge do registro de origem

#### Scenario: Cópia atualizada com o registro

- **WHEN** a change atualiza a cópia e o `ORIGEM.md`, com a data, a versão e o hash novos
- **THEN** o verify confere o hash, registra o comando e o resultado, e não aponta divergência

### Requirement: Hash do contrato exposto pelo serviço

O padrão SHOULD orientar que o serviço que implementa um contrato exponha o hash dele (por exemplo, num cabeçalho de resposta), para o consumidor detectar a divergência. A ausência do hash exposto MUST NOT ser tratada como falha pelo verify.

#### Scenario: Serviço sem hash exposto

- **WHEN** um projeto com contrato registrado não expõe o hash do contrato
- **THEN** o verify não registra item nenhum por isso
