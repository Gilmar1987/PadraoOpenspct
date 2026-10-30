# Design

## Context

O motivo está no proposal.md ("Why"). O estado atual:

- **Onde o Claude Code carrega o padrão:** os comandos (`.claude/commands/opsx/`), as skills (`.claude/skills/`), os subagentes, os hooks (`.claude/settings.json`) e o `CLAUDE.md` saem da pasta onde a sessão foi aberta. Numa pasta acima do código, nada disso carrega, e o `/opsx:*` chega ao agente como texto.
- **A exceção larga:** o `rules.md` §3 e o bloco de agentes (`templates/agents-block.md`) dizem, sem restrição, que "sem os comandos" o agente segue o arquivo do comando. Foi o que abriu a porta no teste da clínica.
- **O hook de início de sessão:** o `contexto-de-sessao.mjs` imprime "Estado do fluxo OpenSpec (portão do padrão, no início desta sessão):" quando o código tem o portão e o `estado` responde. Ele não tem `matcher`, então roda também na retomada e na compactação.
- **A mensagem final do script de entrada:** o `openWorkspaceSteps` do `comecar.mjs` já mostra `code "<pasta>"` quando o `code` existe. Ele só imprime e não pergunta.
- **A CI:** o passo "Trechos customizados das skills" do `validate.yml` já confere trechos fixos nos comandos e nas skills, com a função `check` e marcadores negativos.

## Goals / Non-Goals

**Goals:**

- Fazer o fluxo parar no primeiro passo quando o Claude Code está na pasta errada, por um texto que o agente lê nesse caso: o arquivo de comando ou a skill que ele abre à mão.
- Fazer o apply, o verify e o archive perceberem os hooks desligados por qualquer causa, e não só a pasta errada.
- Tirar do caminho do dev o passo manual em que o erro nasce, que é abrir a pasta.

**Non-Goals:**

- Garantia mecânica completa. Um agente que ignore o texto passa; o que a change entrega é a parada no ponto de passagem obrigatório e a conferência no apply, no verify e no archive.
- Mexer no `contexto-de-sessao.mjs` ou no portão.
- Escrever arquivos fora das pastas do projeto (o `CLAUDE.md` na pasta-mãe; veja o proposal).

## Decisions

### D1. Um bloco de guarda igual nos 17 arquivos, logo depois do cabeçalho

O bloco entra nos 10 comandos `.claude/commands/opsx/*.md` e nas 7 skills `openspec-*`. Ele fica depois do frontmatter e da linha de abertura de cada arquivo, antes de "**Approval and command**" (ou do primeiro bloco, nos comandos que não têm esse trecho). Ele é escrito em inglês, como o resto desses arquivos, e começa por um rótulo fixo que a CI procura: `**Session folder guard**`.

Texto-base:

> **Session folder guard**: if you are Claude Code and the folder where this session was opened (your primary working directory) is not the folder that contains this file's `.claude/` directory, stop before any step of this workflow. Do not follow this file by hand. Tell the user that the session is outside the code folder, so the standard's commands, hooks, skills and subagents are not loaded, and ask them to open `<folder that contains .claude/>` as the workspace in a new window and start a new conversation there. Compare the paths without case differences in the drive letter. In the right folder, or in an agent without command support, this guard changes nothing.

- **Por que nos 17 arquivos, e não só nas regras:** é o único texto que o agente com certeza lê quando cai na exceção, porque ele abre o arquivo para segui-lo. As regras (`docs/openspec-regras.md`) não carregam na pasta errada, porque o `CLAUDE.md` também não carrega.
- **Por que também nas skills:** com a pasta errada as skills também não carregam, mas um agente pode abrir o `SKILL.md` à mão. E a CI já pareia comando e skill.
- **Alternativa recusada:** um hook. Os hooks são justamente o que não carrega na pasta errada.
- **Alternativa recusada:** a checagem no `portao.mjs`. O agente faz `cd` antes de rodá-lo, então o portão não vê a pasta da sessão.

### D2. A exceção vale só para agentes sem suporte a comandos

- **`rules.md` §3:** o último item da lista vira "num agente sem suporte a comandos (Copilot, Codex, Cursor, Gemini e afins), aceitar como comando o pedido da etapa pelo nome e seguir o arquivo `.claude/commands/opsx/<etapa>.md`. No Claude Code, um `/opsx:*` que não foi expandido quer dizer sessão fora da pasta do código: pare e peça para abrir a pasta do código, sem seguir o arquivo à mão".
- **`templates/agents-block.md`:** a frase "Sem os comandos `/opsx:*` (eles são do Claude Code), siga o arquivo do comando" ganha a mesma restrição, porque o bloco chega ao `AGENTS.md`, que o Claude Code também lê pelo `CLAUDE.md`.
- **COMECE-AQUI:** a seção "Outros agentes" ganha a mesma restrição.

A raiz recebe as mudanças pelo `sync-root.mjs`, como hoje.

### D3. A conferência das proteções no apply, no verify e no archive

Um parágrafo novo, `**Session protections check**`, entra no comando e na skill do apply, do verify e do archive, depois do "Approval and command":

- **Quando roda:** só se o repositório de código tiver `docs/openspec-portao.mjs` e o agente for o Claude Code.
- **O que confere:** se o contexto da sessão traz a linha "Estado do fluxo OpenSpec".
- **Sem a linha:**
  - o agente roda `node docs/openspec-portao.mjs estado` para separar os casos;
  - se o portão responde (exit 0), os hooks não rodaram nesta sessão: pasta errada, `settings.json` ignorado ou hooks desativados;
  - se o portão falha, o problema é outro, e o agente mostra o erro.
- **Nos dois casos:**
  - o agente para e diz o que fica sem proteção: a cobrança de evidência, a exigência de change ativa, a proteção dos ganchos e as guardas dos subagentes;
  - mostra como reabrir a sessão na pasta do código;
  - segue só se o responsável decidir, nessa conversa, continuar sem os hooks;
  - registra a frase dele na evidência da etapa: na primeira tarefa marcada do apply, no `verification.md` do verify e no item `Archive:` do archive.
- **Por que a linha do contexto:** ela é a saída do hook que já existe (`contexto-de-sessao.mjs`) e não exige mudar o hook. Como o hook roda também na compactação e na retomada, a linha volta ao contexto depois delas.
- **Alternativa recusada:** um arquivo-marca gravado pelo hook, por exemplo em `.git/`. Ele daria uma prova mais forte, mas exige mudar o hook e limpar a marca. E uma marca de outra sessão daria um falso "ok".
- **Por que só nessas três etapas:** são as que escrevem código, dão o veredito ou movem a change. O propose e o update só escrevem planejamento; neles, a guarda do D1 basta.

### D4. O script de entrada pergunta se abre o VS Code

- **Onde:** no fim dos dois modos do `comecar.mjs`, depois da mensagem "Pronto. Próximo passo:" e antes de fechar o `readline`.
- **Quando pergunta:** só com o `code` disponível (a mesma conferência do `openWorkspaceSteps`, que já ignora um shim que trava), num console interativo e sem `--yes`. A pergunta é "Abrir o VS Code na pasta do código agora? [S/n]", pelo `askYesNo`, com sim como padrão.
- **Como abre:** pelo `runTool('code', [codeDir], { timeout })`, que já trata os `.cmd` do Windows. O `code` só dispara a janela e sai, então não fica preso.
- **Com falha:** um exit diferente de 0 ou um timeout geram um aviso, e o script termina com sucesso. A mensagem com o comando continua impressa antes da pergunta.
- **Teste:** é um script interativo, então, pelo `project.md`, o responsável testa num PowerShell real antes do archive. A CI cobre o caminho com `--yes`: nenhuma pergunta nova na saída.
- **Alternativa recusada:** abrir o VS Code sem perguntar. Isso abriria uma janela inesperada para quem usa outro editor ou já está com o projeto aberto.

### D5. A CI confere os trechos e barra o texto antigo

No passo "Trechos customizados das skills" (job `store`, em `padrao-openspec/`):

- **Guarda:** `check "$f" "**Session folder guard**"` para os 10 comandos e as 7 skills `openspec-*`.
- **Conferência:** `check "$f" "**Session protections check**"` para o comando e a skill do apply, do verify e do archive.
- **Regras e bloco de agentes:** `check openspec/rules.md` e `check templates/agents-block.md` com a frase da restrição a agentes sem suporte a comandos.
- **Frase do hook:** `check .claude/hooks/openspec-padrao/contexto-de-sessao.mjs "Estado do fluxo OpenSpec"`, porque a conferência do D3 depende dessa frase.
- **Marcador negativo:** o texto antigo "num agente sem os comandos `/opsx:*`, aceitar como comando o pedido da etapa pelo nome" não pode voltar ao `rules.md`.

O passo "Smoke test do script de entrada" ganha uma conferência: a saída com `--yes` não contém "Abrir o VS Code".

### D6. Versão

É a primeira change depois da v1.16.0, então abre a 1.17.0: `padrao-openspec/VERSION` e a seção `## 1.17.0` do `CHANGELOG.md`, com a data acertada na publicação. A ação no projeto é "Nenhuma": os comandos, as skills e as regras chegam com a atualização do padrão. A tarefa 1.1 combina a versão com a outra sessão antes do apply.

## Risks / Trade-offs

- [Agente que ignora o texto] → A guarda é texto lido pelo modelo, não mecanismo. Mitigação: ela fica no ponto de passagem obrigatório e é curta e imperativa; a conferência do D3 pega o caso nas etapas que escrevem código.
- [Falso alarme na conferência] → Uma sessão aberta antes da atualização do padrão, ou um hook com falha, não traz a linha. Mitigação: o `estado` separa o portão quebrado dos hooks desligados, e o responsável pode reabrir a sessão ou decidir seguir.
- [O texto do hook mudar] → Se o `contexto-de-sessao.mjs` mudar a frase, a conferência sempre dispara. Mitigação: a tarefa da CI confere a frase "Estado do fluxo OpenSpec" também no hook.
- [Sessão aberta numa subpasta do código, como `apps/web`] → A guarda pede para abrir a pasta do `.claude/`, o que está certo: lá também os comandos não carregam.
- [Pergunta nova no script interativo] → Uma pergunta a mais no fim. Mitigação: só aparece com o `code` disponível e sem `--yes`, e o padrão é sim.

## Migration Plan

Os projetos recebem tudo pela atualização do padrão, sem ação manual. Para desfazer, basta reverter o commit: nenhum dado é migrado.
