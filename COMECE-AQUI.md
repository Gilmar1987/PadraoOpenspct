# Comece aqui

Guia para quem vai iniciar um projeto com o padrão OpenSpec do PadraoOpenspct: do clone até a
primeira change aprovada. O [README](README.md) é a referência completa; este guia é o caminho do
primeiro dia.

## 1. Antes de começar

Instale e confira:

| Ferramenta | Para quê | Como conferir |
|---|---|---|
| Git | Clonar o padrão e versionar os dois repositórios | `git --version` |
| Node.js 18 ou mais recente | Rodar o setup e o instalador | `node --version` |
| OpenSpec CLI | Registrar o store e criar as changes | `openspec --version` |
| Claude Code | Rodar os comandos `/opsx:*`, que o setup instala em `.claude/commands/opsx/` | Abra o Claude Code no repositório de código depois do setup e digite `/opsx` |
| `gh` (opcional) | Descobrir a última release e abrir PRs pelo terminal (precisa de `gh auth login`) | `gh --version` |

Para instalar o OpenSpec CLI, use a mesma versão da CI do padrão:

```powershell
npm install -g @fission-ai/openspec@1.14.2
```

**Outros agentes:** o setup também instala skills em `.agents/skills/` e subagentes do GitHub
Copilot em `.github/agents/`, mas os comandos `/opsx:*` são do Claude Code. Num agente sem esses
comandos, peça para ele seguir o arquivo do comando, por exemplo: "siga as instruções de
`.claude/commands/opsx/init.md`".

## 2. Criar o projeto

Cada projeto tem dois repositórios: o **store**, um clone do padrão onde ficam specs, changes e
ADRs, e o **repositório de código**, onde fica a aplicação. Nos comandos abaixo, troque
`<projeto>` e `<Nome do Projeto>` pelos valores reais antes de colar.

Se a stack tem um gerador de projeto que exige pasta vazia (por exemplo, `create-next-app`),
rode o gerador no repositório de código **antes** do setup.

O store começa da **última release** do padrão, que é uma versão revisada e com changelog. Troque
`vX.Y.Z` pela tag que o primeiro comando mostrar. Sem o `gh`, use o `git ls-remote` comentado
abaixo (a primeira linha é a mais nova) ou veja a página
[Releases](https://github.com/Gilmar1987/PadraoOpenspct/releases).

O clone de uma tag mostra `warning: refs/tags/vX.Y.Z ... is not a commit!` e um aviso de
`detached HEAD`. Os dois são esperados: o `switch -c main` da linha seguinte cria a branch `main`
na release, e os commits do projeto passam a ficar nela.

```powershell
# Última release do padrão
gh release view --repo Gilmar1987/PadraoOpenspct --json tagName -q .tagName
# ou, só com o Git: git ls-remote --tags --refs --sort=-v:refname https://github.com/Gilmar1987/PadraoOpenspct "v*"

# Store do projeto: clone da release, com a branch main criada a partir dela
git clone --branch vX.Y.Z https://github.com/Gilmar1987/PadraoOpenspct C:\openspec\<projeto>-openspec
git -C C:\openspec\<projeto>-openspec switch -c main

# Repositório de código
mkdir C:\openspec\<projeto>
cd C:\openspec\<projeto>
git init -b main

# Setup: instala skills, comandos e agentes no código e liga o código ao store
node C:\openspec\<projeto>-openspec\padrao-openspec\scripts\setup-project.mjs `
  C:\openspec\<projeto> `
  --name "<Nome do Projeto>" `
  --register-id <projeto> `
  --yes
```

O setup não pergunta a stack: ela é definida na entrevista do próximo passo. Ele também renomeia
para `padrao` o remote `origin` do store, para que um push no store não vá para o repositório do
padrão. O que mais ele faz está em [Como iniciar um projeto novo](README.md#como-iniciar-um-projeto-novo).

## 3. Inicializar

Abra o repositório de código no editor, abra o Claude Code e rode:

```text
/opsx:init
```

A entrevista registra no store a visão do produto, a arquitetura, a stack, os **comandos de
verificação** (instalar, executar, testar, lint, build, migrar, auditar dependências, procurar
secrets) e as ADRs fundacionais. Antes de confirmar, ela aponta combinações de respostas
incoerentes; ajuste ou justifique cada uma. A entrevista termina com a sua confirmação e o seu
nome como responsável.

## 4. Commitar e publicar

No repositório de código, commite o que o setup instalou: `.claude/`, `.agents/`,
`.github/agents/`, `.github/workflows/openspec-padrao-update.yml`, `docs/openspec-padrao.md`,
`.openspec-padrao.json`, `.gitignore` e `openspec/config.yaml` (a declaração do store).

No store, commite o que o init gerou em `padrao-openspec/openspec/`: `project.md`, `config.yaml`,
`project-setup.md` e as ADRs.

Para publicar:

- **Código:** crie o repositório remoto e rode `git remote add origin <url>` e `git push -u origin main`.
- **Store:** o setup tirou o `origin` do padrão. Crie um repositório próprio para o store e rode
  `git -C C:\openspec\<projeto>-openspec remote add origin <url>` e
  `git -C C:\openspec\<projeto>-openspec push -u origin main`.
- **Atualizações do padrão:** no GitHub do repositório de código, ligue **Settings → Actions →
  General → Workflow permissions → Allow GitHub Actions to create and approve pull requests**.
  O workflow instalado abre um PR a cada versão nova (veja `docs/openspec-padrao.md` no projeto).

## 5. Primeira change

Toda mudança de comportamento passa pelo ciclo abaixo, no Claude Code, dentro do repositório de código:

1. `/opsx:explore` (opcional): para pensar o problema antes de planejar.
2. `/opsx:propose <nome-da-change>`: cria proposta, specs, design e tarefas. Revise os artefatos.
3. **Aprove no chat, com uma frase explícita**, por exemplo: `Aprovo a change <nome> para apply`.
   Sem essa frase, o agente não escreve código. Para seguir até o archive sem parar, aprove
   `para archive` e diga as condições.
4. `/opsx:apply`: implementa as tarefas, registra a evidência de cada uma e pede a revisão de
   código no fim.
5. `/opsx:verify`: confere tarefas, requisitos e cenários e grava o `verification.md`.
6. `/opsx:archive`: consolida as specs e arquiva a change.

O agente só faz push, abre PR ou faz deploy quando você pede explicitamente.

## 6. Problemas comuns

| Sintoma | O que fazer |
|---|---|
| `openspec: command not found` | Instale o CLI (passo 1) e abra um terminal novo |
| `git status` no store diz `HEAD detached at vX.Y.Z`, ou o `git push -u origin main` do store falha com `src refspec main does not match any` | Rode `git -C C:\openspec\<projeto>-openspec switch -c main` (passo 2) antes de commitar |
| O setup recusa `--stack` | A opção foi removida; a stack vem do `/opsx:init` |
| O CLI não encontra o store a partir do código | Rode o `openspec store register ...` que o setup mostrou e confira a linha `store:` em `openspec/config.yaml` do código |
| Gerador de projeto recusa a pasta | Rode o gerador numa pasta temporária e copie os arquivos para o repositório de código |
| O CLI está muito lento (Windows) | Veja [Desempenho e ambiente](README.md#desempenho-e-ambiente) |
| O instalador pede `--update` ou `--in-place` | Os arquivos do padrão mudariam. Com a árvore limpa, rode `node C:\openspec\<projeto>-openspec\padrao-openspec\scripts\install-skills.mjs C:\openspec\<projeto> --update` para receber a atualização numa branch própria (o setup não aceita essa opção) |

## 7. Para saber mais

- [README](README.md): referência completa do padrão.
- [CHANGELOG.md](CHANGELOG.md): o que mudou em cada versão e as ações em cada projeto.
- [openspec/rules.md](openspec/rules.md): as regras que os agentes seguem.
