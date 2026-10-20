# Tasks

## 1. Proteção na CI

- [x] 1.1 Aplicar o D3 em `.github/workflows/validate.yml`: marcadores novos no passo de trechos customizados e entrada no formato novo no smoke das métricas de fluxo. Verificar rodando os dois passos localmente: o de trechos deve falhar (marcadores ausentes) e o das métricas deve passar (o parser tolera as linhas novas).
  - Evidência: `[FAIL (1)] Trechos customizados das skills` com os 4 marcadores ausentes; `[PASS] Smoke test das métricas de fluxo`.

## 2. Verify

- [x] 2.1 Aplicar o D1 e o D2 em `padrao-openspec/.claude/skills/openspec-verify-change/SKILL.md` e `padrao-openspec/.claude/commands/opsx/verify.md`, com o mesmo texto nos dois. Verificar com o passo de trechos customizados passando e com `diff` entre os blocos "Write the verification record" dos dois arquivos sem diferença.
  - Evidência: blocos de "Write the verification record" a "Project validation commands" idênticos nos dois arquivos (comparação no shell); `[PASS] Trechos customizados das skills`.

## 3. Documentação e integração

- [x] 3.1 Aplicar o D4 no `README.md`. Verificar com o lint da raiz sem issues.
- [x] 3.2 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e os passos do job `store` localmente. Verificar que todos saem com código 0.
  - Evidência: `[PASS]` nos 12 passos do job `store` (inclui o lint de `padrao-openspec/`) e nos 3 do job `root` (sync `--check`, validate e lint da raiz, que cobre a 3.1). Registro `ci-store` removido com `openspec store unregister ci-store`.
