# Tasks

## 1. Preparação e proteção na CI

- [ ] 1.1 Rebasear a branch na `main` e confirmar com a outra sessão a versão desta change (a próxima minor livre). Acrescentar ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml` os marcadores do D8. Verificar rodando esse passo localmente, depois de avisar a outra sessão: deve falhar nos arquivos de propose, apply, verify e init.

## 2. Init e template do project.md

- [ ] 2.1 Aplicar o D1 (pergunta 2.6, resumo do Bloco 2 e linha na tabela do `project-setup.md`) e o D3 (finalidade "teste de contrato" na 7.1, condicionada à 2.6) em `padrao-openspec/.claude/commands/opsx/init.md`. Verificar com `grep -n "2.6 — O sistema expõe ou consome uma API\|Teste de contrato\|Contratos de interface"` no arquivo.
- [ ] 2.2 Aplicar o D2, o D3 e a nota do D7 em `padrao-openspec/openspec/project.md`: seção "Contratos de interface" e linha "Teste de contrato". Verificar com `grep -n` das duas e com o lint do arquivo.

## 3. Propose, apply e verify

- [ ] 3.1 Aplicar o D4 em `padrao-openspec/.claude/commands/opsx/propose.md` e `skills/openspec-propose/SKILL.md`, com o mesmo texto. Verificar com `diff` das linhas do trecho nos dois arquivos.
- [ ] 3.2 Aplicar o D5 em `padrao-openspec/.claude/commands/opsx/apply.md` e `skills/openspec-apply-change/SKILL.md`, com o mesmo texto. Verificar com `diff` das linhas do trecho.
- [ ] 3.3 Aplicar o D6 em `padrao-openspec/.claude/commands/opsx/verify.md` e `skills/openspec-verify-change/SKILL.md`, com o mesmo texto. Verificar com `diff` das linhas do trecho e com o smoke das métricas de fluxo passando.

## 4. Regras, versão e documentação

- [ ] 4.1 Aplicar o D7 em `padrao-openspec/openspec/rules.md` (item na seção 3). Verificar com `grep -n "contrato de interface"` no arquivo e com o smoke dos blocos de agentes passando.
- [ ] 4.2 Aplicar o D8 em `padrao-openspec/VERSION`, `CHANGELOG.md` e na tabela de trechos customizados do `README.md`. Verificar com o passo "Versão e changelog" passando.
- [ ] 4.3 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente, depois de avisar a outra sessão para não rodarem juntas. Verificar que todos saem com código 0.
