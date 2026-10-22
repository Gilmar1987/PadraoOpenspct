---
id: ADR-0005
status: Accepted
date: 2026-10-22
supersedes:
superseded_by:
related_changes: [regras-em-qualquer-agente]
---

# ADR-0005: Regras do padrão entregues ao código por blocos gerenciados nos arquivos de instrução dos agentes

## Contexto

As regras globais (`openspec/rules.md`: aprovação explícita, ciclo obrigatório, push só com pedido, segurança, disciplina de contexto) são carregadas automaticamente só neste repositório, pelo `.claude/CLAUDE.md` e pelos stubs de Cursor, Windsurf, Amazon Q e Copilot. O instalador não entrega nada disso ao repositório de código dos projetos. No Lava Jato (2026-10-22), o código tem um `AGENTS.md` do Next.js, mas nenhum arquivo aponta para as regras. Os comandos `/opsx:*` repetem as regras principais, mas uma conversa fora deles não as recebe, e agentes diferentes do Claude Code leem arquivos de instrução diferentes (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, regras próprias de Windsurf e Amazon Q).

Os arquivos de instrução do projeto pertencem ao projeto, e outros geradores também escrevem neles (por exemplo, o bloco `nextjs-agent-rules` do `create-next-app`).

## Decisão

- As regras globais SHALL ter uma fonte única em `padrao-openspec/openspec/rules.md`. A cópia da raiz deste repositório passa a ser gerada pelo `sync-root.mjs`, e o instalador entrega a regra ao código como arquivo gerenciado em `docs/openspec-regras.md`.
- O `AGENTS.md` do código SHALL ser o ponto de entrada comum. Nele, o instalador mantém um bloco delimitado por `<!-- BEGIN:openspec-padrao -->` e `<!-- END:openspec-padrao -->`, que manda ler as regras e explica como seguir os comandos `/opsx:*` em qualquer agente.
- Nos arquivos de instrução de agentes que não leem o `AGENTS.md` por padrão, o instalador mantém um bloco igual, delimitado pelos mesmos marcadores, que aponta para o `AGENTS.md` (por import, quando o agente suporta) ou repete o bloco.
- Fora dos marcadores, o instalador MUST NOT alterar esses arquivos. Ele cria o arquivo se não existir, acrescenta o bloco no fim se não houver bloco e substitui só o conteúdo entre os marcadores numa atualização.

## Alternativas consideradas

| Alternativa | Por que não foi escolhida |
|---|---|
| Sobrescrever `AGENTS.md`, `CLAUDE.md` etc. como arquivos gerenciados inteiros | Apagaria instruções do projeto e de outros geradores (como o bloco do Next.js) |
| Só documentar no COMECE-AQUI que o dev deve apontar o agente para as regras | Depende de cada dev lembrar; é exatamente a lacuna que apareceu no Lava Jato |
| Copiar as regras inteiras em cada arquivo de agente | Seis cópias para manter em dia; o bloco curto com ponteiro para `docs/openspec-regras.md` evita divergência |

## Consequências

- Qualquer agente aberto no repositório de código recebe as regras sem configuração manual, desde que leia um dos arquivos cobertos.
- O instalador passa a editar arquivos do projeto, ainda que só entre marcadores; o modo `--update` e o PR de atualização mostram o diff desses blocos.
- O texto das regras precisa servir aos dois contextos (este repositório e os projetos).
- A lista de arquivos por agente precisa acompanhar a evolução dos agentes; mudá-la é uma change do padrão.
