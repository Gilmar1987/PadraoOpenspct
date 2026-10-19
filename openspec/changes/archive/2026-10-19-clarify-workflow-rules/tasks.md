# Tasks

## 1. Verify e archive

- [x] 1.1 Acrescentar ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml` os marcadores "Evidence reuse" (verify, comando e skill) e "Update the project overview" (archive, comando e skill). Verificar rodando o passo localmente: ele deve falhar, citando os quatro trechos ausentes.
- [x] 1.2 Acrescentar a heurística do D4 a `padrao-openspec/.claude/commands/opsx/verify.md` e `padrao-openspec/.claude/skills/openspec-verify-change/SKILL.md`. Verificar comparando os trechos com `diff`.
- [x] 1.3 Acrescentar o bloco do D5 a `padrao-openspec/.claude/commands/opsx/archive.md` e `padrao-openspec/.claude/skills/openspec-archive-change/SKILL.md`. Verificar comparando os trechos com `diff` e o passo da 1.1 passando.

## 2. Regras e ADRs

- [x] 2.1 Atualizar as seções 3 (D1) e 4 (D2) de `openspec/rules.md`. Verificar com `grep -n "opcional"` na seção 3, com cinco linhas de papel na tabela da seção 4 e com o lint da raiz sem issues.
- [x] 2.2 Atualizar o item de aprovação de `padrao-openspec/openspec/adrs/README.md` (D3). Verificar com `grep -n "sem pull request"` e com o lint de `padrao-openspec/` sem issues.

## 3. Documentação, espelhamento e integração

- [x] 3.1 Atualizar o `README.md` da raiz (D6). Verificar com o lint da raiz sem issues.
- [x] 3.2 Rodar `node padrao-openspec/scripts/sync-root.mjs` e verificar que `--check` sai com código 0.
- [x] 3.3 Rodar `openspec validate --all --strict`, o lint nos dois lugares e o passo de trechos customizados. Verificar que todos saem com código 0.
