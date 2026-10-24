# Tasks

## 1. Proteção na CI

- [x] 1.1 Acrescentar ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml` o marcador `Describe the delivery` para os seis pares (comando e skill) do D3. Verificar rodando esse passo localmente: ele deve falhar só nos doze arquivos.
  - Evidência: laço com os doze arquivos (comando e skill de propose, apply, verify, archive, update e sync) no passo "Trechos customizados das skills"; `run-ci-steps.py validate.yml store . "Trechos customizados"` → FAIL (exit 1) com 12 erros "Describe the delivery" e nenhum outro

## 2. Regra e fluxos

- [x] 2.1 Aplicar o D1 em `padrao-openspec/openspec/rules.md`. Verificar com `grep -n "descreva em uma linha o que ela entrega"`.
  - Evidência: item novo no fim da seção 3 do `rules.md`; `grep -n` → linha 117; espelho da raiz sincronizado
- [x] 2.2 Aplicar o D2 nos comandos e nas skills de `propose`, `apply`, `verify`, `archive`, `update` e `sync`: anúncio, modelos de saída e próximo passo, com o mesmo texto no comando e na skill. Verificar com o passo "Trechos customizados das skills" passando e com `grep -c "Using change: <name>"` igual a 0 nos doze arquivos.
  - Evidência: trecho "Describe the delivery" no lugar do `Always announce: "Using change: <name>"` em apply, verify, archive, update e sync (comando e skill) e no Output do propose (comando e skill), com "What the change delivers, in one line, and where its files are"; `**Change:** <change-name>` trocado por `**Entrega:** <...>` nos modelos de saída (apply 2+2, archive 4+1); `grep -c "Using change: <name>"` → 0 nos doze; `sync-root.mjs` → 13 caminhos; "Trechos customizados", "Lint de Markdown" e "Raiz em dia" → PASS (exit 0)

## 3. Documentação e suíte

- [x] 3.1 Atualizar a tabela de trechos customizados do `README.md` e acrescentar o item ao `CHANGELOG.md` na seção 1.15.0. Verificar com os passos "Versão e changelog" e "Lint de Markdown da raiz" passando.
  - Evidência: linha "Describe the delivery" na tabela de trechos customizados do README; item "Mensagens descrevem a entrega" na 1.15.0 do CHANGELOG; "Versão e changelog" → PASS; "Lint de Markdown da raiz" → FAIL primeiro, por `<name>` sem crase em proposal, design e tasks desta change, corrigido com crases (só formatação) → PASS (exit 0)
- [x] 3.2 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` e todos os passos dos jobs `store` e `root` localmente, depois de avisar a outra sessão. Verificar que todos saem com código 0.
  - Evidência: outra sessão avisada antes e depois; `sync-root.mjs --check` → em dia; `openspec validate --all --strict` → 23 passed (exit 0); `run-ci-steps.py` dos jobs `store` e `root` → 30 PASS (exit 0); nenhum `ci-*` no registro

## Workflow follow-up

- `/opsx:verify` e `/opsx:archive` depois do apply; push, PR e merge só quando o responsável pedir.
