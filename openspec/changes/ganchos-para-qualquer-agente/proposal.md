# Proposal

## Why

Num teste de 2026-11-05 (projeto `socker`, padrão v1.18.0), o GitHub Copilot CLI do VS Code (1.0.100, modelo GPT-6 Luna) não conseguiu rodar nenhum comando de shell na pasta do código. Ele lê os ganchos do `.claude/settings.json` como "repo settings", mas ignora o campo `args`, que a [ADR-0006](../../adrs/0006-camada-do-claude-code-por-entradas-gerenciadas.md) fixou. Por isso ele roda só `node`, que trata o JSON da entrada como script e falha com `SyntaxError`. O Copilot trata o gancho que falha como negação ("fail-closed"), então todo `openspec context --json` e todo `git status` foi negado. O dev abriu então a pasta do store, e o init gravou o projeto no lugar errado.

O defeito não é do Copilot. O padrão registra os ganchos numa forma que só o Claude Code executa, e trata uma falha interna do gancho como se o agente fosse ignorá-la. Corrigir só para o Copilot deixaria o mesmo problema para o próximo agente que ler o `.claude/settings.json`.

## What Changes

- **Registro dos ganchos numa forma neutra de agente:** cada entrada de gancho do `templates/claude-settings.json` passa de `"command": "node"` com o caminho em `"args"` para um comando único em texto que não depende do shell, sem `args`: o lançador `node -e "import(require('url').pathToFileURL(require('path').resolve(process.env.CLAUDE_PROJECT_DIR||'.','.claude/hooks/openspec-padrao/<gancho>.mjs')))"`, que acha o script pela variável de ambiente `CLAUDE_PROJECT_DIR` ou, sem ela, pela pasta atual.
  - O Claude Code roda o comando pelo Git Bash, e o Copilot CLI pelo PowerShell. O lançador roda igual nos dois e também no cmd.
  - A primeira forma tentada nesta change, `node "${CLAUDE_PROJECT_DIR}/..."`, falhou no roteiro de 2026-11-06 com o Copilot CLI 1.0.106. No PowerShell, `${CLAUDE_PROJECT_DIR}` é uma variável vazia do próprio PowerShell, e o gancho não foi achado (`Cannot find module 'C:\.claude\hooks\...'`).
  - O instalador reconhece as entradas antigas pelo caminho `.claude/hooks/openspec-padrao/` e as troca pelas novas no `--update`, sem tocar nas entradas do projeto.
- **Falha interna do gancho não bloqueia:** uma exceção não tratada num gancho do padrão passa a terminar com código 0 e um aviso na saída de erro. Uma negação ou um pedido de confirmação continuam saindo só pela resposta JSON. Assim um agente que nega a ferramenta quando o gancho falha, como o Copilot, não fica travado por um defeito do padrão.
- **Suporte declarado por agente:** o guia do padrão (`templates/openspec-padrao.md`) e o `COMECE-AQUI.md` passam a dizer que os ganchos foram verificados no Claude Code e no Copilot CLI. Para Cursor, Codex, Windsurf, Gemini CLI e Trae, o suporte fica dito como "regras e portão; ganchos não verificados". Para o Amazon Q, fica dito que os ganchos não se aplicam, porque ele só tem ganchos de contexto (`agentSpawn` e `userPromptSubmit`) num arquivo próprio. O aviso atual de que "outros agentes não recebem esta camada" é corrigido.
- **CI:** o "Smoke test dos hooks do Claude Code" passa a rodar cada gancho exatamente pelo `command` do template, sem `args`, como faz um agente: pelo Git Bash e, no Windows, pelo PowerShell, sem substituir o texto, com e sem a variável `CLAUDE_PROJECT_DIR`. O teste também confere que um gancho com exceção interna sai com 0 e libera a chamada. O "Smoke test da camada do Claude Code no instalador" confere a troca das entradas antigas, com `args`, pelas novas.
- **Verificação real nos dois agentes:**
  - um roteiro com `claude -p` numa pasta de teste confere que os ganchos disparam no Claude Code;
  - o responsável roda, no Copilot do VS Code, um roteiro que confere que os comandos de leitura passam e que as negações do padrão continuam negando. O resultado vai para o `verification.md`.
- **ADR:** a ADR-0012 substitui a ADR-0006 e mantém a decisão dela, exceto em dois pontos: a forma de chamar os ganchos e a regra para uma falha interna. A ADR-0006 passa a `Superseded` no archive.
- **Versão do padrão:** pelo combinado com a outra sessão, quem chegar primeiro à `main` abre a 1.19.0 (`VERSION` e uma seção nova no topo do `CHANGELOG.md`), e quem vier depois acrescenta itens nela. "Ações no projeto" pede `--update` do padrão, para trocar as entradas no `.claude/settings.json`.

### Fora do escopo

- O init que grava na raiz do clone do store quando a sessão é aberta nessa pasta: fica para a change B, depois do merge da adoção da outra sessão, porque toca o `comecar.mjs` e o `setup-project.mjs`.
- A guarda da pasta da sessão valendo para outros agentes e reconhecendo a raiz do clone: fica para a change C.
- Arquivos de ganchos próprios do Copilot (`.github/hooks/`) ou de outros agentes: hoje o Copilot lê o `.claude/settings.json`, e um segundo registro dispararia cada gancho duas vezes. Um agente novo com formato próprio entra numa change própria, depois de um teste real.
- Os ganchos de papel nos subagentes do Copilot (`.github/agents/`): eles dependem do campo `agent_type`, e esta change não confere se o Copilot o envia. Sem o campo, os ganchos de papel liberam a chamada, como já é hoje no agente principal.
- O formato da saída de contexto do início da sessão no Copilot: se ele ignorar o `additionalContext`, o gancho não atrapalha, e o roteiro registra o que acontece.
- Os testes reais em Cursor, Codex, Windsurf, Gemini CLI e Amazon Q.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `agent-guardrails`: ganchos executáveis por qualquer agente que leia o `.claude/settings.json`, falha interna que não bloqueia e suporte declarado por agente.
- `skill-installation`: as entradas gerenciadas de gancho no `.claude/settings.json` usam a forma neutra, e o `--update` troca as entradas antigas com `args`.

## Impact

- **Ganchos:** `padrao-openspec/.claude/hooks/openspec-padrao/comum.mjs` (tratamento de exceção não capturada) e os sete ganchos que o importam, com a cópia da raiz em `.claude/` pelo `sync-root.mjs`.
- **Template e instalador:** `padrao-openspec/templates/claude-settings.json` (sete entradas) e, se preciso, `padrao-openspec/scripts/install-skills.mjs`, só na função que reconhece a entrada do padrão. A outra sessão mexe no usage, nas opções, no `parseArgs` e no manifesto desse arquivo, e esses trechos ficam de fora.
- **CI:** `.github/workflows/validate.yml`, nos passos "Smoke test dos hooks do Claude Code" e "Smoke test da camada do Claude Code no instalador". O "Smoke test do script de entrada", que é da outra sessão, fica de fora.
- **Documentação:** `padrao-openspec/templates/openspec-padrao.md` (seções "Camada do Claude Code" e "Usar com outros agentes"), `COMECE-AQUI.md` (tabela de agentes), `CHANGELOG.md` e, se esta change abrir a versão, `padrao-openspec/VERSION`.
- **ADRs:** `openspec/adrs/0012-ganchos-em-forma-neutra-de-agente.md` (nova, `Proposed`) e `openspec/adrs/0006-camada-do-claude-code-por-entradas-gerenciadas.md` (passa a `Superseded` no archive). O número 0012 foi combinado com a outra sessão, que reservou a 0010 e a 0011.
- **Dependências:** nenhuma nova.
- **Riscos:**
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - Shell do comando: o lançador não usa expansão de shell, então roda igual no Git Bash (Claude Code), no PowerShell (Copilot CLI) e no cmd. A reserva da pasta atual só vale se o agente rodar o gancho na pasta do projeto, e o roteiro do Copilot confere isso. Os roteiros com `claude -p` e no Copilot rodam de novo com o lançador.
  - Gancho que libera por exceção: um defeito num gancho deixa de bloquear e passa a liberar. O portão continua sendo a garantia de aprovação, apply e archive, e o aviso na saída de erro mostra o defeito.
  - Projetos com a v1.18.0 ou anterior: as entradas antigas continuam funcionando no Claude Code até o `--update`.
- **Interface com outros sistemas:** não se aplica.
- **Débitos:** o repositório não tem `openspec/estado-atual.md`.
- **Falhas aceitas:** o repositório não tem `openspec/estado-atual.md`, então a seção não existe.
- **Changes concorrentes:** `adocao-entrada-no-comecar`, da outra sessão, no worktree `ProjetoOpenspct-adocao-entrada-no-comecar`. O CLI não lista essa change daqui.
  - Arquivos em comum: `install-skills.mjs`, em trechos diferentes; `validate.yml`, em passos diferentes; `CHANGELOG.md` e `VERSION`, pela regra de versão combinada.
  - Ordem sugerida: quem chegar primeiro à `main` abre a 1.19.0, e a outra rebaseia antes do apply.

## Aprovação

- Responsável: Pendente
- Data: —
- Escopo: —
- Condições: —
- Origem: —
- Aprovação anterior: Gilmar Campelo, 2026-11-05, apply; Condições: —; Origem: "Eu aprovo fazer a implementação dos ganchos do padrão compatíveis com qualquer agente", seguida do comando `/opsx:apply`; Conteúdo: sha256:929b371be1a8d6b89820ffc196a2f90b8d361ba4a6de02821d38f2eb8e909be3
