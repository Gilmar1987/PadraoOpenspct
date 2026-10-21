# Tasks

## 1. Proteção na CI

- [ ] 1.1 Acrescentar o passo "Guia de primeiros passos" (D5) ao job `root` de `.github/workflows/validate.yml`. Verificar rodando o passo localmente: deve falhar (guia inexistente).

## 2. Guias

- [ ] 2.1 Criar `COMECE-AQUI.md` na raiz (D1) e aplicar o D2 no `README.md`. Verificar com o passo da 1.1 passando e o lint da raiz sem issues.
- [ ] 2.2 Acrescentar a seção "Primeiros passos" (D3) a `padrao-openspec/templates/openspec-padrao.md` e atualizar a mensagem final de `padrao-openspec/scripts/setup-project.mjs` (D4). Verificar com o lint de `padrao-openspec/`, `node --check` e os smokes do instalador e do setup passando localmente.

## 3. Versão e integração

- [ ] 3.1 Aplicar o D6 em `padrao-openspec/VERSION` e `CHANGELOG.md`. Verificar com o passo "Versão e changelog" passando localmente.
- [ ] 3.2 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente. Verificar que todos saem com código 0.
