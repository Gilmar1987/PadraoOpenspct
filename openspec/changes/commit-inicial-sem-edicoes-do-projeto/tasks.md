# Tasks

## 1. Preparação e testes primeiro

- [ ] 1.1 Confirmar a versão com a outra sessão: esta change acrescenta itens à 1.16.0, se a change dela no propose entrar antes, ou a abre. Rebasear a branch na `main` se ela tiver andado. Verificar com `git log --oneline HEAD..origin/main` vazio e a versão citada na evidência.
- [ ] 1.2 Acrescentar ao "Smoke test do script de entrada" de `.github/workflows/validate.yml` o cenário do D4, citando o requisito "Edições do projeto fora do commit inicial" e o cenário "CLAUDE.md com edição do dev" num comentário. Verificar rodando o passo antes da implementação, depois de combinar com a outra sessão que a suíte dela não está rodando: ele deve falhar só no cenário novo.

## 2. Script de entrada

- [ ] 2.1 Aplicar o D1, o D2 e o D3 em `padrao-openspec/scripts/comecar.mjs` (conjunto dos caminhos com edições antes do setup, divisão da lista do commit, mensagem final e linha do plano). Verificar com `node --check`, com o "Smoke test do script de entrada" passando (cenário novo e os anteriores, inclusive "Pasta de gerador com um commit" com a árvore limpa) e com o "Sintaxe dos scripts" passando.

## 3. Documentação e integração

- [ ] 3.1 Atualizar o `CHANGELOG.md` (item na seção 1.16.0; se esta change abrir a versão, também o `padrao-openspec/VERSION`). Verificar com o lint e com o passo "Versão e changelog" passando.
- [ ] 3.2 Rodar o `sync-root.mjs` e o `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente, com tempo limite por passo. Antes, avisar a outra sessão e esperar que ela não esteja rodando a suíte dela. Verificar que todos saem com código 0.
