# Tasks

## 1. Proteção na CI

- [x] 1.1 Aplicar o D5 no passo "Trechos customizados das skills" do `validate.yml`. Verificar rodando o passo no Git Bash: deve falhar, citando os 10 trechos ausentes nos 6 arquivos.
  - Evidência: 10 checagens novas no passo "Trechos customizados das skills" (6 no par do apply, 3 no do verify, 1 no par novo do update); no Git Bash → 20 linhas "Trecho customizado ausente" (10 trechos × 2 arquivos) e `[FAIL (1)]`, esperado.

## 2. Skills e comandos

- [x] 2.1 Aplicar o D1 no `apply.md` e no `SKILL.md` do apply. Verificar com `grep` mostrando os 6 títulos nos dois arquivos.
  - Evidência: `grep -cE` com os 6 títulos → 6 em `commands/opsx/apply.md` e 6 em `skills/openspec-apply-change/SKILL.md`, inseridos depois do "Security checks" no passo 6.
- [x] 2.2 Aplicar o D2 no `verify.md` e no `SKILL.md` do verify. Verificar com `grep` mostrando os 3 títulos nos dois arquivos e o passo "Review before verify" antes do passo 2.
  - Evidência: `grep -cE` com os 3 títulos → 3 em cada arquivo do verify; o passo "1a. **Review before verify**" fica na linha 43 do comando e 47 da skill, antes do "2. **Check status**" (45 e 49).
- [x] 2.3 Aplicar o D3 no `update.md` e no `SKILL.md` do update. Verificar com `grep` mostrando o título nos dois arquivos, e com o passo da 1.1 passando inteiro.
  - Evidência: "Scope change resets approval" → 1 em cada arquivo do update; `sync-root.mjs` → "Synced 6 paths."; `[PASS] Trechos customizados das skills` (exit 0).

## 3. Regras, config e integração

- [x] 3.1 Aplicar o D4 no `rules.md` e no `config.yaml` e regenerar a raiz com `sync-root.mjs`. Verificar com `sync-root --check` em dia e o passo "Config base carrega sem avisos" passando (ele confere que as regras de `tasks` aparecem nas instruções).
  - Evidência: `rules.md` com a correção urgente por change (seção 2) e as contagens vindas do CLI (seção 7); `config.yaml` com a regra de tasks das dependências do Impact; `sync-root.mjs` → "Synced 1 paths.", `--check` → em dia; `[PASS]` em "Config base carrega sem avisos" (a regra nova aparece nas instruções), "Lint de Markdown" e "Smoke test dos blocos de agentes" (as regras entregues aos projetos seguem iguais à fonte).
- [x] 3.2 Aplicar o D5 no README e o D6 no `VERSION` e no `CHANGELOG.md`. Verificar com o lint nos dois lugares sem issues e o passo "Versão e changelog" passando.
  - Evidência: tabela de trechos do README com as 3 linhas novas; `VERSION` → 1.8.0 e seção `## 1.8.0` no topo do CHANGELOG (a `1.7.0` da outra change entra no rebase); registro da v1.6.0 (teste no console e download) no `verification.md` da change arquivada `commits-e-atualizacao-local`. `[PASS]` em "Versão e changelog", "Lint de Markdown" (nos dois lugares) e "Validar specs e changes OpenSpec da raiz" (exit 0).
- [x] 3.3 Rodar os comandos de verificação do `openspec/project.md` localmente e, no PR, conferir os três jobs (`store (ubuntu-latest)`, `store (windows-latest)` e `root`). Verificar que todos passam.
  - Evidência: localmente, antes do rebase, 16 `[PASS]` no `store` mais o "Smoke test da declaração do store" ao rodar de novo (a primeira falha foi colisão de id com a suíte da outra sessão, rodando ao mesmo tempo) e 4 no `root`; depois do rebase sobre a 1.7.0, `[PASS]` nos passos afetados e `validate --all --strict` → 17 passed; no PR #27 (run 39820322412), `store (ubuntu-latest)`, `store (windows-latest)` e `root` → pass.

## Workflow follow-up

- O registro do download e do teste no console da `v1.6.0` (change arquivada `commits-e-atualizacao-local`) entra neste PR.
- Depois do merge, release `v1.8.0`, depois do merge da `coerencia-de-seguranca-e-triagem` e do rebase, com o `comecar.mjs` anexado. Esta change não altera script interativo, então não exige o teste no console.
