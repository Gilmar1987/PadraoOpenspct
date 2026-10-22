# Tasks

## 1. Preparação e proteção na CI

- [ ] 1.1 Rebasear a branch na `main` atual e combinar com a outra sessão o número da próxima minor livre (usado no grupo 5). Verificar com `git log --oneline HEAD..origin/main` vazio e o número registrado na evidência.
- [ ] 1.2 Acrescentar os marcadores do D6 ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml` ("Declared gaps" e "ADR verification" no laço do verify; "verificacao" no laço do propose). Verificar rodando só esse passo localmente: deve falhar nos quatro arquivos que ainda não têm os trechos.

## 2. Registro de lacunas e script

- [ ] 2.1 Criar `padrao-openspec/openspec/lacunas.md` conforme o D1 (introdução, tabela vazia e linha de exemplo comentada). Verificar com o markdownlint nos dois lugares.
- [ ] 2.2 Criar `padrao-openspec/scripts/lacunas.mjs` conforme o D2 (Node.js sem dependências, `--raiz` e `--codigo`, normalização de fim de linha) e acrescentar `node --check scripts/lacunas.mjs` ao passo "Sintaxe dos scripts". Verificar com `node --check` e com os cinco casos do D6 rodados à mão num diretório temporário (códigos de saída 0, 1, 1, 1 e 0).
- [ ] 2.3 Acrescentar ao `validate.yml` o passo "Smoke test do registro de lacunas" com os cinco casos do D6 e a mensagem "releia a declaração inteira". Verificar rodando só esse passo localmente, depois de avisar a outra sessão (suítes locais não rodam em paralelo).

## 3. Verify e propose

- [ ] 3.1 Aplicar o D3 e o D4 (heurísticas "Declared gaps" e "ADR verification") em `padrao-openspec/.claude/commands/opsx/verify.md` e `skills/openspec-verify-change/SKILL.md`, com o mesmo texto. Verificar com `diff` das duas heurísticas entre os arquivos vazio.
- [ ] 3.2 Aplicar o item novo do D4 ao passo 5 da "Architectural Decision Check" em `padrao-openspec/.claude/commands/opsx/propose.md` e `skills/openspec-propose/SKILL.md`. Verificar com `grep -n "verificacao"` nos dois arquivos.
- [ ] 3.3 Acrescentar o campo `verificacao` ao `padrao-openspec/openspec/adrs/template.md` e a explicação ao `adrs/README.md` (D4). Verificar com `grep` nos dois arquivos e com o passo "Trechos customizados das skills" passando.

## 4. Precedência e modelo de project.md

- [ ] 4.1 Aplicar o D5 em `padrao-openspec/openspec/rules.md` (parágrafo "Precedência entre documentos" na seção 1). Verificar com `grep -n "Precedência entre documentos"` e com o smoke test dos blocos de agentes passando (o `docs/openspec-regras.md` gerado traz o parágrafo).
- [ ] 4.2 Aplicar o D5 ao modelo `padrao-openspec/openspec/project.md` (seção "Precedência dos documentos" depois de "Key Constraints" e linha "Conferência de lacunas" em "Comandos de verificação"). Verificar com `grep` das duas e com o markdownlint.
- [ ] 4.3 Atualizar o `README.md` (trechos customizados novos e o `lacunas.mjs` na lista de scripts) conforme o D6. Verificar com o lint da raiz.

## 5. Versão e integração

- [ ] 5.1 Atualizar `padrao-openspec/VERSION` e `CHANGELOG.md` com a versão combinada na 1.1, com "O que mudou" e "Ações no projeto" do Migration Plan. Verificar com o passo "Versão e changelog".
- [ ] 5.2 Rodar `node padrao-openspec/scripts/sync-root.mjs` e `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o markdownlint nos dois lugares e os passos dos jobs `store` e `root` do `validate.yml` localmente, avisando a outra sessão antes. Verificar que todos saem com código 0.
