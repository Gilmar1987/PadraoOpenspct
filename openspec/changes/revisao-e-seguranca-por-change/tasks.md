# Tasks

## 1. Proteção na CI

- [x] 1.1 Acrescentar os marcadores do D6 ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml`. Verificar rodando o passo localmente: ele deve falhar citando os três marcadores ausentes.
  - Evidência: `[FAIL (1)] Trechos customizados das skills`; ausentes "Code review record", "Request code review" e "Security checks", 2 arquivos cada (exit 1, esperado).

## 2. Skills e comandos

- [x] 2.1 Aplicar o D1 e o D2 em `padrao-openspec/.claude/skills/openspec-apply-change/SKILL.md` e `padrao-openspec/.claude/commands/opsx/apply.md`, com o mesmo texto. Verificar com `grep -c "Security checks\|Request code review"` igual nos dois arquivos.
  - Evidência: o grep conta 2 nos dois arquivos ("Security checks" no passo 6 e o passo 6a "Request code review").
- [x] 2.2 Aplicar o D3 em `padrao-openspec/.claude/skills/openspec-verify-change/SKILL.md` e `padrao-openspec/.claude/commands/opsx/verify.md`. Verificar com o passo de trechos customizados passando.
  - Evidência: `[PASS] Trechos customizados das skills` (exit 0), com "Code review record" na skill e no comando de verify.

## 3. Store neutro, init e regras

- [x] 3.1 Aplicar o D4 em `padrao-openspec/openspec/project.md` e `padrao-openspec/.claude/commands/opsx/init.md`. Verificar com o smoke "Smoke test do setup de projeto" passando e com `grep -n "Auditoria de dependências\|Varredura de secrets"` nos dois arquivos.
  - Evidência: `[PASS] Smoke test do setup de projeto` (exit 0). Critério adaptado: no `init.md` as finalidades aparecem em minúsculas na lista do bloco 7.1, então o grep foi feito com `-i` (2 linhas); no `project.md`, linhas 79 e 80.
- [x] 3.2 Aplicar o D5 em `padrao-openspec/openspec/config.yaml` e `openspec/rules.md`. Verificar com o passo "Config base carrega sem avisos" passando.
  - Evidência: `[PASS] Config base carrega sem avisos` (exit 0); a pergunta "Adiciona ou atualiza dependências?" entrou na regra de riscos, e o `rules.md` seção 5 ganhou o item da varredura de secrets.

## 4. Documentação e integração

- [x] 4.1 Aplicar o D6 no `README.md`. Verificar com o lint da raiz sem issues.
- [x] 4.2 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e os passos do job `store` localmente. Verificar que todos saem com código 0.
  - Evidência: passos do `validate.yml` no Git Bash: `[PASS]` nos 12 do job `store` e nos 3 do job `root` (sync `--check`, validate e lint da raiz, que cobre a 4.1), exit 0. Registro `ci-store` removido com `openspec store unregister ci-store`.
