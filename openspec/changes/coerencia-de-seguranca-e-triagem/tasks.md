# Tasks

## 1. Proteção na CI

- [ ] 1.1 Se a `main` tiver andado desde o planejamento, rebasear a branch nela e, se outra versão tiver saído, usar a próxima minor livre no D4. Depois, acrescentar o marcador "External report triage" (D5) para a skill e o comando de verify no passo "Trechos customizados das skills" de `.github/workflows/validate.yml`. Verificar rodando o passo localmente: deve falhar nos dois arquivos.

## 2. Init

- [ ] 2.1 Aplicar o D1 (opção "0) Sem autenticação no MVP" na 3.6) e o D2 (três combinações novas e a regra de levar a restrição para o `project.md` e a ADR) em `padrao-openspec/.claude/commands/opsx/init.md`. Verificar com `grep -n "Sem autenticação no MVP\|Auditoria de dependências\" é \"Não aplicável\|Varredura de secrets\" é \"Não aplicável\|dados pessoais ou sensíveis, 3.6"` no arquivo, e com `grep -n "dados pessoais ou sensíveis) e 6.5 é 0"` confirmando que a linha de LGPD da tabela continua lá.

## 3. Verify

- [ ] 3.1 Aplicar o D3 em `padrao-openspec/.claude/skills/openspec-verify-change/SKILL.md` e `padrao-openspec/.claude/commands/opsx/verify.md`, com o mesmo texto, inclusive a seção opcional `Triagem:` no formato do registro. Verificar com o passo de trechos customizados passando e com o smoke das métricas de fluxo passando.

## 4. Versão, documentação e integração

- [ ] 4.1 Aplicar o D4 em `padrao-openspec/VERSION` e `CHANGELOG.md`. Verificar com o passo "Versão e changelog" passando localmente.
- [ ] 4.2 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e todos os passos do job `store` localmente. Verificar que todos saem com código 0.
