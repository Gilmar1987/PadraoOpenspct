# Tasks

## 1. Versão e changelog

- [ ] 1.1 Acrescentar a `.github/workflows/validate.yml` o passo "Versão e changelog" e o smoke do `changelog-range.mjs` (D9), e o `node --check scripts/changelog-range.mjs` ao passo de sintaxe. Verificar rodando os passos localmente: devem falhar (arquivos ainda inexistentes).
- [ ] 1.2 Criar `padrao-openspec/VERSION` e `CHANGELOG.md` (D1) e `padrao-openspec/scripts/changelog-range.mjs` (D2). Verificar com os passos da 1.1 passando localmente.

## 2. Instalador

- [ ] 2.1 Acrescentar ao "Smoke test do instalador" de `.github/workflows/validate.yml` os casos do D9 (manifesto, reinstalação sem mudança, recusa sem modo, `--update` limpo e com pendência). Verificar rodando o passo localmente contra o instalador atual: deve falhar.
- [ ] 2.2 Criar os modelos `padrao-openspec/templates/openspec-padrao-update.yml` (D5) e `padrao-openspec/templates/openspec-padrao.md` (D6). Verificar o YAML com `python -c "import yaml; yaml.safe_load(open(...))"` e o guia com o lint de Markdown de `padrao-openspec/`.
- [ ] 2.3 Implementar em `padrao-openspec/scripts/install-skills.mjs` o manifesto (D3), os modos `--update` e `--in-place` (D4) e a entrega do workflow e do guia. Verificar com `node --check` e com o "Smoke test do instalador" passando localmente.
- [ ] 2.4 Atualizar a mensagem final de `padrao-openspec/scripts/setup-project.mjs` (D8) e o `padrao-openspec/scripts/test-setup.ps1` com checks do manifesto, do workflow e do guia. Verificar com os smokes de setup passando localmente e o parser do PowerShell sem erros.

## 3. Aviso nos comandos

- [ ] 3.1 Acrescentar o marcador "Standard version check" ao passo de trechos customizados de `.github/workflows/validate.yml`. Verificar rodando o passo: deve falhar nos oito arquivos.
- [ ] 3.2 Aplicar o D7 em `padrao-openspec/.claude/commands/opsx/{propose,apply,verify,archive}.md` e nas skills `openspec-propose`, `openspec-apply-change`, `openspec-verify-change` e `openspec-archive-change`. Verificar com o passo de trechos customizados passando.

## 4. Documentação, ADR e integração

- [ ] 4.1 Aplicar o D8 em `README.md` e `padrao-openspec/README.md`. Verificar com o lint dos dois lugares sem issues.
- [ ] 4.2 Revisar `openspec/adrs/0004-distribuicao-versionada-do-padrao.md` contra a implementação e promovê-la a `Accepted` com a aprovação explícita do responsável, citada no commit. Verificar com `grep -n "status:"` no arquivo.
- [ ] 4.3 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e todos os passos do job `store` localmente. Verificar que todos saem com código 0.
