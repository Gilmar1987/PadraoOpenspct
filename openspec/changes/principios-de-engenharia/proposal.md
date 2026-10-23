# Proposal

## Why

O responsável trouxe um guia de conformidade, o `OPENSPEC_COMPLIANCE_AGENT.md`, com três pilares de engenharia: fundamentos e arquitetura, segurança e operação, e visão de negócio. A auditoria do padrão contra esse guia (2026-10-22) mostrou um ponto em comum: o padrão registra as decisões no `/opsx:init`, mas nada as cobra a cada change. Exemplos:

- o init escolhe a ferramenta de validação de entrada (3.7) e a de logs (6.1), mas o apply e o verify não conferem que a change as use nas fronteiras;
- o `rules.md` proíbe dados pessoais em logs, mas nem a revisão de código nem o verify procuram por isso;
- nada confere se a resposta de erro devolve a mensagem interna da exceção;
- a revisão de código não tem critérios de responsabilidade única, extensão sem modificação ou reaproveitamento dos padrões já usados no projeto;
- o teste não cita o requisito nem o cenário que cobre;
- o "Why" do proposal não precisa citar o objetivo do produto que a change atende.

O padrão é generalista ([ADR-0003](../../adrs/0003-padrao-sem-stack-embutida.md)), então os pilares entram como regras que apontam para as decisões de cada projeto, e não como os exemplos de TypeScript do guia.

## What Changes

- **Regras (`rules.md`):**
  - na seção 3, um bloco "Princípios de engenharia": responsabilidade única, extensão sem modificação, padrões existentes antes de padrões novos, contrato de entrada tipado e entidade separada do esquema de persistência, e teste que cita o requisito e o cenário;
  - na seção 5, três itens novos: toda entrada de fronteira externa passa pela ferramenta de validação do `project.md`; mutações e fronteiras críticas registram os estados `iniciado`, `sucesso` e `falha`; respostas de erro não devolvem a mensagem interna, o stack trace nem dados pessoais.
- **Config base (`config.yaml`):**
  - proposal: o "Why" cita o objetivo do produto ou a capability do `project.md` que a change atende;
  - design: indicar o padrão de projeto existente que a change segue, ou justificar um novo;
  - tasks: os testes de cada cenário citam o requisito e o cenário no nome ou num comentário.
- **Revisão de código:** o template do `requesting-code-review` e o subagente `openspec-code-reviewer` ganham os critérios dos três pilares.
- **Verify:** nova heurística "Engineering principles", igual no comando e na skill, que confere as fronteiras e os erros da change, com severidade por item.
- **Init e `project.md`:** a seção "Development Conventions" ganha a linha "Princípios de engenharia", preenchida pelo init com os padrões do guia (log de três estados, validação na fronteira e erro sem detalhe interno). O projeto pode marcar o log de três estados como "Não aplicável", com justificativa, e o verify respeita isso; a validação na fronteira e o erro sem detalhe interno valem sempre.
- **CI:** marcadores dos trechos novos.
- **Versão:** pelo modelo de versão acumulada, é a primeira change depois da release v1.13.0: sobe o `VERSION` para 1.14.0 e abre a seção `## 1.14.0` no `CHANGELOG.md` (se outra change entrar antes, acrescenta itens à seção que ela abrir); a release sai só quando o responsável pedir.

### Fora do escopo

- Reescrever código existente dos projetos: as regras valem para o código que cada change escreve.
- O passo de "aplicação irrestrita" do guia: ele contraria a regra de aprovação (`rules.md`, seção 2) e o portão.
- Ferramentas de uma stack (Zod, OpenTelemetry, Jest, Gherkin executável). O padrão cita exemplos de vários ecossistemas e usa as ferramentas que o projeto registrou.
- O contrato nas APIs, que é da change `contratos-de-interface`, e a rastreabilidade entre ADR e teste, que é da `lacunas-e-adrs-verificaveis`.

## Capabilities

### New Capabilities

- `engineering-principles`: princípios de design, observabilidade, validação de entrada, erro sem vazamento e rastreabilidade entre teste, requisito e objetivo, cobrados no planejamento, na revisão e no verify.

### Modified Capabilities

Nenhuma.

## Impact

- **Arquivos:**
  - `padrao-openspec/openspec/rules.md`, `padrao-openspec/openspec/config.yaml` e `padrao-openspec/openspec/project.md`;
  - `padrao-openspec/.claude/commands/opsx/init.md`, `verify.md` e `skills/openspec-verify-change/SKILL.md`;
  - `padrao-openspec/.claude/skills/requesting-code-review/code-reviewer.md` e `padrao-openspec/.claude/agents/openspec-code-reviewer.md`;
  - `.github/workflows/validate.yml`, `README.md`, `padrao-openspec/VERSION` e `CHANGELOG.md`;
  - os espelhos da raiz, pelo `sync-root.mjs`.
- **Riscos:**
  - **Dados pessoais:** a change não coleta nem trata dados; ela reforça a regra de não expô-los em logs e erros.
  - **Autenticação, esquema de dados e variáveis de ambiente:** não se aplicam.
  - **Compatibilidade:** projetos existentes recebem as regras novas pelo PR de atualização. O verify passa a apontar warnings em changes novas que não registrem os três estados de log, a menos que o `project.md` marque o item como "Não aplicável". O CHANGELOG pede para revisar a linha "Princípios de engenharia".
  - **Peso para projetos pequenos:** o log de três estados vale só para mutações e fronteiras críticas, e o projeto pode desligá-lo com justificativa.
- Changes concorrentes: nenhuma ativa nesta raiz. Em outras branches e worktrees, tocam os mesmos arquivos:
  - `lacunas-e-adrs-verificaveis`: verify, `rules.md` seção 1 e `project.md`;
  - `contratos-de-interface`: init, verify, `rules.md` seção 3 e `project.md`;
  - `debitos-e-camadas-de-verificacao`: init, verify e `project.md`;
  - `validacao-e-paralelismo` (outra sessão): `rules.md`, com a seção nova 8.

  Nenhuma tem capability em comum com esta. Ordem sugerida: depois das que já estão na fila, com rebase na main antes do apply.

## Aprovação

- Responsável: Gilmar Campelo
- Data: 2026-10-23
- Escopo: archive
- Condições: verify sem críticos; o fluxo vai até o PR, e o merge fica com o responsável
- Origem: "Aprovo : 1, 2, 3, 4 e 5", em resposta a "1. principios-de-engenharia: está planejada, com a aprovação pendente. Se aprovar, faço o rebase na main, confiro os arquivos que mudaram desde a proposta e sigo o fluxo completo: apply, revisão, verify, archive com selo e PR."
- Conteúdo: sha256:7452642c2d49411e1f018c56a242c5d33f17827c67269ccae1a28dca55ef34da
