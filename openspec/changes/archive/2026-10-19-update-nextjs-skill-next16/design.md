# Design

## Context

- A skill `padrao-openspec/.claude/skills/nextjs-implementation/SKILL.md` foi escrita à mão (não é gerada pelo CLI) e é coberta pelo lint de Markdown do `padrao-openspec`.
- Ela já manda consultar a documentação da versão instalada e cita `node_modules/next/dist/docs/` (a partir do Next.js 16.2).
- O teste de ponta a ponta usou o `create-next-app` 16.4.2, que liga `cacheComponents` e `partialPrefetching` por padrão.

## Architecture Decisions

Não há ADR nova: a mudança é de conteúdo da skill de stack. Segue a [ADR-0001](../../../adrs/0001-padrao-openspec-fonte-unica.md) (editada em `padrao-openspec/`, espelhada pelo sync).

## Goals / Non-Goals

**Goals:**

- Um agente que siga a skill num app Next.js 16 recém-criado não tropeça nos quatro problemas do teste.

**Non-Goals:**

- Ensinar Next.js; a skill continua delegando o framework às skills oficiais e à documentação embutida.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/.claude/skills/nextjs-implementation/SKILL.md` | seções 1, 3, 4 e 5 | espelho em `.claude/skills/` (sync); projetos que reinstalarem |

## Decisions

### D1. Typecheck condicionado à versão

Na seção 5, a linha do typecheck passa a ser:

```text
<pm> exec next typegen && <pm> exec tsc --noEmit  # Next.js 15.5+, if there is no typecheck script
<pm> exec tsc --noEmit                            # older versions
```

Uma frase explica que os tipos de rota (`LayoutProps`, `PageProps`) vêm do `next typegen`.

### D2. Subseção "Rendering model in Next.js 16"

Entra na seção 4, depois das regras gerais e antes de "Database migrations". Ela diz:

- **Detecção:** verificar `cacheComponents` (e `partialPrefetching`) no `next.config`; o `create-next-app` 16 liga por padrão.
- **Leitura sem cache:** acesso a arquivo, banco ou relógio fora de cache é dinâmico. Ele deve ser marcado com a API que a versão instalada documenta e envolvido em `<Suspense>`. A skill não fixa o nome da API, porque ele muda entre versões; ela manda ler a documentação embutida.
- **Formulários sem JavaScript:** com o modelo novo, um POST de formulário sem JavaScript não devolve a página inteira. O design deve registrar se o formulário exige JavaScript; se o spec pedir funcionamento sem JavaScript, isso vira decisão explícita e teste próprio.
- **Rotas PPR:** aparecem como parcialmente pré-renderizadas no build, e não como "dinâmicas". O agente não deve tratar isso como erro.

### D3. Testes de Server Action e interface

Duas mudanças na seção 3:

- **Tabela:** a linha "Server Action or Route Handler logic" passa a indicar teste unitário da função extraída e teste em navegador (Playwright ou Cypress) para o fluxo, com a nota "not a raw HTTP POST".
- **Regra nova:** se o projeto decidiu não ter E2E, os cenários só de interface são cobertos por uma verificação em navegador versionada no repositório (por exemplo, em `scripts/`) e declarados no verify como cobertura fora da suíte.

### D4. Versão de dependência existente

A regra "Add a dependency only when the design justifies it" ganha uma continuação:

- quando uma dependência exige uma versão maior de outra já instalada (conflito de peer), subir a existente para a menor versão compatível;
- registrar o motivo no design ou na tarefa;
- não usar `--force` nem `--legacy-peer-deps` para contornar.

### D5. Criação do app

Na seção 1, um item novo antes da lista de descoberta: "If the repository has no app yet and `create-next-app` refuses the folder because of `.agents/`, `.github/` or `openspec/`, generate the app in a temporary folder, copy the files without `node_modules`, and run the install in the code repository."

## Risks / Trade-offs

- **[A orientação de Next.js 16 pode envelhecer]** → as regras são condicionadas à presença de `cacheComponents` e à versão, e remetem à documentação embutida.
- **[A skill fica mais longa]** → as adições somam cerca de 15 linhas, em seções já existentes.
