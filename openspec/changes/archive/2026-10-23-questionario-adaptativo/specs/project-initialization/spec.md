# Spec Delta

## ADDED Requirements

### Requirement: Perguntas puladas quando não se aplicam

O `/opsx:init` SHALL pular a pergunta que uma resposta anterior torna sem sentido, segundo a tabela de regras de salto do comando, e SHALL registrar para ela o valor da regra. O resumo do bloco SHALL listar cada pergunta pulada com o motivo, e o dev SHALL poder pedir para respondê-la.

#### Scenario: Sem jobs

- **WHEN** o dev responde "1) Não" na 2.5
- **THEN** o init não faz a 3.8, registra "0) Não aplicável" e o resumo do Bloco 3 mostra "3.8 pulada porque a 2.5 é Não"

#### Scenario: Só back-end

- **WHEN** o dev responde "3) Apenas back-end" na 2.2
- **THEN** o init não faz a 3.2 e registra "0) Não há front-end próprio"

#### Scenario: Sem dados pessoais

- **WHEN** o dev responde "4) Não" na 1.5
- **THEN** o init não faz a 6.5 nem a 6.6 e registra "Não aplicável" nas duas

#### Scenario: Dev desfaz o salto

- **WHEN** o resumo do bloco mostra uma pergunta pulada e o dev pede para respondê-la
- **THEN** o init faz a pergunta e registra a resposta do dev no lugar do valor da regra

### Requirement: Organização dos repositórios antes do estilo do back-end

No Bloco 2, o `/opsx:init` SHALL perguntar a 2.2 antes da 2.1, sem mudar a numeração. Com a 2.2 em "Apenas front-end", a 2.1 e a 3.1 SHALL ser puladas como "Não aplicável".

#### Scenario: Projeto só de front-end

- **WHEN** o dev responde "4) Apenas front-end" na 2.2
- **THEN** o init não pergunta o estilo do back-end (2.1) nem a linguagem do back-end (3.1), e não gera as ADRs 0001 e 0002

### Requirement: Opções filtradas pelas respostas anteriores

O `/opsx:init` SHALL ocultar as opções que não combinam com respostas anteriores, segundo a tabela de filtros do comando, mantendo a numeração das demais e "Outro". Uma linha SHALL dizer quantas opções foram ocultadas e por quê, e a resposta `todas` SHALL mostrar a lista inteira.

#### Scenario: ORM de um projeto Python

- **WHEN** a 3.1 é "3) Python"
- **THEN** a 3.5 mostra só as opções 0, 3, 4 e 6, com os números originais, e uma linha diz que três opções de outras linguagens foram ocultadas

#### Scenario: E2E sem front-end

- **WHEN** a 3.2 é "0) Não há front-end próprio"
- **THEN** a 5.5 mostra só as opções 0, 5 e 6

#### Scenario: Dev pede todas as opções

- **WHEN** o dev responde `todas` numa pergunta com opções ocultas
- **THEN** o init mostra a lista completa e aceita qualquer opção dela

### Requirement: Coerência avaliada na hora

O `/opsx:init` SHALL avaliar cada combinação da checagem de coerência assim que a última resposta envolvida for dada, mostrando a consequência e a proposta e perguntando "Ajustar ou manter?". A checagem antes da confirmação final SHALL continuar e MUST NOT perguntar de novo uma combinação já decidida.

#### Scenario: Aprovação de PR com uma pessoa só, apontada na hora

- **WHEN** o dev exigiu aprovação de PR na 5.7 e responde "1) Uma pessoa" na 5.9
- **THEN** o init aponta a combinação logo depois da 5.9, e não só no fim

#### Scenario: Combinação já decidida

- **WHEN** o dev manteve uma combinação com justificativa durante a entrevista
- **THEN** a checagem final a lista como "Mantida" com a justificativa e não pergunta de novo

### Requirement: Microsserviços num projeto pequeno

A checagem de coerência do `/opsx:init` SHALL apontar a combinação da 2.1 em "Microsserviços" com a 1.4 em "Pequeno" ou "Ainda não sei", ou com a 5.9 em "Uma pessoa", com a consequência do custo de operar vários serviços e a proposta de monólito modular.

#### Scenario: Microsserviços com volume pequeno

- **WHEN** a 1.4 é "Pequeno" e o dev escolhe "4) Microsserviços" na 2.1
- **THEN** o init aponta a combinação logo depois da 2.1 e pergunta "Ajustar ou manter?"

### Requirement: Arquivo de respostas com salto e filtro

Com um arquivo de respostas, o `/opsx:init` SHALL aplicar as respostas do arquivo como estão, inclusive a perguntas que uma regra pularia e a opções que um filtro ocultaria. Uma pergunta sem resposta no arquivo e coberta por uma regra de salto SHALL receber o valor da regra sem ser perguntada. A checagem de coerência SHALL rodar só no fim, como antes.

#### Scenario: Arquivo responde pergunta que seria pulada

- **WHEN** o arquivo traz a 2.5 "Não" e a 3.8 "1"
- **THEN** o init registra a 3.8 como no arquivo e aponta a combinação na checagem final

#### Scenario: Arquivo omite pergunta pulada

- **WHEN** o arquivo traz a 2.5 "Não" e não traz a 3.8
- **THEN** o init registra a 3.8 como "Não aplicável" sem perguntar
