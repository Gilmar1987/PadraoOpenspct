# Tasks

## 1. Preparação e testes primeiro

- [ ] 1.1 Confirmar com a outra sessão (`adocao-inspecao-e-confirmacao`) a versão, que é um item na 1.19.0 sem mexer no `VERSION`, e os trechos em comum: `init.md`, "Trechos customizados das skills", `COMECE-AQUI.md` e `CHANGELOG.md`. Rebasear sobre a `main` se ela tiver andado. Verificar com `git log --oneline HEAD..origin/main` vazio e com o combinado citado na evidência.
- [ ] 1.2 Escrever no passo "Trechos customizados das skills" do `.github/workflows/validate.yml` o bloco da D4, logo depois do bloco da guarda da pasta da sessão, citando num comentário os requisitos "Guarda do clone do store em qualquer agente", "Regras param no clone do store" e "Guarda do clone do store protegida pela CI". Verificar rodando o passo a partir de um arquivo, em `padrao-openspec/`, antes do texto: ele deve falhar só nos 19 casos novos (17 arquivos sem `**Store clone guard**`, além do `rules.md` e do bloco de agentes), com o código de saída e a contagem na evidência.

## 2. Guarda, regras e documentação

- [ ] 2.1 Acrescentar o parágrafo da D2 antes do `**Session folder guard**` nos 10 comandos e nas 7 skills de `padrao-openspec/.claude/`, sem mudar o resto do topo, e rodar o `sync-root.mjs`. Verificar com `grep -c "**Store clone guard**"` dando 1 em cada um dos 17 arquivos, com `node padrao-openspec/scripts/sync-root.mjs --check` em dia e com o passo "Trechos customizados das skills" passando nos 17 casos.
- [ ] 2.2 Acrescentar o item da D3 ao `padrao-openspec/openspec/rules.md` e ao `padrao-openspec/templates/agents-block.md`, e rodar o `sync-root.mjs`. Verificar com o passo "Trechos customizados das skills" passando inteiro (exit 0), com o "Smoke test dos blocos de agentes" passando e com o lint nos dois lugares.
- [ ] 2.3 Atualizar o parágrafo "Outros agentes" do `COMECE-AQUI.md` (os fluxos param no clone do store em qualquer agente) e o `CHANGELOG.md`, com o item "Guarda do clone do store em qualquer agente" na seção 1.19.0 e "Ações no projeto" pedindo o `--update`. Verificar com o lint, o "Guia de primeiros passos", "Versão e changelog" e o "Smoke test do changelog-range" passando.

## 3. Verificação real e integração

- [ ] 3.1 Roteiro no Claude Code com `claude -p`, sem registrar store:
  - **clone de teste:** uma cópia dos arquivos rastreados desta branch numa pasta fora do repositório, com `padrao-openspec/.openspec-store/store.yaml` (`id: clone-teste`). `claude -p "/opsx:propose teste"` deve parar citando o clone do store `clone-teste`, sem criar `openspec/changes/teste`;
  - **pasta do código:** uma pasta de teste com o padrão instalado desta branch. `claude -p "/opsx:explore qual o estado do projeto"` deve seguir sem citar clone do store.

  Registrar a versão do Claude Code, os comandos e o resultado na evidência.
- [ ] 3.2 Roteiro no Copilot do VS Code, feito pelo responsável no clone de teste da 3.1, aberto como workspace: pedir "siga as instruções de `.claude/commands/opsx/init.md`". O agente deve parar sem gravar e pedir a pasta do código com `store: clone-teste`. Registrar a versão do Copilot e o resultado, lidos do log da sessão. Verificar com o registro citado na evidência.
- [ ] 3.3 Rodar `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares, o `sync-root.mjs --check` e os passos dos jobs `store` e `root` localmente, um arquivo por passo, com tempo limite. Antes, avisar a outra sessão e esperar que ela não esteja usando o registro de stores. Verificar com todos saindo com código 0 e nenhum `ci-*` no registro.

## Workflow follow-up

- Revisão de código do intervalo da change (passo 6a do apply), `/opsx:verify` e `/opsx:archive`, cada um com a aprovação e o comando do responsável.
- Push, PR, merge e release só com pedido explícito do responsável.
