# Tasks

## 1. Testes do script na CI

- [ ] 1.1 Acrescentar ao job `store` de `.github/workflows/validate.yml` o `node --check scripts/comecar.mjs` e o passo "Smoke test do script de entrada" do D10, e ao passo "Guia de primeiros passos" as checagens do D10. Verificar rodando os passos localmente no Git Bash: devem falhar (o script e os guias novos ainda não existem).

## 2. Script de entrada

- [ ] 2.1 Criar `padrao-openspec/scripts/comecar.mjs` com a conversa, as opções, a conferência do ambiente e a pasta base (D2, D3, D4, D7, D8) e o modo projeto novo (D5). Verificar com a parte "modo novo" e as recusas do smoke test da 1.1 passando no Git Bash, e com uma execução interativa real no Windows numa pasta temporária, respondendo às perguntas como no exemplo do guia.
- [ ] 2.2 Acrescentar o modo projeto em andamento (D6). Verificar com o smoke test da 1.1 passando inteiro no Git Bash e com uma execução real no Windows contra os repositórios bare do teste, conferindo `openspec context --json` no código clonado.
- [ ] 2.3 Rodar o script com Git ausente do `PATH` e com um id inválido. Verificar que o primeiro para sem criar pastas e que o segundo repete a pergunta (interativo) ou falha citando `--id` (sem TTY).

## 3. Guias

- [ ] 3.1 Reescrever o `COMECE-AQUI.md` conforme o D9, com os exemplos de conversa copiados da saída real das execuções da 2.1 e da 2.2. Verificar com o lint da raiz sem issues e com as checagens do guia da 1.1 sobre o `COMECE-AQUI.md` passando.
- [ ] 3.2 Aplicar o D9 em `README.md` (topo, parágrafo do repositório já configurado e "Como publicar uma release") e em `padrao-openspec/README.md`. Verificar com o lint nos dois lugares sem issues e com `grep` mostrando que o README não tem mais `<caminho-do-store>`.
- [ ] 3.3 Aplicar o D9 em `padrao-openspec/templates/openspec-padrao.md`. Verificar com o passo "Guia de primeiros passos" passando inteiro e com os smoke tests do instalador e do setup passando.

## 4. Versão e integração

- [ ] 4.1 Aplicar o D11 em `padrao-openspec/VERSION` e `CHANGELOG.md`. Verificar com o passo "Versão e changelog" e o smoke test do script (que usa a tag `v<VERSION>`) passando.
- [ ] 4.2 Rodar `sync-root.mjs --check`, `openspec validate --all --strict` na raiz, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente. Verificar que todos saem com código 0.

## Workflow follow-up

- Depois do archive e do merge, publicar a release `v1.3.0` com o `comecar.mjs` anexado (README, "Como publicar uma release") e conferir que o link `releases/latest/download/comecar.mjs` baixa o arquivo. Publicar é só com pedido explícito.
