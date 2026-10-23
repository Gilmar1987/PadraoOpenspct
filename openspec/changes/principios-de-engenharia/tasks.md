## 1. Preparação e proteção na CI

- [x] 1.1 Rebasear a branch na `main` e confirmar com a outra sessão que esta change abre a 1.14.0 (modelo de versão acumulada). Verificar com `git log --oneline HEAD..origin/main` vazio e a versão citada na evidência.
  - Evidência: rebase em `origin/main` 85122da (release v1.13.0) sem conflito; `git log --oneline HEAD..origin/main` vazio; a outra sessão (projetoopenspct-04, antes 5a) confirmou que esta change abre a 1.14.0 e que não tem change em andamento
- [x] 1.2 Acrescentar ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml` os marcadores do D6. Verificar rodando o passo localmente antes da implementação: ele deve falhar nos arquivos citados.
  - Evidência: marcadores do D6 ("Engineering principles" no verify, na revisão e no subagente revisor, a 7.4 no init, o bloco no `rules.md` e a linha no modelo de `project.md`); `run-ci-steps.py ... "Trechos customizados"` antes da implementação → FAIL (exit 1) com 7 ausências, só nos pontos esperados

## 2. Regras e config

- [x] 2.1 Aplicar o D1 em `padrao-openspec/openspec/rules.md` (bloco "Princípios de engenharia" na seção 3, três itens novos e o item de validação ajustado na seção 5). Verificar com `grep -n "Princípios de engenharia\|iniciado, sucesso e falha" padrao-openspec/openspec/rules.md` e com o `sync-root.mjs --check` em dia depois do sync.
  - Evidência: bloco "Princípios de engenharia" na seção 3 do `rules.md` (linha 107), "Você MUST" com os três itens na seção 5 (linha 149: iniciado, sucesso e falha) e o item de validação sem citar o Zod; `sync-root.mjs --check` → em dia (exit 0)
- [x] 2.2 Aplicar o D2 em `padrao-openspec/openspec/config.yaml`. Verificar com o passo "Config base carrega sem avisos" passando.
  - Evidência: três regras novas no `config.yaml` (proposal: Why ligado ao objetivo; design: padrão existente e contrato de entrada; tasks: teste cita o cenário); "Config base carrega sem avisos" → PASS (exit 0)

## 3. Revisão e verify

- [x] 3.1 Aplicar o D3 em `padrao-openspec/.claude/skills/requesting-code-review/code-reviewer.md` e `padrao-openspec/.claude/agents/openspec-code-reviewer.md`. Verificar com o marcador do D6 passando e com o passo "Paridade de papéis" passando.
  - Evidência: bloco "Engineering principles" no template `requesting-code-review/code-reviewer.md` (depois de "Production readiness") e item no `openspec-code-reviewer.md`; "Paridade de papéis" → PASS; os marcadores desses dois arquivos deixaram de falhar
- [x] 3.2 Aplicar o D4 em `padrao-openspec/.claude/commands/opsx/verify.md` e `padrao-openspec/.claude/skills/openspec-verify-change/SKILL.md`, com o mesmo texto. Verificar com `diff` vazio entre as duas heurísticas, com o marcador passando e com o "Smoke test das métricas de fluxo" passando.
  - Evidência: heurística "Engineering principles" depois de "Verification layers" no `verify.md` e na skill; `diff` → iguais; "Smoke test das métricas de fluxo" → PASS (exit 0)

## 4. Init e project.md

- [ ] 4.1 Aplicar o D5 em `padrao-openspec/.claude/commands/opsx/init.md` (pergunta 7.4, a 7.2 ajustada, o resumo do bloco 7 e a tabela do `project-setup.md`) e em `padrao-openspec/openspec/project.md` (linha "Princípios de engenharia"). Verificar com o marcador da 7.4 passando e com `grep -n "Princípios de engenharia" padrao-openspec/openspec/project.md`.

## 5. Documentação, versão e integração

- [ ] 5.1 Atualizar o `README.md` (trechos customizados novos), `padrao-openspec/VERSION` e `CHANGELOG.md`, com a seção `## 1.14.0` (VERSION 1.14.0), ou os itens na seção aberta por outra change, e as ações no projeto (acrescentar a linha "Princípios de engenharia" ao `project.md` do store). Verificar com o lint e com o passo "Versão e changelog" passando.
- [ ] 5.2 Rodar o `sync-root.mjs` e o `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente. Antes, avisar a outra sessão e esperar que ela não esteja rodando a suíte dela. Verificar que todos saem com código 0.
