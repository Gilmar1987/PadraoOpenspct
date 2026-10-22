# Proposal

## Why

As regras do padrão chegam ao agente só como texto: as do `rules.md` e as dos comandos `/opsx:*` ("o revisor não corrige", "evidência em toda tarefa", "push só com pedido"). Os seis papéis de agente do padrão existem só para o Copilot (`.github/agents/*.agent.md`). O fluxo roda no Claude Code, que não os usa, e ali nenhum limite de papel é imposto. Em dois projetos de referência (motor-calculo e marelli-sem-kit), os papéis são subagentes do Claude Code com ferramentas e modelo restritos e hooks que **cobram** o que a disciplina sozinha deixou passar: um revisor sem permissão de escrita, um hook de `Stop` que recusa o fim do turno enquanto falta uma verificação e permissões que pedem confirmação antes do push. Nos testes do padrão aconteceram falhas que esses mecanismos pegariam: tarefas marcadas sem evidência, verify rodado antes da revisão e `openspec archive` chamado direto, fora do fluxo, num projeto de outra máquina.

## What Changes

- **Subagentes do Claude Code** distribuídos ao repositório de código em `.claude/agents/`, um por papel, com o prefixo `openspec-` no nome para não colidir com os agentes do projeto:
  - os seis papéis que já existem para o Copilot: `openspec-spec-architect`, `openspec-task-planner`, `openspec-code-implementer`, `openspec-qa-validator`, `openspec-consistency-guardian` e `openspec-requirements-ingestor`;
  - dois papéis novos:
    - `openspec-stage-reviewer` (revisor de etapa): roda os Comandos de verificação do `project.md` e devolve só as falhas, para poupar o contexto do agente principal;
    - `openspec-code-reviewer`: revisão de código somente leitura, usada pela skill `requesting-code-review` quando existir.
  - Cada um declara `tools` e `model`. Os papéis de análise e de veredito não têm `Edit` nem `Write` e devolvem veredito com evidência, sem corrigir.
- **Hooks por papel no frontmatter** dos subagentes, que valem só enquanto o subagente roda:
  - nos papéis de veredito que têm `Bash`, um `PreToolUse` nega comandos que escrevem: redirecionamento para arquivo, `tee`, `sed -i`, interpretador inline, `git commit`, `git push`, `git reset`, `rm` e `mv`;
  - no implementador, um `PreToolUse` de `Edit|Write` nega escrita fora do repositório e nos arquivos gerenciados pelo padrão (`.claude/`, `docs/openspec-*`, `.openspec-padrao.json`).
- **Hooks de sessão** gerenciados no `.claude/settings.json` do código, em Node.js (`.claude/hooks/openspec-padrao/*.mjs`):
  - `Stop`: recusa o fim do turno uma vez quando uma change ativa tem tarefa marcada sem a linha `Evidência:`, com a guarda `stop_hook_active` contra laço;
  - `PreToolUse` de `Bash|PowerShell`: quando o comando é `openspec archive <change>`, chama o portão neutro `docs/openspec-portao.mjs archive <change>` da change `guardas-mecanicas`, se ele existir, e nega com os motivos quando o portão bloqueia. Sem o portão, pede confirmação.
- **Permissões gerenciadas** no mesmo `settings.json`:
  - `ask` para `git push`, `gh pr create`, `gh release` e `openspec archive`;
  - `deny` para `git push --force`, `git push -f` e `git reset --hard`.
- **Instalador:** entrega os subagentes e os hooks como arquivos gerenciados e mantém, no `.claude/settings.json`, só as entradas que são dele, sem tocar no resto do arquivo ([ADR-0006](../../adrs/0006-camada-do-claude-code-por-entradas-gerenciadas.md), estende a ADR-0005).
- **CI:** smoke tests dos hooks (entrada JSON simulada, no Ubuntu e no Windows), paridade entre os papéis do Copilot e os do Claude Code, e a mesclagem do `settings.json` preservando as entradas do projeto.
- **Documentação:** o `docs/openspec-padrao.md` e o COMECE-AQUI explicam os papéis, os hooks, como desligar uma entrada e que os limites são de melhor esforço, não uma fronteira de segurança.
- **Versão:** próxima minor livre, combinada com a outra sessão antes do apply, com as ações para projetos existentes no CHANGELOG.

### Fora do escopo

- O portão neutro de aprovação, de apply e de archive (`docs/openspec-portao.mjs`), o bloco do `AGENTS.md` sobre o portão, o hook `commit-msg` e a checagem do `comecar.mjs` na release: tudo isso pertence à change `guardas-mecanicas`. Esta change só chama o portão.
- Hooks para outros agentes (Copilot, Cursor, Gemini): eles seguem com os blocos da ADR-0005.
- Hooks de formatação: dependem da stack. Ficam para uma change futura que leia o comando de formatação do `project.md`.
- Pipeline orquestrado (guardião → implementador → testador → documentador) como fluxo obrigatório.
- Tratar os hooks como sandbox: são heurísticas. A documentação do Claude Code diz que uma regra de permissão não impede um comando por outro caminho.

## Capabilities

### New Capabilities

- `agent-guardrails`: papéis de agente do Claude Code com ferramentas e modelo restritos, hooks por papel e de sessão que cobram as regras do padrão, e as permissões gerenciadas.

### Modified Capabilities

- `skill-installation`: o instalador distribui os subagentes e os hooks e mantém as entradas gerenciadas do `.claude/settings.json` (requisitos novos; os existentes não mudam).

## Impact

- **Store:**
  - pastas novas `padrao-openspec/.claude/agents/` e `padrao-openspec/.claude/hooks/openspec-padrao/`;
  - template novo `padrao-openspec/templates/claude-settings.json`;
  - `padrao-openspec/scripts/install-skills.mjs` (operações, manifesto com `managedSettings`, mesclagem do `settings.json`);
  - `padrao-openspec/.claude/skills/requesting-code-review/SKILL.md` (usar `openspec-code-reviewer` quando existir);
  - `padrao-openspec/templates/openspec-padrao.md`, `COMECE-AQUI.md`, `README.md`, `VERSION` e `CHANGELOG.md`;
  - `.github/workflows/validate.yml`;
  - ADR nova [ADR-0006](../../adrs/0006-camada-do-claude-code-por-entradas-gerenciadas.md), `Proposed`.
- **Repositório de código dos projetos:** ganha `.claude/agents/openspec-*.md` e `.claude/hooks/openspec-padrao/`. O `.claude/settings.json` é criado se não existir ou ganha só as entradas do padrão.
- **Dependência:** o hook de archive usa o portão da `guardas-mecanicas`, com a interface provisória `node docs/openspec-portao.mjs archive <change>` (0 libera; 1 bloqueia; 2 é erro, tratado como bloqueio). Sem o portão, o hook pede confirmação.
- **Riscos:**
  - **Dados pessoais, autenticação e esquema de dados:** não se aplicam.
  - **Variáveis de ambiente:** os hooks usam `CLAUDE_PROJECT_DIR`, sem secrets.
  - **Compatibilidade:** o `settings.json` do projeto passa a ter entradas do padrão. O instalador nunca remove nem altera entradas do projeto, e um JSON inválido para a instalação sem mudar nada.
  - **Windows:** os hooks rodam como `node` com `args`, a forma que a documentação recomenda; o matcher cobre `Bash|PowerShell`.
  - O comportamento dentro do Claude Code real só é verificável por execução manual, que fica registrada como tal.

## Aprovação

- Responsável: Gilmar Campelo
- Data: 2026-10-22
- Escopo: apply
- Condições: ordem aprovada: guardas-mecanicas (outra sessão) primeiro, depois subagentes-e-ganchos, lacunas-e-adrs-verificaveis, contratos-de-interface e debitos-e-camadas-de-verificacao; cada apply começa depois do merge da anterior, com rebase na main e versão combinada com a outra sessão
- Origem: "Aprovado 2, 3 e 4", em resposta a "2. ADR para a lacunas-e-adrs-verificaveis [...] Crio a ADR-0008 (Proposed) nessa change? 3. Ordem do apply: a minha sugestão é primeiro a guardas-mecanicas [...] e depois subagentes-e-ganchos, lacunas-e-adrs-verificaveis, contratos-de-interface e debitos-e-camadas-de-verificacao. 4. Aprovação para o apply: pode ser de uma change por vez, ou de várias de uma vez com condições."
- Archive: pendente de aprovação
