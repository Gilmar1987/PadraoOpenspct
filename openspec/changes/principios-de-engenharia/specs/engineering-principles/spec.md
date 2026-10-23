# Spec Delta

## Purpose

Define os princípios de engenharia que o padrão cobra a cada change, de forma independente de stack: design, observabilidade, validação de entrada, erro sem vazamento e rastreabilidade entre teste, requisito e objetivo do produto.

## ADDED Requirements

### Requirement: Princípios de design na revisão

A revisão de código de uma change SHALL avaliar responsabilidade única, extensão sem modificação e reaproveitamento dos padrões de projeto já usados no código, e SHALL registrar como achado o código novo que mistura responsabilidades ou cria um padrão novo sem justificativa no design.

#### Scenario: Responsabilidades misturadas

- **WHEN** a change cria uma função que grava no banco, cobra o pagamento e envia o e-mail no mesmo bloco
- **THEN** a revisão registra um achado de responsabilidade única com arquivo e linha, e sugere separar as responsabilidades seguindo o padrão já usado no projeto

#### Scenario: Padrão novo justificado

- **WHEN** o design da change justifica um padrão de projeto que o código ainda não usa
- **THEN** a revisão não registra o padrão novo como achado

### Requirement: Contrato de entrada e entidade separada

O design de uma change que cria um fluxo SHALL indicar o contrato tipado de entrada do fluxo e manter a entidade de domínio separada do esquema de persistência, ou justificar a exceção.

#### Scenario: Fluxo novo

- **WHEN** a change cria um fluxo que recebe dados de fora
- **THEN** o design diz qual é o contrato de entrada e onde a entidade se separa do esquema do banco

### Requirement: Log de três estados

Quando o `project.md` não marcar o log de três estados como "Não aplicável", o código que a change escreve para mutações e fronteiras críticas SHALL registrar os estados iniciado, sucesso e falha com a ferramenta de log registrada no `project.md`. O verify SHALL apontar como warning a mutação ou fronteira sem os três estados.

#### Scenario: Mutação sem log

- **WHEN** a change cria um endpoint que altera dados e não registra o estado de falha
- **THEN** o verify registra um warning citando o arquivo e o estado que falta

#### Scenario: Projeto que desligou a regra

- **WHEN** o `project.md` marca o log de três estados como "Não aplicável", com justificativa
- **THEN** o verify não aponta a falta dos três estados

### Requirement: Validação de entrada nas fronteiras

Toda entrada que chega de fora do sistema pelo código da change (requisição, mensagem, arquivo, variável de ambiente) SHALL ser validada com a ferramenta registrada no `project.md` antes do processamento. O verify SHALL apontar como warning a fronteira sem validação.

#### Scenario: Corpo de requisição sem validação

- **WHEN** a change lê o corpo de uma requisição e o usa direto numa consulta
- **THEN** o verify registra um warning citando a fronteira e a ferramenta de validação do projeto

### Requirement: Erros e logs sem vazamento

O código da change MUST NOT devolver ao cliente a mensagem interna de uma exceção, o stack trace ou dados pessoais, e MUST NOT registrar dados pessoais ou credenciais em log sem mascaramento. O verify SHALL tratar cada ocorrência encontrada como crítico.

#### Scenario: Mensagem interna na resposta

- **WHEN** um tratamento de erro da change devolve `error.message` do banco na resposta HTTP
- **THEN** o verify registra um crítico com arquivo e linha

#### Scenario: CPF em log

- **WHEN** a change registra em log o objeto do cliente com o CPF
- **THEN** o verify registra um crítico e recomenda mascarar o campo

### Requirement: Teste rastreável ao requisito

Os testes que uma change escreve para os cenários das suas specs SHALL citar o requisito e o cenário que cobrem, no nome do teste ou num comentário junto dele. O verify SHALL registrar como sugestão o teste de cenário sem essa citação.

#### Scenario: Teste com a citação

- **WHEN** o teste de um cenário se chama "Mutação sem log — Log de três estados"
- **THEN** o verify associa o teste ao cenário pela citação

### Requirement: Change ligada ao objetivo do produto

O "Why" de uma proposal SHALL citar o objetivo do produto ou a capability do `project.md` que a change atende; uma change interna (refatoração, ferramenta, documentação) SHALL dizer qual capability ou qualidade ela preserva.

#### Scenario: Proposal de funcionalidade

- **WHEN** uma proposal adiciona um desconto por fidelidade
- **THEN** o "Why" cita o objetivo do `project.md` (por exemplo, retenção de clientes) que o desconto atende

### Requirement: Convenção registrada no init

O `/opsx:init` SHALL preencher a linha "Princípios de engenharia" da seção "Development Conventions" do `project.md` com o log de três estados, a validação na fronteira e o erro sem detalhe interno, e SHALL aceitar que o responsável marque o log de três estados como "Não aplicável", com justificativa; a validação na fronteira e o erro sem detalhe interno não aceitam exceção.

#### Scenario: Projeto pequeno sem log de três estados

- **WHEN** o responsável marca o log de três estados como "Não aplicável: script de uso único"
- **THEN** o `project.md` registra a exceção com a justificativa, e os outros itens continuam valendo
