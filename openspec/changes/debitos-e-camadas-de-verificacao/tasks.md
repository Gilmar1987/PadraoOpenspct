# Tasks

## 1. Preparação e proteção na CI

- [x] 1.1 Combinar com a outra sessão o número da próxima minor livre e rebasear a branch na `main` se ela tiver andado. Verificar com `git log --oneline HEAD..origin/main` vazio e o número registrado na Evidência.
  - Evidência: rebase em `origin/main` f4cb088 (com a `contratos-de-interface`) sem conflito; `git log --oneline HEAD..origin/main` vazio; versão: pelo modelo de versão acumulada, a change acrescenta à seção 1.12.0 aberta, sem mexer no `VERSION`; outra sessão sem suíte rodando
- [x] 1.2 Acrescentar ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml` os marcadores do D7 ("Related debts" no propose e no explore, "Update the open debts" no archive, "Verification layers" no verify, `estado-atual.md` e "Camadas de verificação" no init). Verificar rodando o passo localmente, depois de combinar com a outra sessão que a suíte dela não está rodando: deve falhar só nos arquivos ainda sem os trechos.
  - Evidência: marcadores do D7 no passo "Trechos customizados das skills" ("Related debts" no propose e no explore, "Update the open debts" no archive, "Verification layers" no verify, Arquivo 6 e "Camadas de verificação" no init; o marcador com crases em aspas simples); `run-ci-steps.py ... "Trechos customizados"` antes da implementação → FAIL (exit 1) com 10 ausências, só nos arquivos sem os trechos; o passo não usa recursos compartilhados

## 2. Init e template

- [x] 2.1 Aplicar o D5 ao template `padrao-openspec/openspec/project.md` (seção "Camadas de verificação" depois de "Comandos de verificação"). Verificar com `grep -n "## Camadas de verificação"` no template e com o lint de Markdown passando.
  - Evidência: seção "Camadas de verificação" depois de "Comandos de verificação" no modelo de `project.md` (linha 110), com as seis camadas; a linha Contrato aponta para a tabela "Contratos de interface" e o "Teste de contrato" da `contratos-de-interface`; `npx markdownlint-cli2@0.23.2 openspec/project.md` → 0 issues (exit 0)
- [x] 2.2 Aplicar o D1, o D2 e o preenchimento da matriz do D5 em `padrao-openspec/.claude/commands/opsx/init.md`: Arquivo 6 `estado-atual.md`, aviso normativo e link em "Pontos adiados" no Arquivo 5, regra da matriz no Arquivo 2, `estado-atual.md` no commit do init e na lista de próximos passos. Verificar com `grep -n "estado-atual.md\|Camadas de verificação\|normativo"` no arquivo e conferindo que a checagem de coerência e as perguntas não mudaram (`git diff` sem linhas nas seções "Bloco" e "Checagem de coerência").
  - Evidência: Arquivo 6 `estado-atual.md` (linha 984), aviso normativo no Arquivo 5 (linha 929) e "Pontos adiados" só com o link (linha 981), regra da matriz no Arquivo 2 (linha 867; a camada Contrato vem do "Teste de contrato" da 7.1 e da 2.6 da `contratos-de-interface`, já na main), e o `estado-atual.md` nos próximos passos; o commit do init já inclui toda a pasta `openspec/`; `git diff` sem linhas nos blocos de perguntas nem na checagem de coerência (0); lint → 0 issues

## 3. Ciclo das changes

- [x] 3.1 Aplicar o D3 ("Related debts") ao propose e ao explore, no comando e na skill, com o mesmo texto. Verificar com `diff` vazio entre os trechos do comando e da skill de cada um.
  - Evidência: "Related debts" no propose (Artifact Creation Guidelines, depois de "Interface contract first") e no explore (antes de "## Guardrails"), comando e skill; `diff` dos trechos → iguais nos dois pares; "Trechos customizados" → PASS
- [x] 3.2 Aplicar o D4 ("Update the open debts") ao archive, no comando e na skill, incluindo `openspec/estado-atual.md` no `git add` e no `git commit` do passo 5a. Verificar com `grep` nos dois arquivos e com `diff` vazio entre os trechos.
  - Evidência: "Update the open debts" depois de "Update the project overview" no archive (comando e skill) e o `estado-atual.md` nos dois pathspecs do passo 5a quando o arquivo existe; `grep -c "add it to both pathspecs"` → 1 em cada; `diff` dos trechos → iguais
- [x] 3.3 Aplicar o D6 ("Verification layers") ao verify, no comando e na skill, com a linha `- Camadas:` no formato do registro. Verificar com `diff` vazio entre os trechos e com o smoke das métricas de fluxo passando (a linha nova não muda as contagens).
  - Evidência: "Verification layers" depois de "Interface contract check" e a linha `- Camadas:` depois de `Não verificado` no formato do registro (comando e skill); `diff` → iguais; "Smoke test das métricas de fluxo" → PASS (a linha nova não muda as contagens)

## 4. Versão, documentação e integração

- [x] 4.1 Aplicar o D7 ao `padrao-openspec/VERSION` e ao `CHANGELOG.md` com a versão combinada na 1.1 e as ações no projeto. Verificar com o passo "Versão e changelog" passando localmente.
  - Evidência: pelo modelo de versão acumulada, `VERSION` continua 1.12.0; item "Débitos e camadas de verificação" em "O que mudou" e ação recomendada em "Ações no projeto" da seção 1.12.0; README com os trechos novos na tabela (inclusive uma linha para o explore); "Versão e changelog", lint nos dois lugares, "Raiz em dia" e "Guia" → PASS (exit 0)
- [ ] 4.2 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict`, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente, depois de combinar com a outra sessão que a suíte dela não está rodando. Verificar que todos saem com código 0.
