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

### Contratos de interface

| Interface | Direção | Formato | Contrato | Origem (terceiros) |
|---|---|---|---|---|
| <!-- A definir ou Não aplicável --> | | | | |

"Direção" é `expõe`, `consome` ou `ambas`. Uma cópia de contrato de terceiros fica fixada por um
`ORIGEM.md` ao lado dela, com as linhas `Origem:`, `Data:`, `Versão:` e `SHA-256:`. O SHA-256 é do
conteúdo com o fim de linha normalizado para LF, para não mudar entre Windows e Linux:
`node -e "const c=require('crypto');const t=require('fs').readFileSync(process.argv[1],'utf8').replace(/\r\n/g,'\n');console.log(c.createHash('sha256').update(t).digest('hex'))" <arquivo>`. Recomendado: o serviço expõe o
SHA-256 do contrato que implementa (por exemplo, num cabeçalho de resposta), para o consumidor detectar
a divergência.

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

Ordem usada num conflito entre documentos (ajuste se o projeto precisar):

1. Contrato de interface (o da tabela "Contratos de interface"; não aplicável enquanto o projeto não tiver contrato de API)
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
| Teste de contrato | <!-- A definir ou não aplicável --> | Confere o contrato e a implementação nas duas direções |
| Lint | <!-- A definir ou não aplicável --> | |
| Typecheck/build | <!-- A definir ou não aplicável --> | |
| Migrações | <!-- A definir ou não aplicável --> | |
| Auditoria de dependências | <!-- A definir ou não aplicável --> | |
| Varredura de secrets | <!-- A definir ou não aplicável --> | |
| Conferência de lacunas | Não aplicável | Opcional: teste próprio do projeto que compara as fontes com o código. A conferência do registro `openspec/lacunas.md` roda pelo `/opsx:verify` |

## Camadas de verificação

Que camada de teste cobre o quê neste projeto. O `/opsx:verify` registra as camadas que cada change exercitou;
a que se aplica à change e não rodou vira "não verificado". Uma camada "Adiado" também é débito em
[estado-atual.md](estado-atual.md#fora-do-ciclo-atual).

| Camada | O que cobre | Comando ou procedimento | Onde roda |
|---|---|---|---|
| Unitário | <!-- regras de domínio, funções --> | <!-- comando de testes --> | <!-- local, CI --> |
| Contrato | <!-- API x contrato da tabela "Contratos de interface" --> | <!-- Teste de contrato, Adiado ou Não aplicável --> | |
| Arquitetura | <!-- dependências entre camadas, regras das ADRs --> | <!-- Adiado ou Não aplicável --> | |
| E2E | <!-- fluxos de interface --> | <!-- comando de E2E --> | |
| Roteiro manual | <!-- interface sem E2E, conferência humana --> | <!-- roteiro versionado --> | |
| Produção | <!-- verificação depois do deploy --> | <!-- Adiado ou Não aplicável --> | |

## Development Conventions

- **Idioma do código:** <!-- A definir -->
- **Idioma dos textos visíveis ao usuário:** <!-- A definir -->
- **Organização e estilo:** <!-- A definir -->
- **Git e revisão:** <!-- A definir -->
- **Testes e critérios de qualidade:** <!-- A definir -->
- **Segurança e tratamento de dados:** <!-- A definir -->

## Open Questions

- <!-- Decisões pendentes que possam afetar escopo, comportamento ou arquitetura -->
