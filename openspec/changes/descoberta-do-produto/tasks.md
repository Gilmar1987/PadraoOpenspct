# Tasks

## 1. Preparação e proteção na CI

- [x] 1.1 Depois do merge do PR #43, rebasear a branch na `main` e confirmar com a outra sessão a ordem com a `imposicao-e-catraca`. Acrescentar ao `.github/workflows/validate.yml` os marcadores do D8 (init e bloco do `discover.md`) e o `test -f` do `discover.md` instalado. Verificar rodando o passo "Trechos customizados das skills" localmente: ele deve falhar só nos marcadores novos.
  - Evidência: rebase em `origin/main` 362d8ab (merge do #43) sem conflito; outra sessão (projetoopenspct-b3) confirmou: ela mexe só no Arquivo 6 do init, acrescenta à 1.14.0 e quem arquivar por último rebaseia; marcadores do init, do ingest e do `discover.md` e `test -f` do `discover.md` instalado no `validate.yml`; `run-ci-steps.py validate.yml store . "Trechos customizados"` → FAIL (exit 1) só nos sete marcadores novos

## 2. Comando de descoberta

- [x] 2.1 Criar `padrao-openspec/.claude/commands/opsx/discover.md` conforme o D1, o D2 e o D3: cabeçalho padrão, estado inicial, postura do agente, checklist de ideia concreta, template do `descoberta.md`, encerramento com confirmação, gravação "Em andamento", commit avulso e guardrails. Verificar com `grep -n` dos marcadores do D8 e com o lint de Markdown do arquivo.
  - Evidência: `padrao-openspec/.claude/commands/opsx/discover.md` criado (cabeçalho, Store selection, Project check e Raiz OpenSpec iguais aos do `ingest.md`; Como usar, Estado inicial, Postura do agente com exemplo, Checklist de ideia concreta, modelo do `descoberta.md`, Encerramento com commit avulso e Guardrails); `grep -n` dos três marcadores do D8 → presentes; `markdownlint-cli2@0.23.2` numa cópia fora da lista de exclusão (a pasta `commands/opsx` é ignorada pelo lint do store) → 0 issues (exit 0)
- [x] 2.2 Conferir o `discover.md` contra cada requisito da spec `product-discovery`, de "Abertura" a "não implementa", e anotar na evidência a seção que atende cada um. Verificar que nenhum requisito ficou sem seção.
  - Evidência: Abertura → Estado inicial (linhas do ingest e "nenhum dos anteriores"); Postura crítica → Postura do agente ("Não só concorde", "Opções com justificativa" e exemplo); Uma pergunta por vez → Postura ("Uma pergunta por vez", "Dependências primeiro"); Conhecimento marcado → Postura ("Conhecimento marcado"); Critério de ideia concreta → Checklist de ideia concreta; Encerramento pelo dev → Encerramento, passo 2, e Postura ("Sem aceite implícito", "Sem interrogatório"); Brief com confirmação → modelo do brief, Encerramento, passo 1, e guardrail de dados sensíveis; Retomável → Estado inicial (Em andamento e Concluída) e Encerramento, passo 3; Não implementa → IMPORTANTE, Guardrails e Encerramento, passo 5; nenhum requisito sem seção

## 3. Init e ingest

- [x] 3.1 Aplicar o D4 e o D5 em `padrao-openspec/.claude/commands/opsx/init.md`:
  - seção "Antes da entrevista" com as duas perguntas;
  - uso do `descoberta.md` existente;
  - regra de pular a seção com arquivo de respostas;
  - regra da recomendação em "Regras da entrevista".

  Verificar com `grep -n "Antes da entrevista\|Recomendação:"` e com o lint do arquivo.
  - Evidência: regra "Recomendação a partir do brief" em Regras da entrevista (linha 42), regra de pular a seção com arquivo de respostas (linha 60) e seção "## Antes da entrevista" (linha 64) com as perguntas A e B, o uso do `descoberta.md` Concluída ou Em andamento e a tabela de resultado; `grep -n` → linhas 42-44, 60 e 64; `markdownlint-cli2@0.23.2` numa cópia fora da exclusão → 52 issues, as mesmas 52 da versão da `main` (o arquivo está na lista de exclusão do lint e já tinha esses achados), nenhum nas linhas novas
- [x] 3.2 Aplicar o D7 no `init.md`: linha "Base das recomendações" no Arquivo 1 e item 4 dos próximos passos. Verificar com `grep -n "Base das recomendações"`.
  - Evidência: linha "Base das recomendações" no modelo do `project-setup.md` (Arquivo 1) e item 4 dos próximos passos citando `/opsx:propose` e o `descoberta.md`; `grep -n "Base das recomendações"` → linha 831
- [x] 3.3 Aplicar o D6 em `padrao-openspec/.claude/commands/opsx/ingest.md`. Verificar com `grep -n "/opsx:init"` no arquivo e com o lint.
  - Evidência: parágrafo "Quando o /opsx:init conduz o ingest" depois do IMPORTANTE (Passo 2 sem pergunta de contexto, sem Passo 5, brief devolvido ao init); `grep -n "/opsx:init"` → linha 13; lint numa cópia → 36 issues, iguais aos 36 da `main` (arquivo na lista de exclusão)

## 4. Testes, versão e documentação

- [x] 4.1 Acrescentar `discover` à lista `$cmds` de `padrao-openspec/scripts/test-setup.ps1`. Verificar com `grep -n "'discover'"`.
  - Evidência: `discover` na lista `$cmds` de `test-setup.ps1`; `grep -n "'discover'"` → linha 117
- [x] 4.2 Atualizar `README.md`, `COMECE-AQUI.md` e `padrao-openspec/README.md` conforme o D8, e o `CHANGELOG.md`, com um item na seção aberta (1.14.0). Verificar com os passos "Versão e changelog", "Lint de Markdown da raiz" e "Guia de primeiros passos" passando.
  - Evidência: README com a linha `/opsx:discover` na tabela de comandos, o fluxo `init → [ingest] → [discover] → entrevista → propose` e três linhas na tabela de trechos customizados; COMECE-AQUI com as duas perguntas do init; README do `padrao-openspec` com o comando na árvore e o passo 0 do fluxo; CHANGELOG com o item "Descoberta do produto" na 1.14.0 aberta, sem ação obrigatória; `run-ci-steps.py` → "Versão e changelog", "Lint de Markdown", "Sintaxe dos scripts", "Trechos customizados", "Lint de Markdown da raiz" e "Guia de primeiros passos" PASS (exit 0)
- [x] 4.3 Rodar `sync-root.mjs` e `sync-root.mjs --check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, e todos os passos dos jobs `store` e `root` localmente, depois de avisar a outra sessão. Verificar que todos saem com código 0.
  - Evidência: outra sessão avisada e liberou depois da suíte dela; `sync-root.mjs --check` → em dia; `openspec validate --all --strict` na raiz → 22 passed (exit 0); em `padrao-openspec/` → nada a validar (exit 0); `run-ci-steps.py` do job `store` → 24 PASS e do job `root` → 6 PASS (exit 0); nenhum `ci-*` no registro de stores ao final

## 5. Verificação de comportamento

- [x] 5.1 Roteiro manual numa cópia temporária de store, fora do repositório, registrado na evidência:
  - (a) `/opsx:discover` avulso: confirmar a primeira pergunta, uma pergunta por vez e uma afirmação contraditória do dev ("12 funcionalidades, time de 1 pessoa") contestada com opções e recomendação;
  - (b) interromper e conferir o `descoberta.md` "Em andamento", depois retomar;
  - (c) `/opsx:init` com "não" e "não": a entrevista começa no Bloco 1 sem linha de recomendação;
  - (d) `/opsx:init` com o `descoberta.md` "Concluída": a 1.4 mostra a recomendação com a fonte, e uma pergunta não coberta mostra "o brief não cobre".

  Verificar que os quatro itens se comportam como os cenários das specs.
  - Evidência: roteiro numa cópia temporária do store (scratchpad, fora do repositório), com subagentes seguindo os comandos e eu no papel do dev. (a) primeira mensagem "Qual é a sua ideia de projeto?..."; a afirmação "12 funcionalidades, só eu, 2 meses" foi contestada (conflito de escopo, prazo e time; NF, convênios e prontuário apontados como produtos inteiros), depois vieram três opções com justificativa, desvantagem e recomendação e uma única pergunta; desvio: a segunda mensagem trouxe duas perguntas ligadas por "E", corrigido no `discover.md` (regra "Não junte duas perguntas na mesma mensagem") e sincronizado na raiz. (b) com "preciso parar", o agente ofereceu gravar "Em andamento" e gravou só depois do "sim": `descoberta.md` no modelo, com Decisões e Em aberto, e commit só do arquivo (`7accab5` no store de teste); um agente novo retomou com o resumo do que já estava decidido e perguntou pelo primeiro item em falta, sem refazer perguntas. (c) init com n/n → Bloco 1 a partir da 1.1, sem linha de recomendação. (d) init com `descoberta.md` Concluída → "Encontrei uma descoberta concluída...", pergunta B não feita; 1.1 com "Recomendação: o brief não cobre esta pergunta."; 1.4 com "Recomendação: 1) Pequeno — a descoberta prevê 3 clínicas piloto... (descoberta.md, Restrições > Volume)", opções de sempre e escolha esperada do dev

## Workflow follow-up

- `/opsx:verify` e `/opsx:archive` depois do apply; PR e merge só quando o responsável pedir.
- Avisar a outra sessão no archive, porque quem arquivar por último rebaseia.
