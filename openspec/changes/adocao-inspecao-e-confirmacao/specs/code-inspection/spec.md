## ADDED Requirements

### Requirement: Inspeção somente leitura do código

O script de inspeção SHALL ler só os arquivos rastreados pelo Git do repositório informado, pulando binários, pastas geradas (`vendor/`, `dist/`, `build/`, `out/`, `target/`, `bin/`, `obj/`, `coverage/`, `.next/`), arquivos minificados e os arquivos gerenciados pelo padrão. Ele MUST NOT executar código, testes ou gerenciadores de pacote do projeto, MUST NOT acessar a rede e MUST NOT escrever no repositório.

#### Scenario: Arquivo não rastreado ignorado

- **WHEN** o repositório tem um `package.json` rastreado sem `fastify` e um `extra/package.json` não rastreado com `fastify`
- **THEN** a saída não detecta Fastify na 3.1

#### Scenario: Script de pacote não executado

- **WHEN** o `package.json` rastreado tem um `postinstall` que criaria um arquivo
- **THEN** depois da inspeção, o arquivo não existe e o `git status` do repositório continua igual ao de antes

### Requirement: Respostas detectadas com evidência e confiança

Para cada pergunta do init que o catálogo cobre, a saída SHALL trazer o valor detectado (o número da opção da pergunta), o rótulo, o nível (`alta`, `media` ou `baixa`), as evidências (arquivo, linha e trecho) e os conflitos. Duas ou mais respostas com evidência para uma pergunta de resposta única SHALL vir como conflito, sem valor escolhido.

#### Scenario: Back-end Node com Fastify

- **WHEN** o `package.json` declara `fastify` e um arquivo de código o importa
- **THEN** a 3.1 sai com valor `1`, nível `alta` e as duas evidências com arquivo e linha

#### Scenario: Dois bancos

- **WHEN** o `docker-compose.yml` sobe PostgreSQL e um arquivo de teste usa SQLite
- **THEN** a 3.3 sai como conflito, com as evidências de cada banco e sem valor escolhido

### Requirement: Perguntas que exigem leitura do agente

O script SHALL listar em `requerLeitura` as perguntas que só a leitura do código responde (1.3, 2.3, 6.5 e 7.4) e as que ele cobre só em parte (1.2, 1.5, 1.6, 2.1 e 2.4), com as pistas que encontrou como evidências, e MUST NOT dar a elas confiança acima de `media`.

#### Scenario: Regras de negócio

- **WHEN** o código tem a pasta `src/handlers/` com classes de comando
- **THEN** a 2.3 aparece em `requerLeitura`, com a pasta como pista, e não tem nível `alta`

### Requirement: Saída sem secrets nem dados pessoais

A saída MUST NOT conter valores de secrets nem dados pessoais. De arquivos `.env*`, SHALL registrar só a existência e, do `.env.example`, só os nomes das chaves; um `.env` rastreado SHALL virar aviso de risco. Do histórico do Git, SHALL registrar só o número de pessoas. Trechos SHALL ter no máximo 120 caracteres, com valores que pareçam segredo trocados por `***`.

#### Scenario: Arquivo .env rastreado

- **WHEN** o repositório rastreia um `.env` com `DATABASE_URL=postgres://u:VALOR_FALSO_123@db/app`
- **THEN** a saída tem o aviso de risco do `.env` e nenhuma ocorrência de `VALOR_FALSO_123`

### Requirement: Arquivos de dados sem trecho

Uma evidência tirada de arquivo de dados (nome começando com `seed`, `*.csv`, `*.sql` com `INSERT`, pastas `fixtures/` ou `testdata/`) SHALL trazer só o arquivo e a linha, sem trecho.

#### Scenario: Seed com dados pessoais

- **WHEN** o `seed.sql` tem `INSERT` com CPF e e-mail fictícios e é a evidência de um campo `cpf` da 1.5
- **THEN** a evidência traz o arquivo e a linha, sem o campo `trecho`

### Requirement: Limites e escopo da inspeção

O script SHALL ler até 20.000 arquivos e até 1 MB por arquivo. Passando dos limites, SHALL marcar `truncado: true` e contar o que ficou de fora. Com `--escopo`, SHALL ler só as pastas informadas. A mesma entrada SHALL produzir a mesma saída, com listas em ordem estável.

#### Scenario: Escopo restrito

- **WHEN** o script roda com `--escopo apps/api` num monorepo com `apps/api` e `apps/web`
- **THEN** nenhuma evidência vem de `apps/web`

#### Scenario: Saída repetível

- **WHEN** o script roda duas vezes no mesmo repositório
- **THEN** as duas saídas são iguais
