## 1. Preparação e proteção na CI

- [ ] 1.1 Rebasear a branch na `main` se ela tiver andado, combinar com a outra sessão a versão (próxima minor livre) e conferir a interface real do portão da `guardas-mecanicas` (`docs/openspec-portao.mjs`): caminho, argumentos e códigos de saída. Se a interface mudou, atualizar o D3 do design antes de seguir. Verificar com `git log --oneline HEAD..origin/main` vazio e a interface citada na evidência.
- [ ] 1.2 Acrescentar ao `validate.yml` (job `store`) o passo "Paridade de papéis" do D6 e o marcador da skill `requesting-code-review` que cita o `openspec-code-reviewer`. Verificar rodando os dois localmente antes da implementação: os dois devem falhar.

## 2. Subagentes e hooks de papel

- [ ] 2.1 Criar os oito subagentes de `padrao-openspec/.claude/agents/` conforme o D1 (frontmatter `name`, `description`, `tools`, `model` e `hooks` quando houver; corpo adaptado do agente do Copilot ou novo para `stage-reviewer` e `code-reviewer`). Verificar com o passo "Paridade de papéis" passando e com o grep de `tools:` mostrando que nenhum papel de veredito tem `Edit` ou `Write`.
- [ ] 2.2 Criar `somente-leitura.mjs` e `escopo-de-escrita.mjs` em `padrao-openspec/.claude/hooks/openspec-padrao/` conforme o D2, com o limite declarado no cabeçalho. Verificar com `node --check` e com o smoke test do D7 para os dois hooks, no Git Bash e no PowerShell.
- [ ] 2.3 Fazer a skill `requesting-code-review` despachar o `openspec-code-reviewer` quando `.claude/agents/openspec-code-reviewer.md` existir, mantendo o `general-purpose` como alternativa. Verificar com o marcador da tarefa 1.2 passando.

## 3. Hooks de sessão e permissões

- [ ] 3.1 Criar `cobra-evidencia.mjs` e `portao-do-archive.mjs` conforme o D3, e o template `padrao-openspec/templates/claude-settings.json` com os hooks do D3 e as permissões do D4. Verificar com o smoke test do D7 para os dois hooks, usando um store de teste com id único por execução e removendo-o no fim.
- [ ] 3.2 No `install-skills.mjs`: copiar `.claude/agents/` e `.claude/hooks/openspec-padrao/` como operações gerenciadas, parar diante de `openspec-*.md` não gerenciado, mesclar o `settings.json` conforme o D5 e gravar `managedSettings` no manifesto. Verificar com o smoke test do instalador do D7 (settings do projeto preservado, reinstalação sem mudanças, JSON inválido, `openspec-*.md` alheio) e com os smoke tests de instalador e setup que já existem passando.

## 4. Documentação, ADR, versão e integração

- [ ] 4.1 Documentar em `padrao-openspec/templates/openspec-padrao.md`, no `COMECE-AQUI.md` e no `README.md`: os papéis, os hooks, como desligar uma entrada, a confiança de pasta, o limite de melhor esforço e o roteiro manual de verificação no Claude Code. Verificar com o lint e com o passo "Guia de primeiros passos" passando.
- [ ] 4.2 Atualizar `padrao-openspec/VERSION` e `CHANGELOG.md` com a versão combinada na 1.1 e as ações no projeto (revisar o diff do `settings.json` e confiar na pasta). Verificar com o passo "Versão e changelog" passando.
- [ ] 4.3 Revisar a [ADR-0006](../../adrs/0006-camada-do-claude-code-por-entradas-gerenciadas.md) com o responsável e promovê-la a `Accepted` antes do archive, acrescentando-a ao `openspec/adrs/README.md`. Verificar com o `status: Accepted` no frontmatter e a linha no índice.
- [ ] 4.4 Rodar o `sync-root.mjs` e o `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente. Antes, avisar a outra sessão e esperar que ela não esteja rodando a suíte dela. Verificar que todos saem com código 0.
- [ ] 4.5 Rodar o roteiro manual num repositório de teste aberto no Claude Code:
  - o `openspec-qa-validator` não consegue gravar arquivo;
  - o `Stop` bloqueia uma tarefa marcada sem evidência;
  - `openspec archive` pede confirmação, ou passa pelo portão.

  Registrar quem executou e o resultado. Verificar com a evidência do roteiro; o que não puder ser executado fica como não verificado, com o motivo.
