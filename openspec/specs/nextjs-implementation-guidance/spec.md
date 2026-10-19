# nextjs-implementation-guidance Specification

## Purpose

Define o que a skill de stack `nextjs-implementation` orienta para que o agente implemente e verifique changes em projetos Next.js atuais sem tropeçar em comportamentos de versão, ferramentas e criação do app.

## Requirements

### Requirement: Typecheck compatível com o Next.js 16

Quando o projeto usa Next.js 15.5 ou mais recente e não tem script de typecheck, a skill SHALL recomendar `next typegen && tsc --noEmit` como comando de typecheck.

#### Scenario: App recém-criado sem script de typecheck

- **WHEN** o agente consulta a seção de comandos de validação da skill num projeto com Next.js 16
- **THEN** a skill indica `next typegen && tsc --noEmit`, e não apenas `tsc --noEmit`

### Requirement: Modelo de renderização com cacheComponents

A skill SHALL orientar a detectar `cacheComponents` no `next.config`. Quando ele estiver ligado, a skill SHALL orientar a marcar a leitura sem cache com a API documentada pela versão instalada, envolvê-la em `<Suspense>` e registrar no design se os formulários funcionam sem JavaScript.

#### Scenario: Leitura de arquivo numa página

- **WHEN** a change lê um arquivo local numa página de um projeto com `cacheComponents` ligado
- **THEN** a skill orienta a consultar `node_modules/next/dist/docs` para a API de leitura sem cache e a envolver o trecho em `<Suspense>`

### Requirement: Teste de Server Actions

A skill SHALL orientar a testar a lógica de uma Server Action pela função extraída e o fluxo por teste em navegador. Ela MUST NOT recomendar POST HTTP cru como evidência do fluxo.

#### Scenario: Cenário de cadastro por formulário

- **WHEN** um cenário descreve o envio de um formulário tratado por Server Action
- **THEN** a tabela de cenários da skill aponta teste unitário da função extraída e teste em navegador, sem citar POST HTTP

### Requirement: Cenários de interface sem E2E

Quando o projeto decidiu não ter E2E, a skill SHALL orientar a cobrir cenários só de interface com uma verificação em navegador versionada no repositório, e a declarar essa cobertura no verify.

#### Scenario: Projeto sem E2E

- **WHEN** o `project.md` registra "sem E2E" e a change tem um cenário de erro exibido junto do campo
- **THEN** a skill orienta a versionar a verificação em navegador e a citá-la no verify como cobertura não automatizada pela suíte de testes

### Requirement: Atualização de versão de dependência existente

A skill SHALL permitir subir a versão de uma dependência existente quando outra dependência exigir, com o menor salto compatível, registrado no design ou na tarefa.

#### Scenario: Conflito de peer dependency

- **WHEN** a instalação de uma dependência nova falha porque exige uma versão maior de uma dependência existente
- **THEN** a skill orienta a subir a dependência existente para a menor versão compatível e a registrar o motivo

### Requirement: Criação do app num repositório preparado

A skill SHALL orientar o caso em que o `create-next-app` recusa a pasta por causa de `.agents/`, `.github/` ou `openspec/`: gerar o app numa pasta temporária, copiar os arquivos sem `node_modules` e instalar as dependências no repositório de código.

#### Scenario: create-next-app recusa a pasta

- **WHEN** o `create-next-app` sai com erro de conflito no repositório de código
- **THEN** a skill indica gerar numa pasta temporária, copiar sem `node_modules` e rodar a instalação no repositório
