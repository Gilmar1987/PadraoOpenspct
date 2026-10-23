# Tasks

## 1. Preparação e proteção na CI

- [x] 1.1 Rebasear a branch na `main` atual e combinar com a outra sessão o número da próxima minor livre (usado no grupo 5). Verificar com `git log --oneline HEAD..origin/main` vazio e o número registrado na evidência.
  - Evidência: rebase em `origin/main` fe31307 (PR #34) sem conflito; `git log --oneline HEAD..origin/main` vazio (exit 0); versão: pelo modelo decidido em 2026-10-22, a change acrescenta itens à seção `## 1.12.0` aberta no CHANGELOG, sem mexer no `VERSION` (já em 1.12.0, sem tag `v1.12.0`); outra sessão avisada
- [x] 1.2 Acrescentar os marcadores do D6 ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml` ("Declared gaps" e "ADR verification" no laço do verify; "verificacao" no laço do propose). Verificar rodando só esse passo localmente: deve falhar nos quatro arquivos que ainda não têm os trechos.
  - Evidência: marcadores "Declared gaps" e "ADR verification" no laço do verify e "verificacao" no do propose; `run-ci-steps.py ... "Trechos customizados"` antes da implementação → FAIL (exit 1) só nos seis pontos esperados (verify e propose, comando e skill)

## 2. Registro de lacunas e script

- [x] 2.1 Criar `padrao-openspec/openspec/lacunas.md` conforme o D1 (introdução, tabela vazia e linha de exemplo comentada). Verificar com o markdownlint nos dois lugares.
  - Evidência: `padrao-openspec/openspec/lacunas.md` com introdução, como manter, comando de conferência, tabela vazia com as sete colunas e linha de exemplo num comentário; `npx markdownlint-cli2@0.23.2` em `padrao-openspec/` → 0 issues (exit 0); na raiz o arquivo fica fora do lint pela configuração (ignora `padrao-openspec/**`)
- [x] 2.2 Criar `padrao-openspec/scripts/lacunas.mjs` conforme o D2 (Node.js sem dependências, `--raiz` e `--codigo`, normalização de fim de linha) e acrescentar `node --check scripts/lacunas.mjs` ao passo "Sintaxe dos scripts". Verificar com `node --check` e com os cinco casos do D6 rodados à mão num diretório temporário (códigos de saída 0, 1, 1, 1 e 0).
  - Evidência: `node --check scripts/lacunas.mjs` → ok; cinco casos do D6 à mão num diretório temporário: em dia → "ok: 1 lacunas, 1 fontes" (exit 0, fonte com CRLF), sem motivo → "falta o motivo" (exit 1), fonte alterada → "releia a declaração inteira" com o hash atual (exit 1), fonte ausente (exit 1), sem registro (exit 0); o modelo vazio do padrão → "ok: 0 lacunas" (exit 0); `node --check` acrescentado ao passo "Sintaxe dos scripts" → PASS. As mensagens de hash ausente ou divergente mostram o hash atual, porque o hash normaliza o fim de linha e não pode ser obtido com sha256sum
- [x] 2.3 Acrescentar ao `validate.yml` o passo "Smoke test do registro de lacunas" com os cinco casos do D6 e a mensagem "releia a declaração inteira". Verificar rodando só esse passo localmente, depois de avisar a outra sessão (suítes locais não rodam em paralelo).
  - Evidência: passo "Smoke test do registro de lacunas" (modelo vazio, em dia, sem motivo, fonte alterada com "releia a declaração inteira", fonte ausente, fonte codigo: sem --codigo, sem registro) → PASS (exit 0); o passo usa só uma pasta temporária, sem registro de stores, portas nem o CLI global, por isso não exigiu aviso à outra sessão

## 3. Verify e propose

- [x] 3.1 Aplicar o D3 e o D4 (heurísticas "Declared gaps" e "ADR verification") em `padrao-openspec/.claude/commands/opsx/verify.md` e `skills/openspec-verify-change/SKILL.md`, com o mesmo texto. Verificar com `diff` das duas heurísticas entre os arquivos vazio.
  - Evidência: heurísticas "Declared gaps" e "ADR verification" depois de "External report triage" no `verify.md` e na skill; `diff` das duas linhas entre os arquivos → vazio para as duas; "Trechos customizados" e "Smoke test das métricas de fluxo" → PASS (exit 0)
- [x] 3.2 Aplicar o item novo do D4 ao passo 5 da "Architectural Decision Check" em `padrao-openspec/.claude/commands/opsx/propose.md` e `skills/openspec-propose/SKILL.md`. Verificar com `grep -n "verificacao"` nos dois arquivos.
  - Evidência: item novo no passo 5 da "Architectural Decision Check"; `grep -n "verificacao"` → propose.md:213 e SKILL.md:217
- [x] 3.3 Acrescentar o campo `verificacao` ao `padrao-openspec/openspec/adrs/template.md` e a explicação ao `adrs/README.md` (D4). Verificar com `grep` nos dois arquivos e com o passo "Trechos customizados das skills" passando.
  - Evidência: `verificacao: []` no frontmatter de `adrs/template.md` (linha 8) e explicação com exemplos de três ecossistemas no `adrs/README.md` (linha 27); `sync-root.mjs` → 6 caminhos, espelho da raiz com o campo; "Trechos customizados" e "Lint de Markdown" → PASS (exit 0)

## 4. Precedência e modelo de project.md

- [x] 4.1 Aplicar o D5 em `padrao-openspec/openspec/rules.md` (parágrafo "Precedência entre documentos" na seção 1). Verificar com `grep -n "Precedência entre documentos"` e com o smoke test dos blocos de agentes passando (o `docs/openspec-regras.md` gerado traz o parágrafo).
  - Evidência: parágrafo "Precedência entre documentos" na seção 1 do `rules.md` (ordem contrato → specs → arquitetura → ADRs → código, lacuna declarada, contrato × specs ao responsável); `grep` → linha 23 no padrão e no espelho da raiz; "Smoke test dos blocos de agentes" → PASS (exit 0); instalação num repositório temporário → o `docs/openspec-regras.md` traz o parágrafo (1 ocorrência)
- [x] 4.2 Aplicar o D5 ao modelo `padrao-openspec/openspec/project.md` (seção "Precedência dos documentos" depois de "Key Constraints" e linha "Conferência de lacunas" em "Comandos de verificação"). Verificar com `grep` das duas e com o markdownlint.
  - Evidência: modelo de `project.md` com a seção "Precedência dos documentos" (linha 56, entre "Key Constraints" e "Stack Summary") e a linha "Conferência de lacunas" em "Comandos de verificação" (linha 94); "Lint de Markdown" e "Config base carrega sem avisos" → PASS (exit 0)
- [x] 4.3 Atualizar o `README.md` (trechos customizados novos e o `lacunas.mjs` na lista de scripts) conforme o D6. Verificar com o lint da raiz.
  - Evidência: README: trechos "Declared gaps", "ADR verification" e o item `verificacao` na tabela de trechos customizados; `lacunas` na árvore de scripts; e, por decisão do responsável em 2026-10-22 (modelo de versão acumulada), o passo 1 de "Como publicar uma release" descreve a versão que acumula changes; "Lint de Markdown da raiz" e "Guia de primeiros passos" → PASS (exit 0)

## 5. Versão e integração

- [x] 5.1 Atualizar `padrao-openspec/VERSION` e `CHANGELOG.md` com a versão combinada na 1.1, com "O que mudou" e "Ações no projeto" do Migration Plan. Verificar com o passo "Versão e changelog".
  - Evidência: pelo modelo de versão acumulada, `VERSION` continua 1.12.0 e a change acrescentou três itens em "O que mudou" e três ações recomendadas em "Ações no projeto" da seção `## 1.12.0` aberta; "Versão e changelog", "Smoke test do changelog-range" e "Lint de Markdown da raiz" → PASS (exit 0)
- [ ] 5.2 Revisar a [ADR-0007](../../adrs/0007-lacunas-declaradas-e-precedencia-entre-documentos.md) com o responsável e promovê-la a `Accepted` antes do archive, acrescentando-a ao `openspec/adrs/README.md`. Verificar com o `status: Accepted` no frontmatter e a linha no índice.
- [x] 5.3 Rodar `node padrao-openspec/scripts/sync-root.mjs` e `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o markdownlint nos dois lugares e os passos dos jobs `store` e `root` do `validate.yml` localmente, avisando a outra sessão antes. Verificar que todos saem com código 0.
  - Evidência: outra sessão avisada antes e depois; `sync-root.mjs --check` → em dia; `openspec validate --all --strict` → 19 passed na raiz e nada a validar em `padrao-openspec/` (exit 0); `run-ci-steps.py` dos jobs `store` e `root` → 29 PASS, nenhum `ci-*` no registro de stores (exit 0). Depois das correções da revisão, os passos afetados rodaram de novo sem recursos compartilhados: "Smoke test do registro de lacunas", "Trechos customizados", "Lint de Markdown", "Sintaxe dos scripts", "Versão e changelog", "Config base" e os três da raiz → PASS (exit 0)
