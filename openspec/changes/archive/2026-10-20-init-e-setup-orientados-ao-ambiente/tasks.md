# Tasks

## 1. Setup

- [x] 1.1 Acrescentar a `.github/workflows/validate.yml` o passo "Smoke test do remote do padrão": um store em repositório git com `origin` `https://github.com/Gilmar1987/PadraoOpenspct.git` passa a ter `padrao` e nenhum `origin` depois do setup com `--yes`; com `--keep-origin`, o `origin` continua; com `origin` de outro repositório, nada muda. Verificar rodando o passo localmente contra o setup atual: ele deve falhar.
- [x] 1.2 Implementar o D1 em `padrao-openspec/scripts/setup-project.mjs`. Verificar com `node --check` e com o passo da 1.1 e os smokes de setup existentes passando localmente.
  - Evidência: antes da implementação, o passo novo deu `[FAIL (1)]`. Depois, `node --check` ok e `[PASS]` em "Smoke test do remote do padrão", "Smoke test do setup de projeto" e "Smoke test do setup em subpasta". A primeira rodada pós-implementação falhou por um grep do próprio teste (`git remote add origin` contra a saída `git -C "<store>" remote add origin`), corrigido para `remote add origin`.

## 2. Init e config base

- [x] 2.1 Acrescentar a regra do D4 a `padrao-openspec/openspec/config.yaml`. Verificar com o passo "Config base carrega sem avisos" passando localmente.
- [x] 2.2 Acrescentar as perguntas 5.8 e 5.9 (D2) e as linhas "Remoto" e "Time" na tabela 5 do `project-setup.md` gerado, em `padrao-openspec/.claude/commands/opsx/init.md`. Verificar com `grep -n "5.8 —\|5.9 —\|| Remoto |\|| Time |"` no arquivo.
- [x] 2.3 Acrescentar a seção "Checagem de coerência" (D3) ao `init.md`, entre o bloco 7 e a confirmação final, e a seção correspondente ao modelo do `project-setup.md`. Verificar com `grep -n "Checagem de coerência"` (seção e modelo) e lendo as seis combinações do D3 no texto.

## 3. Documentação e integração

- [x] 3.1 Aplicar o D5 em `README.md` e `padrao-openspec/README.md`. Verificar com o lint de Markdown dos dois lugares sem issues.
- [x] 3.2 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e os passos do job `store` localmente. Verificar que todos saem com código 0.
  - Evidência: passos do `validate.yml` executados no Git Bash: `[PASS]` nos 12 do job `store` (inclui o lint de Markdown de `padrao-openspec/`, que cobre a 3.1, e o smoke novo do remote do padrão) e nos 3 do job `root` (`sync-root.mjs --check`, validate da raiz e lint da raiz). Registro `ci-store` removido depois com `openspec store unregister ci-store`.
