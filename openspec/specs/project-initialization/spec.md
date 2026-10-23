# project-initialization Specification

## Purpose

Define como o `/opsx:init` conduz a inicialização de um projeto: as perguntas, o complemento dos campos do preset ativo, as ADRs geradas, a precedência da decisão de testes e o uso de respostas pré-preenchidas.

## Requirements

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

A decisão de E2E registrada pelo projeto SHALL prevalecer sobre a orientação padrão do config base. Quando o projeto decidir não ter E2E, o `config.yaml` gerado pelo init MUST orientar a cobrir cenários de interface com um roteiro de verificação em navegador versionado, com o script versionado quando a execução for automatizada, o registro de quem executou e a limpeza dos dados criados.

#### Scenario: Projeto Next.js sem E2E

- **WHEN** o responsável responde "Não aplicável" à pergunta de E2E num projeto Next.js, ou de qualquer outra stack
- **THEN** o `operations.apply.guidance` do `config.yaml` gerado não exige E2E e orienta a verificação em navegador versionada para cenários de interface

#### Scenario: Roteiro automatizado pelo agente

- **WHEN** o agente automatiza o roteiro de navegador num projeto sem E2E
- **THEN** a orientação gerada exige que o script fique versionado junto do roteiro, que o registro diga que o agente executou e que os dados criados sejam marcados e removidos ao final

### Requirement: ADRs para respostas negativas

Uma resposta negativa a uma decisão da tabela de ADRs obrigatórias (por exemplo, "Não" para Docker ou "Sem deploy no MVP") SHALL gerar a ADR com a restrição explícita na decisão. "Ainda não sei" e "Não aplicável" MUST NOT gerar ADR.

#### Scenario: Sem contêiner

- **WHEN** o responsável responde que o sistema não será containerizado
- **THEN** o init gera a ADR de containerização com uma decisão do tipo "O projeto SHALL NOT usar contêiner no MVP"

### Requirement: Arquivo de respostas

O `/opsx:init` SHALL aceitar, opcionalmente, o caminho de um arquivo Markdown com as respostas, aplicá-las sem perguntar uma a uma e apresentar o resumo completo. A confirmação final MUST vir do responsável no chat, ou do próprio arquivo quando ele contiver `Confirmação final: sim` e o nome do responsável.

#### Scenario: Teste automatizado do padrão

- **WHEN** o `/opsx:init` recebe um arquivo com todas as respostas, `Confirmação final: sim` e `Responsável: Teste E2E`
- **THEN** o init gera `project-setup.md`, `project.md`, `config.yaml` e as ADRs sem fazer perguntas

#### Scenario: Arquivo incompleto

- **WHEN** o arquivo de respostas não responde a pergunta 3.3
- **THEN** o init pergunta só a 3.3 no chat e segue com as demais respostas do arquivo

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

### Requirement: Remoto e tamanho do time

O `/opsx:init` SHALL perguntar onde o repositório de código fica hospedado, com a opção "Sem remoto por enquanto", e quantas pessoas desenvolvem e revisam o código. As duas respostas SHALL ir para o `project-setup.md` e para a convenção "Git e revisão" do `project.md`.

#### Scenario: Projeto sem remoto

- **WHEN** o responsável responde "Sem remoto por enquanto"
- **THEN** o `project.md` registra em "Git e revisão" que o projeto não tem remoto

#### Scenario: Projeto solo no GitHub

- **WHEN** o responsável responde GitHub e "Uma pessoa"
- **THEN** o `project-setup.md` registra as duas respostas

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

### Requirement: Comandos de segurança do projeto

No registro dos comandos de verificação, o `/opsx:init` SHALL perguntar também o comando de auditoria de dependências e o de varredura de secrets, com sugestões de ao menos três ecossistemas ou ferramentas, além de "Não aplicável", "Adiar" e "Outro", e SHALL gravá-los na seção "Comandos de verificação" do `project.md`.

#### Scenario: Projeto Node.js

- **WHEN** a stack escolhida é TypeScript + Node.js
- **THEN** o init sugere `npm audit` para a auditoria de dependências e uma ferramenta de varredura de secrets, e grava a escolha no `project.md`

#### Scenario: Varredura adiada

- **WHEN** o responsável escolhe adiar a varredura de secrets
- **THEN** o `project.md` registra "Adiado: definir na primeira change que precisar" para a varredura

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

### Requirement: Orientação de E2E acrescentada ao config

O `/opsx:init` SHALL acrescentar ao `operations.apply.guidance` do `config.yaml` gerado uma linha sobre E2E de acordo com a 5.5, sem depender de uma linha preexistente no config base: com um framework de E2E, a orientação de cobrir os cenários de interface com esse framework; com "Não aplicável", a orientação do roteiro de verificação em navegador.

#### Scenario: Projeto com Playwright

- **WHEN** o responsável escolhe Playwright na 5.5
- **THEN** o `operations.apply.guidance` gerado tem uma linha que manda cobrir os cenários de interface com testes E2E em Playwright, e as linhas do config base continuam lá

#### Scenario: Projeto sem E2E sobre o config neutro

- **WHEN** o responsável responde "Não aplicável" na 5.5 e o `config.yaml` do store é o neutro
- **THEN** o init acrescenta a orientação do roteiro de verificação em navegador, sem procurar uma linha para substituir

### Requirement: Idioma do código perguntado

O bloco 7 do `/opsx:init` SHALL perguntar o idioma do código (identificadores, comentários e mensagens de commit) e registrar a resposta em "Idioma do código" nas Development Conventions do `project.md`. Os demais campos de Development Conventions que nenhuma resposta cobriu SHALL ser perguntados como os campos sem decisão da Stack Summary.

#### Scenario: Código em inglês

- **WHEN** o responsável escolhe inglês para o código
- **THEN** o `project.md` gerado registra o idioma em "Idioma do código", e não "Adiado"

### Requirement: Opções de fila compatíveis com o banco

A pergunta 3.8 do `/opsx:init` SHALL oferecer tipos de fila (no próprio banco, em Redis, em broker dedicado, por agendamento simples e por serviço gerenciado) com exemplos compatíveis com a linguagem da 3.1 e o banco da 3.3. A checagem de coerência SHALL apontar uma biblioteca de fila presa a um banco diferente do escolhido na 3.3.

#### Scenario: Fila no SQL Server

- **WHEN** o responsável escolheu SQL Server na 3.3 e precisa de jobs
- **THEN** a 3.8 oferece uma opção de fila no próprio banco sem citar só bibliotecas de PostgreSQL

#### Scenario: pg-boss com outro banco

- **WHEN** o responsável escolhe pg-boss na 3.8 e SQLite na 3.3
- **THEN** a checagem de coerência aponta que o pg-boss exige PostgreSQL e propõe fila no banco escolhido ou registrar o banco extra

### Requirement: Documento de arquitetura gerado pelo init

O `/opsx:init` SHALL gerar `<root>/openspec/arquitetura.md` a partir das respostas confirmadas, com: visão geral, estilo e organização, componentes e responsabilidades, comunicação, um diagrama Mermaid dos componentes, dados, infraestrutura e deploy, observabilidade e segurança, decisões com links para as ADRs geradas e pontos adiados. A seção "Architecture" do `project.md` gerado SHALL resumir e apontar para esse documento.

#### Scenario: Init concluído

- **WHEN** o responsável confirma a entrevista
- **THEN** o store tem `openspec/arquitetura.md` com o diagrama Mermaid e os links para as ADRs, e a seção "Architecture" do `project.md` aponta para ele

#### Scenario: Componente não escolhido

- **WHEN** o projeto não tem jobs, e-mail nem armazenamento de arquivos
- **THEN** o `arquitetura.md` não inventa esses componentes nem os desenha no diagrama

### Requirement: Init commita os artefatos no store

Depois de gerar os artefatos, o `/opsx:init` SHALL commitar só a pasta `openspec/` da raiz OpenSpec, quando ela estiver num repositório Git, com uma mensagem Conventional Commits, e MUST NOT fazer push. Fora de um repositório Git, SHALL dizer que não commitou e seguir.

#### Scenario: Store num repositório Git

- **WHEN** o responsável confirma a entrevista num projeto cujo store é um repositório Git
- **THEN** o store tem um commit novo com `project-setup.md`, `project.md`, `config.yaml`, `arquitetura.md` e as ADRs, e nada mais do que estava preparado no índice entra nele

#### Scenario: Sem Git

- **WHEN** a raiz OpenSpec não está num repositório Git
- **THEN** o init gera os arquivos, informa que não houve commit e termina sem erro

### Requirement: Opção sem autenticação

A pergunta de autenticação do `/opsx:init` SHALL oferecer a opção "Sem autenticação no MVP", para que a decisão fique registrada sem depender de "Outro" e possa ser considerada pela checagem de coerência.

#### Scenario: Projeto sem login no MVP

- **WHEN** o responsável decide que o MVP não terá autenticação
- **THEN** existe uma opção que registra essa decisão, sem precisar de "Outro"

### Requirement: Inferências marcadas no init

O `/opsx:init` SHALL marcar com `[INFERIDO: <base>]` o que os arquivos gerados afirmam sem ter vindo de uma resposta da entrevista ou do arquivo de respostas, e SHALL listar essas marcas no resumo final, pedindo a confirmação de cada uma. Uma marca confirmada perde o marcador; uma recusada sai do arquivo.

#### Scenario: Componente deduzido

- **WHEN** o `arquitetura.md` gerado cita um componente "fila de e-mails" que nenhuma resposta mencionou
- **THEN** a linha leva `[INFERIDO: <base>]`, e o resumo final pergunta se o componente fica
