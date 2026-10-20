# Tasks

## 1. Proteção na CI

- [ ] 1.1 Aplicar o D3 em `.github/workflows/validate.yml`: marcadores novos no passo de trechos customizados e entrada no formato novo no smoke das métricas de fluxo. Verificar rodando os dois passos localmente: o de trechos deve falhar (marcadores ausentes) e o das métricas deve passar (o parser tolera as linhas novas).

## 2. Verify

- [ ] 2.1 Aplicar o D1 e o D2 em `padrao-openspec/.claude/skills/openspec-verify-change/SKILL.md` e `padrao-openspec/.claude/commands/opsx/verify.md`, com o mesmo texto nos dois. Verificar com o passo de trechos customizados passando e com `diff` entre os blocos "Write the verification record" dos dois arquivos sem diferença.

## 3. Documentação e integração

- [ ] 3.1 Aplicar o D4 no `README.md`. Verificar com o lint da raiz sem issues.
- [ ] 3.2 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e os passos do job `store` localmente. Verificar que todos saem com código 0.
