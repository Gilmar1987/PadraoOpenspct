# Tasks

## 1. Preparação e proteção na CI

- [x] 1.1 Rebasear a branch na `main` e confirmar com a outra sessão a versão desta change (a próxima minor livre). Acrescentar ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml` os marcadores do D8. Verificar rodando esse passo localmente, depois de avisar a outra sessão: deve falhar nos arquivos de propose, apply, verify e init.
  - Evidência: rebase em `origin/main` b4e707c sem conflito; versão: pelo modelo de versão acumulada, a change acrescenta à seção 1.12.0 aberta (sem tag), sem mexer no `VERSION`; marcadores do D8 no passo "Trechos customizados das skills"; `run-ci-steps.py ... "Trechos customizados"` antes da implementação → FAIL (exit 1) só nos sete pontos esperados (propose, apply e verify, comando e skill, e o init); o passo não usa recursos compartilhados

## 2. Init e template do project.md

- [x] 2.1 Aplicar o D1 (pergunta 2.6, resumo do Bloco 2 e linha na tabela do `project-setup.md`) e o D3 (finalidade "teste de contrato" na 7.1, condicionada à 2.6) em `padrao-openspec/.claude/commands/opsx/init.md`. Verificar com `grep -n "2.6 — O sistema expõe ou consome uma API\|Teste de contrato\|Contratos de interface"` no arquivo.
  - Evidência: pergunta 2.6 depois da 2.5 (múltipla escolha, caminho e, para terceiros, origem e versão), linha "Contratos de interface" na tabela do `project-setup.md`, "teste de contrato" nas finalidades da 7.1 com a condição da 2.6 e sugestões de quatro ecossistemas, e instrução do Arquivo 2 para preencher a tabela e o item 1 da precedência; `grep -n` → linhas 223, 692, 799 e 867; lint → 0 issues
- [x] 2.2 Aplicar o D2, o D3 e a nota do D7 em `padrao-openspec/openspec/project.md`: seção "Contratos de interface" e linha "Teste de contrato". Verificar com `grep -n` das duas e com o lint do arquivo.
  - Evidência: seção "Contratos de interface" em Architecture (linha 40), com a nota do ORIGEM.md e a recomendação do hash exposto, e linha "Teste de contrato" nos Comandos de verificação (linha 100); o item 1 da "Precedência dos documentos" aponta para a tabela; lint → 0 issues (exit 0)

## 3. Propose, apply e verify

- [x] 3.1 Aplicar o D4 em `padrao-openspec/.claude/commands/opsx/propose.md` e `skills/openspec-propose/SKILL.md`, com o mesmo texto. Verificar com `diff` das linhas do trecho nos dois arquivos.
  - Evidência: "Interface contract first" nas Artifact Creation Guidelines do `propose.md` e da skill, depois de "Declared inference"; `diff` das linhas → iguais; "Trechos customizados" → PASS
- [x] 3.2 Aplicar o D5 em `padrao-openspec/.claude/commands/opsx/apply.md` e `skills/openspec-apply-change/SKILL.md`, com o mesmo texto. Verificar com `diff` das linhas do trecho.
  - Evidência: "Contract and code in the same commit" depois de "Unrequested fixes are scope" no `apply.md` e na skill; `diff` das linhas → iguais; "Trechos customizados" → PASS
- [x] 3.3 Aplicar o D6 em `padrao-openspec/.claude/commands/opsx/verify.md` e `skills/openspec-verify-change/SKILL.md`, com o mesmo texto. Verificar com `diff` das linhas do trecho e com o smoke das métricas de fluxo passando.
  - Evidência: "Interface contract check" depois de "Project validation commands" no `verify.md` e na skill; `diff` das linhas → iguais; "Smoke test das métricas de fluxo" e "Lint de Markdown" → PASS (exit 0)

## 4. Regras, versão e documentação

- [x] 4.1 Aplicar o D7 em `padrao-openspec/openspec/rules.md` (item na seção 3). Verificar com `grep -n "contrato de interface"` no arquivo e com o smoke dos blocos de agentes passando.
  - Evidência: item novo na seção 3 do `rules.md` (contrato antes do código e no mesmo commit); `grep -n "contrato de interface"` → linha 104 (e a 26, da precedência); espelho da raiz sincronizado; "Smoke test dos blocos de agentes" → PASS (exit 0)
- [x] 4.2 Aplicar o D8 em `padrao-openspec/VERSION`, `CHANGELOG.md` e na tabela de trechos customizados do `README.md`. Verificar com o passo "Versão e changelog" passando.
  - Evidência: pelo modelo de versão acumulada, `VERSION` continua 1.12.0; item "Contratos de interface" em "O que mudou" e ação recomendada em "Ações no projeto" da seção 1.12.0; README com os três trechos e a 2.6 na tabela de trechos customizados; "Versão e changelog", "Lint de Markdown da raiz" e "Guia de primeiros passos" → PASS (exit 0)
- [x] 4.3 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente, depois de avisar a outra sessão para não rodarem juntas. Verificar que todos saem com código 0.
  - Evidência: outra sessão avisada antes e depois; `sync-root.mjs --check` → em dia; `openspec validate --all --strict` → 20 passed (exit 0); `run-ci-steps.py` dos jobs `store` e `root` → 29 PASS, nenhum `ci-*` no registro (exit 0). Depois das correções da revisão, os passos afetados rodaram de novo sem recursos compartilhados ("Trechos customizados", lint nos dois lugares, "Versão e changelog", "Smoke test das métricas de fluxo", "Config base", "Raiz em dia" e "Guia") → PASS (exit 0)
