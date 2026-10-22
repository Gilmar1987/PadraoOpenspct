# Tasks

## 1. Pergunta 6.5 e checagem de coerência

- [ ] 1.1 Aplicar o D1 e o D2 em `padrao-openspec/.claude/commands/opsx/init.md` e regenerar a raiz com `sync-root.mjs`. Verificar com `grep` mostrando "Todos os controles de 1 a 4", a nota de múltipla escolha e a linha nova da checagem nas duas cópias, nenhum "Todos os anteriores" no repositório, `sync-root.mjs --check` em dia e o passo "Trechos customizados das skills" passando.

## 2. Versão e integração

- [ ] 2.1 Aplicar o D3 no `CHANGELOG.md`. Verificar com o passo "Versão e changelog" passando.
- [ ] 2.2 Rodar `openspec validate --all --strict`, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente. Verificar que todos saem com código 0.

## Workflow follow-up

- Mesmas condições da `corrige-caminho-e-prompt-no-windows`: teste do responsável no console antes da release `v1.3.1`.
