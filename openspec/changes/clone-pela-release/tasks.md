# Tasks

## 1. Proteção na CI

- [ ] 1.1 Acrescentar as duas checagens do D4 ao passo "Guia de primeiros passos" de `.github/workflows/validate.yml`. Verificar rodando o passo localmente: deve falhar (o guia ainda clona a `main`).

## 2. Guias

- [ ] 2.1 Aplicar o D1 e o D2 em `COMECE-AQUI.md` e o D3 em `README.md` e `padrao-openspec/README.md`. Verificar com o passo da 1.1 passando, o lint nos dois lugares sem issues e um clone real por tag numa pasta temporária: `git clone --branch v1.2.0 ...` seguido de `switch -c main` deixa `git branch --show-current` = `main` e `padrao-openspec/VERSION` = `1.2.0`.

## 3. Versão e integração

- [ ] 3.1 Aplicar o D5 em `padrao-openspec/VERSION` e `CHANGELOG.md`. Verificar com o passo "Versão e changelog" passando.
- [ ] 3.2 Rodar `sync-root.mjs --check`, `openspec validate --all --strict` na raiz, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente. Verificar que todos saem com código 0.
