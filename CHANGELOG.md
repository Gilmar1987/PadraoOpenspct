# Changelog

Versões do padrão OpenSpec (PadraoOpenspct). Cada versão traz o que mudou e as ações que um
projeto precisa fazer ao atualizar. A versão vigente está em `padrao-openspec/VERSION`, e cada
versão publicada tem uma tag `vX.Y.Z` com uma GitHub Release ([ADR-0004](openspec/adrs/0004-distribuicao-versionada-do-padrao.md)).

## 1.6.0 — 2026-10-22

### O que mudou

- **Commits do que é gerado:** o `comecar.mjs` passa a oferecer o commit inicial do código e do store
  depois do setup (`--sem-commit` recusa; sem identidade Git, avisa e mostra os comandos), e o
  `/opsx:init` commita no store a pasta `openspec/` que gerou. O projeto já nasce com histórico, que
  o `--update` do instalador exige.
- **Atualização em projeto sem remoto:** os comandos `/opsx:propose`, `/opsx:apply`, `/opsx:verify`
  e `/opsx:archive` continuam avisando de uma versão nova e, quando o repositório de código não tem
  remoto (ou quando você pede), oferecem rodar a atualização à mão; ela só roda com a sua
  confirmação e com a árvore limpa, numa branch `chore/padrao-vX.Y.Z`.

### Ações no projeto

- Nenhuma obrigatória.
- Projetos sem remoto passam a receber, nos comandos do ciclo, a oferta de atualizar à mão.

## 1.5.0 — 2026-10-22

### O que mudou

- **Regras em qualquer agente:** as regras globais ganham fonte única em
  `padrao-openspec/openspec/rules.md` e chegam ao repositório de código como
  `docs/openspec-regras.md`. O instalador mantém um bloco `openspec-padrao`, entre marcadores, em
  `AGENTS.md`, `CLAUDE.md` (que importa o `AGENTS.md`), `GEMINI.md`,
  `.github/copilot-instructions.md` e `.amazonq/rules/openspec-padrao.md`, para que Claude Code,
  Cursor, Codex, Windsurf, Copilot, Gemini CLI e Amazon Q recebam as regras sem configuração
  ([ADR-0005](openspec/adrs/0005-regras-entregues-por-blocos-gerenciados.md)).
- **Guias:** o COMECE-AQUI e o `docs/openspec-padrao.md` ganham a tabela "Usar com outros agentes".

### Ações no projeto

- O PR de atualização cria ou atualiza `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`,
  `.github/copilot-instructions.md`, `.amazonq/rules/openspec-padrao.md` e
  `docs/openspec-regras.md`. Nos arquivos que já existiam (por exemplo, um `AGENTS.md` do
  Next.js), revise o diff: só o bloco entre os marcadores é acrescentado.

## 1.4.0 — 2026-10-22

### O que mudou

- **Documento de arquitetura:** o `/opsx:init` passa a gerar `openspec/arquitetura.md` com visão
  geral, estilo, componentes, comunicação, um diagrama Mermaid, dados, deploy, observabilidade,
  as decisões com links para as ADRs e os pontos adiados. A seção "Architecture" do `project.md`
  fica com um resumo e o link.
- **Idioma do código:** nova pergunta 7.3; a 7.2 passa a cobrir também os campos de Development
  Conventions que nenhuma resposta preencheu.
- **Fila e banco:** a 3.8 oferece tipos de fila (no próprio banco, Redis, broker, agendamento,
  serviço gerenciado) com exemplos por banco e linguagem, e a checagem de coerência aponta uma
  biblioteca de fila presa a outro banco.
- **E2E no config:** o init acrescenta a orientação de E2E ao `operations.apply.guidance` (com o
  framework da 5.5, ou o roteiro em navegador quando não há E2E), em vez de procurar uma linha que
  o config neutro não tem.

### Ações no projeto

- Nenhuma obrigatória.
- Projetos já inicializados podem pedir ao agente que gere `openspec/arquitetura.md` a partir do
  `project-setup.md`, seguindo o "Arquivo 5" do `.claude/commands/opsx/init.md`.
- Arquivos de respostas pré-preenchidas com a 3.8 numérica: confira a resposta, porque a
  numeração mudou. Antiga → nova: 1 (pg-boss / BullMQ) → 1 (pg-boss) ou 2 (BullMQ); 2 (Celery /
  RQ) → 2; 3 (Hangfire) → 1; 4 (Sidekiq) → 2; 5 → 5; 6 → 6. Respostas em texto livre continuam
  valendo.

## 1.3.1 — 2026-10-21

### O que mudou

- **Drive em minúscula no Windows:** o setup e o `comecar.mjs` deixam de acusar "not this store"
  quando a pasta é digitada como `c:\...` e o OpenSpec CLI devolve `C:\...`; a comparação usa o
  caminho real normalizado.
- **Perguntas visíveis:** num console real, a pergunta da pasta base (e as do setup) era apagada
  pelo redesenho do readline, e o dev via só o sinal `>`. As perguntas passam a ser o prompt do readline.
- **Abrir o projeto certo:** a mensagem final do `comecar.mjs` manda abrir a pasta do código como
  pasta do workspace (com `code "<pasta>"` quando o VS Code está instalado), porque o Claude Code
  só carrega os comandos `/opsx:*` nessa pasta.
- **Pergunta de LGPD do `/opsx:init`:** a 6.5 aceita mais de um controle (números separados por
  vírgula), a opção 5 passa a ser "Todos os controles de 1 a 4" (antes "Todos os anteriores", que
  incluía o "Não aplicável"), a pergunta não é feita quando o 1.5 diz que não há dados pessoais, e a
  checagem de coerência aponta dados pessoais sem nenhum controle.

### Ações no projeto

- Nenhuma.

## 1.3.0 — 2026-10-21

### O que mudou

- **Script de entrada:** o `comecar.mjs`, anexado a cada release, é baixado sozinho
  (`curl -LO https://github.com/Gilmar1987/PadraoOpenspct/releases/latest/download/comecar.mjs`)
  e conduz o dev em dois casos. No projeto novo, pergunta a pasta, o nome e o id, clona a
  última release uma única vez, já com o nome do projeto, e roda o setup. No projeto em
  andamento, clona o código e o store, lê o id na linha `store:` e registra o store. O
  `COMECE-AQUI.md` e os READMEs começam por ele e mantêm os passos à mão numa seção própria.
- **Clone pela release:** o `COMECE-AQUI.md` e os READMEs passam a orientar a clonar a última
  release do padrão (`git clone --branch vX.Y.Z`) e a criar a branch `main` a partir dela
  (`git switch -c main`), em vez de clonar a `main`. Um projeto novo começa de uma versão
  publicada, com changelog, e o manifesto registra uma versão que existe como release.

### Ações no projeto

- Nenhuma obrigatória. O `docs/openspec-padrao.md` ganha a seção "Entrar neste projeto"
  pelo PR de atualização.

## 1.2.0 — 2026-10-21

### O que mudou

- **Guia de primeiros passos:** `COMECE-AQUI.md` na raiz do padrão, com pré-requisitos (Git,
  Node.js 18 ou mais recente e o OpenSpec CLI, com o comando de instalação), os passos até o
  `/opsx:init`, o que commitar em cada repositório, como criar o remoto do store, o primeiro
  ciclo de uma change e problemas comuns. O README aponta para ele no topo, e o exemplo de início
  de projeto passa a incluir o `/opsx:init`.
- **Guia do projeto:** o `docs/openspec-padrao.md` entregue ao repositório de código ganha a
  seção "Primeiros passos", e a mensagem final do setup passa a citá-lo.

### Ações no projeto

- Nenhuma. O guia novo chega pelo PR de atualização.

## 1.0.0 — 2026-10-20

Primeira versão numerada. Registra o estado do padrão depois do teste de ponta a ponta com
Django e das correções que vieram dele.

### O que mudou

- **Padrão generalista:** saem os presets e as skills de .NET e Next.js; `setup-project.mjs` e
  `install-skills.mjs` recusam `--stack`. A stack e os "Comandos de verificação" de cada projeto
  são registrados pelo `/opsx:init` no `project.md` do store ([ADR-0003](openspec/adrs/0003-padrao-sem-stack-embutida.md)).
- **Setup e init orientados ao ambiente:** o setup renomeia para `padrao` o `origin` do store
  que aponta para o PadraoOpenspct; o init pergunta remoto (5.8) e tamanho do time (5.9) e checa
  a coerência das respostas antes da confirmação final.
- **Verify com registro detalhado:** o `verification.md` traz "Itens:", "Comandos:" e
  "Cobertura fora da suíte", e o verify usa os comandos de verificação do `project.md`.
- **Fluxo de change auditável:** o propose e o archive commitam no store; o archive pede e
  registra a confirmação quando a aprovação é só para `apply`; a Origem cita a pergunta quando
  a resposta depende dela; push e PR só com pedido explícito; cada tarefa registra a evidência.
- **Revisão de código e segurança por change:** o apply revisa o intervalo de commits da change
  e grava `review.md`; o verify cobra a revisão; a varredura de secrets roda antes de cada commit
  e a auditoria de dependências quando a change as altera.
- **Versões e atualização:** `VERSION`, este CHANGELOG, o manifesto `.openspec-padrao.json` no
  repositório de código, o modo `install-skills.mjs --update` (branch e commit próprios), o
  workflow `.github/workflows/openspec-padrao-update.yml`, que abre um PR quando sai versão nova,
  e o aviso de versão nos comandos `/opsx:*` do ciclo.

### Ações no projeto

- No `openspec/project.md` do store, acrescente a seção "Comandos de verificação" (copie a
  tabela do `padrao-openspec/openspec/project.md` deste repositório) e preencha os comandos do
  projeto, inclusive "Auditoria de dependências" e "Varredura de secrets". Sem ela, o apply e o
  verify registram testes, lint e segurança como "não verificado".
- Automações que chamam o setup ou o instalador com `--stack` precisam tirar a opção.
- Automações que reinstalam o padrão com `install-skills.mjs --force` sobre arquivos já instalados
  precisam trocar por `--update` (branch e commit próprios, árvore limpa) ou `--in-place` (grava
  na branch atual). O `--force` passou a ser ignorado, com um aviso.
- Para receber os PRs de atualização, ligue no GitHub do repositório de código "Settings →
  Actions → General → Workflow permissions → Allow GitHub Actions to create and approve pull
  requests" (veja `docs/openspec-padrao.md`).
- Projetos configurados antes desta versão adotam o mecanismo rodando uma vez, a partir de um
  clone do padrão na tag `v1.0.0`: `node padrao-openspec/scripts/install-skills.mjs <repositório-de-código> --update`.
