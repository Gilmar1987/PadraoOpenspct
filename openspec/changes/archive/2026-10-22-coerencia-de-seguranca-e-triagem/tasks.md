# Tasks

## 1. Proteção na CI

- [x] 1.1 Se a `main` tiver andado desde o planejamento, rebasear a branch nela e, se outra versão tiver saído, usar a próxima minor livre no D4. Depois, acrescentar o marcador "External report triage" (D5) para a skill e o comando de verify no passo "Trechos customizados das skills" de `.github/workflows/validate.yml`. Verificar rodando o passo localmente: deve falhar nos dois arquivos.
  - Evidência: main sem commits novos (`git log HEAD..origin/main` vazio), sem rebase; `python run-ci-steps.py validate.yml store . "Trechos customizados"` → falha esperada só em `verify.md` e `openspec-verify-change/SKILL.md` com "External report triage" ausente (exit 1)

## 2. Init

- [x] 2.1 Aplicar o D1 (opção "0) Sem autenticação no MVP" na 3.6) e o D2 (três combinações novas e a regra de levar a restrição para o `project.md` e a ADR) em `padrao-openspec/.claude/commands/opsx/init.md`. Verificar com `grep -n "Sem autenticação no MVP\|Auditoria de dependências\" é \"Não aplicável\|Varredura de secrets\" é \"Não aplicável\|dados pessoais ou sensíveis, 3.6"` no arquivo, e com `grep -n "dados pessoais ou sensíveis) e 6.5 é 0"` confirmando que a linha de LGPD da tabela continua lá.
  - Evidência: grep do critério em `init.md` → linhas 300 (opção 0 da 3.6), 715, 716 e 717 (três combinações novas) (exit 0); `grep -n "dados pessoais ou sensíveis) e 6.5 é 0"` → linha 712, LGPD mantida (exit 0)

## 3. Verify

- [x] 3.1 Aplicar o D3 em `padrao-openspec/.claude/skills/openspec-verify-change/SKILL.md` e `padrao-openspec/.claude/commands/opsx/verify.md`, com o mesmo texto, inclusive a seção opcional `Triagem:` no formato do registro. Verificar com o passo de trechos customizados passando e com o smoke das métricas de fluxo passando.
  - Evidência: texto da heurística idêntico na skill e no comando (`diff` vazio); `sync-root.mjs` → 3 caminhos espelhados; `run-ci-steps.py ... "Trechos customizados" "métricas de fluxo"` → os dois PASS (exit 0)

## 4. Versão, documentação e integração

- [x] 4.1 Aplicar o D4 em `padrao-openspec/VERSION` e `CHANGELOG.md`. Verificar com o passo "Versão e changelog" passando localmente.
  - Evidência: `VERSION` = 1.6.0 e seção `## 1.6.0` no topo do CHANGELOG; `run-ci-steps.py ... "Versão e changelog" "changelog-range"` → os dois PASS (exit 0). Depois do rebase na `main` 1.6.0 (PR #25), a versão passou a 1.7.0, com a seção `## 1.7.0` acima da `1.6.0`
- [x] 4.2 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e todos os passos do job `store` localmente. Verificar que todos saem com código 0.
  - Evidência: main sem commits novos, sem rebase; `sync-root.mjs --check` → em dia (exit 0); `openspec validate --all --strict` na raiz → 17 passed (exit 0) e em `padrao-openspec/` → nada a validar (exit 0); `run-ci-steps.py validate.yml store .` → 18/18 PASS, lint incluído (exit 0); passos da raiz "Raiz em dia", "Lint de Markdown da raiz" e "Guia de primeiros passos" → PASS (exit 0); store `ci-store` do smoke removido depois
