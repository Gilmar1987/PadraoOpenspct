# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: Opções que cobrem as stacks dos presets`
- TO: `### Requirement: Opções de stack de vários ecossistemas`

## MODIFIED Requirements

### Requirement: Opções de stack de vários ecossistemas

As perguntas de stack do `/opsx:init` (linguagem e framework, front-end, ORM, validação, jobs, testes unitários e verificações de CI) SHALL oferecer opções de ao menos três ecossistemas diferentes, sem privilegiar uma stack, além de "Outro". As perguntas 3.5 e 6.4 SHALL oferecer a opção de nenhum ORM e a de nenhuma proteção no MVP. A pergunta 5.3 SHALL explicar que, sem CI, as respostas viram verificações locais obrigatórias.

#### Scenario: Projeto Next.js sem servidor separado

- **WHEN** o responsável responde a 3.1 num projeto em que o back-end são Route Handlers e Server Actions do Next.js
- **THEN** existe uma opção que descreve esse caso, sem precisar de "Outro"

#### Scenario: Projeto Django

- **WHEN** o responsável responde a 3.1 num projeto Python com Django
- **THEN** existe uma opção que cita Python e Django, sem precisar de "Outro"

#### Scenario: Projeto sem ORM

- **WHEN** o projeto lê dados de uma API externa, sem banco próprio
- **THEN** a 3.5 oferece a opção de nenhum ORM

### Requirement: Precedência da decisão de testes

A decisão de E2E registrada pelo projeto SHALL prevalecer sobre a orientação padrão do config base. Quando o projeto decidir não ter E2E, o `config.yaml` gerado pelo init MUST orientar a cobrir cenários de interface com verificação em navegador versionada, e não com E2E.

#### Scenario: Projeto Next.js sem E2E

- **WHEN** o responsável responde "Não aplicável" à pergunta de E2E num projeto Next.js, ou de qualquer outra stack
- **THEN** o `operations.apply.guidance` do `config.yaml` gerado não exige E2E e orienta a verificação em navegador versionada para cenários de interface

## ADDED Requirements

### Requirement: Comandos de verificação do projeto

Depois do bloco 6, o `/opsx:init` SHALL perguntar os comandos que o projeto usa para instalar dependências, executar localmente, rodar os testes, o lint, o typecheck ou build e as migrações, e SHALL gravá-los na seção "Comandos de verificação" do `project.md`. Um comando que o projeto não tem MUST ser gravado como "Não aplicável" ou "Adiado: definir na primeira change que precisar", nunca como "A definir".

#### Scenario: Projeto com testes e lint

- **WHEN** o responsável informa `pytest` para testes e `ruff check .` para lint
- **THEN** a seção "Comandos de verificação" do `project.md` lista esses dois comandos, e o `config.yaml` gerado orienta o apply e o verify a usá-los

#### Scenario: Comando ainda inexistente

- **WHEN** o projeto ainda não tem código e o responsável escolhe adiar o comando de migração
- **THEN** o `project.md` registra "Adiado: definir na primeira change que precisar" para migrações, e o projeto não é considerado "não inicializado" por causa dele

### Requirement: Campos da Stack Summary sem decisão

Depois dos comandos de verificação, o `/opsx:init` SHALL perguntar cada campo da Stack Summary do `project.md` que continua "A definir" e não foi coberto pelas respostas, oferecendo opções coerentes com a stack escolhida no bloco 3, "Adiar" e "Outro". "Adiar" MUST gravar "Adiado: decidir na primeira change que precisar".

#### Scenario: Observabilidade não perguntada

- **WHEN** os blocos 1 a 6 não definiram o campo Build/execução da Stack Summary
- **THEN** o init pergunta esse campo com opções coerentes com a stack escolhida, mais "Adiar" e "Outro"

## REMOVED Requirements

### Requirement: Complemento dos campos do preset

**Reason**: O padrão não tem presets (ADR-0003); não há campos de preset a complementar.

**Migration**: Substituído pelos requisitos "Comandos de verificação do projeto" e "Campos da Stack Summary sem decisão".
