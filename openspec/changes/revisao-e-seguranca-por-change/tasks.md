# Tasks

## 1. Proteção na CI

- [ ] 1.1 Acrescentar os marcadores do D6 ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml`. Verificar rodando o passo localmente: ele deve falhar citando os três marcadores ausentes.

## 2. Skills e comandos

- [ ] 2.1 Aplicar o D1 e o D2 em `padrao-openspec/.claude/skills/openspec-apply-change/SKILL.md` e `padrao-openspec/.claude/commands/opsx/apply.md`, com o mesmo texto. Verificar com `grep -c "Security checks\|Request code review"` igual nos dois arquivos.
- [ ] 2.2 Aplicar o D3 em `padrao-openspec/.claude/skills/openspec-verify-change/SKILL.md` e `padrao-openspec/.claude/commands/opsx/verify.md`. Verificar com o passo de trechos customizados passando.

## 3. Store neutro, init e regras

- [ ] 3.1 Aplicar o D4 em `padrao-openspec/openspec/project.md` e `padrao-openspec/.claude/commands/opsx/init.md`. Verificar com o smoke "Smoke test do setup de projeto" passando e com `grep -n "Auditoria de dependências\|Varredura de secrets"` nos dois arquivos.
- [ ] 3.2 Aplicar o D5 em `padrao-openspec/openspec/config.yaml` e `openspec/rules.md`. Verificar com o passo "Config base carrega sem avisos" passando.

## 4. Documentação e integração

- [ ] 4.1 Aplicar o D6 no `README.md`. Verificar com o lint da raiz sem issues.
- [ ] 4.2 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e os passos do job `store` localmente. Verificar que todos saem com código 0.
