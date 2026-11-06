# Design

## Context

O motivo está no `proposal.md` ("Why"). O estado atual que molda a solução:

- **Comandos e skills:** os 10 comandos `padrao-openspec/.claude/commands/opsx/*.md` e as 7 skills `openspec-*` começam com o parágrafo `**Session folder guard**`, da change `guarda-da-pasta-da-sessao`. Ele só age quando o Claude Code lê o arquivo à mão, porque o comando chegou como texto. Ele também declara que não muda nada "in an agent other than Claude Code" nem quando o texto chegou pela expansão do Claude Code.
- **Raiz do clone:** o clone do store que o `comecar.mjs` cria (`<base>/<id>-openspec`, ao lado de `<base>/<id>`) é uma cópia do PadraoOpenspct.
  - Na raiz, ele tem `.claude/commands/opsx/` e `.claude/skills/`, cópias da raiz do padrão pelo `sync-root.mjs`, e o `openspec/` do desenvolvimento do padrão.
  - O store real fica em `padrao-openspec/`, que o CLI registra com o arquivo `padrao-openspec/.openspec-store/store.yaml` (`version: 1` e `id: <id>`, como em `C:\teste002\futebol\futebol\socker-openspec`).
- **Marcadores:** o repositório do PadraoOpenspct não tem `padrao-openspec/.openspec-store/`, conferido na `main` em 2ea1542. A pasta do código tem `.openspec-padrao.json` e `openspec/config.yaml` com `store: <id>`, mas não tem `padrao-openspec/`.
- **Sem ganchos no clone:** a raiz do clone não tem `.claude/settings.json`, então nenhum gancho do padrão roda nela. O único mecanismo que alcança um agente no clone é o texto dos comandos, das skills e das regras.
- **Regras:** o `padrao-openspec/openspec/rules.md` é copiado para `openspec/rules.md` pelo `sync-root.mjs` e chega aos projetos como `docs/openspec-regras.md`. No clone, o `CLAUDE.md` da raiz manda ler o `openspec/rules.md`.

## Goals / Non-Goals

**Goals:**

- Qualquer agente aberto no clone do store para antes de seguir um fluxo `/opsx` e aponta a pasta do código.
- Nenhum falso alarme na pasta do código nem no repositório do padrão.
- O texto da guarda fica protegido pela CI, como o da guarda da pasta da sessão.

**Non-Goals:**

- Mudar a estrutura do clone (frente B) ou o CLI.
- Achar e abrir a pasta do código pelo agente: ele só indica como reconhecê-la.

## Decisions

### D1. O marcador é `padrao-openspec/.openspec-store/store.yaml` ao lado do `.claude/` do arquivo

O agente sabe o caminho do arquivo que está seguindo e resolve o marcador a partir da pasta que contém o `.claude/` desse arquivo. Não depende da pasta da sessão, que os agentes informam de jeitos diferentes.

- O marcador só existe no clone de um store registrado.
- O `id` do arquivo é o mesmo que a pasta do código declara em `store: <id>`, o que permite ao dev reconhecê-la.

Alternativas:

- **Pasta sem `.openspec-padrao.json`:** o repositório do próprio padrão também não tem esse arquivo, e os fluxos rodam nele para mudar o padrão. Seria falso alarme.
- **Pasta com `padrao-openspec/` e `openspec/rules.md`:** também casa com o repositório do padrão.
- **Nome terminado em `-openspec`:** o modo "projeto existente" do `comecar.mjs` usa o nome do repositório do store, que pode não ter o sufixo.

### D2. Um parágrafo novo, antes da guarda da pasta da sessão, que vale para qualquer agente

O parágrafo `**Store clone guard**` entra logo antes do `**Session folder guard**`, em inglês, como os outros trechos do topo:

> **Store clone guard**: this applies to any agent, Claude Code included, and also when this text reached you through Claude Code's own command or skill expansion. If the folder that contains this file's `.claude/` also has `padrao-openspec/.openspec-store/store.yaml`, that folder is the clone of a project's OpenSpec store, not the code folder: stop before any step of this workflow and write nothing. Read the store id from that file (`id: <id>`), tell the user that the folder is the clone of store `<id>`, and ask them to open, in a new window, the code folder whose `openspec/config.yaml` declares `store: <id>` (in a project created by `comecar.mjs`, it sits next to this folder, named without the `-openspec` suffix). This guard changes nothing when you are only reading or editing this file as a file, for example to change the standard.

A guarda da pasta da sessão não muda. As exceções dela (expansão do Claude Code, subagente e agente que não é o Claude Code) continuam valendo para ela, e não para a guarda nova.

Alternativas:

- **Estender o `**Session folder guard**`:** misturaria duas condições com exceções opostas e reescreveria trechos que a CI e a change `guarda-da-pasta-da-sessao` protegem.
- **Pôr a guarda só no `init.md`:** o `propose`, o `apply` e o `archive` também gravam no `openspec/` errado do clone.

### D3. Regras e bloco de agentes com a mesma frase

- No `padrao-openspec/openspec/rules.md`, na lista de condutas da seção 3, logo depois do item sobre o `/opsx:*` que chega como texto no Claude Code, entra o item: "na pasta do clone de um store (a que tem `padrao-openspec/.openspec-store/store.yaml`), em qualquer agente: não seguir os fluxos `/opsx` nem gravar specs, changes ou ADRs, e pedir para abrir a pasta do código, a que declara `store: <id>` no `openspec/config.yaml`".
- O bloco de agentes (`templates/agents-block.md`) ganha a mesma instrução, em uma linha.
- O `sync-root.mjs` leva o `rules.md` para a raiz.

### D4. A CI exige os trechos

No passo "Trechos customizados das skills", logo depois do bloco da guarda da pasta da sessão, entra um bloco que exige:

- `**Store clone guard**` e `padrao-openspec/.openspec-store/store.yaml` nos 17 arquivos;
- `padrao-openspec/.openspec-store/store.yaml` em `openspec/rules.md` e em `templates/agents-block.md`.

O bloco cita os requisitos num comentário. Ele roda antes do texto existir e falha nos 19 casos (tarefa 1.2).

### D5. Roteiros reais

- **Claude Code:** `claude -p "/opsx:propose teste"` num clone de teste com `store.yaml` deve parar sem criar a change. Na pasta do código instalada da branch, `claude -p "/opsx:explore ..."` deve seguir sem falar em clone.
- **Copilot:** o responsável abre o clone de teste no VS Code e pede para seguir o `init.md`. O agente deve parar sem gravar.

## Risks / Trade-offs

- **[Agente que ignora o texto]** A guarda não é um mecanismo. → O roteiro com o Copilot, o agente do caso real, confere que ele para. O guia já diz que, fora do Claude Code, valem as regras e o portão.
- **[Store registrado com outra estrutura]** Um store que não seja um clone do padrão (sem `padrao-openspec/`) não tem o marcador nesse caminho, e a guarda não dispara. → É o comportamento de antes. Os stores que o `comecar.mjs` cria seguem a estrutura do clone.
- **[Texto mais longo no topo de cada arquivo]** São cerca de 90 palavras a mais no contexto de cada fluxo. → É o preço de valer em qualquer agente, já pago pela guarda da v1.18.0.

## Migration Plan

- Projetos recebem os comandos e as skills novos pelo `--update` do padrão.
- O clone do store recebe a raiz nova quando o dev atualiza o clone (`git pull` do padrão ou o fluxo de atualização do store).

## Open Questions

- Nenhuma.
