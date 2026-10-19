# project-initialization Specification

## Purpose

Define como o `/opsx:init` conduz a inicialização de um projeto: as perguntas, o complemento dos campos do preset ativo, as ADRs geradas, a precedência da decisão de testes e o uso de respostas pré-preenchidas.

## Requirements

### Requirement: Complemento dos campos do preset

Depois do bloco 6, o `/opsx:init` SHALL perguntar cada campo da Stack Summary do preset ativo que continua "A definir" e não foi coberto pelas respostas, oferecendo as opções listadas no próprio preset, "Adiar" e "Outro". A opção "Adiar" MUST gravar "Adiado: decidir na primeira change que precisar".

#### Scenario: Gerenciador de pacotes não perguntado

- **WHEN** o preset `nextjs` está ativo e os blocos 1 a 6 não definiram o gerenciador de pacotes
- **THEN** o bloco 7 pergunta o gerenciador de pacotes com as opções npm, pnpm, Yarn e Bun, mais "Adiar" e "Outro"

#### Scenario: Campo adiado

- **WHEN** o responsável escolhe "Adiar" para a biblioteca de componentes de UI
- **THEN** o `project.md` registra "Adiado: decidir na primeira change que precisar" nesse campo, e o projeto não é considerado "não inicializado" por causa dele

### Requirement: Opções que cobrem as stacks dos presets

As perguntas 3.1, 3.5 e 6.4 SHALL oferecer, respectivamente, o back-end no próprio app Next.js, a opção de nenhum ORM e a opção de nenhuma proteção no MVP. A pergunta 5.3 SHALL explicar que, sem CI, as respostas viram verificações locais obrigatórias.

#### Scenario: Projeto Next.js sem servidor separado

- **WHEN** o responsável responde a 3.1 num projeto em que o back-end são Route Handlers e Server Actions do Next.js
- **THEN** existe uma opção que descreve esse caso, sem precisar de "Outro"

### Requirement: Precedência da decisão de testes

A decisão de E2E registrada pelo projeto SHALL prevalecer sobre a regra padrão do preset. Quando o projeto decidir não ter E2E, o `config.yaml` gerado pelo init MUST orientar a cobrir cenários de interface com verificação em navegador versionada, e não com E2E.

#### Scenario: Projeto Next.js sem E2E

- **WHEN** o responsável responde "Não aplicável" à pergunta de E2E num projeto com o preset `nextjs`
- **THEN** o `operations.apply.guidance` do `config.yaml` gerado não exige E2E e orienta a verificação em navegador versionada para cenários de interface

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
