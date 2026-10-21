# Tasks

## 1. Testes do script na CI

- [x] 1.1 Acrescentar ao job `store` de `.github/workflows/validate.yml` o `node --check scripts/comecar.mjs` e o passo "Smoke test do script de entrada" do D10, e ao passo "Guia de primeiros passos" as checagens do D10. Verificar rodando os passos localmente no Git Bash: devem falhar (o script e os guias novos ainda não existem).
  - Evidência: passos rodados no Git Bash com um executor local do `validate.yml` → `[FAIL (1)] Sintaxe dos scripts` (`Cannot find module ...comecar.mjs`), `[FAIL (1)] Smoke test do script de entrada` e `[FAIL (1)] Guia de primeiros passos` (exit 1, esperado).

## 2. Script de entrada

- [x] 2.1 Criar `padrao-openspec/scripts/comecar.mjs` com a conversa, as opções, a conferência do ambiente e a pasta base (D2, D3, D4, D7, D8) e o modo projeto novo (D5). Verificar com a parte "modo novo" e as recusas do smoke test da 1.1 passando no Git Bash, e com uma execução interativa real no Windows numa pasta temporária, respondendo às perguntas como no exemplo do guia.
  - Evidência: no Git Bash, `[PASS] Sintaxe dos scripts` e `[PASS] Smoke test do script de entrada` (modo novo e recusas; exit 0). Não houve como abrir um console interativo real nesta sessão; a conversa foi rodada com TTY simulado (stdin e stdout marcados como terminal, respostas por pipe), num padrão local com tags v1.2.0 e v1.3.0: respostas `1`, pasta `projetos` inexistente → "Criar? [S/n]", nome `Livraria Online`, id sugerido `[livraria-online]`, Enter no gerador e na confirmação → store em `v1.3.0` na branch `main`, `store: livraria-online` no código, mensagem final com `/opsx:init`. A saída do setup passou a ser mostrada só em caso de falha, porque repetia um segundo "Pronto".
- [x] 2.2 Acrescentar o modo projeto em andamento (D6). Verificar com o smoke test da 1.1 passando inteiro no Git Bash e com uma execução real no Windows contra os repositórios bare do teste, conferindo `openspec context --json` no código clonado.
  - Evidência: `[PASS] Smoke test do script de entrada` inteiro (modo existente, código sem `store:` recusado sem registrar). Com TTY simulado: modo `2`, pasta relativa `dev2`, as URLs dos repositórios bare → "✔ O CLI encontra o store a partir do código"; `openspec context --json` no código clonado → `root.path` = `dev2\livraria-online-openspec\padrao-openspec`, `source: declared` (exit 0). Id já registrado → para com o `openspec store unregister livraria-online` a rodar e lista a pasta criada.
- [x] 2.3 Rodar o script com Git ausente do `PATH` e com um id inválido. Verificar que o primeiro para sem criar pastas e que o segundo repete a pergunta (interativo) ou falha citando `--id` (sem TTY).
  - Evidência: `PATH` só com o Node → "Erro: Git não encontrado. Instale o Git ..." (exit 1) e a pasta `semgit` não foi criada; `--id "Meu Id"` sem TTY → "Erro: Id inválido: \"Meu Id\" ... (--id)" (exit 1); com TTY simulado, "Meu Id" → `Id inválido` e a pergunta repete, `meu-id` aceito. Extra: pasta com espaço dentro de `OneDrive` → aviso de pasta sincronizada e projeto criado (exit 0).

## 3. Guias

- [x] 3.1 Reescrever o `COMECE-AQUI.md` conforme o D9, com os exemplos de conversa copiados da saída real das execuções da 2.1 e da 2.2. Verificar com o lint da raiz sem issues e com as checagens do guia da 1.1 sobre o `COMECE-AQUI.md` passando.
  - Evidência: `markdownlint-cli2@0.23.2 COMECE-AQUI.md` → 0 issues; checagens do guia sobre o `COMECE-AQUI.md` (`setup-project.mjs`, `/opsx:init`, `git clone --branch v`, `-openspec switch -c main`, `releases/latest/download/comecar.mjs` e a ausência de clone da `main`) → todas ok. Os exemplos de conversa vêm da saída real das execuções da 2.1 e da 2.2, com as pastas trocadas por `C:\openspec` e as URLs locais por URLs de exemplo.
- [x] 3.2 Aplicar o D9 em `README.md` (topo, parágrafo do repositório já configurado e "Como publicar uma release") e em `padrao-openspec/README.md`. Verificar com o lint nos dois lugares sem issues e com `grep` mostrando que o README não tem mais `<caminho-do-store>`.
  - Evidência: `markdownlint-cli2@0.23.2` → 0 issues em `README.md` e `COMECE-AQUI.md` (raiz) e em `padrao-openspec/README.md`; `grep -c '<caminho-do-store>' README.md` → 0. O topo do README mostra os comandos do script, o parágrafo do repositório já configurado indica `--modo existente` e o registro de `<pasta-do-store>\padrao-openspec`, e o `gh release create` anexa `padrao-openspec/scripts/comecar.mjs`.
- [x] 3.3 Aplicar o D9 em `padrao-openspec/templates/openspec-padrao.md`. Verificar com o passo "Guia de primeiros passos" passando inteiro e com os smoke tests do instalador e do setup passando.
  - Evidência: lint do template → 0 issues; `[PASS] Guia de primeiros passos` (todas as checagens, inclusive as novas); `[PASS]` nos smoke tests do instalador, do setup, do setup em subpasta, do remote do padrão e da declaração do store (exit 0). Registro `ci-store` deixado pelo smoke da declaração removido.

## 4. Versão e integração

- [ ] 4.1 Aplicar o D11 em `padrao-openspec/VERSION` e `CHANGELOG.md`. Verificar com o passo "Versão e changelog" e o smoke test do script (que usa a tag `v<VERSION>`) passando.
- [ ] 4.2 Rodar `sync-root.mjs --check`, `openspec validate --all --strict` na raiz, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente. Verificar que todos saem com código 0.

## Workflow follow-up

- Depois do archive e do merge, publicar a release `v1.3.0` com o `comecar.mjs` anexado (README, "Como publicar uma release") e conferir que o link `releases/latest/download/comecar.mjs` baixa o arquivo. Publicar é só com pedido explícito.
