# Design

## Context

- O `/opsx:init` tem a seção "Checagem de coerência" com uma tabela de nove combinações (5.7×5.9, 5.2×5.8, 3.8×2.5, 2.4×2.1, 4.4×4.1, 5.5×5.3, 1.5×6.5, 3.8×3.3 e 3.8×bloco 4) e registra as decisões no `project-setup.md`. A 1.5×6.5 (dados pessoais sem controles de LGPD) entrou na v1.3.1.
- O bloco 7.1 pergunta os comandos de verificação, inclusive "Auditoria de dependências" e "Varredura de secrets", com "Não aplicável", "Adiar" e "Outro". Desde a v1.4.0 ele sugere ferramentas do ecossistema para as duas, e o apply roda a varredura antes de cada commit e a auditoria quando a change mexe em dependências. "Não aplicável" continua aceito sem aviso, e aí nada roda.
- A pergunta 3.6 (autenticação) tem cinco opções de mecanismo e "Outro"; não há "sem autenticação". A 1.5 registra dados pessoais ou sensíveis; a 6.4 é de múltipla escolha e tem "0) Nenhuma no MVP".
- O verify (skill e comando) tem as heurísticas "Project validation commands" e "Evidence reuse" e grava itens e comandos no `verification.md`; nada fala de relatórios externos.
- O controleCondominio mostrou o efeito: auditoria e varredura "Não aplicável no MVP", sem autenticação e sem proteção, com CPF; e um relatório externo com cerca de 11 falsos positivos em 16 achados.

## Architecture Decisions

Não há ADR nova: as mudanças são regras de processo na entrevista e no verify, sem decisão de stack nem padrão transversal novo. Seguem a [ADR-0003](../../adrs/0003-padrao-sem-stack-embutida.md) (ferramentas citadas só como exemplos de vários ecossistemas) e a [ADR-0004](../../adrs/0004-distribuicao-versionada-do-padrao.md) (versão e CHANGELOG).

## Goals / Non-Goals

**Goals:**

- Nenhum projeto desliga a auditoria de dependências ou a varredura de secrets sem uma decisão explícita e justificada.
- A combinação "dados pessoais + sem autenticação + sem proteção" sempre vira uma decisão registrada no `project.md`.
- Um relatório externo é triado com evidência, sem corrigir falsos positivos nem descartar achados reais.

**Non-Goals:**

- Detectar vulnerabilidades: isso é papel das ferramentas que cada projeto registra.
- Mudar o comportamento de projetos já inicializados.

## Decisions

### D1. Opção "sem autenticação" na 3.6

```text
0) Sem autenticação no MVP
1) JWT Bearer — ...
...
6) Outro (digitar livremente)
```

O `0)` segue o padrão das perguntas que admitem "nenhum" (3.5, 6.4). Ele não é "pular": gera a ADR de autenticação com a restrição explícita, como já fazem as respostas negativas.

### D2. Combinações novas na checagem de coerência

Linhas novas na tabela da seção "Checagem de coerência" do `init.md`:

| Combinação | Consequência | Proposta |
|---|---|---|
| 7.1 "Auditoria de dependências" é "Não aplicável" e a stack (3.1, 3.2, 3.5) usa dependências de terceiros | Vulnerabilidades conhecidas nas dependências não serão detectadas por nenhuma etapa do fluxo | Registrar a ferramenta do ecossistema (por exemplo, `npm audit`, `pip-audit`, `dotnet list package --vulnerable`, `osv-scanner`) ou "Adiar" com justificativa |
| 7.1 "Varredura de secrets" é "Não aplicável" e o projeto usa credenciais (4.4 com `.env` ou cofre, banco na 3.3, serviços externos na 3.9 ou 3.10) | Um secret commitado por engano não será detectado | Registrar uma ferramenta que examine o conteúdo a commitar (por exemplo, `gitleaks git --staged`, `trufflehog filesystem .`, `git secrets --scan`) ou "Adiar" com justificativa |
| 1.5 tem dados pessoais ou sensíveis, 3.6 é "Sem autenticação no MVP" e 6.4 é só "0) Nenhuma no MVP" | Qualquer pessoa com acesso à aplicação lê e altera dados pessoais, sem limite de requisições | Registrar em "Key Constraints" do `project.md` a restrição "uso só em ambiente local, com dados de teste, até existir autenticação", ou adotar autenticação (3.6) e limite de requisições (6.4) |

A terceira combinação complementa a 1.5×6.5 (LGPD), que não muda: uma trata de quem acessa os dados, a outra dos direitos do titular, e as duas podem aparecer na mesma entrevista.

Quando a terceira combinação é mantida, o init MUST levar a restrição para o `project.md` (Key Constraints) e para a ADR de autenticação; a justificativa sozinha no `project-setup.md` não basta, porque é o `project.md` que as changes leem.

### D3. Triagem de relatório externo no verify

Nova heurística, igual na skill e no comando de verify, depois de "Evidence reuse":

> **External report triage**: when the user or the change provides a report from an external analysis tool (static analysis, dependency scanner, automated review), triage every finding before acting on it. Confirm it in the code (file and line), in the configuration and in the recorded decisions (ADRs, `project.md` constraints). Classify it as **real**, **not applicable** (the pattern exists but cannot be exploited here, with the reason), **accepted risk** (cite the ADR or recorded decision) or **false positive** (cite the code that disproves it). Keep the reported severity, or raise it, for every real finding; never lower it to make the report look better. A finding you cannot confirm or disprove stays not verified, with the reason. Real findings become `Itens:` of the verification record with their severity; add one line under `Triagem:` per finding with its class and evidence.

O formato do `verification.md` ganha a seção opcional `Triagem:` (só quando houver relatório), depois de `Comandos:`:

```markdown
Triagem:

- <tool>: <finding> → real | não se aplica | risco aceito (<ADR/decisão>) | falso positivo — <evidência>
```

As linhas de contagem não mudam; o `flow-metrics.mjs` continua lendo só elas.

### D4. Versão e CHANGELOG

- `padrao-openspec/VERSION`: `1.6.0`.
- `CHANGELOG.md`: seção `## 1.6.0` no topo, acima da `1.5.0`, com "O que mudou" (D1 a D3) e "Ações no projeto": rever no `project.md` do store as respostas "Não aplicável" para auditoria de dependências e varredura de secrets e, se o projeto trata dados pessoais sem autenticação, registrar a restrição de uso em "Key Constraints".

### D5. CI

O passo "Trechos customizados das skills" exige "External report triage" na skill e no comando de verify.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/.claude/commands/opsx/init.md` | D1, D2 | espelho da raiz |
| `padrao-openspec/.claude/commands/opsx/verify.md`, `skills/openspec-verify-change/SKILL.md` | D3 | espelhos |
| `padrao-openspec/VERSION`, `CHANGELOG.md` | D4 | passo "Versão e changelog" da CI; workflow de atualização dos projetos |
| `.github/workflows/validate.yml` | D5 | nenhum |

## Risks / Trade-offs

- [Entrevista mais longa] → as combinações só aparecem quando ocorrem; sem elas, uma linha.
- [Triagem usada para descartar achados reais] → regra explícita de nunca baixar a severidade de um achado confirmado e de deixar "não verificado" o que não foi conferido.
- [Outra sessão altera o `init.md` com frequência] → rebasear na `main` antes do apply e conferir que as linhas da tabela de coerência da `main` continuam lá depois da edição; se outra versão sair antes, a desta change passa a ser a próxima minor livre.

## Migration Plan

Projetos existentes recebem as skills novas pelo PR de atualização (`1.6.0`) e fazem as "Ações no projeto" do CHANGELOG. Rollback: reverter os commits e voltar o `VERSION` para `1.5.0`.

## Open Questions

Nenhuma.
