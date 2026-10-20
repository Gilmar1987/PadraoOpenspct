# Tasks

## 1. Versão e changelog

- [x] 1.1 Acrescentar a `.github/workflows/validate.yml` o passo "Versão e changelog" e o smoke do `changelog-range.mjs` (D9), e o `node --check scripts/changelog-range.mjs` ao passo de sintaxe. Verificar rodando os passos localmente: devem falhar (arquivos ainda inexistentes).
  - Evidência: `run-ci-steps.py` → `[FAIL (1)]` em "Sintaxe dos scripts" e "Smoke test do changelog-range" (`changelog-range.mjs` inexistente) e em "Versão e changelog" (`VERSION` inexistente), exit 1, esperado.
- [x] 1.2 Criar `padrao-openspec/VERSION` e `CHANGELOG.md` (D1) e `padrao-openspec/scripts/changelog-range.mjs` (D2). Verificar com os passos da 1.1 passando localmente.
  - Evidência: `run-ci-steps.py` → `[PASS]` em "Sintaxe dos scripts", "Versão e changelog" e "Smoke test do changelog-range" (exit 0); `changelog-range.mjs --from 0.0.0 --to 1.0.0 --actions` lista as 4 ações da 1.0.0.

## 2. Instalador

- [x] 2.1 Acrescentar ao "Smoke test do instalador" de `.github/workflows/validate.yml` os casos do D9 (manifesto, reinstalação sem mudança, recusa sem modo, `--update` limpo e com pendência). Verificar rodando o passo localmente contra o instalador atual: deve falhar.
  - Evidência: `[FAIL (1)] Smoke test do instalador` contra o instalador atual (sem workflow, guia nem manifesto), exit 1, esperado.
- [x] 2.2 Criar os modelos `padrao-openspec/templates/openspec-padrao-update.yml` (D5) e `padrao-openspec/templates/openspec-padrao.md` (D6). Verificar o YAML com `python -c "import yaml; yaml.safe_load(open(...))"` e o guia com o lint de Markdown de `padrao-openspec/`.
  - Evidência: `yaml.safe_load` → YAML_OK; `markdownlint-cli2 "**/*.md"` em `padrao-openspec/` → 0 issues em 14 arquivos. Ajuste além do design: os valores de `steps.*.outputs` passam por `env:` em vez de interpolação no `run:`, para evitar injeção de script a partir do manifesto.
- [x] 2.3 Implementar em `padrao-openspec/scripts/install-skills.mjs` o manifesto (D3), os modos `--update` e `--in-place` (D4) e a entrega do workflow e do guia. Verificar com `node --check` e com o "Smoke test do instalador" passando localmente.
  - Evidência: `node --check` ok; `[PASS] Smoke test do instalador` (exit 0), com manifesto, reinstalação sem mudança, recusa sem modo, `--update` com pendência e `--update` limpo. Decisão de implementação: `--force` continua aceito, mas não substitui o modo; reinstalar com mudanças sempre exige `--update` ou `--in-place`.
- [x] 2.4 Atualizar a mensagem final de `padrao-openspec/scripts/setup-project.mjs` (D8) e o `padrao-openspec/scripts/test-setup.ps1` com checks do manifesto, do workflow e do guia. Verificar com os smokes de setup passando localmente e o parser do PowerShell sem erros.
  - Evidência: `node --check` ok; `[PASS]` em "Smoke test do setup de projeto", "do setup em subpasta", "do remote do padrão" e "da declaração do store" (exit 0); `Parser::ParseFile` do `test-setup.ps1` → 0 erros. Registro `ci-store` removido depois.

## 3. Aviso nos comandos

- [x] 3.1 Acrescentar o marcador "Standard version check" ao passo de trechos customizados de `.github/workflows/validate.yml`. Verificar rodando o passo: deve falhar nos oito arquivos.
  - Evidência: `[FAIL (1)] Trechos customizados das skills` com "Standard version check" ausente nos 8 arquivos (exit 1, esperado).
- [x] 3.2 Aplicar o D7 em `padrao-openspec/.claude/commands/opsx/{propose,apply,verify,archive}.md` e nas skills `openspec-propose`, `openspec-apply-change`, `openspec-verify-change` e `openspec-archive-change`. Verificar com o passo de trechos customizados passando.
  - Evidência: bloco inserido depois do "Project check" nos 4 comandos e nas 4 skills; `[PASS] Trechos customizados das skills` (exit 0).

## 4. Documentação, ADR e integração

- [x] 4.1 Aplicar o D8 em `README.md` e `padrao-openspec/README.md`. Verificar com o lint dos dois lugares sem issues.
  - Evidência: `markdownlint-cli2 "**/*.md"` → 0 issues na raiz e em `padrao-openspec/`. Além do D8, a migração do README da raiz troca `install-skills.mjs ... --force` por `--update`, e o `padrao-openspec/README.md` deixa de dizer que `--force` atualiza os arquivos.
- [ ] 4.2 Revisar `openspec/adrs/0004-distribuicao-versionada-do-padrao.md` contra a implementação e promovê-la a `Accepted` com a aprovação explícita do responsável, citada no commit. Verificar com `grep -n "status:"` no arquivo.
- [x] 4.3 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e todos os passos do job `store` localmente. Verificar que todos saem com código 0.
  - Evidência: `sync-root.mjs` → 8 caminhos e `--check` em dia; passos do `validate.yml` no Git Bash → `[PASS]` nos 14 do job `store` (inclui "Versão e changelog" e "Smoke test do changelog-range") e nos 3 do job `root`; `openspec validate --all --strict` em `padrao-openspec/` → nada a validar (exit 0). Varredura de secrets: não verificado (o `project.md` deste repositório não registra o comando).
