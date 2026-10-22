# PadraoOpenspct

Repositório central de padrões OpenSpec para desenvolvimento orientado a especificação (spec-driven development). Serve como ponto de partida para qualquer projeto novo, garantindo que o agente de IA tenha contexto preciso, regras claras e fluxo de trabalho padronizado antes de tocar no código.

> **Vai criar um projeto ou entrar num que já usa o padrão?** Não clone este repositório: baixe e
> rode o script de entrada, que pergunta o seu caso e faz o resto.
>
> ```powershell
> curl.exe -LO https://github.com/Gilmar1987/PadraoOpenspct/releases/latest/download/comecar.mjs
> node comecar.mjs
> ```
>
> No macOS e no Linux, use `curl` no lugar de `curl.exe`. O [COMECE-AQUI.md](COMECE-AQUI.md) tem
> os pré-requisitos, exemplos das duas conversas, os passos sem o script e os problemas comuns.
> Este README é a referência completa.

## O que está aqui

```text
PadraoOpenspct/
├── padrao-openspec/          # Fonte única: store neutro, skills, comandos /opsx:*, agentes e scripts
├── openspec/                 # Raiz OpenSpec deste repositório: regras globais, ADRs e changes do próprio padrão
├── .claude/                  # Espelho gerado de padrao-openspec/.claude (+ CLAUDE.md)
├── .github/                  # Workflow de CI, agentes espelhados e stub de regras para GitHub Copilot
├── .amazonq/rules/           # Stub de regras para Amazon Q
├── .cursorrules              # Stub de regras para Cursor
└── .windsurfrules            # Stub de regras para Windsurf
```

`padrao-openspec/` é a única fonte editável de skills, comandos, agentes e modelos de ADR
([ADR-0003](openspec/adrs/0003-padrao-sem-stack-embutida.md)). As cópias em `.claude/skills/`,
`.claude/commands/opsx/`, `.github/agents/` e `openspec/adrs/{README,template}.md` são geradas
por `padrao-openspec/scripts/sync-root.mjs`; veja [Manutenção do padrão](#manutenção-do-padrão).

O padrão é generalista: não traz presets nem skills de nenhuma stack. A stack de cada
projeto, e os comandos que instalam, executam, testam e validam o código, são registrados
pelo `/opsx:init` no `project.md` do projeto, e o apply e o verify usam esses comandos.

---

## Como iniciar um projeto novo

Pré-requisitos (Git, Node.js 18 ou mais recente e o OpenSpec CLI), o que commitar e o primeiro
ciclo de uma change estão no [COMECE-AQUI.md](COMECE-AQUI.md).

### Fluxo validado (recomendado)

```powershell
# 1. Clone a última release do padrão com o nome do projeto (sufixo -openspec por convenção)
#    e crie a branch main a partir dela. A última tag aparece com:
#    gh release view --repo Gilmar1987/PadraoOpenspct --json tagName -q .tagName
git clone --branch vX.Y.Z https://github.com/Gilmar1987/PadraoOpenspct C:\openspec\<projeto>-openspec
git -C C:\openspec\<projeto>-openspec switch -c main

# 2. Crie e inicialize o repositório de código
mkdir C:\openspec\<projeto>
cd C:\openspec\<projeto>
git init -b main

# 3. Rode o setup
node C:\openspec\<projeto>-openspec\padrao-openspec\scripts\setup-project.mjs `
  C:\openspec\<projeto> `
  --name "<Nome do Projeto>" `
  --register-id <projeto> `
  --yes

# 4. No repositório de código, abra o agente e rode a entrevista de inicialização
/opsx:init
```

Exemplo real (projeto Livraria):

```powershell
git clone --branch v1.2.0 https://github.com/Gilmar1987/PadraoOpenspct C:\openspec\livraria-openspec
git -C C:\openspec\livraria-openspec switch -c main
mkdir C:\openspec\livraria
cd C:\openspec\livraria
git init -b main
node C:\openspec\livraria-openspec\padrao-openspec\scripts\setup-project.mjs `
  C:\openspec\livraria `
  --name "Livraria" `
  --register-id livraria `
  --yes

# No repositório de código C:\openspec\livraria, abra o agente e rode a entrevista
/opsx:init
```

O setup:

- instala no repositório de código as skills em `.agents/skills/` e `.claude/skills/` (padrão `--target both`), os comandos `/opsx:*` em `.claude/commands/opsx/` e os subagentes em `.github/agents/`;
- grava o nome do projeto em `<projeto>-openspec\padrao-openspec\openspec\project.md`, sem mexer no resto do `project.md` nem no `config.yaml`, que continuam neutros até o `/opsx:init`;
- acrescenta ao `.gitignore` do repositório de código um bloco que ignora o conteúdo local de `openspec/`, mas mantém no git o `openspec/config.yaml` com a declaração do store (commite esse arquivo);
- registra o store nesta máquina, grava `store: <projeto>` em `openspec/config.yaml` do repositório de código e confirma que o OpenSpec CLI encontra o store a partir dele.
- renomeia para `padrao` o remote `origin` do store quando ele aponta para o repositório do padrão, para que um `git push` no store não publique o planejamento do projeto no PadraoOpenspct. As atualizações do padrão continuam disponíveis com `git fetch padrao`. Para publicar o store, crie um repositório para ele e rode `git -C <store> remote add origin <url>`; para manter o `origin`, passe `--keep-origin`.

Resultado final:

| Pasta | Conteúdo |
|---|---|
| `C:\openspec\<projeto>-openspec\padrao-openspec\` | Store OpenSpec do projeto (specs, changes, config, ADRs) |
| `C:\openspec\<projeto>\` | Código da aplicação (skills, comandos e subagentes instalados) |

**Gerador de projeto que exige pasta vazia** (por exemplo, `create-next-app`): rode-o no
repositório de código **antes** do setup, porque ele recusa pastas que já têm `.agents/`,
`.github/` ou `openspec/`. Se o setup já rodou, gere o app numa pasta temporária e copie
os arquivos para o repositório de código.

Quem vai entrar num projeto já configurado roda o script de entrada no modo projeto em
andamento (`node comecar.mjs --modo existente`): ele clona o código e o store, lê o id na linha
`store:` do `openspec/config.yaml` do código e registra o store. À mão, clone o repositório do
store e registre a pasta `padrao-openspec` dele com esse id:
`openspec store register <pasta-do-store>\padrao-openspec --id <id> --yes`
(veja [Sem o script](COMECE-AQUI.md#5-sem-o-script)).

Sem registrar o store (por exemplo, em CI), troque `--register-id <projeto>` por
`--no-register`. O setup mostra ao final o comando de registro e a linha `store:` a
declarar quando você quiser ligar os dois repositórios. Use `--target agents` ou
`--target claude` para instalar as skills em um único destino.

---

## Fluxo de trabalho

Todo projeto que usa este padrão segue o mesmo ciclo:

```text
[/opsx:explore]   →   /opsx:propose   →   /opsx:apply   →   /opsx:verify   →   /opsx:archive
```

| Comando | O que faz |
|---|---|
| `/opsx:init` | Inicializa o projeto: entrevista estruturada, registra a stack e os comandos de verificação do projeto, gera `project.md`, `config.yaml`, `arquitetura.md` (com diagrama) e ADRs fundacionais. Com `/opsx:init <arquivo>`, usa um arquivo de respostas pré-preenchidas (tabela `\| Pergunta \| Resposta \|`, mais `Responsável:` e `Confirmação final: sim`) e pergunta só o que faltar |
| `/opsx:ingest` | Ingere documentos externos (atas, requisitos, e-mails) e gera brief estruturado |
| `/opsx:explore` | Opcional: explora o problema, limites e critérios de sucesso sem implementar nada, quando algo ainda não está claro |
| `/opsx:propose <nome>` | Cria os artefatos de planejamento: proposal, delta specs, design e tasks |
| `/opsx:apply` | Implementa as tarefas guiadas pelos artefatos, roda as checagens de segurança do projeto e grava a revisão de código em `review.md` |
| `/opsx:verify` | Confere conclusão de tarefas, requisitos, cenários e decisões de design |
| `/opsx:archive` | Aplica as delta specs à fonte da verdade, atualiza a tabela de capabilities do `project.md` e arquiva a change. É o fluxo do agente, com avaliação da sincronização e confirmação; o `openspec archive` do CLI faz o mesmo de forma mecânica. Use um dos dois por change |
| `/opsx:update` | Revisa artefatos de uma change existente |
| `/opsx:sync` | Aplica deltas às specs principais sem arquivar |

> Toda mudança de comportamento passa por `/opsx:propose` antes do código.

Fluxo completo quando há documentos externos:

```text
/opsx:init → /opsx:ingest → [/opsx:explore] → /opsx:propose → /opsx:apply → /opsx:verify → /opsx:archive
```

---

## Skills disponíveis

Todas vivem em `padrao-openspec/.claude/skills/`, são neutras quanto à stack e são
instaladas pelo setup.

| Skill | Papel |
|---|---|
| `openspec-explore` | Exploração sem implementação |
| `openspec-propose` | Planejamento da change |
| `openspec-apply-change` | Implementação guiada por tasks |
| `openspec-verify-change` | Verificação baseada em evidências |
| `openspec-archive-change` | Sync e arquivo com confirmação |
| `openspec-sync-specs` | Sync sem arquivar |
| `openspec-update-change` | Revisão de artefatos existentes |
| `requesting-code-review` | Revisão de código via subagente isolado |
| `docker` | Containerização com Dockerfile, docker-compose e boas práticas |
| `versioning-ci-cd` | Versionamento, Git, CI, CD e deploy conforme a stack detectada |

O padrão não tem skills de stack. Skills de fornecedor (por exemplo, as oficiais de um
framework) podem ser instaladas à parte, pelo comando do próprio fornecedor; elas
complementam, sem substituir, os comandos de verificação registrados no `project.md`.

---

## Subagentes VS Code / GitHub Copilot

Fonte em `padrao-openspec/.github/agents/`, espelhados em `.github/agents/`:

| Subagente | Responsabilidade |
|---|---|
| `spec-architect` | Analisa specs, impactos e prepara drafts de proposal/specs/design |
| `task-planner` | Deriva checklist atômico e verificável dos artefatos aprovados |
| `code-implementer` | Executa tarefas aprovadas, testa e atualiza o progresso |
| `qa-validator` | Avalia tarefas, requisitos, cenários e decisões de design |
| `consistency-guardian` | Detecta contradições, duplicações e ambiguidades entre changes e specs |
| `business-requirements-ingestor` | Extrai objetivos, atores e regras de materiais de negócio |

---

## Regras globais de agentes

Todas as regras que governam o comportamento dos agentes de IA estão em uma única
fonte da verdade:

```text
openspec/rules.md    ← fonte única, agnóstica de agente
```

Cada agente carrega automaticamente um stub mínimo que aponta para esse arquivo:

| Agente | Arquivo carregado automaticamente |
|---|---|
| Amazon Q | `.amazonq/rules/openspec-rules.md` |
| Claude Code | `.claude/CLAUDE.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Cursor | `.cursorrules` |
| Windsurf | `.windsurfrules` |

Para atualizar uma regra, edite apenas `openspec/rules.md`. Os stubs não precisam
ser alterados.

---

## Estrutura de um store

```text
padrao-openspec/
├── openspec/
│   ├── config.yaml       # Stack, convenções e regras injetadas no agente
│   ├── project.md        # Visão do produto, arquitetura, stack e comandos de verificação
│   ├── arquitetura.md    # Componentes, comunicação, diagrama e deploy (gerado pelo /opsx:init)
│   ├── specs/            # Fonte da verdade (preenchida após /opsx:archive)
│   ├── changes/          # Changes ativas e arquivadas
│   └── adrs/             # Decisões de arquitetura duradouras
├── .claude/
│   ├── commands/opsx/    # Slash commands /opsx:*
│   └── skills/           # Skills instaladas no repositório de código
├── .github/agents/       # Subagentes VS Code/Copilot
└── scripts/              # setup-project, install-skills, sync-root
```

---

## Versões e atualização

O padrão tem versão semver em `padrao-openspec/VERSION`, um [CHANGELOG.md](CHANGELOG.md) com
"O que mudou" e "Ações no projeto" por versão, e uma tag `vX.Y.Z` com GitHub Release para cada
versão publicada ([ADR-0004](openspec/adrs/0004-distribuicao-versionada-do-padrao.md)).

Em cada projeto, o instalador grava:

| Arquivo no repositório de código | Para quê |
|---|---|
| `.openspec-padrao.json` | Versão, commit e origem do padrão instalado e a lista de arquivos gerenciados (não edite esses arquivos à mão) |
| `.github/workflows/openspec-padrao-update.yml` | Toda segunda-feira (ou sob demanda) compara a versão instalada com a última release e, se houver versão nova, abre um PR da branch `chore/padrao-vX.Y.Z` com as "Ações no projeto" e o changelog |
| `docs/openspec-padrao.md` | Guia do projeto: como a atualização chega, a permissão de Actions necessária e como atualizar à mão |

Para o workflow abrir o PR, ligue no GitHub do repositório de código **Settings → Actions →
General → Workflow permissions → Allow GitHub Actions to create and approve pull requests**.

Uma reinstalação que mudaria arquivos já instalados exige um modo explícito:

- `--update`: exige a árvore limpa, cria a branch `chore/padrao-vX.Y.Z`, instala e commita (sem push);
- `--in-place`: grava na branch atual, sem commit.

Sem um dos dois, o instalador para sem alterar nada. Os comandos `/opsx:propose`, `/opsx:apply`,
`/opsx:verify` e `/opsx:archive` avisam no início quando a versão instalada está atrás da última tag.

### Como publicar uma release

Publicar é ação do responsável, feita só com pedido explícito:

1. No PR da mudança, atualize `padrao-openspec/VERSION` e acrescente a seção da versão no topo do
   `CHANGELOG.md`, com "O que mudou" e "Ações no projeto" ("Nenhuma" quando não houver). A CI
   falha se os dois não baterem.
2. Depois do merge na `main`, crie a tag e a release com as notas da seção e o script de entrada
   anexado:

   ```powershell
   git tag vX.Y.Z
   git push origin vX.Y.Z
   node padrao-openspec/scripts/changelog-range.mjs --from <versão-anterior> --to X.Y.Z > notas.md
   gh release create vX.Y.Z --title "vX.Y.Z" --notes-file notas.md padrao-openspec/scripts/comecar.mjs
   ```

   O anexo é o que `releases/latest/download/comecar.mjs` baixa. Uma release sem ele faz o link
   do guia falhar até a próxima; para corrigir, rode
   `gh release upload vX.Y.Z padrao-openspec/scripts/comecar.mjs`.

Na semana seguinte, o workflow de cada projeto abre o PR de atualização.

---

## Manutenção do padrão

1. Edite skills, comandos, agentes e modelos de ADR **somente** em `padrao-openspec/`.
2. Regenere as cópias da raiz:

   ```powershell
   node padrao-openspec/scripts/sync-root.mjs
   ```

3. Confira antes do commit (a CI faz a mesma checagem e falha em qualquer divergência):

   ```powershell
   node padrao-openspec/scripts/sync-root.mjs --check
   ```

Mudanças no próprio padrão seguem o fluxo OpenSpec na raiz `openspec/` deste repositório.

As skills `openspec-*` e os comandos `/opsx:*` foram gerados pelo OpenSpec CLI 1.14.2 e
receberam trechos próprios do padrão. Ao regenerá-los com uma versão nova do CLI,
reaplique estes trechos (o passo "Trechos customizados das skills" da CI falha se algum
sumir):

| Trecho | Arquivos |
|---|---|
| "Architectural Decision Check" | `commands/opsx/propose.md` e `skills/openspec-propose/SKILL.md` |
| "Approval record", "Prior authorization exception" e "Commit the planning" | `commands/opsx/propose.md` e `skills/openspec-propose/SKILL.md` |
| "Check the approval record", trailer "OpenSpec-Change:", "Record task evidence", "Push only on explicit request", "Security checks" e "Request code review" | `commands/opsx/apply.md` e `skills/openspec-apply-change/SKILL.md` |
| "Write the verification record", "Evidence reuse", "Cobertura fora da suíte", "Project validation commands" e "Code review record" | `commands/opsx/verify.md` e `skills/openspec-verify-change/SKILL.md` |
| "Update the project overview", "Check the archive authorization" e "Commit the archive" | `commands/opsx/archive.md` e `skills/openspec-archive-change/SKILL.md` |
| "Confirm progress per task group" | `commands/opsx/apply.md` e `skills/openspec-apply-change/SKILL.md` |
| Bloco "Store selection", "Project check" e "Raiz OpenSpec" | `commands/opsx/init.md` e `commands/opsx/ingest.md` |

---

## Validação contínua

O workflow `.github/workflows/validate.yml` roda em pull requests e na `main`, em dois jobs:

| Job | O que valida |
|---|---|
| `store` (em `padrao-openspec/`) | `openspec validate --all --strict`, config base sem avisos, lint de Markdown, sintaxe dos scripts e smoke tests do instalador, do setup (inclusive a recusa de `--stack`) e da declaração do store |
| `root` | Raiz em dia com `padrao-openspec/` (`sync-root.mjs --check`), `openspec validate --all --strict` e lint de Markdown da raiz |

Para rodar localmente:

```powershell
node padrao-openspec/scripts/sync-root.mjs --check
npx @fission-ai/openspec@1.14.2 validate --all --strict
npx markdownlint-cli2@0.23.2 "**/*.md"
```

Skills e comandos gerados pelo OpenSpec CLI e a skill `requesting-code-review` ficam fora do lint.

---

## Desempenho e ambiente

O CLI do OpenSpec é rápido: na CI, o passo que gera as instruções de quatro configs faz
16 chamadas em cerca de 4 segundos. Numa máquina Windows carregada, a mesma chamada levou de
40 a 90 segundos, e um `npm install` com tudo em cache levou 35 minutos. Quando o fluxo
ficar lento:

- exclua do antivírus a pasta do projeto, a pasta do store e o cache do npm;
- encerre processos `node` órfãos de tarefas interrompidas: no Windows, parar a tarefa
  nem sempre encerra os processos filhos (`npm install`, `next start`);
- evite rodar várias sessões pesadas (testes, builds, instalações) ao mesmo tempo.

O `/opsx:apply` confirma o progresso no CLI ao fim de cada grupo de tarefas, e não depois de
cada tarefa, para limitar o número de chamadas. O `.gitattributes` mantém os arquivos de
texto em LF também no Windows, para que o `sync-root.mjs --check` não acuse divergências
que existem só na quebra de linha.

## Migração dos stores removidos

`openspec-store-dotnet/` e `openspec-store-nextjs/` foram removidos: duplicavam o
`padrao-openspec` e divergiam dele. Quem os usava passa a clonar este repositório e
rodar o setup, como em [Como iniciar um projeto novo](#como-iniciar-um-projeto-novo).
Projetos já configurados recebem os comandos e as skills atualizados com:

```powershell
node C:\openspec\<projeto>-openspec\padrao-openspec\scripts\install-skills.mjs C:\openspec\<projeto> --update
```

## Migração do `--stack`

Os presets `dotnet`, `nextjs` e `dotnet-nextjs` e as skills `dotnet-implementation` e
`nextjs-implementation` foram removidos ([ADR-0003](openspec/adrs/0003-padrao-sem-stack-embutida.md)).
O setup e o instalador recusam `--stack` com uma mensagem de erro, sem alterar nada:

- **Automações de setup:** tire o `--stack` da chamada. A stack e os comandos de
  verificação passam a ser registrados pelo `/opsx:init`.
- **Projetos já configurados com preset:** nada muda. O `project.md` e o `config.yaml`
  pertencem ao projeto. Vale acrescentar a seção "Comandos de verificação" ao
  `project.md`, copiando-a do `padrao-openspec/openspec/project.md` neutro.
- **Skills de stack já instaladas:** o instalador não as remove. Apague
  `.agents/skills/<stack>-implementation` e `.claude/skills/<stack>-implementation` do
  repositório de código quando quiser.
