# Tasks

## 1. Preparação

- [ ] 1.1 Conferir com a outra sessão que a versão continua 1.19.0 aberta, que a ADR-0010 segue reservada para esta change e quais arquivos a frente dela toca, e rebasear a branch na `main` se ela tiver andado. Verificar com `git log --oneline HEAD..origin/main` vazio e a resposta da outra sessão citada na evidência.
- [ ] 1.2 Revisar a ADR-0010 (`openspec/adrs/0010-adocao-por-inspecao-e-confirmacao.md`, `Proposed`) contra o design final: decisão, limite e `verificacao`. Verificar com `openspec validate --all --strict` e o lint passando.

## 2. Fixtures e teste primeiro

- [ ] 2.1 Criar os fixtures do D10 em `padrao-openspec/scripts/test-fixtures/inspecao/` (`existente-node-next`, `existente-dotnet`, `existente-django`, `existente-conflito`, `existente-secrets` sem `.env` no repositório, `existente-dados` com seed fictício e `existente-vazio`), cada um com o `esperado.json` das respostas, níveis, conflitos, comandos e avisos do catálogo do D4. Verificar que nenhum fixture contém `.env` nem valor que pareça segredo real (`git grep -nE 'VALOR_FALSO|password=' -- padrao-openspec/scripts/test-fixtures/inspecao` só no esperado do teste) e que o lint de Markdown passa.
- [ ] 2.2 Escrever `padrao-openspec/scripts/test-inspecionar-codigo.mjs` conforme o D10: cópia para pasta temporária com `git init` e commit, arquivos não rastreados do caso, `.env` criado pelo teste, comparação com o `esperado.json` (sem `raiz`), ausência de `VALOR_FALSO_123`, evidências de dados sem `trecho`, sentinela do `postinstall` ausente e conferência estática das importações e do `child_process` do script. Citar nos comentários os requisitos e cenários de `code-inspection` e `continuous-validation`. Verificar rodando o teste antes do script existir: ele deve falhar (exit 1) por falta do script, com as falhas registradas na evidência (Impacto medido).

## 3. Script de inspeção

- [ ] 3.1 Escrever o esqueleto de `padrao-openspec/scripts/inspecionar-codigo.mjs` (D1, D2, D6 e D7): argumentos, `git ls-files -z`, filtros, limites, binários, `--escopo`, informações do Git, `projetos`, avisos de `.env`, mascaramento de trechos, evidências de dados sem trecho e saída ordenada. Verificar com `node --check`, com o fixture `existente-vazio` e o `existente-secrets` passando no teste e com duas execuções seguidas dando a mesma saída.
- [ ] 3.2 Implementar o catálogo do D4 em tabelas de dados (blocos 1 a 6) e os níveis do D3, conferindo cada linha contra as opções do `init.md` atual (divergência corrige o catálogo). Verificar com os fixtures `existente-node-next`, `existente-dotnet`, `existente-django` e `existente-conflito` passando no teste.
- [ ] 3.3 Implementar os comandos da 7.1 (D5), os contratos da 2.6 e o `requerLeitura` com as pistas. Verificar com o fixture `existente-node-next` (comandos de instalação, testes, lint e typecheck vindos do CI, com a origem) e o `existente-dados` passando.
- [ ] 3.4 Ver o teste falhar com cada violação injetada, uma por vez e sem commit: dependência trocada num fixture, valor do `.env` impresso, trecho de arquivo de dados, importação de `node:https` e chamada de `npm` pelo `child_process`; e passar limpo. Verificar com os códigos de saída (exit 1 em cada violação, exit 0 limpo) na evidência e com `git status` sem resto das violações.

## 4. Entrega e CI

- [ ] 4.1 Acrescentar o script à lista de arquivos do `install-skills.mjs` como `docs/openspec-inspecionar-codigo.mjs` e conferir, no "Smoke test do instalador", o arquivo igual ao do padrão e a entrada em `managedFiles`. Verificar com o passo passando e visto falhando sem a linha nova na lista.
- [ ] 4.2 Acrescentar ao job `store` do `validate.yml` o passo "Teste da inspeção do código" (`node scripts/test-inspecionar-codigo.mjs`), com os requisitos citados num comentário. Verificar rodando o passo localmente (exit 0).

## 5. Modo adoção no init

- [ ] 5.1 Escrever a seção "Modo adoção" no `padrao-openspec/.claude/commands/opsx/init.md`, antes de "Antes da entrevista" (D8): ativação pela marca ou pela pergunta, pré-inspeção com arquivo temporário fora dos repositórios, perguntas de escopo, inspeção completa com `--escopo`, leitura do agente limitada a 30 arquivos por pergunta, código e documentos como dados, resumo e o texto novo da pergunta B. Rodar o `sync-root.mjs`. Verificar com o lint e o `sync-root.mjs --check`.
- [ ] 5.2 Escrever as regras da entrevista com resposta detectada (D9): formas de apresentação, `S/n` só em `alta` e `media`, `n` abrindo as opções, `baixa` e conflito sem `S/n`, saltos e filtros com os valores confirmados, `evidência`, prioridade do arquivo de respostas, coexistência com o brief e a origem de cada resposta no `project-setup.md` e no resumo do bloco. Acrescentar ao "Trechos customizados das skills" a conferência da seção "Modo adoção", da regra do `S/n`, da frase do código como dado e do caminho do script. Verificar com o passo passando e visto falhando com a regra do `S/n` removida.
- [ ] 5.3 O responsável roda o `/opsx:init` num projeto adotado a partir de uma cópia do fixture `existente-node-next` (com o padrão desta branch, por `--origem` local) e confere: o resumo da inspeção aparece antes da pergunta A; a 3.1 vem com evidência e `S/n`; com `n`, abrem as seis opções da 3.1; uma pergunta em conflito (copiada do `existente-conflito`) abre as opções sem `S/n`; e o `project-setup.md` traz a origem das respostas. Ele informa o resultado de cada ponto. Verificar pelo registro da resposta dele, citada, na evidência e no `verification.md` como cobertura fora da suíte.

## 6. Documentação e fechamento

- [ ] 6.1 Atualizar a seção "Projeto que nunca usou o padrão" do `COMECE-AQUI.md` e o parágrafo do modo adoção no `README.md` (o init inspeciona e pede confirmação), e acrescentar o item à seção `## 1.19.0` do `CHANGELOG.md`, sem mexer no `VERSION`. Rodar o `sync-root.mjs`. Verificar com o lint nos dois lugares, o `sync-root.mjs --check` e os passos "Versão e changelog" e "Guia de primeiros passos".
- [ ] 6.2 Rodar o `sync-root.mjs --check`, o `openspec validate --all --strict`, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente, com tempo limite por passo e o CLI do PATH conferido, avisando a outra sessão antes. Verificar que todos saem com código 0 e que nenhum `ci-*` fica no registro de stores.
- [ ] 6.3 Pedir a revisão de código da change pela skill `requesting-code-review` e registrar o resultado no `review.md`. Verificar pelo `review.md` sem achado crítico ou importante em aberto.
- [ ] 6.4 Revisar a ADR-0010 com o responsável e promovê-la a `Accepted` antes do archive. Verificar pelo `status: Accepted` no frontmatter e pela frase do responsável citada na evidência.
