# Tasks

## 1. Proteção na CI

- [x] 1.1 Acrescentar os marcadores do D7 ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml`. Verificar rodando o passo localmente: ele deve falhar citando os cinco marcadores ausentes.
  - Evidência: `[FAIL (1)] Trechos customizados das skills` com 10 linhas de trecho ausente (os 5 marcadores, cada um na skill e no comando).

## 2. Skills e comandos

- [x] 2.1 Aplicar o D1 e o D3 em `padrao-openspec/.claude/skills/openspec-propose/SKILL.md` e `padrao-openspec/.claude/commands/opsx/propose.md`. Verificar com `grep -c "Commit the planning\|also your question"` igual nos dois arquivos.
  - Evidência: o grep conta 3 nos dois arquivos (passo 8 "Commit the planning" e as duas citações de Origem).
- [x] 2.2 Aplicar o D3, o D4 e o D5 em `padrao-openspec/.claude/skills/openspec-apply-change/SKILL.md` e `padrao-openspec/.claude/commands/opsx/apply.md`. Verificar com `grep -c "Record task evidence\|Push only on explicit request\|also your question"` igual nos dois arquivos.
  - Evidência: o grep conta 3 nos dois arquivos.
- [x] 2.3 Aplicar o D2 em `padrao-openspec/.claude/skills/openspec-archive-change/SKILL.md` e `padrao-openspec/.claude/commands/opsx/archive.md`. Verificar com o passo de trechos customizados passando.
  - Evidência: passos 4a e 5a nos dois arquivos; `[PASS] Trechos customizados das skills` com os 5 marcadores novos.

## 3. Regras e init

- [x] 3.1 Aplicar o D6 em `padrao-openspec/.claude/commands/opsx/init.md`, o D3 na regra do proposal de `padrao-openspec/openspec/config.yaml` e o D3 e o D4 em `openspec/rules.md`. Verificar com o passo "Config base carrega sem avisos" passando e com `grep -n "pedido de push\|da pergunta"` em `openspec/rules.md`.
  - Evidência: `[PASS] Config base carrega sem avisos`. Critério adaptado: o texto do D3 no `rules.md` ficou "cite também a pergunta", então o grep usado foi `"pedido de push\|cite também a pergunta"`, que encontra as duas regras (seções 2 e 4).

## 4. Documentação e integração

- [x] 4.1 Atualizar a tabela de trechos customizados do `README.md` (D7). Verificar com o lint da raiz sem issues.
- [x] 4.2 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e os passos do job `store` localmente. Verificar que todos saem com código 0.
  - Evidência: `[PASS]` nos 12 passos do job `store` e em "Raiz em dia" e "Validar specs" da raiz; o lint da raiz falhou uma vez (`MD038` em `design.md:73`, trecho de código começando com espaços), corrigido na redação do design; `markdownlint-cli2 "**/*.md"` na raiz → 0 issues em 102 arquivos (cobre a 4.1). Registro `ci-store` removido com `openspec store unregister ci-store`.
