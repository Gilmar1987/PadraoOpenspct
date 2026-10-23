# {{Nome do Projeto}} — Project Overview

> Preencha este documento na inicialização do projeto. Substitua os exemplos e comentários por decisões reais; use `A definir` quando algo ainda estiver em aberto.

## Product Vision

<!-- Que problema o produto resolve, para quem e qual resultado pretende alcançar? -->

## System Boundaries

**Dentro do escopo:**

- <!-- Capacidades incluídas -->

**Fora do escopo:**

- <!-- Itens adiados ou explicitamente excluídos -->

## Users and Stakeholders

| Perfil | Necessidades e responsabilidades |
|---|---|
| | |

## Architecture

<!-- Resumo de 3 a 5 linhas, sem assumir uma stack específica. O detalhe (componentes, comunicação,
     diagrama, dados e deploy) fica em [Arquitetura detalhada](arquitetura.md), gerado pelo /opsx:init. -->

### Componentes e limites

| Componente | Responsabilidade | Dependências |
|---|---|---|
| | | |

### Fluxo de dados e integrações

<!-- Registre os fluxos e sistemas externos relevantes. -->

## Domain Model

| Conceito | Responsabilidade | Regras importantes |
|---|---|---|
| | | |

## Capabilities

| Capability | Estado | Change relacionada |
|---|---|---|
| | | |

## Key Constraints

- <!-- Regras de negócio, segurança, privacidade, desempenho, disponibilidade ou compliance -->

## Precedência dos documentos

<!-- Ordem usada num conflito entre documentos. Ajuste se o projeto precisar; o padrão é: -->

1. Contrato de interface: <!-- caminho do contrato, ou "não aplicável" -->
2. Specs principais (`openspec/specs/`)
3. Arquitetura (`openspec/arquitetura.md` e este `project.md`)
4. ADRs `Accepted` (`openspec/adrs/`)
5. Código

Divergências declaradas ficam em `openspec/lacunas.md`.

## Stack Summary

| Área | Escolha do projeto | Observações |
|---|---|---|
| Linguagem/runtime | <!-- A definir --> | |
| Framework/plataforma | <!-- A definir --> | |
| Persistência | <!-- A definir ou não aplicável --> | |
| Autenticação/autorização | <!-- A definir ou não aplicável --> | |
| Validação | <!-- A definir --> | |
| Testes | <!-- A definir --> | |
| Build/execução | <!-- A definir --> | |
| Deploy/infraestrutura | <!-- A definir ou não aplicável --> | |
| Observabilidade | <!-- A definir --> | |

## Comandos de verificação

| Finalidade | Comando | Observações |
|---|---|---|
| Instalar dependências | <!-- A definir --> | |
| Executar localmente | <!-- A definir --> | |
| Testes | <!-- A definir --> | |
| Lint | <!-- A definir ou não aplicável --> | |
| Typecheck/build | <!-- A definir ou não aplicável --> | |
| Migrações | <!-- A definir ou não aplicável --> | |
| Auditoria de dependências | <!-- A definir ou não aplicável --> | |
| Varredura de secrets | <!-- A definir ou não aplicável --> | |
| Conferência de lacunas | <!-- Não aplicável enquanto openspec/lacunas.md estiver vazio; depois, o teste do projeto que confere as fontes, se houver --> | |

## Development Conventions

- **Idioma do código:** <!-- A definir -->
- **Idioma dos textos visíveis ao usuário:** <!-- A definir -->
- **Organização e estilo:** <!-- A definir -->
- **Git e revisão:** <!-- A definir -->
- **Testes e critérios de qualidade:** <!-- A definir -->
- **Segurança e tratamento de dados:** <!-- A definir -->

## Open Questions

- <!-- Decisões pendentes que possam afetar escopo, comportamento ou arquitetura -->
