# Tasks

## 1. Checagens na CI

- [x] 1.1 Acrescentar ao job `store` de `.github/workflows/validate.yml` um passo "Trechos customizados das skills" que falha se `.claude/commands/opsx/propose.md` ou `.claude/skills/openspec-propose/SKILL.md` não contiverem "Architectural Decision Check" e a exceção de autorização prévia, ou se `.claude/commands/opsx/apply.md` ou `.claude/skills/openspec-apply-change/SKILL.md` não contiverem o passo de conferência da aprovação. Verificar rodando o passo localmente antes das tarefas 2.x e 3.x: ele deve falhar, citando os trechos ausentes.

## 2. Registro e conferência da aprovação

- [x] 2.1 Acrescentar a regra de `proposal` do D1 (seção `## Aprovação` com Responsável `Pendente`, Data, Escopo, Condições e Origem, sem checkbox) ao `config.yaml` base e aos três presets. Verificar com o passo de CI "Configs base e presets carregam sem avisos" (código 0) e com `openspec instructions proposal`, que deve exibir a regra para cada config.
- [x] 2.2 Acrescentar a `padrao-openspec/.claude/commands/opsx/apply.md` e `padrao-openspec/.claude/skills/openspec-apply-change/SKILL.md` o passo de conferência da aprovação do D4, entre "Read context files" e "Implement tasks", e a linha equivalente ao `operations.apply.guidance` dos quatro configs. Verificar com `grep -n "## Aprovação"` nos dois arquivos e nos quatro configs.
- [x] 2.3 Acrescentar ao "Planning boundary" e aos "Guardrails" de `padrao-openspec/.claude/commands/opsx/propose.md` e `padrao-openspec/.claude/skills/openspec-propose/SKILL.md` a exceção de autorização prévia do D3, com o mesmo texto nos dois arquivos. Verificar comparando os trechos extraídos dos dois arquivos com `diff`.
- [x] 2.4 Atualizar a seção 2 de `openspec/rules.md`: a aprovação vale quando registrada na seção `## Aprovação` do proposal, a partir de declaração explícita do usuário (D2). Verificar com `grep -n "Aprovação" openspec/rules.md` e com o lint da raiz sem issues.

## 3. Proteções de planejamento e implementação

- [x] 3.1 Copiar a seção "Architectural Decision Check" de `propose.md` para `padrao-openspec/.claude/skills/openspec-propose/SKILL.md`, antes de "Guardrails" (D7). Verificar comparando a seção extraída dos dois arquivos com `diff`, sem diferença.
- [x] 3.2 Acrescentar as três regras do D5 (raio de impacto em `design`; arquivos por tarefa e testes antes da implementação em `tasks`) ao `config.yaml` base e aos três presets. Verificar com o passo de CI de configs (código 0) e com `openspec instructions design` e `openspec instructions tasks`, que devem exibir as regras.
- [x] 3.3 Acrescentar à seção 7 do `rules.md` os dois itens de proteção contra loops (3 tentativas; mais de 5 arquivos fora do raio de impacto) e a linha equivalente ao `operations.apply.guidance` dos quatro configs (D6). Verificar com `grep` nos cinco arquivos e com o lint da raiz sem issues.

## 4. Espelhamento, documentação e integração

- [x] 4.1 Rodar `node padrao-openspec/scripts/sync-root.mjs` e verificar que `--check` sai com código 0 e que o passo de CI da tarefa 1.1 agora passa.
- [x] 4.2 Acrescentar à seção "Manutenção do padrão" do `README.md` a lista de trechos customizados nas skills geradas pelo CLI (checagem de ADR, conferência da aprovação e exceção de autorização prévia), para reaplicar ao regenerá-las. Verificar com o lint da raiz sem issues.
- [x] 4.3 Rodar `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois e os passos de CI de configs e de trechos customizados. Verificar que todos saem com código 0.

## Workflow follow-up

- Rodar `/opsx:verify` e, depois da revisão do PR, `/opsx:archive`.
