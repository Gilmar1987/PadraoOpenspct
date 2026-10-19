# Tasks

## 1. Declaração do store versionada

- [x] 1.1 Atualizar o smoke test do instalador em `.github/workflows/validate.yml`. Ele passa a conferir: `openspec/changes/demo/proposal.md` ignorado, `openspec/config.yaml` não ignorado, uma única linha `/openspec/*` e uma única `!/openspec/config.yaml` depois de duas execuções, e a migração de um `.gitignore` que termina com o bloco antigo. Verificar rodando o passo localmente antes da 1.2: ele deve falhar.
- [x] 1.2 Implementar o D1 em `padrao-openspec/scripts/install-skills.mjs` (bloco novo, detecção de "já correto" e migração). Verificar com o passo da 1.1 passando.

## 2. Backup só de arquivos editados

- [x] 2.1 Acrescentar o passo "Smoke test do setup em subpasta" (D3) em `.github/workflows/validate.yml`. Verificar rodando localmente antes da 2.2: ele deve falhar porque um `.bak` é gerado.
- [x] 2.2 Implementar o D2 em `padrao-openspec/scripts/setup-project.mjs`. Verificar com os passos da 2.1 e o "Smoke test do setup de projeto" passando.

## 3. Documentação e init

- [x] 3.1 Atualizar o texto do próximo passo em `padrao-openspec/.claude/commands/opsx/init.md` (D5) e rodar o `sync-root.mjs`. Verificar com `grep` do texto novo e `sync-root.mjs --check` com código 0.
- [x] 3.2 Atualizar `README.md` e `padrao-openspec/README.md` com a ordem do `create-next-app` (D4) e a regra nova do `.gitignore`. Verificar com o lint da raiz e de `padrao-openspec/` sem issues.

## 4. Integração

- [x] 4.1 Rodar `openspec validate --all --strict`, o lint e os passos de CI do instalador, do setup, do setup em subpasta e da declaração do store. Verificar que todos saem com código 0.
