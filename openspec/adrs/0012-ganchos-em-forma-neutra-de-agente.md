---
id: ADR-0012
status: Proposed
date: 2026-11-05
supersedes: ADR-0006
superseded_by:
related_changes: [ganchos-para-qualquer-agente]
verificacao: [".github/workflows/validate.yml#Smoke test dos hooks do Claude Code"]
imposicao: consultivo
---

# ADR-0012: Ganchos do padrão em forma neutra de agente

## Contexto

A [ADR-0006](0006-camada-do-claude-code-por-entradas-gerenciadas.md) entregou ao código uma camada do Claude Code: subagentes, scripts de gancho e entradas gerenciadas no `.claude/settings.json`. Ela fixou que os ganchos são "chamados como `node` com `args`", forma que só o Claude Code documenta.

Num teste de 2026-11-05, o GitHub Copilot CLI 1.0.100, no VS Code, leu esse mesmo arquivo como "repo settings". Ele executa o campo `command` das entradas e entrega o payload no formato do Claude Code (`hook_event_name`, `tool_name`, `tool_input`, `cwd`). Também resolve `${CLAUDE_PROJECT_DIR}` e aceita a resposta `hookSpecificOutput.permissionDecision`.

O Copilot ignora o `args`. Ele rodou só `node`, que tratou o JSON da entrada como script e saiu com código 1. O Copilot trata um gancho que falha como negação ("fail-closed"), então negou todo comando de shell na pasta do código.

A ADR-0006 supunha que só o Claude Code leria esse arquivo, e que um gancho com erro seria ignorado. As duas suposições caíram.

## Decisão

Esta ADR substitui a ADR-0006. Ficam valendo, como lá estavam:

- a camada entregue ao código: subagentes em `.claude/agents/openspec-*.md`, scripts em `.claude/hooks/openspec-padrao/` e entradas no `.claude/settings.json`;
- os subagentes e os scripts como arquivos gerenciados em `managedFiles`;
- o instalador mexendo só nas entradas dele: um gancho é do padrão quando o comando aponta para `.claude/hooks/openspec-padrao/`, e uma permissão é do padrão quando está em `managedSettings`. Ele acrescenta, atualiza e remove as suas, nunca as do projeto, e para sem mudança quando o arquivo não é JSON válido;
- os ganchos em Node.js e todos no `.claude/settings.json`, com os de papel filtrando pelo `agent_type`;
- a lógica de aprovação, de apply e de archive no portão neutro de agente (`docs/openspec-portao.mjs`), que os ganchos chamam sem repetir a regra.

Mudam dois pontos:

- **Forma de chamar o gancho:** cada entrada SHALL ser um comando único em texto, `node "${CLAUDE_PROJECT_DIR}/.claude/hooks/openspec-padrao/<gancho>.mjs"`, sem o campo `args`. O padrão MUST NOT usar, nas suas entradas, um campo que só um agente entende quando existe uma forma que mais de um executa.
- **Falha interna:** um gancho do padrão SHALL terminar com código 0 quando encontra um erro que não trata, avisando na saída de erro. Negação e pedido de confirmação MUST sair só pela resposta JSON. Um defeito do gancho libera a chamada e nunca trava o agente.

O suporte a um agente SHALL ser declarado no guia do padrão. Um agente só consta como verificado depois de um roteiro real registrado no `verification.md` de uma change.

## Alternativas consideradas

| Alternativa | Por que não foi escolhida |
|---|---|
| Manter `args` e tirar os ganchos do caminho do Copilot | O Copilot lê o `.claude/settings.json` por conta própria; o padrão não controla isso |
| Um registro próprio do Copilot em `.github/hooks/` | O Copilot continuaria lendo o `.claude/settings.json` e falhando; com os dois corrigidos, cada gancho dispararia duas vezes |
| Um lançador em shell (`.sh` ou `.ps1`) | O shell muda entre Git Bash e PowerShell no Windows, o motivo de a ADR-0006 ter escolhido Node.js |
| Gancho com erro continuar saindo com código 1 | No Claude Code o erro é ignorado, mas no Copilot ele nega a ferramenta; o comportamento ficaria dependente do agente |
| Caminho relativo, sem `${CLAUDE_PROJECT_DIR}` | O diretório de trabalho do gancho pode não ser a raiz do projeto quando a sessão muda de pasta |

## Consequências

- O mesmo `.claude/settings.json` serve ao Claude Code e ao Copilot CLI, sem um registro por agente.
- Um agente novo que imite os ganchos do Claude Code passa a funcionar sem mudança, mas só consta como verificado depois de um roteiro real.
- O `--update` troca as entradas antigas, com `args`, pelas novas. Projetos que não atualizarem continuam funcionando no Claude Code e travando no Copilot.
- Um defeito num gancho deixa de bloquear e passa a liberar. O portão continua sendo a garantia de aprovação, apply e archive, e os ganchos seguem como reforço heurístico.
- A CI passa a rodar cada gancho pelo `command` do template, e não só pelo caminho do script.

## Limite

- **Garante:** o "Smoke test dos hooks do Claude Code" confere que cada entrada do `templates/claude-settings.json` não tem `args`, que o seu `command` roda o gancho e dá a resposta esperada, e que um gancho com exceção interna sai com 0.
- **Fica sob palavra:** como cada agente real executa o `command` (shell, diretório, variáveis) e se ele envia `agent_type`. Isso só se confere no roteiro manual de cada agente, registrado no `verification.md`.
