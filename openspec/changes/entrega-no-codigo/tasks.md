# Tasks

## 1. Preparação e testes primeiro

- [ ] 1.1 Rebasear a branch na `main` depois do merge da `descoberta-do-produto`, se ela entrar antes, e combinar a versão com a outra sessão: esta change acrescenta itens à 1.15.0, ou a abre se entrar antes. Verificar com `git log --oneline HEAD..origin/main` vazio e a versão citada na evidência.
- [ ] 1.2 Estender o "Smoke test do instalador" de `.github/workflows/validate.yml` com os cenários de "Quebra de linha no repositório de código" (arquivo criado com `* text=auto eol=lf`, um único bloco depois da segunda instalação e um `.gitattributes` próprio intacto), citando o requisito num comentário, e acrescentar ao passo "Trechos customizados das skills" os marcadores do D5. Verificar rodando os dois passos antes da implementação: os dois devem falhar só nos pontos novos.

## 2. Instalador

- [ ] 2.1 Implementar o D1 em `padrao-openspec/scripts/install-skills.mjs` (`ensureConsumerGitattributes`, com os casos ausente, com bloco, sem bloco, marcadores inválidos e arquivo não regular, gravação atômica, fora do manifesto). Verificar com o "Smoke test do instalador" passando, com `node --check` e com os smoke tests do setup, do setup em subpasta e do script de entrada passando.

## 3. Skills e explore

- [ ] 3.1 Aplicar o D2 em `padrao-openspec/.claude/skills/docker/SKILL.md` e `docker-guidelines.md` (regra das portas em `127.0.0.1` em "Princípios" e no checklist, exemplo de compose e, no guia, as seções "docker-compose" e ".env.example"). Verificar com `grep -n "127.0.0.1"` nos dois arquivos e com o marcador passando.
- [ ] 3.2 Aplicar o D3 em `padrao-openspec/.claude/commands/opsx/explore.md` e `skills/openspec-explore/SKILL.md` ("Number the alternatives", com o mesmo texto). Verificar com `diff` vazio entre os dois itens e com o marcador passando.

## 4. Documentação, versão e integração

- [ ] 4.1 Aplicar o D4 no `README.md` ("Desempenho e ambiente") e atualizar o `CHANGELOG.md` (itens na 1.15.0, ou a seção aberta, com a ação recomendada) e o `padrao-openspec/VERSION`, se esta change abrir a versão. Verificar com o lint e com o passo "Versão e changelog" passando.
- [ ] 4.2 Rodar o `sync-root.mjs` e o `--check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente. Antes, avisar a outra sessão e esperar que ela não esteja rodando a suíte dela. Verificar que todos saem com código 0.
