# Padrão OpenSpec neste repositório

Este repositório usa o padrão OpenSpec do [PadraoOpenspct](https://github.com/Gilmar1987/PadraoOpenspct):
skills, comandos `/opsx:*` e agentes que guiam o fluxo propose → apply → verify → archive.
Este guia é gerenciado pelo padrão e é substituído a cada atualização; não o edite à mão.

## Entrar neste projeto

Para trabalhar neste projeto numa máquina nova, você precisa também do store OpenSpec do projeto,
registrado na máquina. Peça ao tech lead a URL do repositório do store e rode, na pasta onde os
repositórios devem ficar (no macOS e no Linux, `curl` no lugar de `curl.exe`):

```powershell
curl.exe -LO https://github.com/Gilmar1987/PadraoOpenspct/releases/latest/download/comecar.mjs
node comecar.mjs --modo existente
```

O script clona este repositório e o store, lê o id na linha `store:` do `openspec/config.yaml`,
registra o store e confere que o OpenSpec CLI o encontra a partir daqui. Se você já clonou este
repositório, rode o script em outra pasta ou siga os passos à mão da seção "Sem o script" do
[COMECE-AQUI.md](https://github.com/Gilmar1987/PadraoOpenspct/blob/main/COMECE-AQUI.md#5-sem-o-script).
O projeto já está inicializado: não rode `/opsx:init`; comece pela primeira change.

## Primeiros passos

1. **Se o projeto é novo, inicialize-o**: abra o agente neste repositório e rode `/opsx:init`.
   A entrevista registra no store OpenSpec a stack, os comandos de verificação e as ADRs.
2. **Confira os commits.** O `comecar.mjs` já faz o commit inicial deste repositório e do store, e o
   `/opsx:init` commita no store o que gerar. Sem o script, commite os arquivos que o padrão instalou
   (os listados em `managedFiles` e `managedBlocks` do `.openspec-padrao.json`, o próprio
   `.openspec-padrao.json`, o `.gitignore`, o `openspec/config.yaml`, o `.claude/settings.json` e, quando
   o padrão o criou, o `.gitattributes`).
3. **Faça cada mudança pelo ciclo** `/opsx:propose` → aprovação e `/opsx:apply` → aprovação e
   `/opsx:verify` → aprovação e `/opsx:archive`. Cada etapa só começa com a aprovação escrita
   (`Eu aprovo fazer ...`) e o comando digitado por você; ao fim de cada uma, o agente para e
   mostra a aprovação e o comando da próxima. O agente só faz push, abre PR ou faz deploy quando
   você pede.

O passo a passo completo, com pré-requisitos e problemas comuns, está no
[COMECE-AQUI.md](https://github.com/Gilmar1987/PadraoOpenspct/blob/main/COMECE-AQUI.md) do padrão.

## Portão

O `docs/openspec-portao.mjs` dá a mesma resposta, para qualquer agente ou pessoa, sobre escrever código
e arquivar uma change:

```sh
node docs/openspec-portao.mjs apply <change>     # aprovação completa?
node docs/openspec-portao.mjs archive <change>   # escopo archive, tarefas, verification.md e review.md?
node docs/openspec-portao.mjs selo <change>      # selo do planejamento, para o item "Conteúdo:" da aprovação
node docs/openspec-portao.mjs estado             # changes ativas, aprovação, selo e próximo passo
```

A aprovação registra o selo do planejamento (proposal sem a seção de aprovação, design, specs e
tarefas sem as caixas e as linhas `Evidência:`). Se ele mudar depois, o portão bloqueia com "A
aprovação venceu": o `/opsx:update` mostra o que mudou e registra a reconfirmação do responsável.
Aprovações sem selo, de antes desta versão, seguem valendo com um aviso. O portão também bloqueia o
apply enquanto um artefato tiver a marca `[INFERIDO: <base>]`, que o propose e o init usam para fatos
deduzidos sem fonte.

Saída 0 libera, 1 bloqueia com os motivos e 2 indica erro de ambiente (por exemplo, store não
resolvido: rode na pasta deste repositório ou passe `--store <id>`). Os fluxos `/opsx:apply` e
`/opsx:archive` rodam o portão sozinhos. Para recusar também commits `OpenSpec-Change: <change>` de
changes não aprovadas, rode uma vez `node docs/openspec-portao.mjs instalar-hook`.

## Validação de interface

Numa change que cria ou muda telas, siga a skill `interface-quality`: o `design.md` traz um "Brief
visual", e antes de marcar a tarefa de uma tela a aplicação passa pela validação no navegador:

```sh
node docs/openspec-validar-interface.mjs http://localhost:<porta>/ --jornadas openspec/changes/<change>/interface/jornadas.json --saida openspec/changes/<change>
```

O script instala o Playwright e o axe-core numa pasta temporária fora do projeto (na primeira vez,
baixa o Chromium, cerca de 100 MB) e precisa do Node.js 20 ou mais novo. Ele grava o
`interface-report.md` com capturas em 390, 768 e 1280 px, acessibilidade, console, links, título,
favicon, página 404, o resultado de cada jornada e uma nota automática. Saída 0 com nota "médio" ou
"bom", 1 com "fraco" e 2 em erro de ambiente. No Claude Code, o subagente
`openspec-validador-de-interface` roda o script, olha as capturas e dá a nota final, que vai para a
seção "Avaliação do validador" do relatório; o `/opsx:verify` exige "médio" ou melhor.

## Camada do Claude Code

No Claude Code, o padrão também impõe limites por mecanismo, e não só por instrução
([ADR-0006](https://github.com/Gilmar1987/PadraoOpenspct/blob/main/openspec/adrs/0006-camada-do-claude-code-por-entradas-gerenciadas.md)).

**Subagentes** em `.claude/agents/openspec-*.md`, um por papel, com ferramentas e modelo próprios:

| Subagente | Ferramentas | Papel |
|---|---|---|
| `openspec-spec-architect` | leitura | Analisa specs e impactos e prepara drafts de proposal, specs e design |
| `openspec-task-planner` | leitura | Deriva o checklist de tarefas dos artefatos aprovados |
| `openspec-consistency-guardian` | leitura | Aponta contradições e duplicações entre changes, specs e ADRs |
| `openspec-requirements-ingestor` | leitura | Extrai requisitos de atas e documentos de negócio |
| `openspec-qa-validator` | leitura e shell somente leitura | Valida a change antes do archive |
| `openspec-stage-reviewer` | leitura e shell somente leitura | Roda os Comandos de verificação e devolve só as falhas |
| `openspec-code-reviewer` | leitura e shell somente leitura | Revisa o intervalo de commits da change (passo 6a do apply) |
| `openspec-validador-de-interface` | leitura e shell somente leitura | Valida as telas da change no navegador e dá a nota final |
| `openspec-code-implementer` | leitura, edição e shell | Implementa as tarefas aprovadas |

Os de veredito não têm ferramenta de edição e devolvem achados com evidência, sem corrigir. Nas
chamadas dos que têm shell, um hook nega comandos que gravam arquivos ou alteram o Git
(redirecionamento, `tee`, `sed -i`, código inline, `git commit`, `git push`, `rm`, `mv`). Nas chamadas
do implementador, um hook nega a escrita fora do repositório e nos arquivos do padrão (`.claude/`,
`.github/agents/`, `docs/openspec-*` e `.openspec-padrao.json`). Esses hooks ficam no
`.claude/settings.json` e reconhecem o subagente pelo campo `agent_type` da chamada; o agente
principal não é afetado. Uma sessão aberta com `claude --agent openspec-<papel>` assume o papel e
passa a ter os mesmos limites.

**Hooks de sessão** em `.claude/hooks/openspec-padrao/`, ligados pelo `.claude/settings.json`:

- **Fim do turno:** se um `tasks.md` alterado nesta conversa tem tarefa marcada sem a linha
  `Evidência:` logo abaixo, o turno não encerra uma vez, e o agente recebe a lista das tarefas. Tarefas
  de changes que a conversa não tocou não bloqueiam. Uma falha de ambiente (CLI ausente, store não
  resolvido) nunca bloqueia, e o hook desiste depois de alguns segundos.
- **`openspec archive <change>`:** roda o portão (`docs/openspec-portao.mjs archive <change>`) e nega o
  comando com os motivos quando ele bloqueia. Sem o portão, pede a sua confirmação.
- **Início da sessão:** o agente recebe o estado das changes ativas (tarefas, aprovação, selo,
  inferências e próximo passo), tirado de `docs/openspec-portao.mjs estado`, em vez de deduzir a fase.
- **Ganchos do Git:** `git commit --no-verify`, `git commit -n` e qualquer escrita de
  `core.hooksPath` são negados, para o agente principal e para os subagentes; consultar o
  `core.hooksPath` segue liberado.
- **Escrita fora do fluxo:** uma edição de arquivo do repositório fora de `openspec/` sem nenhuma change
  ativa aprovada (com o selo em dia e sem inferências a confirmar) pede a sua confirmação. Dentro de
  `openspec/`, ou com uma change aprovada, segue sem pergunta.

**Permissões:** `git push`, `gh pr create`, `gh release` e `openspec archive` pedem a sua confirmação;
`git push --force ...`, `git push -f ...` e `git reset --hard ...` são negados (outras formas de push
forçado, como `--force-with-lease`, caem na confirmação do `git push`). O padrão não acrescenta nada em
`allow`. As regras valem para a ferramenta Bash; no Windows sem Git Bash, em que o Claude Code usa a
ferramenta PowerShell, elas não se aplicam, e valem só os hooks e as regras de `docs/openspec-regras.md`.

No `.claude/settings.json`, o instalador só mexe nas entradas dele: os hooks que apontam para
`.claude/hooks/openspec-padrao/` e as permissões listadas em `managedSettings` no
`.openspec-padrao.json`. Para desligar uma entrada, apague-a do arquivo. A próxima reinstalação ou
atualização do padrão pede `--update` ou `--in-place` e a põe de volta, e o PR de atualização mostra
isso no diff. O instalador mantém a indentação, o fim de linha e o BOM do arquivo.

Avisos:

- **Confiança na pasta:** os hooks e as regras `allow` do projeto só valem depois que a pasta é marcada
  como confiável no Claude Code; `ask` e `deny` valem logo.
- **Limite:** os hooks e as permissões são heurísticas sobre o texto do comando, não uma sandbox. Um
  comando por outro caminho (o caminho absoluto de outro interpretador, uma expansão de variável,
  `$( )`) pode escapar. As regras
  de `docs/openspec-regras.md` continuam valendo.
- **Outros agentes** não recebem esta camada; para eles valem os blocos de instrução e o portão.
- **Versão:** os hooks de papel dependem do campo `agent_type`, que o Claude Code envia nas chamadas
  de subagente; o roteiro abaixo foi validado no Claude Code 2.1.243. Sem esse campo, os hooks de papel
  liberam tudo sem aviso: repita o passo 1 do roteiro no ambiente que o time usa (terminal, VS Code).

### Roteiro de verificação no Claude Code

Depois de instalar ou atualizar o padrão, confira num repositório de teste, com uma conversa nova:

1. Peça ao agente que despache o `openspec-qa-validator` e que ele rode `python -c "print(1)"`, um
   comando que só lê e que o agente não tem motivo para recusar. O comando deve ser negado com "Papel
   somente leitura"; se aparecer `1`, o hook não disparou.
2. Com a conversa aberta, marque à mão, no editor, uma tarefa de uma change de teste sem a linha
   `Evidência:` e peça ao agente uma resposta curta. O turno deve continuar uma vez, citando a tarefa.
3. Peça `openspec archive <change de teste>`. Com o portão, o comando deve ser negado com os motivos;
   sem ele, o Claude Code deve pedir confirmação.
4. Numa conversa nova, pergunte, sem deixar o agente rodar comandos, o que ele sabe sobre as changes
   OpenSpec do projeto. Ele deve citar o estado (tarefas, aprovação e próximo passo) que recebeu no
   início da sessão.
5. Peça `git commit --allow-empty --no-verify -m teste`. O comando deve ser negado, citando o hook
   commit-msg do padrão.
6. Com o modo "accept edits" ligado e nenhuma change aprovada, peça para criar um arquivo em `src/`. O
   Claude Code deve pedir a sua confirmação com a mensagem do padrão; dentro de `openspec/`, não.

Registre quem executou, quando e o resultado de cada passo no `verification.md` da change que mexeu
nesta camada.

## Usar com outros agentes

As regras do padrão chegam a este repositório como `docs/openspec-regras.md`. Cada agente as recebe por
um bloco entre `<!-- BEGIN:openspec-padrao -->` e `<!-- END:openspec-padrao -->` no arquivo de
instrução que ele lê. O padrão só altera o texto entre os marcadores; escreva instruções próprias fora
deles.

| Agente | Arquivo que lê | Como rodar o fluxo |
|---|---|---|
| Claude Code | `CLAUDE.md` (importa o `AGENTS.md`); subagentes em `.claude/agents/` | Comandos `/opsx:*` |
| Cursor, Codex, Windsurf | `AGENTS.md` | "Siga `.claude/commands/opsx/<comando>.md`" |
| GitHub Copilot | `.github/copilot-instructions.md` e `AGENTS.md`; subagentes em `.github/agents/` | Idem, ou os subagentes por papel |
| Gemini CLI | `GEMINI.md` | Idem |
| Amazon Q | `.amazonq/rules/openspec-padrao.md` | Idem |

Apagar um desses arquivos não quebra nada, mas a próxima atualização do padrão o recria.

## Versão instalada

A versão do padrão, o commit e o repositório de origem ficam em `.openspec-padrao.json`, na raiz
do repositório. O campo `managedFiles` lista os arquivos que o instalador gerencia, como os de
`.claude/`, `.agents/skills/` e `.github/agents/`, este guia e o workflow de atualização.

Não edite esses arquivos à mão: a próxima atualização os substitui. Uma customização precisa
virar mudança no padrão ou ficar num arquivo fora da lista.

## Como a atualização chega

O workflow `.github/workflows/openspec-padrao-update.yml` roda toda segunda-feira e pode ser
disparado à mão em **Actions → Atualização do padrão OpenSpec → Run workflow**. Ele compara a
versão instalada com a última release do padrão. Se houver versão nova, ele:

1. cria a branch `chore/padrao-vX.Y.Z` a partir da branch padrão do repositório;
2. instala a versão nova e commita só os arquivos gerenciados;
3. abre um PR com as **Ações no projeto** em destaque e o changelog entre as duas versões.

Revise o PR como qualquer outro. As "Ações no projeto" são os passos manuais da versão, por
exemplo acrescentar uma seção ao `project.md` do store OpenSpec. Faça-os antes ou junto do merge.

Para **recusar uma versão**, feche o PR e mantenha a branch: o workflow não volta a propor uma
versão cujo PR foi fechado. Para que ele a proponha de novo, apague a branch remota.

### Permissão necessária

Para o workflow conseguir abrir o PR, ligue no GitHub:
**Settings → Actions → General → Workflow permissions → Allow GitHub Actions to create and approve
pull requests**. Sem ela, o workflow falha no passo "Abrir o PR" depois de publicar a branch
`chore/padrao-vX.Y.Z`. Ligue a opção e rode o workflow de novo: ele reaproveita a branch e só abre
o PR.

O workflow usa o `GITHUB_TOKEN` do próprio repositório, com permissão de escrever código e
abrir PRs, e lê o padrão pela release pública.

Quando uma versão nova muda arquivos em `.github/workflows/` (inclusive este workflow), o GitHub
não aceita o push feito com o `GITHUB_TOKEN`, e o workflow falha com uma mensagem explicando o
caso. Para automatizar também essas versões, crie o segredo de repositório `PADRAO_UPDATE_TOKEN`
com um token que tenha o escopo `workflow` (ou um GitHub App com essa permissão); o workflow o
usa quando existe. Sem ele, atualize essas versões à mão (abaixo).

O workflow roda o instalador da tag do padrão com permissão de escrita no repositório: confie no
repositório do padrão como confia em qualquer dependência. Um PR aberto com o `GITHUB_TOKEN` não dispara os
outros workflows: para rodar a CI no PR de atualização, faça um push na branch ou feche e reabra
o PR.

## Atualizar à mão

Sem o workflow (por exemplo, num repositório sem remoto), os comandos `/opsx:propose`, `/opsx:apply`,
`/opsx:verify` e `/opsx:archive` avisam da versão nova e oferecem rodar os comandos abaixo; eles só
rodam com a sua confirmação e com a árvore limpa, clonando o padrão numa pasta fora deste repositório,
e voltam à sua branch depois, deixando a `chore/padrao-vX.Y.Z` para você revisar e mergear. À mão, ou
para testar antes, a partir de um clone do padrão na tag desejada, fora deste repositório:

```sh
git clone --depth 1 --branch vX.Y.Z https://github.com/Gilmar1987/PadraoOpenspct padrao-tmp
node padrao-tmp/padrao-openspec/scripts/install-skills.mjs <este-repositório> --update
```

O `--update` exige a árvore limpa, cria a branch `chore/padrao-vX.Y.Z`, instala e commita. Ele
não faz push. Se algo falhar no meio (um hook de commit, por exemplo), ele volta à branch original
e apaga a branch nova. Para gravar direto na branch atual, sem commit, use `--in-place` no lugar
de `--update`. Sem um dos dois, o instalador se recusa a alterar arquivos já instalados; o
`--force` antigo não substitui esses modos e é ignorado com um aviso.

## Onde ver o que mudou

No `CHANGELOG.md` do PadraoOpenspct e nas releases do repositório. Cada versão tem "O que mudou"
e "Ações no projeto".
