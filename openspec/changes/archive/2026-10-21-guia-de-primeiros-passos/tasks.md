# Tasks

## 1. Proteção na CI

- [x] 1.1 Acrescentar o passo "Guia de primeiros passos" (D5) ao job `root` de `.github/workflows/validate.yml`. Verificar rodando o passo localmente: deve falhar (guia inexistente).
  - Evidência: `[FAIL (1)] Guia de primeiros passos` antes de criar o guia (exit 1, esperado).

## 2. Guias

- [x] 2.1 Criar `COMECE-AQUI.md` na raiz (D1) e aplicar o D2 no `README.md`. Verificar com o passo da 1.1 passando e o lint da raiz sem issues.
  - Evidência: `markdownlint-cli2 "**/*.md"` na raiz → 0 issues em 124 arquivos; `[PASS] Guia de primeiros passos` depois da 2.2 (o passo também confere a seção do guia do projeto, que é da 2.2).
- [x] 2.2 Acrescentar a seção "Primeiros passos" (D3) a `padrao-openspec/templates/openspec-padrao.md` e atualizar a mensagem final de `padrao-openspec/scripts/setup-project.mjs` (D4). Verificar com o lint de `padrao-openspec/`, `node --check` e os smokes do instalador e do setup passando localmente.
  - Evidência: lint de `padrao-openspec/` → 0 issues; `node --check scripts/setup-project.mjs` ok; `[PASS]` em "Smoke test do instalador", "do setup de projeto" e "do setup em subpasta" (exit 0).

## 3. Versão e integração

- [x] 3.1 Aplicar o D6 em `padrao-openspec/VERSION` e `CHANGELOG.md`. Verificar com o passo "Versão e changelog" passando localmente.
  - Evidência: `VERSION` → 1.2.0 e seção `## 1.2.0` no topo do CHANGELOG; `[PASS] Versão e changelog` (exit 0).
- [x] 3.2 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente. Verificar que todos saem com código 0.
  - Evidência: `sync-root.mjs --check` em dia; `[PASS]` nos 14 passos do job `store` e em "Raiz em dia", "Validar specs" e "Guia de primeiros passos" do `root`. O lint da raiz falhou (MD024: o CHANGELOG com duas versões repete "O que mudou" e "Ações no projeto"); corrigido com `MD024.siblings_only` nas duas configurações (registrado no raio de impacto do design), e `markdownlint-cli2 "**/*.md"` → 0 issues na raiz e em `padrao-openspec/`. Registro `ci-store` removido.
