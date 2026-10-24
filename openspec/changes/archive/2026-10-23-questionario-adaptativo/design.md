# Design

## Context

- A entrevista do `init.md` tem dois mecanismos adaptativos isolados, escritos dentro das próprias perguntas:
  - a 6.5 é pulada com a 1.5 em "Não" (nota em itálico na pergunta);
  - a 3.8 ajusta os exemplos à linguagem e ao banco (nota para o agente).

  O resto é linear.
- As "Regras da entrevista" fixam uma pergunta por vez, cinco opções mais "Outro", confirmação por bloco e, desde a `descoberta-do-produto`, a linha de recomendação a partir do brief.
- A "Checagem de coerência" é uma tabela de combinações avaliada só antes da confirmação final, com "Ajustar ou manter?".
- O arquivo de respostas usa números de pergunta e de opção. O teste E2E do padrão depende dele, e a checagem de coerência roda no fim também nesse modo.
- As ADRs obrigatórias não são geradas para respostas "Não aplicável" (requisito "ADRs para respostas negativas").

## Architecture Decisions

Não há ADR nova: é uma mudança de comportamento do comando de init. A change segue a [ADR-0003](../../adrs/0003-padrao-sem-stack-embutida.md): os filtros só escondem opções incompatíveis com a stack que o dev escolheu, e nenhuma stack ganha preferência.

## Goals / Non-Goals

**Goals:**

- Nenhuma pergunta sem sentido para o projeto, e nenhuma opção incompatível com a stack, sem perder a possibilidade de responder ou ver tudo.
- Incoerências apontadas quando o dev ainda está com a decisão na cabeça.
- Arquivos de respostas existentes continuam produzindo os mesmos artefatos.

**Non-Goals:**

- Uma "árvore" de perguntas condicionais complexa. As regras são tabelas simples, uma resposta para um efeito.
- Reescrever perguntas ou opções.

## Decisions

### D1. Regras de salto como tabela única

Seção nova "Regras de salto" depois das "Regras da entrevista", com a tabela:

| Quando | Pula | Registra |
|---|---|---|
| 2.2 = 4 (Apenas front-end) | 2.1 e 3.1 | Não aplicável (sem back-end próprio) |
| 2.2 = 3 (Apenas back-end) | 3.2 | 0) Não há front-end próprio |
| 2.5 = 1 (Não) | 3.8 | 0) Não aplicável |
| 1.5 = 4 (Não) | 6.5 e 6.6 | Não aplicável (6.5: 0; 6.6: 4) |
| 2.6 = 0 | Teste de contrato na 7.1 | Não aplicável (regra que já existe, citada aqui) |

A nota da 6.5 passa a apontar para a tabela, sem duplicar a regra.

O resumo do bloco ganha a linha "Puladas: 3.8 (porque a 2.5 é Não)". Antes do "Confirma este bloco?", o agente diz que qualquer pulada pode ser respondida. Uma pulada respondida vale como resposta normal.

Alternativa descartada: notas espalhadas em cada pergunta, como a da 6.5 hoje. Ficam difíceis de revisar e de conferir na CI.

### D2. Ordem do Bloco 2

O bloco começa pela 2.2 e segue 2.1, 2.3, 2.4, 2.5 e 2.6. O texto da 2.2 e da 2.1 é movido sem mudar os números, e uma frase no topo do bloco explica a ordem. O resumo do bloco e a tabela do `project-setup.md` seguem a ordem numérica, como hoje.

Alternativa descartada: pular a 2.1 retroativamente quando a 2.2 vier depois. O dev já teria respondido uma pergunta inútil.

### D3. Filtros de opções como tabela, com números estáveis

Seção "Filtros de opções", com a tabela:

| Pergunta | Depende de | Mostra |
|---|---|---|
| 3.2 | 3.1 ≠ 2 (.NET) | esconde 4 (Blazor) |
| 3.5 | 3.1 | 1 → 0, 1, 6; 2 → 0, 2, 6; 3 → 0, 3, 4, 6; 4 → 0, 5, 6; 5 → 0, 6; 6 → todas |
| 3.6 | nem 3.1 = 1 nem 3.2 = 1 | esconde 4 (Auth.js / NextAuth) |
| 3.7 | 3.1 e 3.2 | 1 → 1, 5, 6; 2 → 2, 5, 6; 3 → 3, 5, 6; 4 → 4, 5, 6; 5 → 5, 6; 6 → todas; com a 3.2 em 1 ou 2 (front-end em JS/TS), mantém também a 1 |
| 4.5 | 4.1 ≠ 1 (Vercel/Netlify) | esconde 3 (Vercel Edge Network) |
| 5.4 | 3.1 e 3.2 | 1 → 1, 6; 2 → 3, 6; 3 → 2, 6; 4 → 4, 6; 5 → 5, 6; 6 → todas; com a 3.2 em 1 ou 2 (front-end em JS/TS), mantém também a 1 |
| 5.5 | 3.2 = 0 | 0, 5, 6 |

- O filtro usa o valor registrado da pergunta da qual depende, inclusive o valor que uma regra de salto registrou (a 3.2 pulada com "0" filtra a 3.6 e a 5.5). Com "Não aplicável" ou "Outro", não filtra nada.
- Se o brief sustentar uma opção oculta, a pergunta mostra a lista inteira e recomenda a opção, dizendo que ela não combina com a resposta que a ocultaria.
- A pergunta mostra as opções com os números originais e, abaixo delas, a linha `(N opções ocultas porque a 3.1 é Python; digite "todas" para ver)`.
- `todas` mostra a lista completa, e qualquer número dela vale.
- Uma opção oculta nunca recebe a linha de recomendação.
- As opções "0", "Ainda não sei" e "Outro" nunca são ocultadas.

Alternativa descartada: renumerar as opções visíveis (1, 2, 3...). Quebraria o arquivo de respostas e a referência das regras de coerência aos números.

### D4. Coerência na hora

Na "Checagem de coerência", um parágrafo novo diz que cada combinação é avaliada assim que a última resposta envolvida existe, inclusive depois de uma pulada respondida. O procedimento é o mesmo: mostrar, perguntar "Ajustar ou manter?" e registrar.

- A checagem final lista todas as combinações encontradas. Pergunta só as que ainda não foram decididas e mostra as decididas como "Ajustada" ou "Mantida".
- Uma resposta ajustada que desfaz a combinação a tira da lista.
- Com arquivo de respostas, tudo fica para o fim, como hoje.
- "Ajustar" pode voltar a um bloco já confirmado: refaz só essa pergunta, reavalia os saltos e filtros que dependem dela e retoma de onde parou.

### D5. Combinação nova

Linha na tabela de coerência:

| Combinação | Consequência | Proposta |
|---|---|---|
| 2.1 é "Microsserviços" e 1.4 é "Pequeno" ou "Ainda não sei" | Vários serviços para implantar, monitorar e versionar, sem volume que justifique | Monólito modular, com módulos que possam virar serviços depois |
| 2.1 é "Microsserviços" e 5.9 é "Uma pessoa" | Vários serviços para implantar, monitorar e versionar, sem time que justifique | Monólito modular, com módulos que possam virar serviços depois |

A 1.4 vem antes da 2.1, então a combinação costuma aparecer logo depois da 2.1. Com a 5.9, aparece no Bloco 5.

### D6. Arquivo de respostas

Itens novos em "Respostas pré-preenchidas":

- as respostas do arquivo valem mesmo para perguntas puladas e opções ocultas;
- uma pergunta sem resposta e coberta por uma regra de salto recebe o valor da regra;
- a coerência roda no fim.

O resumo único mostra as puladas também.

### D7. CI e documentação

- **Marcadores no passo "Trechos customizados das skills":** `## Regras de salto`, `## Filtros de opções`, `digite "todas" para ver` e `assim que a última resposta envolvida`.
- **README:** uma linha na tabela de trechos customizados.
- **COMECE-AQUI:** uma frase: a entrevista pula o que não se aplica e mostra só as opções que combinam com a stack.
- **CHANGELOG:** item na 1.15.0, sem ação obrigatória.

## Risks / Trade-offs

- [Uma regra de salto ou de filtro errada esconde uma escolha legítima] → A pulada aparece no resumo com o motivo e pode ser respondida; `todas` mostra a lista inteira; "Outro" nunca some.
- [O agente esquece de aplicar a tabela] → Tabelas no topo do comando, perto das regras da entrevista; roteiro manual na tarefa 4.1 com uma entrevista Python/sem jobs/sem front-end.
- [Mudança de ordem no Bloco 2 confunde quem conhece o init] → A numeração não muda, e uma frase no topo do bloco explica a ordem.
- [Conflito com a `descoberta-do-produto` no `init.md`] → Esta branch parte dela. Rebase na `main` depois do merge do #45.

## Migration Plan

Nenhuma migração. Projetos já inicializados não rodam o init de novo, e o arquivo de respostas continua compatível.
