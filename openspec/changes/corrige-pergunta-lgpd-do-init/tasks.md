# Tasks

## 1. Pergunta 6.5 e checagem de coerência

- [x] 1.1 Aplicar o D1 e o D2 em `padrao-openspec/.claude/commands/opsx/init.md` e regenerar a raiz com `sync-root.mjs`. Verificar com `grep` mostrando "Todos os controles de 1 a 4", a nota de múltipla escolha e a linha nova da checagem nas duas cópias, nenhum "Todos os anteriores" no repositório, `sync-root.mjs --check` em dia e o passo "Trechos customizados das skills" passando.
  - Evidência: `grep -c` nas duas cópias do `init.md` → 1 para "Todos os controles de 1 a 4", 1 para a nota "Faça esta pergunta só se o 1.5" e 1 para a linha "1.5 é 1, 2 ou 3" da checagem; "Todos os anteriores" só aparece nos artefatos desta change, que citam o texto antigo; `sync-root.mjs` → "Synced 1 paths." e `--check` → "Root is in sync"; `[PASS] Trechos customizados das skills` (exit 0).

## 2. Versão e integração

- [x] 2.1 Aplicar o D3 no `CHANGELOG.md`. Verificar com o passo "Versão e changelog" passando.
  - Evidência: item "Pergunta de LGPD do `/opsx:init`" na seção `## 1.3.1` do CHANGELOG; `[PASS] Versão e changelog` (exit 0).
- [ ] 2.2 Rodar `openspec validate --all --strict`, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente. Verificar que todos saem com código 0.

## Workflow follow-up

- Mesmas condições da `corrige-caminho-e-prompt-no-windows`: teste do responsável no console antes da release `v1.3.1`.
