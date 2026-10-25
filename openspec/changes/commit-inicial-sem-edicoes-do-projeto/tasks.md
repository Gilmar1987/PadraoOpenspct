# Tasks

## 1. Preparação e testes primeiro

- [x] 1.1 Confirmar a versão com a outra sessão: esta change acrescenta itens à 1.16.0, se a change dela no propose entrar antes, ou a abre. Rebasear a branch na `main` se ela tiver andado. Verificar com `git log --oneline HEAD..origin/main` vazio e a versão citada na evidência.
  - Evidência: branch sobre `origin/main` 4710c02 (v1.15.0); `git log --oneline HEAD..origin/main` → vazio; a outra sessão (projetoopenspct-57) confirmou que a change dela no propose não toca o `comecar.mjs` e abre a 1.16.0 (VERSION e seção) se entrar antes; versão: esta change acrescenta itens à 1.16.0 aberta por ela, ou a abre se entrar antes (decidido no rebase da tarefa 3.1)
- [x] 1.2 Acrescentar ao "Smoke test do script de entrada" de `.github/workflows/validate.yml` o cenário do D4, citando o requisito "Edições do projeto fora do commit inicial" e o cenário "CLAUDE.md com edição do dev" num comentário. Verificar rodando o passo antes da implementação, depois de combinar com a outra sessão que a suíte dela não está rodando: ele deve falhar só no cenário novo.
  - Evidência: cenário "CLAUDE.md com edição do dev" no "Smoke test do script de entrada" (pasta de gerador com um commit e um `CLAUDE.md` com `linha do dev` sem commit; confere que o `CLAUDE.md` não está no commit inicial, que o `AGENTS.md` está, que a linha continua no `git diff` e que a saída lista o arquivo e o comando), com o requisito e o cenário citados no comentário e o id `ci-edicao-$sfx` no `trap`; antes da implementação: o passo → FAIL (exit 1), e o mesmo cenário à mão mostra o `CLAUDE.md` com `+linha do dev` dentro do commit inicial (a falha esperada); nenhum `ci-*` no registro; a outra sessão liberou o registro antes

## 2. Script de entrada

- [ ] 2.1 Aplicar o D1, o D2 e o D3 em `padrao-openspec/scripts/comecar.mjs` (conjunto dos caminhos com edições antes do setup, divisão da lista do commit, mensagem final e linha do plano). Verificar com `node --check`, com o "Smoke test do script de entrada" passando (cenário novo e os anteriores, inclusive "Pasta de gerador com um commit" com a árvore limpa) e com o "Sintaxe dos scripts" passando.

## 3. Documentação e integração

- [ ] 3.1 Atualizar o `CHANGELOG.md` (item na seção 1.16.0; se esta change abrir a versão, também o `padrao-openspec/VERSION`). Verificar com o lint e com o passo "Versão e changelog" passando.
- [ ] 3.2 Rodar o `sync-root.mjs` e o `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente, com tempo limite por passo. Antes, avisar a outra sessão e esperar que ela não esteja rodando a suíte dela. Verificar que todos saem com código 0.
