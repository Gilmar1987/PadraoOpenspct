# padrao-openspec

Store OpenSpec neutro para iniciar projetos de qualquer domínio ou stack. O store define o fluxo de especificação; cada projeto consumidor informa seu produto, arquitetura, tecnologias e convenções.

Esta pasta é a fonte única de skills, comandos `/opsx:*`, agentes e modelos de ADR do
repositório PadraoOpenspct. As cópias na raiz do repositório são geradas por
`scripts/sync-root.mjs`; edite sempre aqui.

## Usar em um novo projeto

Cada projeto tem o próprio store: clone o repositório PadraoOpenspct com o nome do
projeto e rode o setup a partir do clone. O setup pergunta a stack e o caminho do
repositório de código e faz o resto.

```powershell
git clone https://github.com/Gilmar1987/PadraoOpenspct C:\openspec\meu-projeto-openspec
node C:\openspec\meu-projeto-openspec\padrao-openspec\scripts\setup-project.mjs
```

```text
Qual a stack do projeto?
  1) .NET
  2) Next.js
  3) .NET (back-end) + Next.js (front-end)
  4) Nenhuma: manter o store neutro
Escolha [1-4]:
Caminho do repositório de código do projeto:
Nome do projeto (Enter para preencher depois):
Registrar este store nesta máquina como "meu-projeto-openspec"? [S/n]:
```

Depois de um resumo e da sua confirmação, o setup:

1. instala no repositório de código as skills (em `.agents/skills/` e
   `.claude/skills/`, padrão `--target both`), incluindo a skill da stack, os
   comandos `/opsx:*` em `.claude/commands/opsx/` e os agentes em `.github/agents/`,
   e acrescenta ao `.gitignore` dele um bloco que ignora o conteúdo local de
   `openspec/`, mas mantém no git o `openspec/config.yaml` com a declaração do store;
2. aplica o preset da stack em `openspec/project.md` e `openspec/config.yaml` deste
   store (veja [presets/](presets/README.md));
3. registra o store nesta máquina com `openspec store register`, grava
   `store: <id>` em `openspec/config.yaml` do repositório de código e confirma, de
   dentro dele, que o OpenSpec CLI resolve este store. Se a resolução falhar, o
   setup termina com erro e mostra o comando que corrige.

Se o instalador encontrar conflito no repositório de código, o setup para antes de
alterar o store. Um `project.md` já preenchido não é substituído sem `--force`, e
arquivos com edições locais ganham um backup `.bak` antes da troca. Se o
repositório de código já declarar outro store, o setup recusa sem `--force`. Sem
terminal interativo (agentes, CI), passe as respostas como opções:

```powershell
node C:\openspec\meu-projeto-openspec\padrao-openspec\scripts\setup-project.mjs C:\caminho\do\codigo --stack dotnet --name "Meu Projeto" --register-id meu-projeto --yes
```

`node scripts/setup-project.mjs --help` lista as opções. Em seguida, preencha a
Stack Summary do `openspec/project.md` com as escolhas reais (ou rode `/opsx:init`)
e registre as decisões transversais como ADRs. Não copie decisões de stack que o
projeto ainda não tomou.

Abra o repositório de código no editor. Os comandos OpenSpec executados nele usam o
store declarado em `openspec/config.yaml`; as mudanças e specs ficam no store e a
implementação continua no repositório de código. Não é preciso rodar `openspec init`
no repositório de código: o setup já instala skills, comandos e a declaração do
store. Com `--no-register`, registre e declare depois com os comandos que o setup
mostra ao final.

## Fluxo de trabalho

1. `/opsx:explore` — esclarecer problema, limites e critérios de sucesso.
2. `/opsx:propose <nome-ou-descrição>` — criar os artefatos de planejamento exigidos pelo schema: proposta, delta specs, design e tarefas, conforme aplicável.
3. Revisar os artefatos e resolver ambiguidades antes de implementar.
4. `/opsx:apply` — implementar as tarefas guiadas pelos artefatos e validar conforme a stack escolhida.
5. `/opsx:verify` — conferir conclusão das tarefas, requisitos, cenários e decisões de design.
6. `/opsx:archive` — após a validação, revisar o delta e arquivar a change. O
    arquivamento aplica as alterações das delta specs à fonte da verdade em
    `openspec/specs/` e move a change para `openspec/changes/archive/`.

O arquivamento preserva o histórico da change; para que um agente use esse histórico em trabalhos futuros, as instruções do projeto devem direcioná-lo às specs principais e, quando necessário, ao arquivo relevante.

## Estrutura

```text
padrao-openspec/
├── README.md
├── .claude/
│   ├── commands/opsx/                 # Slash commands /opsx:* (init, ingest, explore, propose, apply, verify, archive, sync, update)
│   └── skills/
│       ├── openspec-explore/          # Exploração sem implementação
│       ├── openspec-propose/          # Planejamento da change
│       ├── openspec-apply-change/     # Implementação guiada por tasks
│       ├── openspec-verify-change/    # Verificação baseada em evidências
│       ├── openspec-archive-change/   # Sync/arquivo com confirmação
│       ├── openspec-sync-specs/       # Sync sem arquivar
│       ├── openspec-update-change/    # Revisão de artefatos existentes
│       ├── requesting-code-review/    # Revisão de código via subagente isolado
│       ├── docker/                    # Containerização
│       ├── versioning-ci-cd/          # Release, CI e CD
│       ├── dotnet-implementation/     # Ponte OpenSpec → .NET (instalada com --stack dotnet)
│       └── nextjs-implementation/     # Ponte OpenSpec → Next.js (instalada com --stack nextjs)
├── .markdownlint-cli2.jsonc  # Regras de lint de Markdown usadas no CI
├── .github/
│   └── agents/            # Subagentes especializados para VS Code/Copilot
│       ├── spec-architect.agent.md
│       ├── task-planner.agent.md
│       ├── code-implementer.agent.md
│       ├── qa-validator.agent.md
│       ├── consistency-guardian.agent.md
│       └── business-requirements-ingestor.agent.md
├── presets/               # project.md + config.yaml prontos por stack
│   ├── dotnet/
│   ├── nextjs/
│   └── dotnet-nextjs/
├── scripts/
│   ├── setup-project.mjs  # Setup interativo: stack, preset, instalação, registro e declaração do store
│   ├── install-skills.mjs # Instala skills, comandos e subagentes no projeto consumidor
│   ├── sync-root.mjs      # Espelha esta pasta na raiz do repositório (--check na CI)
│   └── test-setup.ps1     # Teste manual de ponta a ponta: clone, setup e verificação
└── openspec/
    ├── config.yaml       # Regras e contexto neutros
    ├── project.md        # Modelo preenchido por cada projeto
    ├── adrs/             # Decisões de arquitetura duradouras (README e template)
    ├── specs/            # Fonte da verdade das capacidades
    └── changes/
        ├── archive/      # Changes concluídas
        └── <change>/     # Changes ativas criadas pelo OpenSpec CLI
```

As pastas `specs/` e `changes/archive/` começam vazias; os diretórios de changes
ativas são criados pelo OpenSpec CLI.

## Skills e subagentes

O store empacota sete skills de workflow OpenSpec (geradas pelo OpenSpec CLI
1.14.2), três skills de engenharia (`versioning-ci-cd`, `docker` e
`requesting-code-review`) e duas skills de stack opcionais, instalando-as junto
dos comandos `/opsx:*` e dos agentes. Isso não ativa nem altera o perfil global da
CLI. Os nomes correspondem aos arquivos `SKILL.md` incluídos:

| Grupo | Skills | Papel |
| --- | --- | --- |
| Ciclo base | `openspec-explore`, `openspec-propose`, `openspec-apply-change`, `openspec-verify-change`, `openspec-archive-change` | Explorar, planejar, implementar, verificar e arquivar |
| Planejamento complementar | `openspec-update-change` | Revisar artefatos de uma change existente |
| Specs | `openspec-sync-specs` | Aplicar deltas às specs principais sem arquivar |
| Engenharia | `versioning-ci-cd`, `docker`, `requesting-code-review` | Versionamento e CI/CD, containerização e revisão de código |
| Stack (via `--stack`) | `dotnet-implementation`, `nextjs-implementation` | Traduzir specs e cenários em código, testes, migrations e comandos de validação da stack |

As skills de stack não ensinam a linguagem nem o framework: elas ligam o fluxo
OpenSpec à stack (cenário → tipo de teste, comando de validação por tarefa,
migrations, fronteiras de segurança) e delegam o conhecimento de framework às
skills oficiais, instaladas à parte:

| Stack | Skills oficiais | Instalação |
| --- | --- | --- |
| .NET | [dotnet/skills](https://github.com/dotnet/skills) (time .NET, MIT) | `/plugin marketplace add dotnet/skills` e `/plugin install <plugin>@dotnet-agent-skills` |
| Next.js | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) (Vercel, MIT) | `npx skills add vercel-labs/agent-skills` |
| Next.js (design visual de interface) | [frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) (Anthropic, Apache 2.0) | `npx skills add https://github.com/anthropics/skills --skill frontend-design` |

O instalador não instala as skills oficiais: elas têm instalador e ciclo de
atualização próprios.

O pacote usa os identificadores presentes nas skills reais deste workspace; não
cria nomes presumidos como `openspec-context-loading` ou
`openspec-continue-change`. O instalador distribui todas as pastas com
`SKILL.md` existentes em `.claude/skills/` para o destino escolhido, exceto as
skills de stack, que só são copiadas quando pedidas com `--stack`.

O store também fornece seis subagentes VS Code/Copilot em `.github/agents/`:

| Subagente | Responsabilidade | Limite principal |
| --- | --- | --- |
| Spec Architect | Analisar specs atuais, impactos e preparar drafts de proposal/specs/design | Não escreve código nem arquivos |
| Task Planner | Derivar checklist atômico e verificável dos artefatos aprovados | Não implementa nem marca tarefas concluídas |
| Code Implementer | Executar tarefas aprovadas, testar e atualizar o progresso | Para diante de ambiguidade ou mudança de escopo |
| QA Validator | Avaliar tarefas, requisitos, cenários, design e verificações | Não altera código, sincroniza specs ou arquiva |
| Consistency Guardian | Comparar changes, `project.md` e specs relacionadas; apontar contradições, duplicações e ambiguidades | Revisão read-only; não altera specs nem bloqueia comandos sozinho |
| Business Requirements Ingestor | Extrai objetivos, atores, regras, cenários e dúvidas de material de negócio | Não altera arquivos; não copia documentos brutos para specs |

O Business Requirements Ingestor prepara um brief a partir dos materiais
explicitamente fornecidos; o Spec Architect o encaminha ao workflow
`openspec-propose`. O Code Implementer segue `openspec-apply-change`; o QA
Validator segue `openspec-verify-change`; o fluxo de arquivo usa
`openspec-archive-change` e, quando necessário, `openspec-sync-specs`. O
Consistency Guardian revisa antes de fechar o design e na verificação, mas não
sincroniza nem arquiva. O Task Planner contribui com o artefato de tarefas
gerado durante `openspec-propose`. Os agentes não fixam um modelo específico:
o VS Code usa o modelo escolhido para a sessão.

Materiais brutos podem ficar localmente em
`openspec/changes/<change>/.inputs/`. A regra
`openspec/changes/**/.inputs/` precisa estar no `.gitignore` do repositório que
contém a raiz OpenSpec ativa (o store de planejamento); o `.gitignore` do código
consumidor não protege automaticamente um store separado. Antes de inserir
documentos sensíveis, confirme também que eles não estão já rastreados pelo Git.
O agente de ingestão não altera `.gitignore` e não pode verificar essas condições
sem evidência do coordenador/humano.

Para distribuir automaticamente todas as skills, os comandos e esses agentes ao
projeto consumidor e configurar o `.gitignore` do consumidor, execute o
instalador com Node.js 18 ou mais recente (o setup já faz isso):

```powershell
node C:\openspec\meu-projeto-openspec\padrao-openspec\scripts\install-skills.mjs C:\caminho\para\projeto
```

O destino padrão das skills é `--target both`: `.agents/skills/` (GitHub
Copilot e agentes universais) e `.claude/skills/` (Claude Code). Use
`--target agents` ou `--target claude` para um único destino. Os comandos
`/opsx:*` são sempre instalados em `.claude/commands/opsx/`. Acrescente `--stack dotnet`,
`--stack nextjs` ou `--stack dotnet,nextjs` para instalar também as skills de
stack; sem `--stack`, só as skills neutras são instaladas, e uma skill de stack
já instalada é preservada. Os agentes VS Code são instalados em
`.github/agents/`. O instalador acrescenta ao final do `.gitignore` do projeto
consumidor um bloco canônico com `/openspec/*` e `!/openspec/config.yaml`,
prevalecendo sobre regras anteriores; se o bloco, ou a versão antiga que ignorava
`/openspec/` inteiro, já existir mais acima, ele é substituído e movido para o final
em vez de duplicado. Assim, os artefatos locais não são enviados junto com o código
da aplicação, e a declaração do store (`openspec/config.yaml`) vai para o git, para
que um clone novo saiba qual store usar.

Em projeto Next.js novo, rode o `create-next-app` no repositório de código antes do
setup: ele recusa pastas que já têm `.agents/`, `.github/` ou `openspec/`. Se o setup
já rodou, gere o app numa pasta temporária e copie os arquivos. O store/template `padrao-openspec` continua sendo um
repositório separado e versionado; compartilhe mudanças/specs pelo remoto desse
store quando desejado.

O instalador é idempotente e interrompe sem copiar se encontrar customizações
divergentes; `--force` atualiza os arquivos do store preservando arquivos extras.
O Git não executa scripts automaticamente durante `clone` ou ao criar um
repositório a partir de template; execute este comando uma vez como etapa de
bootstrap. Se `openspec/` já tiver arquivos rastreados, a regra de ignore não os
remove do índice: o instalador apenas avisa, sem executar `git rm`. Ele rejeita
links simbólicos/junctions nos caminhos de destino e revalida antes de copiar;
não é uma sandbox contra outros processos que alterem simultaneamente o projeto.
O instalador mantém backups temporários durante a atualização do `.gitignore` e
tenta recuperar um backup único se a execução for interrompida no meio. Na
execução seguinte, cópias temporárias deixadas por uma interrupção
(`.gitignore-<uuid>.tmp`, `.skill-tree-<uuid>.tmp`) são removidas; backups de
skills (`.skill-tree-<uuid>.bak`) são apenas reportados para revisão manual.

## Métricas de fluxo

`scripts/flow-metrics.mjs` mede o fluxo das changes a partir de dados que o padrão e o
Git já registram. Ele só lê: não altera nem apaga nada no store ou no código, não lê o
autor dos commits e não grava nomes de pessoas.

```powershell
node C:\openspec\meu-projeto-openspec\padrao-openspec\scripts\flow-metrics.mjs `
  --code C:\openspec\meu-projeto --out C:\relatorios\metricas
```

| Opção | Efeito |
| --- | --- |
| `--store <dir>` | Pasta que contém `openspec/`; o padrão é este `padrao-openspec/` |
| `--code <repo>` | Repositório de código para medir retrabalho; pode ser repetida |
| `--ci` | Conta as execuções da CI que falharam antes do verde, via `gh` autenticado |
| `--out <dir>` | Onde gravar `metrics.csv` e `resumo.md`; o padrão é a pasta atual |

O `metrics.csv` tem uma linha por change, e o `resumo.md` agrega por mês e semana:

| Métrica | Fonte |
| --- | --- |
| Criação, aprovação e archive | `created` do `.openspec.yaml`, campo Data de `## Aprovação` e prefixo da pasta em `changes/archive/` |
| Espera, execução e lead time (dias) | Diferença entre as datas acima |
| Requisitos, cenários e tarefas | Delta specs e `tasks.md` da change |
| Retrabalho | Commits `fix` com o trailer `OpenSpec-Change` de uma change já arquivada, depois do archive |
| Críticos, warnings, sugestões e não verificados | Última entrada do `verification.md` gravado pelo `/opsx:verify` |
| Falhas de CI antes do verde | `gh`, buscando o PR pelo nome da change (heurística) |

Para o retrabalho funcionar, todo commit de código de uma change leva o trailer git
`OpenSpec-Change: <nome-da-change>`, como o `/opsx:apply` pede
([ADR-0002](../openspec/adrs/0002-rastreabilidade-commit-change.md)). Dado ausente
aparece como coluna vazia, nunca como zero, e a seção "Limites" do resumo diz o que não
foi coletado. Os marcos guardam só a data, então os tempos são em dias. Use os números
para entender o fluxo da equipe, não para comparar pessoas.

## Decisões de arquitetura e riscos

Decisões transversais e caras de reverter são registradas como ADRs em
`openspec/adrs/` (veja [openspec/adrs/README.md](openspec/adrs/README.md)). ADRs
`Accepted` são restrições vigentes: o Consistency Guardian reporta changes que as
contrariem e recomenda uma ADR nova quando uma change toma uma decisão desse tipo.

As regras em `openspec/config.yaml` pedem uma seção de riscos na proposal (dados
pessoais, autenticação, dados, configuração, compatibilidade), a mitigação no
design e tarefas correspondentes. A revisão humana dessas respostas acontece no
pull request do store, não em confirmação pelo chat.

## Validação contínua

O workflow fica na raiz do repositório, em `.github/workflows/validate.yml`, e
roda em pull requests e na `main`. O job `store` executa nesta pasta:
`openspec validate --all --strict` (estrutura e SHALL/MUST dos requisitos), carga
do config base e dos presets, lint de Markdown, sintaxe dos scripts e smoke tests
do instalador, do setup e da declaração do store. O job `root` confere que a raiz
está em dia com esta pasta (`sync-root.mjs --check`). Para rodar localmente, nesta
pasta:

```powershell
npx @fission-ai/openspec@1.14.2 validate --all --strict
npx markdownlint-cli2@0.23.2 "**/*.md"
```

## Princípios do store

- O store não escolhe linguagem, framework, banco, arquitetura, ferramentas de teste ou provedor de deploy.
- `openspec/project.md` e `context` descrevem o projeto consumidor, não este template.
- Requisitos devem ser observáveis e acompanhados por cenários verificáveis.
- Tarefas devem ser pequenas, rastreáveis e indicar como validar a conclusão.
- A fonte de verdade durável fica em `openspec/specs/`; deltas e trabalho em andamento ficam em `openspec/changes/`.
- Instale skills opcionais no projeto consumidor conforme o agente e a necessidade; elas não devem ser pré-requisitos do fluxo básico.
