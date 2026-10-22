# Proposal

## Why

O relatório do teste do Lava Jato (`C:\TesteOpenSpct\response.md`, 2026-10-22) mostrou que o agente desviou da spec ou pulou verificações em pontos que as regras atuais deixam abertos:

- **Escopo não pedido (item 17):** o agente acrescentou, sem perguntar, uma rota pega-tudo para o 404 seguir o idioma. Em desenvolvimento parecia funcionar; em produção, o 404 vinha vazio. A skill de apply manda expor escopo novo, mas não deixa claro que uma "correção" que a spec não pede também é escopo novo.
- **Premissa sobre a API (item 21):** o agente escreveu um parser próprio, que desligava o TLS, porque achou que a biblioteca não aceitava a string de conexão. A assinatura pública dizia o contrário.
- **Versões (item 12):** depois de trocar a versão de uma dependência, o requisito de runtime do projeto (`engines.node`) não foi revisto.
- **Ferramenta que escreve no repositório (item 20):** o `prisma init` instala 10 skills de agente e cria o `.env`. Só não entrou no código porque o agente rodou o comando numa pasta temporária por conta própria.
- **CI quebrado (item 22):** um workflow novo exigia um `.env` que o CI não tem. Só foi pego porque o agente simulou o CI numa cópia limpa, sem regra que pedisse isso.
- **Dependência sem tarefa (item 11):** o proposal listava o Zod no Impact, nenhuma tarefa o instalava, e só a revisão percebeu.
- **Roteiro sem navegador (item 18):** o agente rodou o roteiro de navegador com `curl`, sem cliques. O resultado ficou registrado como se cobrisse a interface.
- **Verify antes da revisão (item 27):** o verify foi chamado com a revisão de código ainda rodando.
- **Contagens de memória (item 28):** o agente anunciou "20 tarefas" quando eram 19, e "três pontos" quando eram quatro.

Além disso, à luz do princípio "se o requisito mudou, aborte, altere a spec e revalide", há uma lacuna própria do padrão: um `/opsx:update` que muda o escopo de uma change aprovada não exige uma nova aprovação. A aprovação registrada continua valendo para um plano que já não é o mesmo.

## What Changes

- **Apply** (`commands/opsx/apply.md` e `skills/openspec-apply-change/SKILL.md`), trechos novos:
  - **"Unrequested fixes are scope"**: uma correção de comportamento que a spec não pede é escopo novo. O agente para, expõe e pergunta, com o exemplo da rota do 404;
  - **"Check the library API"**: antes de escrever um adaptador, parser ou wrapper para uma biblioteca, conferir a API pública (tipos, assinatura, documentação local) e registrar na evidência por que não há solução nativa;
  - **"Revalidate requirements after a version change"**: quando um desvio troca a versão de uma dependência, rever os requisitos de runtime e de compatibilidade do projeto e das outras dependências e registrar;
  - **"Tool generators outside the repository"**: comandos que geram arquivos (`init`, `create`, scaffolds) rodam numa pasta temporária, e só o necessário é copiado, conferindo efeitos em `.claude/`, `.agents/`, `.env` e afins;
  - **"Simulate CI on a clean copy"**: a change que cria ou altera um workflow de CI roda os passos numa cópia com só os arquivos versionados, sem `.env` e sem dependências instaladas, antes de marcar a tarefa;
  - **"Production-mode check"**: mudança de comportamento de servidor ou de rotas é verificada também no modo de produção do projeto, pelos comandos de build e execução do `project.md`, e não só no modo de desenvolvimento.
- **Verify** (`commands/opsx/verify.md` e `skills/openspec-verify-change/SKILL.md`), trechos novos:
  - **"Review before verify"**: numa change que alterou código e não tem `review.md`, o verify para no início, diz que a revisão de código é pré-requisito e oferece rodá-la. Hoje ele segue e registra um crítico;
  - **"Dependencies in Impact"**: cruza as dependências citadas no Impact do proposal com as tarefas e o manifesto de dependências do projeto. Uma dependência sem tarefa ou ausente do manifesto vira warning;
  - **"Agent-run browser scripts"**: um roteiro de navegador executado por agente sem interação (HTTP, sem cliques) é registrado como tal, e o verify pede uma execução humana antes do archive.
- **Update** (`commands/opsx/update.md` e `skills/openspec-update-change/SKILL.md`), trecho novo **"Scope change resets approval"**:
  - uma revisão que muda o escopo de uma change aprovada (o "What Changes", requisitos ou cenários das delta specs, ou tarefas novas ou retiradas) volta a seção `## Aprovação` para `Pendente`, guardando a anterior numa linha "Aprovação anterior";
  - o apply volta a pedir confirmação;
  - correções de texto que não mudam o escopo não zeram a aprovação.
- **Regras globais** (`padrao-openspec/openspec/rules.md`):
  - seção 2: toda correção, inclusive urgente, passa por uma change; uma change pequena basta;
  - seção 7: contagens anunciadas vêm do CLI ou de uma lista montada na hora, nunca de memória.
- **Config base** (`padrao-openspec/openspec/config.yaml`), regra de tasks: toda dependência citada no Impact do proposal aparece numa tarefa.
- **CI e README:** os trechos novos entram na checagem de trechos customizados e na tabela do README.
- **Versão:** `1.7.0`.

### Fora do escopo

- Regras de versão no propose (itens 9 e 10), coerência do init e ferramentas (itens 5, 13 e 24): ficam para a change `init-coerencia-e-ferramentas`.
- Execução paralela e conflito entre changes ativas: change `validacao-e-paralelismo`.
- Citar ferramentas ou stacks específicas nas regras (ADR-0003). Os exemplos usam termos gerais; o caso do 404 é citado só como exemplo de comportamento.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `implementation-safeguards`: escopo não pedido, API da biblioteca, requisitos depois de troca de versão, geradores fora do repositório, simulação do CI e verificação em modo de produção.
- `verification-record`: revisão antes do verify, dependências do Impact e roteiro executado por agente.
- `change-approval`: mudança de escopo pelo update zera a aprovação.
- `agent-context-discipline`: contagens vindas do CLI ou de lista.

## Impact

- **Comandos e skills:** `apply`, `verify` e `update` (6 arquivos), com as cópias da raiz pelo `sync-root`. Os projetos recebem pelo PR de atualização.
- **Regras e config base:** `padrao-openspec/openspec/rules.md` e `padrao-openspec/openspec/config.yaml`.
- **CI e documentação:** `.github/workflows/validate.yml`, `README.md`, `CHANGELOG.md`, `padrao-openspec/VERSION`.
- **Riscos:**
  - **Fluxo mais lento:** paradas a mais no apply e no verify. Mitigação: cada regra só dispara no caso que descreve.
  - **Comportamento do agente não testável pela CI:** a CI só confere que os trechos existem. A eficácia fica para o próximo projeto de teste.
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam; o item 20 reduz o risco de `.env` e skills estranhas entrarem no código.

## Aprovação

- Responsável: Pendente
- Data: —
- Escopo: —
- Condições: —
- Origem: —
