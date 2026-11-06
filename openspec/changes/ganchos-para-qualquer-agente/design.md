# Design

## Context

O motivo está no `proposal.md` ("Why"). Estado atual que molda a solução:

- O `padrao-openspec/templates/claude-settings.json` tem 7 entradas de gancho, todas com `"command": "node"` e o caminho do script em `"args"`:
  - `SessionStart`: `contexto-de-sessao`;
  - `Stop`: `cobra-evidencia`;
  - `PreToolUse` com `Bash|PowerShell`: `protege-ganchos`, `portao-do-archive` e `somente-leitura`;
  - `PreToolUse` com `Edit|Write`: `escopo-de-escrita` e `exige-change`.
- Os 7 ganchos importam `comum.mjs`, leem o payload pelo `readPayload` e só respondem pela saída JSON: `deny`, `ask` ou `blockStop`. Nenhum chama `process.exit` com código diferente de 0. Uma exceção não tratada sai com código 1 pelo próprio Node.
- O instalador já reconhece uma entrada do padrão pelo texto de `command` mais `args` (`isStandardHook`, em `install-skills.mjs`). O `mergeHooks` remove todas as entradas do padrão e põe as do template no lugar da primeira. Uma entrada antiga, com `args`, já é reconhecida e trocada.
- O que o teste de 2026-11-05 mostrou sobre o Copilot CLI 1.0.100: o log das sessões, `~/.copilot/session-state/*/events.jsonl` e `~/.copilot/logs`, e os textos do executável (`runtime.node`) mostram que ele:
  - lê o `.claude/settings.json` como "repo settings";
  - executa o `command` e não conhece `args` (a configuração de gancho dele tem `command`, `bash`, `powershell`, `cwd`, `env`, `timeoutSec` e `matcher`);
  - substitui `${CLAUDE_PROJECT_DIR}` e `${COPILOT_PROJECT_DIR}`, e também define essas variáveis no ambiente;
  - envia o payload no formato do Claude Code, com `tool_name: "Bash"` para a ferramenta de shell;
  - aceita `hookSpecificOutput.permissionDecision`;
  - nega a ferramenta quando o gancho sai com erro (`fail-closed`).
- O Claude Code desta máquina é a versão 2.1.243. A forma `args` funciona nele, pelo roteiro de 2026-10-22. A forma de comando único ainda não foi testada aqui.
- O Amazon Q (extensão 2.9.0, servidor 1.84.0) só tem ganchos `agentSpawn` e `userPromptSubmit`, num arquivo próprio. O Trae (extensão 1.7.16) não mostra suporte aos ganchos do Claude Code. Nenhum dos dois lê o `.claude/settings.json`.

## Goals / Non-Goals

**Goals:**

- O mesmo registro de ganchos roda no Claude Code e no Copilot CLI, sem um segundo arquivo.
- Nenhum defeito interno de um gancho do padrão trava um agente.
- A CI roda cada gancho do jeito que um agente roda: pelo texto do `command` do template.
- O guia diz, por agente, o que foi verificado e com qual versão.

**Non-Goals:**

- Mudar a lógica de cada gancho: o que nega, o que pergunta e o que libera continua igual.
- Ganchos de papel no Copilot: o envio de `agent_type` não é conferido.
- Ajustar o `matcher` `Edit|Write` aos nomes das ferramentas de edição do Copilot. O roteiro registra os nomes que ele envia, e um ajuste fica para uma change própria.
- A resposta vazia ocasional do `cobra-evidencia.mjs` no smoke do Windows, que a outra sessão viu e que passou na repetição sem mudança. Ela vai como risco, e não como correção.

## Decisions

### D1. Comando único com o caminho entre aspas

Cada entrada fica `{ "type": "command", "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/hooks/openspec-padrao/<gancho>.mjs\"", "timeout": 30 }`, sem `args`.

- **No Copilot**, o texto `${CLAUDE_PROJECT_DIR}` é substituído antes de executar, qualquer que seja o shell.
- **No Claude Code**, o comando passa pelo shell, que expande a variável de ambiente `CLAUDE_PROJECT_DIR`. No Windows, esse shell é o Git Bash. As aspas protegem caminhos com espaço.
- A barra `/` funciona no Node em qualquer sistema, mesmo com o prefixo `C:\...` do Windows.

Alternativas:

- **Caminho relativo** (`node .claude/hooks/...`): depende do diretório de trabalho do gancho, que nenhum dos dois agentes garante.
- **`$CLAUDE_PROJECT_DIR` sem chaves**: o Copilot substitui só a forma com chaves, e o shell aceita as duas.
- **Manter `args` e acrescentar `command` completo**: o Claude Code passaria o caminho duas vezes ao Node.

**Prova antes do commit:** o roteiro com `claude -p` da tarefa 4.1. Se o gancho não disparar no Claude Code, o apply para e volta ao design, sem procurar outra forma por conta própria.

### D2. Erro interno sai com 0, registrado no `comum.mjs`

O `comum.mjs` passa a registrar, ao ser importado, um tratador de `uncaughtException` e de `unhandledRejection`. O tratador escreve `[<gancho>] erro interno: <mensagem>; a chamada segue sem checagem.` na saída de erro e sai com código 0.

- O nome do gancho vem do `process.argv[1]`, então cada um dos 7 ganchos fica coberto sem mudar o seu código.
- Ele imita o que o `readPayload` já faz com uma entrada ilegível.
- Se já houver algo na saída JSON (uma negação escrita antes do erro), o tratador não acrescenta nada. A negação vale, porque a resposta já saiu.

Alternativas:

- **`try/catch` em cada gancho**: são sete cópias da mesma regra, e um gancho novo pode esquecê-la.
- **Lançador comum que importa o gancho**: troca o caminho registrado e cria um oitavo arquivo, sem ganho sobre o tratador.

**Limite:** um erro que acontece antes do `comum.mjs` carregar escapa do tratador. São os casos de sintaxe inválida, de arquivo ausente ou de Node ausente. O `node --check` da CI pega o primeiro, e o instalador entrega os arquivos juntos.

### D3. A CI roda o `command` do template

O "Smoke test dos hooks do Claude Code" ganha um bloco que:

1. lê o template e falha se alguma entrada tiver `args`;
2. para cada entrada, substitui `${CLAUDE_PROJECT_DIR}` pela pasta `padrao-openspec` (onde o job `store` roda) e executa o texto resultante pelo shell: o `bash` nos dois sistemas e também o PowerShell (`pwsh`) no runner Windows, como faz o Copilot;
3. compara a resposta de cada entrada, com um payload de negação e um de liberação, com a resposta do gancho chamado direto pelo caminho;
4. copia os ganchos para uma pasta temporária, acrescenta um gancho que importa o `comum.mjs` e lança uma exceção, e confere que ele sai com 0 e que a saída de erro cita o nome dele.

O "Smoke test da camada do Claude Code no instalador" já tem o caso de atualização a partir de entradas com `args`. Ele passa a conferir que, depois do `--in-place`, nenhuma entrada do padrão tem `args` e que cada gancho aparece uma vez.

Esses blocos são a `verificacao` da ADR-0012. Pela regra das ADRs, eles rodam vistos reprovando antes da implementação (tarefas 1.2 e 1.3).

### D4. O instalador fica como está, salvo prova em contrário

O `isStandardHook` já cobre as duas formas, e o `mergeHooks` já troca tudo. A tarefa 2.3 confere isso pelo smoke da D3. O `install-skills.mjs` só muda se o smoke mostrar uma falha, e mesmo assim só no `isStandardHook` e no `mergeHooks`. Os trechos que a outra sessão altera (usage, opções, `parseArgs` e manifesto) ficam de fora.

### D5. Suporte declarado no guia, com a versão do roteiro

A tabela "Usar com outros agentes" do `templates/openspec-padrao.md` ganha a coluna "Ganchos do padrão". A tabela do `COMECE-AQUI.md` ganha a mesma coluna, porque as duas tabelas são iguais hoje. Os valores:

| Agente | Ganchos do padrão |
|---|---|
| Claude Code | Verificados no Claude Code <versão do roteiro 4.1> |
| GitHub Copilot | Verificados no Copilot CLI <versão do roteiro 4.2>, no VS Code; ganchos de papel não verificados |
| Cursor, Codex, Windsurf | Regras e portão; ganchos não verificados |
| Gemini CLI | Regras e portão; ganchos não verificados |
| Amazon Q | Não se aplicam: o Amazon Q só tem ganchos de contexto; valem as regras e o portão |

O Trae entra como linha nova, com "Regras e portão; ganchos não verificados" e o `AGENTS.md` como arquivo lido. A seção "Camada do Claude Code" troca:

- o link da ADR-0006 pela ADR-0012;
- o aviso "Outros agentes não recebem esta camada" por uma frase que remete à tabela.

## Architecture Decisions

- [ADR-0012](../../adrs/0012-ganchos-em-forma-neutra-de-agente.md) (`Proposed`) substitui a [ADR-0006](../../adrs/0006-camada-do-claude-code-por-entradas-gerenciadas.md). Ela decide a forma de comando único (D1) e o erro interno que sai com 0 (D2). O responsável aprovou o texto nesta conversa ("aprovo a ADR-0012"), e a promoção a `Accepted` é a tarefa 5.3.

## Impacto medido

- **Comando:** contagem das entradas do template com `args`, feita no propose com `node -e`, que lê `templates/claude-settings.json` e lista cada entrada com `args`. Saída `entradas 7 com args 7` (exit 0).
- **Violações:** 7, uma por entrada:
  - `SessionStart`: `contexto-de-sessao.mjs`;
  - `Stop`: `cobra-evidencia.mjs`;
  - `PreToolUse` `Bash|PowerShell`: `protege-ganchos.mjs`, `portao-do-archive.mjs` e `somente-leitura.mjs`;
  - `PreToolUse` `Edit|Write`: `escopo-de-escrita.mjs` e `exige-change.mjs`.
- **Destino:** as 7 vão para a tarefa 2.2 desta change.
- **Verificação da ADR-0012:** o bloco do smoke ainda não existe. A tarefa 1.2 escreve o bloco, roda-o antes da implementação e registra as violações que ele acusa antes de qualquer correção.

## Risks / Trade-offs

- **[Claude Code sem expansão no shell]** No Windows sem Git Bash, o Claude Code usa o PowerShell, em que `${CLAUDE_PROJECT_DIR}` é uma variável do PowerShell, vazia. O gancho não acharia o script, sairia com erro, e o Claude Code seguiria sem ele. → O roteiro 4.1 roda na configuração desta máquina (com Git Bash). O guia diz que, sem Git Bash, os ganchos não são verificados. O portão continua valendo.
- **[Gancho que libera por defeito]** Um defeito passa a liberar a chamada em vez de travar. → O aviso na saída de erro mostra o defeito. A CI roda cada gancho com negações conhecidas, e o portão continua sendo a garantia.
- **[Projetos sem `--update`]** Eles continuam com `args`. Funciona no Claude Code e trava no Copilot. → "Ações no projeto" do `CHANGELOG.md` pede o `--update`.
- **[Resposta vazia do `cobra-evidencia.mjs` no Windows]** A outra sessão viu uma falha intermitente nesse teste. → O bloco novo da D3 não usa o `cobra-evidencia` no caso de negação, porque o caso dele depende do CLI. Se a falha aparecer de novo na suíte desta change, ela vai para o `review.md` com o tempo medido, sem repetir o passo até passar.
- **[Copilot muda a forma de executar]** Uma versão futura do Copilot pode parar de ler o `.claude/settings.json` ou mudar o payload. → O guia cita a versão verificada.

## Migration Plan

- Projetos com a v1.18.0 ou anterior: `node padrao-openspec/scripts/install-skills.mjs <código> --update`, pelo fluxo normal de atualização do padrão. O PR de atualização mostra a troca das 7 entradas no `.claude/settings.json`.
- Reverter: voltar à versão anterior do padrão com `--update`. O instalador põe de volta as entradas com `args`.

## Open Questions

- Quais nomes de ferramenta o Copilot envia nas edições de arquivo (`Edit`, `Write` ou os nomes dele)? O roteiro 4.2 registra a resposta. A resposta não muda esta change, porque o ajuste do `matcher` está fora do escopo.
