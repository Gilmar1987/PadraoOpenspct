# Tasks

## 1. Preparação e proteção na CI

- [x] 1.1 Depois do merge do PR #45, rebasear a branch na `main`. Acrescentar ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml` os marcadores do D7. Verificar rodando esse passo localmente: ele deve falhar só nos marcadores novos.
  - Evidência: rebase em `origin/main` 045e18c (merge do #45) sem conflito; quatro marcadores do D7 no passo "Trechos customizados das skills"; `run-ci-steps.py validate.yml store . "Trechos customizados"` → FAIL (exit 1) só nos quatro marcadores novos; perguntas numeradas no `init.md` antes da implementação: 48

## 2. Init

- [x] 2.1 Aplicar o D1 e o D2 em `padrao-openspec/.claude/commands/opsx/init.md`:
  - seção "Regras de salto" com a tabela;
  - regra da linha "Puladas" no resumo do bloco;
  - nota da 6.5 apontando para a tabela;
  - Bloco 2 com a 2.2 antes da 2.1 e a frase de ordem.

  Verificar com `grep -n "## Regras de salto\|Puladas"` e conferindo que os números das perguntas não mudaram (`grep -c "^\*\*[1-7]\.[0-9]*"` igual antes e depois).
  - Evidência: seção "## Regras de salto" (linha 52) com a tabela do D1 (inclui a regra existente da 2.6), a linha `Puladas:` no resumo do bloco, pulada sem recomendação e sem ADR; Bloco 2 com a 2.2 (linha 237) antes da 2.1 (linha 250) e a frase de ordem; nota da 6.5 apontando para a tabela; `grep -c "^\*\*[1-7]\.[0-9]*"` → 48 antes e depois
- [x] 2.2 Aplicar o D3 no `init.md`: seção "Filtros de opções" com a tabela e a regra da linha de opções ocultas e do `todas`. Verificar com `grep -n "## Filtros de opções\|digite \"todas\" para ver"`.
  - Evidência: seção "## Filtros de opções" (linha 70) com a tabela do D3 e as regras da linha de ocultas, do `todas`, de pergunta pulada ou "Outro" sem filtro, das opções que nunca somem e da recomendação; `grep -n` → linhas 70 e 84
- [x] 2.3 Aplicar o D4, o D5 e o D6 no `init.md`: parágrafo da coerência na hora, linha de microsserviços na tabela e itens em "Respostas pré-preenchidas". Verificar com `grep -n "assim que a última resposta envolvida\|Microsserviços"` e com o lint de uma cópia do arquivo (sem achados novos em relação à `main`).
  - Evidência: parágrafo "Na hora" na Checagem de coerência (linha 834), linha de microsserviços na tabela (linha 844) e dois itens em "Respostas pré-preenchidas" (linha 102: respostas do arquivo valem, pulada sem resposta recebe o valor da regra; coerência só no fim); `grep -n` → presentes; `markdownlint-cli2@0.23.2` numa cópia → 52 issues, as mesmas 52 da `main` (arquivo na lista de exclusão do lint)

## 3. Documentação e suíte

- [x] 3.1 Atualizar `README.md` e `COMECE-AQUI.md` conforme o D7 e acrescentar o item ao `CHANGELOG.md` na seção 1.15.0. Verificar com os passos "Versão e changelog", "Lint de Markdown da raiz" e "Guia de primeiros passos" passando.
  - Evidência: README com a linha "Regras de salto", "Filtros de opções" e coerência "Na hora" na tabela de trechos customizados; COMECE-AQUI com o parágrafo da entrevista adaptativa; CHANGELOG com o item "Questionário adaptativo" na 1.15.0; `sync-root.mjs` → 1 caminho sincronizado e `--check` em dia; `run-ci-steps.py` → "Lint de Markdown", "Versão e changelog", "Trechos customizados", "Lint de Markdown da raiz" e "Guia de primeiros passos" PASS (exit 0)
- [ ] 3.2 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` e todos os passos dos jobs `store` e `root` localmente, depois de avisar a outra sessão. Verificar que todos saem com código 0.

## 4. Verificação de comportamento

- [ ] 4.1 Roteiro manual numa cópia temporária do store, fora do repositório, com um subagente seguindo o `init.md` e o agente da change no papel do dev, registrado na evidência:
  - (a) 1.5 = "Não" e 2.2 = "Apenas back-end": a 3.2, a 6.5 e a 6.6 não são feitas e aparecem em "Puladas";
  - (b) 2.5 = "Não": a 3.8 não é feita; o dev pede para respondê-la e escolhe uma fila, e a combinação "fila sem jobs" é apontada na hora;
  - (c) 3.1 = Python: a 3.5, a 3.7 e a 5.4 mostram só as opções do ecossistema, com os números originais e a linha de ocultas; `todas` mostra a lista inteira;
  - (d) 1.4 = "Pequeno" e 2.1 = "Microsserviços": a combinação é apontada logo depois da 2.1.

  Verificar que os quatro itens se comportam como os cenários da spec.

## Workflow follow-up

- `/opsx:verify` e `/opsx:archive` depois do apply; PR e merge só quando o responsável pedir.
