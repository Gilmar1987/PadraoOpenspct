# Design

## Context

- **ADR-0006 e PR #30:** a `subagentes-e-ganchos` (v1.10.0) entrega a camada do Claude Code:
  - hooks em `padrao-openspec/.claude/hooks/openspec-padrao/`, com o `comum.mjs` (`readPayload`, `deny`, `ask`, `blockStop`, `shellCommands`, `unquoted`, `openspecJson` com timeout de 15 s, `repositoryRoot`, `idPattern`);
  - o template `padrao-openspec/templates/claude-settings.json`;
  - grupos `Stop`, `PreToolUse Bash|PowerShell` (`portao-do-archive.mjs`, `somente-leitura.mjs`) e `PreToolUse Edit|Write` (`escopo-de-escrita.mjs`).
- **Instalador:** só reconhece como do padrão um hook cujo `command`/`args` contenha `.claude/hooks/openspec-padrao/`, mescla grupos novos e mistos, e a CI confere o par matcher ↔ script na lista `placed` do "Smoke test da camada do Claude Code no instalador" (nota da outra sessão, 2026-10-22).
- **Hooks de papel:** o `somente-leitura.mjs` já nega `git commit` aos subagentes de veredito. A proteção dos ganchos do Git vale para todos e por isso fica num script separado.
- **Portão:** já tem `apply`, `archive`, `instalar-hook` e `commit-msg`. A `aprovacao-por-conteudo` acrescenta `selo`, o campo `avisos` e as marcas `[INFERIDO`.

## Architecture Decisions

Não há ADR nova: os três hooks são entradas gerenciadas da camada do Claude Code decidida na ADR-0006, e o `estado` é um comando a mais do portão.

## Goals / Non-Goals

**Goals:**

- O agente começa a sessão sabendo o estado real do fluxo.
- O agente não desliga o hook `commit-msg`.
- Uma edição de código fora do fluxo chega ao usuário como pergunta.

**Non-Goals:**

- Classificar prompts, interpretar o shell inteiro, ou ligar uma edição a uma change específica.

## Decisions

### D1. Comando `estado` no portão

```text
node docs/openspec-portao.mjs estado [--json] [--store <id>]
```

- **Fonte:** uma chamada `openspec list --json` (changes ativas, `completedTasks` e `totalTasks`) e a leitura do `proposal.md` de cada change por `readApproval`. Se a `aprovacao-por-conteudo` já estiver no portão, entram também o selo e as marcas.
- **JSON:**

  ```json
  {
    "ok": true,
    "acao": "estado",
    "changes": [
      {
        "change": "...",
        "tarefas": { "feitas": 3, "total": 7 },
        "aprovacao": "pendente|apply|archive",
        "selo": "valido|vencido|ausente",
        "inferencias": 0,
        "proximo": "..."
      }
    ]
  }
  ```

- **Próximo passo, na ordem:**
  1. pendente → "pedir a aprovação ao responsável";
  2. selo vencido → "reconfirmar a aprovação com /opsx:update";
  3. inferências → "confirmar as inferências";
  4. tarefas abertas → `/opsx:apply`;
  5. sem `verification.md` → `/opsx:verify`;
  6. escopo apply → "pedir a confirmação do archive";
  7. senão → `/opsx:archive`.
- **Texto:** uma linha por change, no formato `<change>: 3/7 tarefas, aprovada (apply), selo válido → /opsx:apply`.
- **Saída:** exit 0 sempre que conseguir listar, inclusive sem changes; exit 2 em erro de ambiente (store não resolvido, CLI ausente).
- **Desempenho:** o `estado` não chama `instructions apply` por change; o custo é uma chamada do CLI.

### D2. `contexto-de-sessao.mjs` (SessionStart)

- **Quando age:** só se `docs/openspec-portao.mjs` existir na raiz Git do `cwd` da entrada. Roda `estado --json` com timeout de 20 s.
- **Saída:**

  ```json
  {"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": "..."}}
  ```

- **Texto do contexto:**
  - o título "Estado do fluxo OpenSpec (portão do padrão)";
  - uma linha por change;
  - a frase "Nenhuma change ativa: para mudar código, comece pelo /opsx:propose." quando não houver nenhuma;
  - no máximo 20 changes, com "+N" para o resto.
- **Em falha** (portão com erro, timeout ou JSON inválido): não imprime nada. O hook nunca bloqueia.
- **Matcher:** sem matcher, ou seja, todos os inícios (`startup`, `resume`, `clear`, `compact`).

### D3. `protege-ganchos.mjs` (PreToolUse `Bash|PowerShell`, todos os agentes)

Para cada comando de `shellCommands(command)` cuja primeira palavra seja `git` (ou `git.exe`), depois de pular as opções globais (`-C <dir>`, `--git-dir=...`, `-c <k=v>`), o hook nega quando:

- **`-c` com core.hooksPath:** algum `-c` global define `core.hooksPath` (com qualquer caixa);
- **`--no-verify`:** a subcomando for qualquer um (`commit`, `push`, `merge`, `rebase`, `am`…) e houver `--no-verify` entre os argumentos;
- **commit com `-n`:** a subcomando for `commit` e houver `-n` sozinho ou dentro de opções curtas agrupadas (`-nm`, `-anm`), sem confundir `-m` com o valor seguinte;
- **escrita no config:** a subcomando for `config` e houver `core.hooksPath` com um valor ou com `--unset`/`--unset-all`/`--replace-all`/`--add`. `--get`, `--get-all`, `--list` e `-l` seguem liberados.

A mensagem de negação:

> O hook commit-msg do padrão confere a change de cada commit (trailer OpenSpec-Change) e não pode ser pulado. Se o hook estiver bloqueando um commit legítimo, mostre ao usuário a mensagem dele.

### D4. `exige-change.mjs` (PreToolUse `Edit|Write`, todos os agentes)

1. **Alvo:** `tool_input.file_path` ou `notebook_path`, resolvido contra o `cwd`. Fora da raiz Git → nada. Relativo começando por `openspec/` → nada. Sem `docs/openspec-portao.mjs` → nada.
2. **Cache:** com `session_id` na entrada, o hook lê `os.tmpdir()/openspec-padrao/estado-<session_id>.json`. Um registro positivo com menos de 60 s → libera sem chamar nada. O `session_id` é filtrado por `idPattern`; outro formato → sem cache.
3. **Consulta:** roda `estado --json` com timeout de 20 s. Se houver uma change com aprovação `apply` ou `archive`, selo `valido` ou `ausente` e `inferencias: 0`, grava o cache positivo e libera. O resultado negativo nunca entra no cache, para que a aprovação recém-registrada valha na hora.
4. **Sem change válida:** `ask` com a explicação:

   > Nenhuma change ativa aprovada (ou a aprovação venceu, ou há inferências pendentes). No padrão, toda mudança de código passa por uma change: /opsx:propose, aprovação e /opsx:apply. Confirme só se o usuário pediu esta edição fora do fluxo.

5. **Erro do portão ou do CLI:** não imprime nada, e a escrita segue. Um ambiente quebrado não trava a conversa, como no `comum.mjs`.

### D5. Template e instalador

- **`claude-settings.json`:**
  - grupo `SessionStart` com `contexto-de-sessao.mjs` (timeout 30);
  - `protege-ganchos.mjs` como primeiro hook do grupo `Bash|PowerShell`;
  - `exige-change.mjs` depois do `escopo-de-escrita.mjs` no grupo `Edit|Write`.
- **CI:** a lista `placed` do "Smoke test da camada do Claude Code no instalador" ganha os três pares matcher ↔ script.

### D6. CI

- **"Smoke test do portão"** ganha casos do `estado`:
  - sem changes → exit 0 e lista vazia;
  - change pendente → `proximo` pede aprovação;
  - change aprovada com tarefas abertas → `/opsx:apply`;
  - archive sem `verification.md` → `/opsx:verify`.
- **"Smoke test dos hooks do Claude Code"**, com o helper `payload` do PR #30, ganha casos:
  - SessionStart com e sem portão;
  - `git commit --no-verify` negado, `git commit -nm x` negado, `git log -n 5` liberado;
  - `git -c core.hooksPath=/dev/null commit` negado, `git config core.hooksPath x` negado, `git config --get core.hooksPath` liberado;
  - Edit em `src/a.ts` sem change aprovada → `ask`, e com change aprovada → nada;
  - Edit em `openspec/changes/x/proposal.md` → nada.
- **Sintaxe:** `node --check` dos três scripts novos.

### D7. Versão

Item da versão aberta no CHANGELOG, sem subir o VERSION (decisão do responsável em 2026-10-22). "Ações no projeto":

- "Rodar a atualização do padrão: o `settings.json` ganha os hooks novos. Nenhuma mudança no código."

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/scripts/portao.mjs` | D1 | `docs/openspec-portao.mjs`, hooks que leem `motivos` (não mudam) |
| `padrao-openspec/.claude/hooks/openspec-padrao/{contexto-de-sessao,protege-ganchos,exige-change}.mjs` (novos) | D2–D4 | instalador (`managedFiles`), cópias da raiz |
| `padrao-openspec/templates/claude-settings.json` | D5 | mesclagem do instalador, `settings.json` dos projetos |
| `.github/workflows/validate.yml`, `README.md`, guia, `CHANGELOG.md`, `VERSION` | D6, D7 | CI, versão |

## Risks / Trade-offs

- [O SessionStart atrasa o início da sessão] → timeout de 20 s e uma única chamada do CLI; em falha, nada.
- [`ask` frequente para quem edita fora do fluxo de propósito] → é o sinal desejado: a pessoa decide e a regra fica visível.
- [Heurística de shell perde um caso, como `git` dentro de `$( )`] → o `commit-msg` continua sendo a barreira principal; o hook só fecha as formas diretas de desligá-lo.
- [Cache em `os.tmpdir()` entre sessões] → a chave inclui o `session_id`, e o registro expira em 60 s.

## Migration Plan

Atualização do padrão nos projetos (`install-skills --update`), que mescla o `settings.json`. Rollback: reverter os commits; o instalador remove as entradas gerenciadas que saíram do template.

## Open Questions

Nenhuma.
