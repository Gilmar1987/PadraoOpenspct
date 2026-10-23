# Comece aqui

> **Não clone este repositório para começar.** Baixe e rode o script de entrada: ele pergunta o
> que você vai fazer e faz o único clone necessário, já na pasta e na versão certas.

Guia para quem vai trabalhar com o padrão OpenSpec do PadraoOpenspct, num projeto novo ou num
projeto que já usa o padrão. O [README](README.md) é a referência completa.

## 1. Antes de começar

Instale:

| Ferramenta | Para quê | Como conferir |
|---|---|---|
| Git | Clonar e versionar os repositórios | `git --version` |
| Node.js 18 ou mais recente | Rodar o script de entrada e o setup | `node --version` |
| Claude Code | Rodar os comandos `/opsx:*` | Abra o Claude Code no repositório de código e digite `/opsx` |

O OpenSpec CLI também é necessário. Se ele faltar, o script oferece instalar a versão usada pelo
padrão (`npm install -g @fission-ai/openspec@1.14.2`).

E peça ao tech lead, antes de começar:

| Seu caso | O que pedir |
|---|---|
| Vou criar um projeto que ainda não existe | O nome do projeto; quem responde a entrevista do `/opsx:init` (visão, arquitetura, stack); permissão para criar os dois repositórios no GitHub e mudar as configurações de Actions |
| Vou trabalhar num projeto que já usa o padrão | A URL do repositório de código e a URL do repositório do store, com acesso aos dois |

Na dúvida, pergunte se o projeto já tem um repositório de store. Se tem, é um projeto em andamento.

## 2. Rode o script

Abra um terminal na pasta onde os repositórios devem ficar e rode:

```powershell
# Windows (PowerShell)
curl.exe -LO https://github.com/Gilmar1987/PadraoOpenspct/releases/latest/download/comecar.mjs
node comecar.mjs
```

```bash
# macOS e Linux
curl -LO https://github.com/Gilmar1987/PadraoOpenspct/releases/latest/download/comecar.mjs
node comecar.mjs
```

O arquivo é salvo antes de rodar; abra-o se quiser conferir o que ele faz. O script só cria algo
depois de mostrar um resumo e você confirmar. Cada pergunta mostra a sugestão entre colchetes:
Enter aceita, ou digite outro valor. A pasta pode ser qualquer uma, em qualquer disco.

Todo projeto tem dois repositórios: o **store**, onde ficam specs, changes e ADRs, e o
**repositório de código**, onde fica a aplicação.

### Projeto novo

Exemplo com o projeto Livraria Online, rodado em `C:\openspec`:

```text
Padrão OpenSpec — comece aqui

Conferindo o ambiente...
  Git .......... 2.52.0    ok
  Node.js ...... 24.12.0   ok
  OpenSpec CLI . 1.14.2    ok

O que você vai fazer?
  1) Criar um projeto novo
  2) Entrar num projeto que já usa o padrão
> 1
Pasta onde os repositórios vão ficar [C:\openspec]: (Enter)
Nome do projeto, como as pessoas o chamam: Livraria Online
Id do projeto, usado nas pastas e no store [livraria-online]: (Enter)
Pasta do código já criada por um gerador de projeto (Enter para criar C:\openspec\livraria-online): (Enter)

Resumo:
  - Store: C:\openspec\livraria-online-openspec (clone da release v1.3.0 de https://github.com/Gilmar1987/PadraoOpenspct, branch main)
  - Código: C:\openspec\livraria-online (repositório novo, branch main)
  - Setup: comandos /opsx:*, skills e agentes no código; store registrado como "livraria-online"

Confirmar? [S/n]: (Enter)

  ✔ Store clonado da v1.3.0
  ✔ Branch main criada no store
  ✔ Repositório de código criado
  … Rodando o setup (pode levar alguns segundos)
  ✔ Setup concluído (skills, comandos e agentes no código; store registrado e ligado ao código)

Fazer o commit inicial do código e do store? [S/n]: (Enter)
  ✔ Commit inicial do código e do store

Pronto. Próximo passo:
  1. Abra a pasta do projeto como pasta do workspace (não a pasta acima dela):
       code "C:\openspec\livraria-online"
     ou, no VS Code: File → Open Folder → C:\openspec\livraria-online
  2. Nessa janela, abra o Claude Code e rode: /opsx:init
     Se /opsx não aparecer, o Claude Code foi aberto em outra pasta.
Os dois repositórios já têm o commit inicial, e o /opsx:init commita o que gerar no store.
Para publicar, crie os remotos e faça o push (veja o COMECE-AQUI.md, "Commitar e publicar").
No GitHub do código, ligue Settings → Actions → General → "Allow GitHub Actions to create and approve
pull requests" para receber as atualizações do padrão por PR.
```

Se a pasta informada não existir, o script pergunta antes de criá-la. Se ela estiver numa pasta
sincronizada (OneDrive, Dropbox, Google Drive, iCloud), ele avisa e pergunta se você quer
continuar.

Se a stack tem um gerador de projeto que exige pasta vazia (por exemplo, `create-next-app`),
rode o gerador **antes** do script e informe a pasta gerada na pergunta do gerador.

Depois do script, siga [Inicializar](#inicializar) e [Commitar e publicar](#commitar-e-publicar).

### Projeto em andamento

Exemplo com as URLs que o tech lead passou:

```text
O que você vai fazer?
  1) Criar um projeto novo
  2) Entrar num projeto que já usa o padrão
> 2
Pasta onde os repositórios vão ficar [C:\openspec]: (Enter)
URL do repositório de código: https://github.com/empresa/livraria-online
URL do repositório do store: https://github.com/empresa/livraria-online-openspec

Resumo:
  - Código: C:\openspec\livraria-online (clone de https://github.com/empresa/livraria-online)
  - Store: C:\openspec\livraria-online-openspec (clone de https://github.com/empresa/livraria-online-openspec)
  - Registrar o store nesta máquina com o id que o código declara

Confirmar? [S/n]: (Enter)

  ✔ Código clonado
  ✔ Id do store lido do código: livraria-online
  ✔ Store clonado
  ✔ Store registrado nesta máquina
  ✔ O CLI encontra o store a partir do código

Pronto. O projeto já está inicializado: não rode /opsx:init.
  1. Abra a pasta do projeto como pasta do workspace (não a pasta acima dela):
       code "C:\openspec\livraria-online"
     ou, no VS Code: File → Open Folder → C:\openspec\livraria-online
  2. Nessa janela, abra o Claude Code e comece pela primeira change: /opsx:propose <nome-da-change>
     Se /opsx não aparecer, o Claude Code foi aberto em outra pasta.
```

Siga para a [Primeira change](#4-primeira-change). Se o projeto tiver uma atualização do padrão
pendente, ela chega por PR no repositório de código; não atualize à mão no primeiro dia.

### Sem perguntas

Toda pergunta tem uma opção, útil em automações ou para quem já sabe as respostas
(`node comecar.mjs --help` lista todas):

```powershell
node comecar.mjs --modo novo --pasta D:\Trabalho --nome "Livraria Online" --id livraria-online
node comecar.mjs --modo existente --url-codigo <url-do-codigo> --url-store <url-do-store>
```

## 3. Depois do script, no projeto novo

### Inicializar

Abra a pasta do código como pasta do workspace (no VS Code, File → Open Folder), não a pasta
acima dela: os comandos `/opsx:*` ficam em `.claude/commands/` dentro do código, e o Claude Code
só os carrega quando é aberto nessa pasta. Nessa janela, abra o Claude Code e rode:

```text
/opsx:init
```

A entrevista registra no store a visão do produto, a arquitetura, a stack, os **comandos de
verificação** (instalar, executar, testar, lint, build, migrar, auditar dependências, procurar
secrets), as ADRs fundacionais e o `arquitetura.md`, com o diagrama dos componentes. Antes de confirmar, ela aponta combinações de respostas
incoerentes; ajuste ou justifique cada uma. A entrevista termina com a sua confirmação e o seu
nome como responsável.

### Commitar e publicar

Com o script, os commits já estão feitos: o `comecar.mjs` commita o código e o store depois do
setup, e o `/opsx:init` commita no store o que gerou. Falta só publicar. Se você usou o
`--sem-commit`, se o commit falhou (o script avisa e mostra os comandos) ou se seguiu os passos à
mão, commite antes:

- **No código:** o que o setup instalou: `.claude/`, `.agents/`, `.github/agents/`,
  `.github/workflows/openspec-padrao-update.yml`, `.github/copilot-instructions.md`, `.amazonq/`,
  `docs/openspec-padrao.md`, `docs/openspec-regras.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`,
  `.openspec-padrao.json`, `.gitignore` e `openspec/config.yaml` (a declaração do store).
- **No store:** o que o init gerou em `padrao-openspec/openspec/`: `project.md`, `config.yaml`,
  `project-setup.md`, `arquitetura.md` e as ADRs.

Para publicar:

- **Código:** crie o repositório remoto e rode `git remote add origin <url>` e `git push -u origin main`.
- **Store:** o setup renomeou para `padrao` o remote que apontava para o padrão, para que um push
  no store não vá para o PadraoOpenspct. Crie um repositório próprio para o store e rode
  `git -C <pasta-do-store> remote add origin <url>` e `git -C <pasta-do-store> push -u origin main`.
- **Atualizações do padrão:** no GitHub do repositório de código, ligue **Settings → Actions →
  General → Workflow permissions → Allow GitHub Actions to create and approve pull requests**.
  O workflow instalado abre um PR a cada versão nova (veja `docs/openspec-padrao.md` no projeto).

Passe as duas URLs para quem for entrar no projeto: é o que o modo "projeto em andamento" pede.

**Não mova nem renomeie a pasta do store** depois do setup: o registro aponta para o caminho dela.
Se precisar, veja [Problemas comuns](#6-problemas-comuns).

## 4. Primeira change

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

**Changes com telas:** o agente segue a skill `interface-quality`, com um brief visual no design e a
validação no navegador (`docs/openspec-validar-interface.mjs`) antes de dar a tela por pronta. O verify
só aceita a change com nota "médio" ou melhor; as capturas ficam no `interface-report.md` da change
para você conferir.

**Outros agentes:** os comandos `/opsx:*` são do Claude Code, mas as regras e o fluxo valem para
qualquer agente. O setup põe as regras em `docs/openspec-regras.md` e um bloco
`openspec-padrao` no arquivo que cada agente lê; num agente sem os comandos, peça para ele seguir o
arquivo do comando, por exemplo: "siga as instruções de `.claude/commands/opsx/init.md`".

| Agente | Arquivo que lê | Como rodar o fluxo |
|---|---|---|
| Claude Code | `CLAUDE.md` (importa o `AGENTS.md`); subagentes em `.claude/agents/` | Comandos `/opsx:*` |
| Cursor, Codex, Windsurf | `AGENTS.md` | "Siga `.claude/commands/opsx/<comando>.md`" |
| GitHub Copilot | `.github/copilot-instructions.md` e `AGENTS.md`; subagentes em `.github/agents/` | Idem, ou os subagentes por papel |
| Gemini CLI | `GEMINI.md` | Idem |
| Amazon Q | `.amazonq/rules/openspec-padrao.md` | Idem |

## 5. Sem o script

Os mesmos passos, à mão. Os comandos são de PowerShell; no macOS e no Linux, troque
`C:\openspec\` por `~/openspec/`, `\` por `/` nos caminhos e a crase do fim da linha por `\`.

Instale o OpenSpec CLI, se faltar: `npm install -g @fission-ai/openspec@1.14.2`.

### Projeto novo, à mão

Troque `<projeto>` e `<Nome do Projeto>` pelos valores reais. O store começa da **última
release** do padrão: troque `vX.Y.Z` pela tag que o primeiro comando mostrar ou pela da página
[Releases](https://github.com/Gilmar1987/PadraoOpenspct/releases).

```powershell
# Última release do padrão (precisa do gh; sem ele, veja a página Releases)
gh release view --repo Gilmar1987/PadraoOpenspct --json tagName -q .tagName

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

O clone por tag deixa o store sem branch; o `switch -c main` cria a branch `main` na release.
Cada projeto tem o próprio clone do padrão. Depois, siga a [seção 3](#3-depois-do-script-no-projeto-novo).

### Projeto em andamento, à mão

Não clone o padrão, não rode o setup e não rode o `/opsx:init`.

```powershell
# 1. Clone o código e o store do projeto, lado a lado
git clone <url-do-codigo> C:\openspec\<projeto>
git clone <url-do-store>  C:\openspec\<projeto>-openspec

# 2. Leia o id do store que o código declara (no macOS/Linux: grep '^store:' <arquivo>)
Select-String -Path C:\openspec\<projeto>\openspec\config.yaml -Pattern '^store:'

# 3. Registre a pasta padrao-openspec do store com esse id
openspec store register C:\openspec\<projeto>-openspec\padrao-openspec --id <id> --yes

# 4. Confira: rodado no código, o "path" de "root" tem de terminar em \padrao-openspec do store
cd C:\openspec\<projeto>
openspec context --json
```

O registro vale para esta máquina: cada dev faz o passo 3 uma vez.

## 6. Problemas comuns

| Sintoma | O que fazer |
|---|---|
| `curl.exe` não existe (Windows antigo) | Baixe o `comecar.mjs` pelo navegador, na página [Releases](https://github.com/Gilmar1987/PadraoOpenspct/releases), ou siga a [seção 5](#5-sem-o-script) |
| `openspec: command not found` depois de instalar o CLI | Abra um terminal novo e rode o script de novo |
| O script diz que a pasta já existe | Ele não altera nada. Escolha outro id ou outra pasta base, ou apague a pasta se ela sobrou de uma tentativa anterior |
| O script avisa que a pasta é sincronizada (OneDrive, Dropbox, Google Drive) | Prefira uma pasta fora da sincronização: ela pode travar arquivos do Git e deixar o npm lento |
| O script parou no meio | Ele lista o que já fez e as pastas que criou. Apague essas pastas e rode de novo |
| O código não declara um store (linha `store:`) | O projeto não foi configurado com o setup ou o `openspec/config.yaml` não foi commitado. Peça ao tech lead |
| O id já está registrado nesta máquina | Se o registro é antigo, rode `openspec store unregister <id>` e rode o script de novo |
| Rodei o setup num clone `PadraoOpenspct` | Rode o script, ou clone de novo com o nome do projeto ([seção 5](#5-sem-o-script)), e apague o clone antigo depois de conferir |
| `git status` no store diz `HEAD detached at vX.Y.Z` | Rode `git -C C:\openspec\<projeto>-openspec switch -c main` antes de commitar |
| Movi ou renomeei a pasta do store e o CLI não acha mais o store | `openspec store register <novo-caminho>\padrao-openspec --id <id> --yes` e confira com `openspec context --json` no código |
| O CLI responde `no_root_with_registered_stores` | O CLI foi rodado fora da pasta do código, ou o código não declara o store. Rode-o na pasta do código (linha `store:` em `openspec/config.yaml`) ou passe `--store <id>` |
| O agente rodou `openspec verify` ou `openspec archive` | Os `/opsx:*` são fluxos do agente, não comandos do CLI: não existe `openspec verify`, e o `openspec archive` direto pula aprovação, verificação e revisão. Peça que siga `.claude/commands/opsx/verify.md` ou `archive.md`, que rodam o portão `docs/openspec-portao.mjs` |
| `openspec context --json` no código mostra a pasta do código como raiz, ou o erro cita `Declared in ...openspec/config.yaml` | O store não está registrado com o id da linha `store:`. Registre como no passo 3 da [seção 5](#projeto-em-andamento-à-mão) |
| Registrei a pasta do store sem o `\padrao-openspec` | `openspec store unregister <id>` e registre de novo com `\padrao-openspec` no fim |
| `/opsx` não aparece no Claude Code | Quase sempre o Claude Code foi aberto numa pasta acima do código. Abra a pasta do código como pasta do workspace (File → Open Folder) e uma conversa nova. Se a pasta certa já está aberta, o código não tem `.claude/` commitado: peça ao tech lead para commitar o que o setup instalou |
| O setup recusa `--stack` | A opção foi removida; a stack vem do `/opsx:init` |
| O Claude Code negou um comando com "Papel somente leitura" | Um subagente de revisão tentou gravar algo. É o esperado: ele devolve o achado e quem corrige é o agente principal |
| O turno não encerra e o agente cita "Tarefas marcadas sem a linha Evidência" | Acrescente a linha `Evidência:` a cada tarefa citada, ou desmarque a que não foi verificada. O hook bloqueia uma vez só |
| O Claude Code pede confirmação para `git push`, `gh pr create`, `gh release` ou `openspec archive` | São permissões do padrão no `.claude/settings.json`. Confirme só o que você pediu; veja [Camada do Claude Code](padrao-openspec/templates/openspec-padrao.md#camada-do-claude-code) |
| O instalador recusa `.claude/settings.json` ("is not valid JSON") ou um `.claude/agents/openspec-*.md` | Corrija o JSON à mão, ou renomeie o agente do projeto: o prefixo `openspec-` é do padrão. Nada foi alterado |
| Gerador de projeto recusa a pasta | Rode o gerador numa pasta temporária e copie os arquivos para o repositório de código |
| O CLI está muito lento (Windows) | Veja [Desempenho e ambiente](README.md#desempenho-e-ambiente) |
| O instalador pede `--update` ou `--in-place` | Com a árvore limpa, rode `node <pasta-do-store>\padrao-openspec\scripts\install-skills.mjs <pasta-do-codigo> --update` para receber a atualização numa branch própria (o setup não aceita essa opção) |

## 7. Para saber mais

- [README](README.md): referência completa do padrão.
- [CHANGELOG.md](CHANGELOG.md): o que mudou em cada versão e as ações em cada projeto.
- [openspec/rules.md](openspec/rules.md): as regras que os agentes seguem.
