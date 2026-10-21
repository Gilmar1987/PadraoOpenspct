# Tasks

## 1. Proteção na CI

- [x] 1.1 Acrescentar as duas checagens do D4 ao passo "Guia de primeiros passos" de `.github/workflows/validate.yml`. Verificar rodando o passo localmente: deve falhar (o guia ainda clona a `main`).
  - Evidência: `[FAIL (1)] Guia de primeiros passos` com as checagens novas, antes de mudar o guia (exit 1, esperado).

## 2. Guias

- [x] 2.1 Aplicar o D1 e o D2 em `COMECE-AQUI.md` e o D3 em `README.md` e `padrao-openspec/README.md`. Verificar com o passo da 1.1 passando, o lint nos dois lugares sem issues e um clone real por tag numa pasta temporária: `git clone --branch v1.2.0 ...` seguido de `switch -c main` deixa `git branch --show-current` = `main` e `padrao-openspec/VERSION` = `1.2.0`.
  - Evidência: `[PASS] Guia de primeiros passos`; lint → 0 issues na raiz e em `padrao-openspec/`; clone real numa pasta temporária: `git clone --branch v1.2.0 ...` e `switch -c main` → `branch=main version=1.2.0 tag=v1.2.0` (o Git avisa "is not a commit" por ser tag anotada, sem efeito no resultado).

## 3. Versão e integração

- [x] 3.1 Aplicar o D5 em `padrao-openspec/VERSION` e `CHANGELOG.md`. Verificar com o passo "Versão e changelog" passando.
  - Evidência: `VERSION` → 1.2.1 e seção `## 1.2.1` no topo do CHANGELOG; `[PASS] Versão e changelog` (exit 0).
- [x] 3.2 Rodar `sync-root.mjs --check`, `openspec validate --all --strict` na raiz, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente. Verificar que todos saem com código 0.
  - Evidência: `sync-root.mjs --check` em dia; passos do `validate.yml` no Git Bash → `[PASS]` nos 14 do job `store` e nos 4 do job `root` (inclui lint da raiz e "Guia de primeiros passos"), exit 0. Registro `ci-store` removido.
