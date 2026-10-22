## 1. Preparação e proteção na CI

- [ ] 1.1 Rebasear a branch na `main` e combinar com a outra sessão a versão (próxima minor livre). Verificar com `git log --oneline HEAD..origin/main` vazio e a versão citada na evidência.
- [ ] 1.2 Acrescentar ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml` os marcadores do D6. Verificar rodando o passo localmente antes da implementação: ele deve falhar nos arquivos citados.

## 2. Regras e config

- [ ] 2.1 Aplicar o D1 em `padrao-openspec/openspec/rules.md` (bloco "Princípios de engenharia" na seção 3, três itens novos e o item de validação ajustado na seção 5). Verificar com `grep -n "Princípios de engenharia\|iniciado, sucesso e falha" padrao-openspec/openspec/rules.md` e com o `sync-root.mjs --check` em dia depois do sync.
- [ ] 2.2 Aplicar o D2 em `padrao-openspec/openspec/config.yaml`. Verificar com o passo "Config base carrega sem avisos" passando.

## 3. Revisão e verify

- [ ] 3.1 Aplicar o D3 em `padrao-openspec/.claude/skills/requesting-code-review/code-reviewer.md` e `padrao-openspec/.claude/agents/openspec-code-reviewer.md`. Verificar com o marcador do D6 passando e com o passo "Paridade de papéis" passando.
- [ ] 3.2 Aplicar o D4 em `padrao-openspec/.claude/commands/opsx/verify.md` e `padrao-openspec/.claude/skills/openspec-verify-change/SKILL.md`, com o mesmo texto. Verificar com `diff` vazio entre as duas heurísticas, com o marcador passando e com o "Smoke test das métricas de fluxo" passando.

## 4. Init e project.md

- [ ] 4.1 Aplicar o D5 em `padrao-openspec/.claude/commands/opsx/init.md` (pergunta 7.4, a 7.2 ajustada, o resumo do bloco 7 e a tabela do `project-setup.md`) e em `padrao-openspec/openspec/project.md` (linha "Princípios de engenharia"). Verificar com o marcador da 7.4 passando e com `grep -n "Princípios de engenharia" padrao-openspec/openspec/project.md`.

## 5. Documentação, versão e integração

- [ ] 5.1 Atualizar o `README.md` (trechos customizados novos), `padrao-openspec/VERSION` e `CHANGELOG.md`, com a versão combinada na 1.1 e as ações no projeto (acrescentar a linha "Princípios de engenharia" ao `project.md` do store). Verificar com o lint e com o passo "Versão e changelog" passando.
- [ ] 5.2 Rodar o `sync-root.mjs` e o `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente. Antes, avisar a outra sessão e esperar que ela não esteja rodando a suíte dela. Verificar que todos saem com código 0.
