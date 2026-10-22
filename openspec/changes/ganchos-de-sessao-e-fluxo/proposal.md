# Proposal

## Why

A camada do Claude Code da `subagentes-e-ganchos` (v1.10.0, PR #30) protege os papéis: os subagentes de veredito não escrevem, o implementador não toca arquivos gerenciados, e o archive passa pelo portão. Para o agente principal, ficam três buracos que o kit-esquadro (projeto Marelli, analisado em 2026-10-22) fecha com hooks:

- **O agente não sabe em que ponto o fluxo está quando a sessão começa.** Ele deduz, e às vezes deduz errado: no kit, um agente inventou uma fase que não existia. O hook de início de sessão do kit, que só informa, é chamado lá de "a peça de melhor razão custo-benefício".
- **O hook `commit-msg` do padrão pode ser desligado com uma opção:** `git commit --no-verify`, `git commit -n` ou `git config core.hooksPath`. O kit nega essas três formas.
- **A regra "nada de código sem change aprovada" é instrução.** O portão de apply só roda quando o agente segue o `/opsx:apply`, e o hook `commit-msg` só confere commits que citam uma change. Uma edição direta, fora do fluxo, passa sem pergunta nenhuma.

## What Changes

- **Estado das changes no portão:** comando novo `node docs/openspec-portao.mjs estado [--json] [--store <id>]`. Ele lista as changes ativas com:
  - o progresso das tarefas;
  - a situação da aprovação (pendente, apply ou archive);
  - o selo de conteúdo (válido, vencido ou ausente), quando a `aprovacao-por-conteudo` já estiver aplicada;
  - as inferências não confirmadas;
  - o próximo passo do fluxo.
- **Hook de início de sessão** (`contexto-de-sessao.mjs`, evento SessionStart): roda o `estado` e entrega ao agente um resumo curto do fluxo. Não bloqueia nada; sem o portão no repositório, não faz nada.
- **Hook que protege os ganchos do Git** (`protege-ganchos.mjs`, PreToolUse `Bash|PowerShell`, para todos os agentes): nega `--no-verify` em comandos `git`, `-n` em `git commit` e qualquer escrita de `core.hooksPath` (`git config`, `git -c`). A leitura (`git config --get core.hooksPath`) segue liberada.
- **Hook de escrita fora do fluxo** (`exige-change.mjs`, PreToolUse `Edit|Write`, para todos os agentes):
  - quando o alvo está no repositório e fora de `openspec/`, confere pelo `estado` se existe ao menos uma change ativa aprovada, sem selo vencido e sem inferência pendente;
  - sem nenhuma, **pede confirmação ao usuário** (não nega), explicando que a regra do padrão é passar por uma change;
  - uma resposta positiva do `estado` fica em cache por sessão durante 60 segundos, para não pagar os 2 a 3 segundos do CLI a cada edição.
- **Template `claude-settings.json`:** grupo novo `SessionStart` e um hook a mais nos grupos `Bash|PowerShell` e `Edit|Write`, todos sob `.claude/hooks/openspec-padrao/`, como o instalador exige.
- **CI:** casos novos nos smoke tests do portão e dos hooks do Claude Code, e a lista `placed` do smoke da camada do Claude Code no instalador.
- **Versão:** a combinar com o responsável. Provisoriamente 1.17.0, depois da `aprovacao-por-conteudo`.

### Fora do escopo

- Detectar pedido de implementação pelo texto do prompt (o `exige-fluxo-sdd` do kit usa regex em português, frágil): o hook de escrita cobre o mesmo risco pelo efeito.
- Interpretar o shell inteiro (o `escopo-de-execucao` do kit, de 770 linhas, negou comandos legítimos de leitura no próprio registro dele).
- Saber a qual change uma edição pertence: o hook confere só que existe alguma change aprovada; a ligação commit ↔ change continua com o trailer e o hook `commit-msg`.
- Agentes que não são o Claude Code: seguem com as regras do bloco gerenciado (ADR-0005).

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `agent-guardrails` (criada pela `subagentes-e-ganchos`): estado do fluxo no início da sessão, ganchos do Git protegidos e escrita fora do fluxo com confirmação.
- `change-approval`: o portão ganha o comando `estado`.

## Impact

- **Hooks:** `padrao-openspec/.claude/hooks/openspec-padrao/` ganha `contexto-de-sessao.mjs`, `protege-ganchos.mjs` e `exige-change.mjs`, que reaproveitam o `comum.mjs` (`readPayload`, `deny`, `ask`, `shellCommands`, `repositoryRoot`).
- **Template e instalador:** `padrao-openspec/templates/claude-settings.json`; o instalador já mescla grupos novos e mistos.
- **Portão:** `padrao-openspec/scripts/portao.mjs` (comando `estado`).
- **CI, documentação e versão:** `validate.yml`, `README.md`, guia do projeto, `CHANGELOG.md`, `VERSION`.
- **Dependências:**
  - o apply começa depois do merge da `subagentes-e-ganchos` (hooks, `comum.mjs`, template e capability `agent-guardrails`) e da `aprovacao-por-conteudo` (selo e marcas que o `estado` informa);
  - a outra sessão foi avisada em 2026-10-22, não vê conflito e deu as notas que o design segue.
- **Riscos:**
  - **Atrito:** um pedido de confirmação a cada edição fora do fluxo. Mitigação: só quando não há change aprovada, e a confirmação é do usuário.
  - **Latência:** o CLI leva 2 a 3 segundos no Windows. Mitigação: cache da resposta positiva por sessão e nenhum custo dentro de `openspec/`.
  - **Falso negativo:** uma change aprovada qualquer libera edições de outra. Aceito: o commit-msg e a revisão pegam a mistura, e o hook não tenta adivinhar a change.

## Aprovação

- Responsável: Pendente
- Data: —
- Escopo: —
- Condições: —
- Origem: —
