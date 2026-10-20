# PadraoOpenspct

Repositório central de padrões OpenSpec para desenvolvimento orientado a especificação (spec-driven development). Serve como ponto de partida para qualquer projeto novo, garantindo que o agente de IA tenha contexto preciso, regras claras e fluxo de trabalho padronizado antes de tocar no código.

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

### Fluxo validado (recomendado)

```powershell
# 1. Clone o repositório com o nome do projeto (sufixo -openspec por convenção)
git clone https://github.com/Gilmar1987/PadraoOpenspct C:\openspec\<projeto>-openspec

# 2. Crie e inicialize o repositório de código
mkdir C:\openspec\<projeto>
cd C:\openspec\<projeto>
git init

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
git clone https://github.com/Gilmar1987/PadraoOpenspct C:\openspec\livraria-openspec
mkdir C:\openspec\livraria && cd C:\openspec\livraria && git init
node C:\openspec\livraria-openspec\padrao-openspec\scripts\setup-project.mjs `
  C:\openspec\livraria `
  --name "Livraria" `
  --register-id livraria `
  --yes
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

Quem clona um repositório de código já configurado recebe o `openspec/config.yaml` com o
id do store. Para o CLI encontrar o store, clone o repositório do store e registre-o com o
mesmo id: `openspec store register <caminho-do-store> --id <projeto>`.

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
| `/opsx:init` | Inicializa o projeto: entrevista estruturada, registra a stack e os comandos de verificação do projeto, gera `project.md`, `config.yaml` e ADRs fundacionais. Com `/opsx:init <arquivo>`, usa um arquivo de respostas pré-preenchidas (tabela `\| Pergunta \| Resposta \|`, mais `Responsável:` e `Confirmação final: sim`) e pergunta só o que faltar |
| `/opsx:ingest` | Ingere documentos externos (atas, requisitos, e-mails) e gera brief estruturado |
| `/opsx:explore` | Opcional: explora o problema, limites e critérios de sucesso sem implementar nada, quando algo ainda não está claro |
| `/opsx:propose <nome>` | Cria os artefatos de planejamento: proposal, delta specs, design e tasks |
| `/opsx:apply` | Implementa as tarefas guiadas pelos artefatos |
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
| "Approval record" e "Prior authorization exception" | `commands/opsx/propose.md` e `skills/openspec-propose/SKILL.md` |
| "Check the approval record" e trailer "OpenSpec-Change:" | `commands/opsx/apply.md` e `skills/openspec-apply-change/SKILL.md` |
| "Write the verification record", "Evidence reuse", "Cobertura fora da suíte" e "Project validation commands" | `commands/opsx/verify.md` e `skills/openspec-verify-change/SKILL.md` |
| "Update the project overview" | `commands/opsx/archive.md` e `skills/openspec-archive-change/SKILL.md` |
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
node C:\openspec\<projeto>-openspec\padrao-openspec\scripts\install-skills.mjs C:\openspec\<projeto> --force
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
