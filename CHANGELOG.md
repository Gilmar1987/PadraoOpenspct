# Changelog

Versões do padrão OpenSpec (PadraoOpenspct). Cada versão traz o que mudou e as ações que um
projeto precisa fazer ao atualizar. A versão vigente está em `padrao-openspec/VERSION`, e cada
versão publicada tem uma tag `vX.Y.Z` com uma GitHub Release ([ADR-0004](openspec/adrs/0004-distribuicao-versionada-do-padrao.md)).

## 1.12.0 — 2026-10-22

### O que mudou

- **Qualidade de interface:** skill nova `interface-quality`, neutra de stack. Numa change com telas, o
  `design.md` traz um "Brief visual" (público e tom, paleta com contraste, tipografia, espaçamento,
  layout em 390, 768 e 1280 px, componentes, estados de cada tela e textos reais), e a skill traz o
  checklist "pronto para cliente" e os critérios de nota (fraco, médio, bom, ótimo).
- **Validação no navegador:** o `docs/openspec-validar-interface.mjs` abre a aplicação num navegador
  real, com o Playwright e o axe-core instalados numa pasta temporária fora do projeto. Ele grava
  capturas nas três larguras, confere acessibilidade (WCAG 2.2 AA), console, links internos, título,
  favicon, metadados, página 404 e rolagem horizontal, executa as jornadas de usuário da change
  (visitar, clicar, preencher, conferir) e grava o `interface-report.md` com uma nota automática.
- **Subagente validador:** `openspec-validador-de-interface` (Claude Code) e `validador-de-interface`
  (Copilot) rodam o script, olham as capturas, conferem o brief e dão a nota final, sem editar
  arquivos. O hook somente leitura passa a valer também para ele.
- **Verify:** o trecho "Interface quality gate" registra um crítico quando uma change com "Brief visual"
  não tem o relatório, não tem a avaliação do validador ou tem nota final "fraco".
- **Init:** com front-end na 3.2, o `project.md` ganha a linha "Validação de interface" nos Comandos de
  verificação, e o `config.yaml` orienta o uso da skill nas changes com telas.
- **Aprovação presa ao conteúdo:** o portão ganha o comando `selo`, e os fluxos gravam o resultado no
  item `Conteúdo:` da aprovação. Se o planejamento mudar depois (marcar tarefas e registrar evidências
  não conta), o portão bloqueia com "A aprovação venceu" até o `/opsx:update` registrar a
  reconfirmação do responsável. O JSON do portão ganha o campo opcional `avisos`.
- **Inferência declarada:** o propose e o init marcam com `[INFERIDO: <base>]` o que deduziram sem
  fonte, e o portão de apply bloqueia enquanto houver marca fora de código.
- **Brief visual obrigatório:** o propose escreve o `design.md`, com a seção "Brief visual", em toda
  change que cria ou muda telas, mesmo onde o schema o trata como opcional. O verify registra o
  warning "Screens without visual brief" quando a change cita telas sem brief e, com a confirmação do
  responsável de que há tela, um crítico.

- **Lacunas declaradas:** modelo `openspec/lacunas.md` no store e o script
  `padrao-openspec/scripts/lacunas.mjs`, que confere campos, datas, fontes e o SHA-256 de cada fonte;
  quando a fonte muda, a declaração tem de ser relida. O `/opsx:verify` cobra as lacunas nas duas
  direções: divergência nova sem declaração e lacuna fechada que ficou no registro
  ([ADR-0007](openspec/adrs/0007-lacunas-declaradas-e-precedencia-entre-documentos.md)).
- **ADR verificável:** o modelo de ADR ganha o campo opcional `verificacao`, com o teste que confere a
  decisão no código; o `/opsx:propose` o preenche quando a decisão se confere por código, e o
  `/opsx:verify` roda esse teste nas changes que tocam a ADR.
- **Precedência entre documentos:** o `rules.md` e o modelo de `project.md` definem a ordem
  contrato → specs → arquitetura → ADRs → código; divergência entre contrato e specs vai ao
  responsável.
- **Estado do fluxo:** o portão ganha o comando `estado` (changes ativas com tarefas, aprovação, selo,
  inferências e próximo passo), e um hook de início de sessão do Claude Code entrega esse resumo ao
  agente.
- **Ganchos do Git protegidos:** um hook nega `git commit --no-verify`, `git commit -n` e a escrita de
  `core.hooksPath`, para o agente principal e para os subagentes.
- **Escrita fora do fluxo:** uma edição fora de `openspec/` sem change ativa aprovada pede a confirmação
  do usuário no Claude Code.

- **Contratos de interface:** o `/opsx:init` pergunta, na 2.6, se o sistema expõe ou consome uma API
  e onde está o contrato (OpenAPI, GraphQL SDL, Protocol Buffers ou AsyncAPI), e o `project.md` ganha a
  tabela "Contratos de interface" e a linha "Teste de contrato". O propose põe o contrato no Impact e
  a tarefa de atualizá-lo antes do código; o apply commita contrato e código juntos; o verify confere
  as duas direções pelo teste de contrato e o SHA-256 das cópias de terceiros contra o `ORIGEM.md`. O
  `rules.md` passa a exigir o contrato antes do código, no mesmo commit.

### Ações no projeto

- Nenhuma obrigatória. Projetos com front-end: nas próximas changes com telas, o verify exige o
  relatório de interface. O script precisa do Node.js 20 ou mais novo e, na primeira execução, baixa
  o Chromium (cerca de 100 MB) para uma pasta temporária.
- Para registrar o comando num projeto já iniciado, acrescente aos Comandos de verificação do
  `openspec/project.md` a linha "Validação de interface" com
  `node docs/openspec-validar-interface.mjs <url local> --jornadas <arquivo>`, e ao
  `operations.apply.guidance` do `openspec/config.yaml` a linha "Em changes com telas, seguir a skill
  interface-quality: brief visual antes do código e relatório de interface com nota médio ou superior
  antes de marcar a tarefa da tela."
- Rode a validação contra a aplicação com dados de desenvolvimento: o script requisita os links
  internos da página inicial, menos os que parecem mudar estado (sair, excluir, remover).
- Aprovações registradas antes do selo seguem valendo, com um aviso do portão; as próximas gravam o
  selo. Nenhuma ação obrigatória.
- Recomendado (lacunas e precedência): no store, acrescente ao `project.md` a seção "Precedência dos documentos" e a linha "Conferência de
  lacunas" em "Comandos de verificação" (veja o modelo em `padrao-openspec/openspec/project.md`).
- Se o projeto já convive com divergências conhecidas entre o código e uma spec, ADR ou documento de
  referência, registre-as em `openspec/lacunas.md`, com motivo e data.
- Nas ADRs `Accepted` cuja decisão se confere por código, preencha `verificacao` com o teste.
- Recomendado (contratos): no store, acrescente ao `project.md` a tabela "Contratos de interface"
  (em Architecture) e a linha "Teste de contrato" nos Comandos de verificação, ou "Não aplicável" quando
  o sistema não tiver API para outros sistemas.
- Rode a atualização do padrão para receber os três hooks novos no `.claude/settings.json` e repita os
  passos 4 a 6 do "Roteiro de verificação no Claude Code" do `docs/openspec-padrao.md`.

## 1.11.0 — 2026-10-22

### O que mudou

- **Changes concorrentes no propose:** antes de pedir a aprovação, o propose compara as capabilities
  da change nova com as das outras changes ativas e registra no Impact a linha "Changes
  concorrentes", mostrando cada sobreposição com uma ordem sugerida.
- **Trabalho em paralelo:** a seção 8 das regras (`openspec/rules.md` no store, `docs/openspec-regras.md` no código) pede uma worktree e uma branch por change,
  versão e número de ADR combinados antes do apply, e aviso antes de rodar algo que usa recursos
  compartilhados da máquina (registro de stores do OpenSpec, ferramentas globais). "Quando em dúvida"
  passa a ser a seção 9.
- **CI do padrão:** os ids de store dos testes levam um sufixo por execução, todo registro tem a remoção
  garantida por `trap`, e o OpenSpec CLI só é instalado quando a versão fixada não está presente.
  Duas suítes rodando na mesma máquina não se atrapalham mais.

### Ações no projeto

- Nenhuma obrigatória. Com mais de uma sessão ou agente no mesmo repositório, siga a seção 8 do
  `docs/openspec-regras.md`.

## 1.10.0 — 2026-10-22

### O que mudou

- **Subagentes do Claude Code:** oito papéis em `.claude/agents/openspec-*.md`, com ferramentas e
  modelo próprios. Os de veredito (arquiteto de spec, planejador, guardião de consistência, ingestor,
  validador de QA, revisor de etapa e revisor de código) não editam arquivos e devolvem achados com
  evidência. O `openspec-stage-reviewer` roda os Comandos de verificação e devolve só as falhas, e o
  `openspec-code-reviewer` passa a ser usado pela skill `requesting-code-review`.
- **Hooks:** nas chamadas dos subagentes de veredito, um hook nega comandos que gravam arquivos ou
  alteram o Git; nas do implementador, um hook nega escrita fora do repositório e nos arquivos do
  padrão. Os dois reconhecem o subagente pelo `agent_type` e não afetam o agente principal. Na sessão, o
  fim do turno é recusado uma vez quando há tarefa marcada sem `Evidência:`, e `openspec archive`
  passa pelo portão ou pede confirmação.
- **Permissões:** `git push`, `gh pr create`, `gh release` e `openspec archive` pedem confirmação;
  `git push --force`, `git push -f` e `git reset --hard` são negados.
- **Instalador:** entrega os subagentes e os hooks e mantém no `.claude/settings.json` só as entradas
  do padrão, registradas em `managedSettings` no manifesto
  ([ADR-0006](openspec/adrs/0006-camada-do-claude-code-por-entradas-gerenciadas.md)).

### Ações no projeto

- Revise no PR de atualização o diff do `.claude/settings.json`: entram quatro hooks (dois de sessão
  e dois de papel, que só agem nas chamadas dos subagentes do padrão) e as permissões `ask` e `deny`;
  as entradas do projeto não mudam.
- No Claude Code, marque a pasta do código como confiável para os hooks dos subagentes valerem, e
  siga o roteiro "Roteiro de verificação no Claude Code" do `docs/openspec-padrao.md`.

## 1.9.0 — 2026-10-22

### O que mudou

- **Portão:** o novo `docs/openspec-portao.mjs` responde do mesmo jeito para qualquer agente se a
  change pode receber código (`apply <change>`: aprovação completa) ou ser arquivada
  (`archive <change>`: escopo archive, tarefas marcadas, `verification.md` e, com commits de código,
  `review.md`). Saída 0, 1 ou 2; `--json` e `--store <id>`. Os fluxos `/opsx:apply` e
  `/opsx:archive` o rodam, e `instalar-hook` instala um hook `commit-msg` opcional.
- **Bloco e regras:** os `/opsx:*` são fluxos do agente, não comandos do CLI; não existe
  `openspec verify`, e o `openspec archive` direto não deve ser usado. O bloco do `AGENTS.md` cita o
  portão e o `--store <id>`.
- **Release:** um workflow anexa o `comecar.mjs` da própria tag a toda release publicada sem ele.

### Ações no projeto

- Nenhuma obrigatória. O PR de atualização traz `docs/openspec-portao.mjs` e o bloco novo.
- Para recusar commits de change não aprovada, rode uma vez
  `node docs/openspec-portao.mjs instalar-hook`.

## 1.8.0 — 2026-10-22

### O que mudou

- **Apply mais rigoroso:**
  - uma correção que a spec não pede é escopo novo, e o agente para e pergunta;
  - a API real de uma biblioteca é conferida antes de escrever um adaptador;
  - requisitos de runtime e compatibilidade são revistos depois de trocar uma versão;
  - geradores (`init`, `create`) rodam fora do repositório de código;
  - uma change que mexe na CI simula os passos numa cópia limpa;
  - mudanças de servidor ou de rotas são verificadas também no modo de produção.
- **Verify:**
  - sem `review.md` numa change de código, o verify para no início e oferece rodar a revisão;
  - as dependências do Impact são cruzadas com as tarefas e o manifesto;
  - um roteiro de navegador rodado por agente sem interação conta como cobertura parcial.
- **Update:** uma revisão que muda o escopo de uma change aprovada volta a aprovação para
  `Pendente`, guardando a anterior.
- **Regras e config base:**
  - toda correção, inclusive urgente, passa por uma change;
  - as contagens anunciadas vêm do CLI;
  - toda dependência do Impact aparece numa tarefa.

### Ações no projeto

- Nenhuma obrigatória. As regras novas chegam pelo PR de atualização.

## 1.7.0 — 2026-10-22

### O que mudou

- **Sem autenticação no MVP:** a pergunta 3.6 do `/opsx:init` ganha a opção "0) Sem
  autenticação no MVP", para a decisão ficar registrada sem depender de "Outro".
- **Coerência de segurança:** a checagem de coerência do init aponta auditoria de dependências
  "Não aplicável" num projeto com dependências, varredura de secrets "Não aplicável" num projeto
  com credenciais e dados pessoais sem autenticação e sem proteção contra ataques. Quando esta
  última é mantida, a restrição de uso vai para "Key Constraints" do `project.md` e para a ADR
  de autenticação.
- **Triagem de relatório externo:** o `/opsx:verify` confere no código e nas decisões cada
  achado de uma ferramenta de análise externa e o classifica como real, não se aplica, risco
  aceito ou falso positivo, com evidência. Achado real mantém a severidade, e o resultado vai
  para a seção opcional `Triagem:` do `verification.md`.

### Ações no projeto

- No `project.md` do store, reveja as respostas "Não aplicável" para auditoria de dependências e
  varredura de secrets em "Comandos de verificação": registre a ferramenta do ecossistema, ou
  mantenha "Não aplicável" ou "Adiado" com a justificativa na coluna "Observações".
- Se o projeto trata dados pessoais sem autenticação, registre em "Key Constraints" a restrição
  de uso (por exemplo, "uso só em ambiente local, com dados de teste, até existir autenticação").

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
