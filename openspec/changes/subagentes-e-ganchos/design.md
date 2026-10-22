# Design

## Context

- O instalador (`padrao-openspec/scripts/install-skills.mjs`) entrega ao código:
  - as skills em `.agents/skills` e `.claude/skills`;
  - os comandos `/opsx:*` em `.claude/commands/opsx`;
  - os agentes do Copilot em `.github/agents`;
  - três arquivos de template;
  - os blocos gerenciados da ADR-0005.

  Tudo fica registrado em `managedFiles` e `managedBlocks` no `.openspec-padrao.json`. O instalador não entrega `.claude/agents/`, `.claude/settings.json` nem hooks.
- Os seis agentes do Copilot (`spec-architect`, `task-planner`, `code-implementer`, `qa-validator`, `consistency-guardian` e `business-requirements-ingestor`) já descrevem limites ("não edite arquivos", "não corrija"). No Copilot eles têm `tools` restritas. No Claude Code, nada disso existe.
- O apply manda usar a skill `requesting-code-review`, que despacha um subagente `general-purpose`, com todas as ferramentas.
- Pela documentação do Claude Code (hooks, sub-agents, settings, permissions):
  - o frontmatter de `.claude/agents/*.md` aceita `tools`, `disallowedTools`, `model` e `hooks`. Os hooks do frontmatter valem só enquanto o subagente roda, e um `Stop` ali vira `SubagentStop`;
  - o `PreToolUse` recebe `tool_name` e `tool_input`, e pode negar a ferramenta;
  - o `Stop` recebe `stop_hook_active` e bloqueia com `{"decision":"block","reason":...}`;
  - as permissões são avaliadas na ordem `deny`, `ask`, `allow`;
  - no Windows, sem Git Bash, a ferramenta de shell é a `PowerShell`, e a forma recomendada para hooks é `command: "node"` com `args`;
  - as regras de permissão não são uma fronteira de segurança.
- Nos projetos de referência:
  - o motor-calculo tem auditores somente leitura e um revisor de etapa que reporta só as falhas;
  - o marelli-sem-kit tem hooks de escopo de escrita e de execução por papel, e um `Stop` que cobra o teste de tela pendente;
  - nos dois, os hooks têm um limite declarado: são heurística, não sandbox.

## Architecture Decisions

[ADR-0006](../../adrs/0006-camada-do-claude-code-por-entradas-gerenciadas.md) (`Proposed`): camada do Claude Code entregue por arquivos gerenciados e por entradas gerenciadas no `.claude/settings.json`. Ela estende a [ADR-0005](../../adrs/0005-regras-entregues-por-blocos-gerenciados.md) sem contradizê-la e segue a [ADR-0003](../../adrs/0003-padrao-sem-stack-embutida.md): nenhum hook depende da stack, e os comandos de verificação vêm do `project.md`. Ela é promovida a `Accepted` na revisão, antes do archive.

## Goals / Non-Goals

**Goals:**

- Cada papel do fluxo roda, no Claude Code, só com as ferramentas de que precisa.
- Um revisor nunca altera o que revisa.
- A tarefa marcada sem evidência e o `openspec archive` fora do fluxo são barrados por mecanismo.
- A atualização do padrão nunca apaga a configuração do projeto.

**Non-Goals:**

- Impedir um agente determinado a contornar os hooks.
- Substituir o portão neutro da `guardas-mecanicas` ou os blocos da ADR-0005.
- Hooks de formatação ou de teste de tela, que dependem da stack.

## Decisions

### D1. Papéis e ferramentas

| Subagente | `tools` | `model` | Hook de frontmatter |
|---|---|---|---|
| `openspec-spec-architect` | Read, Grep, Glob | sonnet | — |
| `openspec-task-planner` | Read, Grep, Glob | sonnet | — |
| `openspec-consistency-guardian` | Read, Grep, Glob | sonnet | — |
| `openspec-requirements-ingestor` | Read, Grep, Glob | sonnet | — |
| `openspec-qa-validator` | Read, Grep, Glob, Bash | sonnet | `somente-leitura.mjs` |
| `openspec-stage-reviewer` | Read, Grep, Glob, Bash | haiku | `somente-leitura.mjs` |
| `openspec-code-reviewer` | Read, Grep, Glob, Bash | sonnet | `somente-leitura.mjs` |
| `openspec-code-implementer` | Read, Edit, Write, Grep, Glob, Bash | inherit | `escopo-de-escrita.mjs` |

- O corpo de cada um dos seis papéis já existentes é o texto do agente do Copilot correspondente, adaptado aos nomes das ferramentas do Claude Code.
- O `openspec-stage-reviewer`:
  1. lê a seção "Comandos de verificação" do `project.md`;
  2. roda os comandos que se aplicam à change;
  3. devolve, para cada um, o comando, o código de saída e só as linhas da falha, ou "passou".

  Ele não opina sobre o código. Usa `haiku` porque o trabalho é mecânico.
- O `openspec-code-reviewer` recebe o template de revisão da skill `requesting-code-review`. A skill passa a despachá-lo quando `.claude/agents/openspec-code-reviewer.md` existir, e mantém o `general-purpose` como alternativa.

### D2. Hooks de frontmatter

Os scripts ficam em `.claude/hooks/openspec-padrao/`. Cada um lê o JSON da entrada pelo stdin e responde no formato de `PreToolUse`: `permissionDecision: "deny"` com o motivo, ou nenhuma saída para liberar.

- **`somente-leitura.mjs`** (matcher `Bash|PowerShell`): nega o comando quando ele contém, fora de aspas:
  - redirecionamento para arquivo (`>`, `>>`, `Out-File`, `Set-Content`);
  - `tee`, `sed -i` ou `perl -i`;
  - interpretador inline (`python -c`, `node -e`, `powershell -Command`, `bash -c`, `sh -c`, `eval`);
  - `git commit`, `git push`, `git reset`, `git checkout --`, `git restore`, `rm` ou `mv`.

  O cabeçalho do script declara o limite: é heurística sobre o texto do comando, não um parser de shell.
- **`escopo-de-escrita.mjs`** (matcher `Edit|Write`): nega a escrita quando o caminho resolvido:
  - fica fora de `CLAUDE_PROJECT_DIR`;
  - fica dentro de `.claude/` ou `.github/agents/`;
  - é `.openspec-padrao.json` ou um `docs/openspec-*`.

  Os caminhos chegam com barra invertida no Windows, e o script os normaliza antes de comparar.

### D3. Hooks de sessão no `settings.json`

```json
{
  "hooks": {
    "Stop": [{ "hooks": [{ "type": "command", "command": "node",
      "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/openspec-padrao/cobra-evidencia.mjs"] }] }],
    "PreToolUse": [{ "matcher": "Bash|PowerShell", "hooks": [{ "type": "command", "command": "node",
      "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/openspec-padrao/portao-do-archive.mjs"] }] }]
  }
}
```

- **`cobra-evidencia.mjs`** (Stop):
  - Se `stop_hook_active` for `true`, termina sem bloquear.
  - Senão, descobre as changes ativas com `openspec list --json`, que resolve o store declarado como o CLI faz. Para cada uma, lê os `tasks.md` em `openspec status --change <nome> --json`.
  - Se uma tarefa marcada `- [x]` não tiver, nas linhas indentadas logo abaixo, uma linha que comece com `- Evidência:`, bloqueia com a lista `<change>: <tarefa>`.
  - Qualquer erro (CLI ausente, store não resolvido, JSON inválido) libera e escreve um aviso no stderr, porque bloquear por falha de ambiente travaria toda conversa.
- **`portao-do-archive.mjs`** (PreToolUse, `Bash|PowerShell`): age só quando o comando é `openspec archive <nome>`. Nos outros casos, libera sem saída.
  - Se `docs/openspec-portao.mjs` existir, roda `node docs/openspec-portao.mjs archive <nome> --json`:
    - saída 0 libera;
    - 1 ou 2 nega, com os motivos.
  - Sem o portão, responde `permissionDecision: "ask"` com o motivo "rode /opsx:archive, que confere aprovação, verify e revisão".

### D4. Permissões gerenciadas

```json
{
  "permissions": {
    "ask": ["Bash(git push *)", "Bash(gh pr create *)", "Bash(gh release *)", "Bash(openspec archive *)"],
    "deny": ["Bash(git push --force *)", "Bash(git push -f *)", "Bash(git reset --hard *)"]
  }
}
```

- O `ask` não substitui a regra "push só com pedido explícito". Ele dá ao humano a última palavra quando o agente erra.
- O padrão não acrescenta nada em `allow`: o que o projeto libera é decisão do projeto.

### D5. Mesclagem do `settings.json` pelo instalador

1. Lê `.claude/settings.json`. Se o arquivo não existir, parte de `{}`. Se não for JSON válido, para antes de qualquer escrita, com a mensagem e o caminho.
2. Remove as entradas que são do padrão:
   - hooks cujo `args` ou `command` contém `.claude/hooks/openspec-padrao/`;
   - permissões listadas em `managedSettings` do manifesto anterior.
3. Acrescenta as entradas do template `padrao-openspec/templates/claude-settings.json`, sem duplicar uma permissão que o projeto já tenha igual.
4. Grava `managedSettings` no manifesto com as permissões acrescentadas pelo padrão, para a próxima versão saber quais remover.
5. Mantém a indentação de 2 espaços e o fim de linha do arquivo original.

Se a mesclagem mudar o arquivo de um projeto que já tinha a versão anterior, isso conta como mudança gerenciada: exige `--update` ou `--in-place`, como os arquivos e os blocos.

### D6. Paridade com o Copilot

Cada `padrao-openspec/.github/agents/<papel>.agent.md` SHALL ter um `padrao-openspec/.claude/agents/openspec-<papel>.md`. A exceção é o `business-requirements-ingestor`, que vira `openspec-requirements-ingestor`, pela tabela de nomes da CI. Os dois papéis novos (`stage-reviewer` e `code-reviewer`) existem só no Claude Code, e a CI os lista como exceções declaradas.

### D7. Verificação

- **Smoke tests na CI** (job `store`, no Ubuntu e no Windows), cada hook alimentado com JSON simulado no stdin:
  - `somente-leitura.mjs`: nega `echo x > a.txt`, `git push`, `python -c ...` e `Set-Content a.txt x`; libera `git status`, `npm test` e `grep -rn x src`;
  - `escopo-de-escrita.mjs`: nega `.claude/settings.json` e um caminho fora do projeto; libera `src/app.ts`, também com barras invertidas;
  - `cobra-evidencia.mjs`: com um store de teste com id único, bloqueia uma tarefa marcada sem `Evidência:`, libera com ela e libera com `stop_hook_active: true`;
  - `portao-do-archive.mjs`: responde `ask` sem portão, nega com um portão falso que sai com 1, libera com um que sai com 0, e não faz nada com `git status`.
- **Smoke test do instalador:**
  - um `settings.json` do projeto com uma permissão `allow` e um hook próprios continua com os dois depois da instalação;
  - uma reinstalação sem mudanças não altera o arquivo;
  - um JSON inválido faz o instalador parar sem alterar nada.
- **Paridade:** um passo confere D6.
- **Não verificável na CI:** o comportamento dentro do Claude Code real (o hook de frontmatter disparar só no subagente, o `Stop` bloquear o turno). Fica um roteiro manual em `docs/openspec-padrao.md`, com o resultado registrado no `verification.md`.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/.claude/agents/*.md` (novos) | D1, D2 | instalador; CI de paridade |
| `padrao-openspec/.claude/hooks/openspec-padrao/*.mjs` (novos) | D2, D3 | instalador; smoke tests |
| `padrao-openspec/templates/claude-settings.json` (novo) | D3, D4 | instalador |
| `padrao-openspec/scripts/install-skills.mjs` | D5, operações novas | `setup-project.mjs`, `comecar.mjs`, workflow de atualização (só repassam os modos) |
| `padrao-openspec/.claude/skills/requesting-code-review/SKILL.md` | D1 | apply passo 6a; espelho da raiz |
| `.github/workflows/validate.yml` | D6, D7 | nenhum |
| `padrao-openspec/templates/openspec-padrao.md`, `COMECE-AQUI.md`, `README.md` | documentação e roteiro manual | passo "Guia de primeiros passos" da CI |
| `padrao-openspec/VERSION`, `CHANGELOG.md` | versão | passo "Versão e changelog" |
| `openspec/adrs/0006-...md`, `openspec/adrs/README.md` | ADR e índice | — |

## Risks / Trade-offs

- **Um hook nega um comando legítimo** (por exemplo, `>` dentro de um argumento de `grep`) → a heurística ignora o que está entre aspas, os smoke tests cobrem os casos comuns, e a documentação explica como o projeto desliga uma entrada sem editar o script: remover a linha do `settings.json`, que o instalador volta a pôr só no próximo `--update`.
- **O `Stop` trava o turno por falha de ambiente** → qualquer erro libera e só avisa.
- **A interface do portão muda** → o design cita a interface provisória acordada com a `guardas-mecanicas`. O apply confere a interface real antes de implementar o `portao-do-archive.mjs`.
- **Agentes do projeto com o mesmo nome** → o prefixo `openspec-` evita a colisão. O instalador para se encontrar em `.claude/agents/` um arquivo `openspec-*.md` que não está em `managedFiles` de um manifesto anterior.
- **Confiança de pasta** → as regras `allow` de projeto só valem depois que a pasta é confiada; o `ask` e o `deny` valem logo. Hooks de agentes de projeto também exigem a pasta confiada. A documentação avisa.

## Migration Plan

- Projetos existentes recebem os subagentes, os hooks e as entradas do `settings.json` pelo PR de atualização. O CHANGELOG pede para revisar o diff do `settings.json` e confiar na pasta no Claude Code.
- Rollback:
  1. reverter os commits;
  2. no projeto, rodar o instalador da versão anterior com `--update`, que remove as entradas listadas em `managedSettings`;
  3. apagar `.claude/agents/openspec-*` e `.claude/hooks/openspec-padrao/`, que deixam de estar em `managedFiles`.

## Open Questions

- **Ordem com a `guardas-mecanicas`:** se ela entrar antes, o `portao-do-archive.mjs` já nasce chamando o portão real; se entrar depois, o hook fica no modo `ask` até lá. A ordem é decisão do responsável.
