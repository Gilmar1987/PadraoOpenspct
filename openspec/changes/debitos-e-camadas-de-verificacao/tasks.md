# Tasks

## 1. Preparação e proteção na CI

- [ ] 1.1 Combinar com a outra sessão o número da próxima minor livre e rebasear a branch na `main` se ela tiver andado. Verificar com `git log --oneline HEAD..origin/main` vazio e o número registrado na Evidência.
- [ ] 1.2 Acrescentar ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml` os marcadores do D7 ("Related debts" no propose e no explore, "Update the open debts" no archive, "Verification layers" no verify, `estado-atual.md` e "Camadas de verificação" no init). Verificar rodando o passo localmente, depois de combinar com a outra sessão que a suíte dela não está rodando: deve falhar só nos arquivos ainda sem os trechos.

## 2. Init e template

- [ ] 2.1 Aplicar o D5 ao template `padrao-openspec/openspec/project.md` (seção "Camadas de verificação" depois de "Comandos de verificação"). Verificar com `grep -n "## Camadas de verificação"` no template e com o lint de Markdown passando.
- [ ] 2.2 Aplicar o D1, o D2 e o preenchimento da matriz do D5 em `padrao-openspec/.claude/commands/opsx/init.md`: Arquivo 6 `estado-atual.md`, aviso normativo e link em "Pontos adiados" no Arquivo 5, regra da matriz no Arquivo 2, `estado-atual.md` no commit do init e na lista de próximos passos. Verificar com `grep -n "estado-atual.md\|Camadas de verificação\|normativo"` no arquivo e conferindo que a checagem de coerência e as perguntas não mudaram (`git diff` sem linhas nas seções "Bloco" e "Checagem de coerência").

## 3. Ciclo das changes

- [ ] 3.1 Aplicar o D3 ("Related debts") ao propose e ao explore, no comando e na skill, com o mesmo texto. Verificar com `diff` vazio entre os trechos do comando e da skill de cada um.
- [ ] 3.2 Aplicar o D4 ("Update the open debts") ao archive, no comando e na skill, incluindo `openspec/estado-atual.md` no `git add` e no `git commit` do passo 5a. Verificar com `grep` nos dois arquivos e com `diff` vazio entre os trechos.
- [ ] 3.3 Aplicar o D6 ("Verification layers") ao verify, no comando e na skill, com a linha `- Camadas:` no formato do registro. Verificar com `diff` vazio entre os trechos e com o smoke das métricas de fluxo passando (a linha nova não muda as contagens).

## 4. Versão, documentação e integração

- [ ] 4.1 Aplicar o D7 ao `padrao-openspec/VERSION` e ao `CHANGELOG.md` com a versão combinada na 1.1 e as ações no projeto. Verificar com o passo "Versão e changelog" passando localmente.
- [ ] 4.2 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict`, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente, depois de combinar com a outra sessão que a suíte dela não está rodando. Verificar que todos saem com código 0.
