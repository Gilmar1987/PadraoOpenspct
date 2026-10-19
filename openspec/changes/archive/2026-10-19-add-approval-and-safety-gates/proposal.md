# Proposal

## Why

O `rules.md` exige uma change "aprovada" antes de qualquer código, mas a aprovação não fica registrada em lugar nenhum: ela existe só na conversa. O teste de ponta a ponta mostrou o custo disso. Um briefing autorizava de antemão o avanço do propose ao archive com condições, e o padrão não tem como reconhecer esse tipo de autorização. O agente ficou entre a regra da skill ("o pedido autoriza só planejamento") e a instrução do usuário.

O documento "OPENSPEC AUTOMATIZADO CUSTOMIZADO" trouxe ideias que resolvem essa e outras lacunas. Sua estrutura (`.openspec/active/`, limpeza com `rm -rf`, ADR por escolha de menu) foi rejeitada por quebrar o CLI e apagar histórico, mas quatro ideias, adaptadas, cabem no padrão:

- registro de aprovação;
- raio de impacto;
- proteção contra loops;
- testes antes da implementação.

O teste também revelou que a checagem de ADR existe no comando `propose.md`, mas não na skill `openspec-propose`.

## What Changes

- **Registro de aprovação.** O `proposal.md` ganha uma seção "Aprovação", sem checkbox, com responsável, data, escopo e origem.
  - **Escopo:** até o apply, ou até o archive com condições.
  - **Origem:** a mensagem do usuário que aprovou.
  - O agente só registra a aprovação a partir de uma declaração explícita do usuário; ele nunca se aprova.
  - O `/opsx:apply` confere a seção antes de escrever código.
  - O `/opsx:propose` aceita autorização prévia registrada e, com as condições atendidas, pode seguir para o apply no mesmo turno.
- **Raio de impacto.** Novas regras de `design` e `tasks` no `config.yaml` base e nos três presets: listar os arquivos-alvo e os arquivos, rotas ou componentes dependentes que podem quebrar.
- **Testes antes da implementação.** Nova regra de `tasks`: em cada grupo, a tarefa que cria os testes dos cenários vem antes da tarefa que implementa o comportamento.
- **Proteção contra loops.**
  - Novos itens na seção 7 do `rules.md` e no `operations.apply.guidance` dos configs.
  - Depois de 3 tentativas seguidas falhando no mesmo erro, o agente para, mostra as tentativas e pede ajuda.
  - Se a implementação exigir alterar mais de 5 arquivos fora do raio de impacto, o agente para e pede confirmação.
- **Checagem de ADR na skill.** A seção "Architectural Decision Check" do comando `propose.md` passa a existir também na skill `openspec-propose`.
- Todas as edições de skills e comandos são feitas em `padrao-openspec/` e espelhadas na raiz pelo `sync-root.mjs` (ADR-0001).

### Fora do escopo

- A estrutura `.openspec/active/`, o script de limpeza com `rm -rf`, o menu obrigatório de 5 opções e a ADR para cada escolha de menu, propostos no documento.
- Esqueletos de teste (`test.todo`) criados durante o propose: violariam o limite de planejamento. A regra de ordem das tarefas cumpre o mesmo objetivo.
- Fiscalização automática por script da seção "Aprovação": a conferência é feita pelo agente, conforme as instruções do apply.
- Aplicar as novas regras de `design` e `tasks` ao `openspec/config.yaml` da raiz deste repositório; elas valem para os stores consumidores.
- Os demais atritos do teste E2E: preset × entrevista do init, E2E × "sem E2E", lentidão do CLI e `.bak` indevido no setup. Ficam para changes próprias, depois do relatório final do teste.

## Capabilities

### New Capabilities

- `change-approval`: como a aprovação de uma change é registrada, de onde ela pode vir, o que cada escopo autoriza e como o apply a confere.
- `implementation-safeguards`: proteções aplicadas ao planejar e implementar: raio de impacto, testes antes da implementação, limite de tentativas e limite de arquivos fora do plano.

### Modified Capabilities

Nenhuma. A checagem de ADR na skill corrige uma divergência entre cópias; ela não altera requisito de spec existente.

## Impact

- **Skills e comandos** (fonte em `padrao-openspec/`, espelhados na raiz):
  - `.claude/commands/opsx/propose.md` e `apply.md`;
  - `.claude/skills/openspec-propose/SKILL.md` e `openspec-apply-change/SKILL.md`.
- **Configuração:** `padrao-openspec/openspec/config.yaml` e `presets/{dotnet,nextjs,dotnet-nextjs}/config.yaml`.
- **Regras:** `openspec/rules.md`, seções 2 e 7.
- **Dependência:** esta change parte da `add-context-discipline-rules` (PR #3), que cria a seção 7 do `rules.md`.
- **Riscos:**
  - Dados pessoais: o registro de aprovação guarda o nome do responsável, que já aparece no histórico do Git.
  - Autenticação: não se aplica.
  - Não há esquema de dados nem segredos novos.
  - **Compatibilidade:** changes existentes sem a seção "Aprovação" passam a ser barradas no apply até que o usuário aprove e a aprovação seja registrada. Isso muda o comportamento para stores que já tenham changes em andamento.
  - **Segurança do processo:** um agente poderia registrar uma aprovação falsa. A regra exige citar a origem (a mensagem do usuário) e proíbe o agente de se aprovar.

## Aprovação

- Responsável: gilmar.campelo
- Data: 2026-10-17
- Escopo: apply
- Condições: —
- Origem: mensagem do usuário no chat, "rode", em resposta aos artefatos apresentados
