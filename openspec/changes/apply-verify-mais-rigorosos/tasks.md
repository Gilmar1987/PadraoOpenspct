# Tasks

## 1. Proteção na CI

- [ ] 1.1 Aplicar o D5 no passo "Trechos customizados das skills" do `validate.yml`. Verificar rodando o passo no Git Bash: deve falhar, citando os 10 trechos ausentes nos 6 arquivos.

## 2. Skills e comandos

- [ ] 2.1 Aplicar o D1 no `apply.md` e no `SKILL.md` do apply. Verificar com `grep` mostrando os 6 títulos nos dois arquivos.
- [ ] 2.2 Aplicar o D2 no `verify.md` e no `SKILL.md` do verify. Verificar com `grep` mostrando os 3 títulos nos dois arquivos e o passo "Review before verify" antes do passo 2.
- [ ] 2.3 Aplicar o D3 no `update.md` e no `SKILL.md` do update. Verificar com `grep` mostrando o título nos dois arquivos, e com o passo da 1.1 passando inteiro.

## 3. Regras, config e integração

- [ ] 3.1 Aplicar o D4 no `rules.md` e no `config.yaml` e regenerar a raiz com `sync-root.mjs`. Verificar com `sync-root --check` em dia e o passo "Config base carrega sem avisos" passando (ele confere que as regras de `tasks` aparecem nas instruções).
- [ ] 3.2 Aplicar o D5 no README e o D6 no `VERSION` e no `CHANGELOG.md`. Verificar com o lint nos dois lugares sem issues e o passo "Versão e changelog" passando.
- [ ] 3.3 Rodar os comandos de verificação do `openspec/project.md` localmente e, no PR, conferir os três jobs (`store (ubuntu-latest)`, `store (windows-latest)` e `root`). Verificar que todos passam.

## Workflow follow-up

- O registro do download e do teste no console da `v1.6.0` (change arquivada `commits-e-atualizacao-local`) entra neste PR.
- Depois do merge, release `v1.7.0` com o `comecar.mjs` anexado. Esta change não altera script interativo, então não exige o teste no console.
