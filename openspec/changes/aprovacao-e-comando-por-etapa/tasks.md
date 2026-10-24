# Tasks

## 1. Preparação e testes primeiro

- [ ] 1.1 Esperar o merge da `mensagens-descrevem-a-entrega` (outra sessão) e rebasear a branch na `main`; confirmar com a outra sessão que ela não tem outra change nos mesmos arquivos. Verificar com `git log --oneline HEAD..origin/main` vazio e a resposta citada na evidência.
- [ ] 1.2 Atualizar o passo "Trechos customizados das skills" de `.github/workflows/validate.yml` com os marcadores do D6 e o "Smoke test dos hooks do Claude Code" com a linha nova do hook, citando o requisito "Aprovação e comando em cada etapa" num comentário. Verificar rodando os dois passos antes da implementação: os dois devem falhar só nos pontos novos.

## 2. Regras e bloco gerenciado

- [ ] 2.1 Revisar a [ADR-0009](../../adrs/0009-cada-etapa-disparada-pelo-responsavel.md) com o responsável e promovê-la a `Accepted` antes do archive (com PR, na revisão do PR; sem PR, pela declaração do responsável citada no commit). Verificar com `grep -n "^status: Accepted" openspec/adrs/0009-*.md`.
- [ ] 2.2 Aplicar o D1 em `padrao-openspec/openspec/rules.md` e o D5 em `padrao-openspec/templates/agents-block.md`. Verificar com os marcadores do `rules.md` e do bloco passando e com o "Smoke test dos blocos de agentes" passando.

## 3. Fluxos

- [ ] 3.1 Aplicar o D2 e o D3 em `padrao-openspec/.claude/commands/opsx/propose.md` e em `skills/openspec-propose/SKILL.md`, com o mesmo texto. Verificar com `diff` vazio entre os trechos do comando e da skill e com `grep -c "Prior authorization exception"` igual a 0 nos dois.
- [ ] 3.2 Aplicar o D2 e o D4 em `apply`, `verify`, `archive` e `update` (comandos e skills espelho), com o mesmo texto. Verificar com `diff` vazio entre os trechos e com o "Smoke test das métricas de fluxo" passando.
- [ ] 3.3 Aplicar o D5 em `padrao-openspec/.claude/hooks/openspec-padrao/contexto-de-sessao.mjs`. Verificar com `node --check` e com o "Smoke test dos hooks do Claude Code" passando.

## 4. Documentação e integração

- [ ] 4.1 Atualizar o `README.md` (trechos customizados) e o `CHANGELOG.md` (item na seção 1.15.0 aberta, sem mexer no `VERSION`). Verificar com o lint e com o passo "Versão e changelog" passando.
- [ ] 4.2 Rodar o `sync-root.mjs` e o `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente. Antes, avisar a outra sessão e esperar que ela não esteja rodando a suíte dela. Verificar que todos saem com código 0.
