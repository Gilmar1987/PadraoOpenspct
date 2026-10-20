# Tasks

## 1. Proteção na CI

- [ ] 1.1 Acrescentar os marcadores do D7 ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml`. Verificar rodando o passo localmente: ele deve falhar citando os cinco marcadores ausentes.

## 2. Skills e comandos

- [ ] 2.1 Aplicar o D1 e o D3 em `padrao-openspec/.claude/skills/openspec-propose/SKILL.md` e `padrao-openspec/.claude/commands/opsx/propose.md`. Verificar com `grep -c "Commit the planning\|also your question"` igual nos dois arquivos.
- [ ] 2.2 Aplicar o D3, o D4 e o D5 em `padrao-openspec/.claude/skills/openspec-apply-change/SKILL.md` e `padrao-openspec/.claude/commands/opsx/apply.md`. Verificar com `grep -c "Record task evidence\|Push only on explicit request\|also your question"` igual nos dois arquivos.
- [ ] 2.3 Aplicar o D2 em `padrao-openspec/.claude/skills/openspec-archive-change/SKILL.md` e `padrao-openspec/.claude/commands/opsx/archive.md`. Verificar com o passo de trechos customizados passando.

## 3. Regras e init

- [ ] 3.1 Aplicar o D6 em `padrao-openspec/.claude/commands/opsx/init.md`, o D3 na regra do proposal de `padrao-openspec/openspec/config.yaml` e o D3 e o D4 em `openspec/rules.md`. Verificar com o passo "Config base carrega sem avisos" passando e com `grep -n "pedido de push\|da pergunta"` em `openspec/rules.md`.

## 4. Documentação e integração

- [ ] 4.1 Atualizar a tabela de trechos customizados do `README.md` (D7). Verificar com o lint da raiz sem issues.
- [ ] 4.2 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e os passos do job `store` localmente. Verificar que todos saem com código 0.
