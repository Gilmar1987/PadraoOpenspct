---
id: ADR-0009
status: Accepted
date: 2026-10-23
supersedes:
superseded_by:
related_changes: [aprovacao-e-comando-por-etapa]
verificacao: []
imposicao: norma
---

# ADR-0009: Cada etapa do fluxo é disparada pelo responsável

## Contexto

O fluxo do padrão tem etapas com comando: propose, apply, verify, archive e update. Até aqui, uma aprovação com `Escopo: archive` autorizava o agente a seguir por apply, verify e archive sem nova confirmação. O propose também tinha uma exceção que deixava o agente começar o apply no mesmo turno quando o pedido autorizava ir até o archive.

Em 2026-10-23, o agente começou o apply de três changes só com a aprovação escrita, sem o `/opsx:apply`. Ele seguiu os passos de memória, e alguns ficaram de fora: a checagem de versão e a confirmação do progresso por grupo. O responsável decidiu que cada etapa deve ser disparada por ele e que todo dev que usa o padrão deve ter o mesmo comportamento.

## Decisão

- Cada etapa com comando SHALL começar só quando o responsável:
  1. escrever a aprovação daquela etapa, no formato sugerido "Eu aprovo fazer <descrição>";
  2. digitar o comando `/opsx:<etapa>`.
- Antes, o agente SHALL descrever em uma linha o que a etapa vai fazer e propor o texto da aprovação.
- Ao fim de cada etapa, o agente SHALL parar e mostrar o que a próxima etapa vai fazer, a aprovação sugerida e o comando a digitar.
- O `Escopo` da aprovação SHALL ser o limite do que a change pode alcançar (`apply` ou `archive`). Ele MUST NOT autorizar o agente a encadear etapas.
- Ações sem comando (push, PR, merge, release) SHALL continuar exigindo um pedido explícito ou uma condição registrada na aprovação.

## Alternativas consideradas

| Alternativa | Por que não foi escolhida |
|---|---|
| Manter o `Escopo: archive` encadeando as etapas | Foi o que permitiu ao agente implementar sem carregar o fluxo do comando |
| Exigir só o comando | O comando sozinho não registra o que o responsável aprovou para aquela etapa |
| Exigir só a aprovação escrita | Sem o comando, o fluxo não é carregado, e o agente segue de memória |
| Tornar a regra opcional por projeto | O responsável quer o mesmo comportamento para todo dev que usa o padrão |

## Consequências

- O responsável controla o avanço de cada etapa, e cada uma roda com o fluxo completo do comando.
- Cada etapa pede duas ações do dev, o que dá mais interação.
- Aprovações antigas com `Escopo: archive` continuam válidas, como limite.
- O portão de apply e de archive não muda.

## Limite

- **Garante:** a CI do padrão confere que os trechos desta decisão estão no `rules.md`, nos comandos, nas skills e no bloco gerenciado. É uma conferência de texto.
- **Fica sob palavra:** que o agente espere a aprovação e o comando antes de cada etapa e pare ao fim dela. Nenhum mecanismo do padrão distingue um comando digitado pelo dev de outro jeito de começar a etapa.
