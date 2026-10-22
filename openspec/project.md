# {{Nome do Projeto}} — Project Overview

## Product Vision

> Descreva em 2-3 frases o que o produto faz, para quem e qual problema resolve.
> Apague este bloco quando preencher.

## System Boundaries

**Dentro do escopo:**

- A definir

**Fora do escopo (próximas propostas):**

- A definir

## Architecture

> Descreva a arquitetura macro: monólito, microsserviços, módulos principais.
> Apague este bloco quando preencher.

## Domain Model

| Entidade | Responsabilidade |
|---|---|
| A definir | — |

## Capabilities

| Capability | Estado | Change |
|---|---|---|
| A definir | Não iniciado | — |

## Key Constraints

- A definir

## Stack Summary

| Camada | Tecnologia |
|---|---|
| Framework | A definir |
| Linguagem | A definir |
| Banco | A definir |
| Auth | A definir |
| Testes | A definir |
| Deploy | A definir |

## Comandos de verificação

Comandos deste repositório (o padrão), os mesmos que a CI roda em `.github/workflows/validate.yml`.
Rode-os na raiz, no Git Bash ou num shell POSIX.

| Finalidade | Comando | Observações |
|---|---|---|
| Instalar dependências | `npm install -g @fission-ai/openspec@1.14.2` | Node.js 18+; o repositório não tem `package.json` |
| Executar localmente | Não aplicável | Os scripts de `padrao-openspec/scripts/` rodam sob demanda, contra um projeto |
| Testes | Passos `run:` dos jobs `store` (em `padrao-openspec/`) e `root` do `validate.yml` | Smoke tests do instalador, do setup, do script de entrada, das métricas e do guia; o job `store` roda em Ubuntu e em Windows |
| Lint | `npx markdownlint-cli2@0.23.2 "**/*.md"` | Na raiz e em `padrao-openspec/` |
| Typecheck/build | `node --check` em cada `padrao-openspec/scripts/*.mjs`; `node padrao-openspec/scripts/sync-root.mjs --check`; `openspec validate --all --strict` | O validate roda na raiz e em `padrao-openspec/` |
| Migrações | Não aplicável | Sem banco de dados |
| Auditoria de dependências | Não aplicável | Sem dependências npm; o CLI e o markdownlint têm versão fixa |
| Varredura de secrets | Adiado: definir na primeira change que precisar | Candidato: gitleaks, numa change própria que também o ponha na CI |

## Git & Process

- Conventional Commits
- Toda mudança de comportamento passa por `/opsx:propose` antes do código
- Change que altera um script interativo (`comecar.mjs`, `setup-project.mjs` ou outro que pergunte no
  terminal) SHALL ter, antes da release, um teste do responsável num console real do Windows
  (PowerShell), com as respostas digitadas, registrado no `verification.md` como cobertura fora da
  suíte; sem ele, o verify registra o item como não verificado e a release espera
