---
id: ADR-0008
status: Accepted
date: 2026-10-23
supersedes:
superseded_by:
related_changes: [imposicao-e-catraca]
verificacao: []
imposicao: norma
---

# ADR-0008: Imposição declarada das decisões e catraca de falhas aceitas

## Contexto

A [ADR-0007](0007-lacunas-declaradas-e-precedencia-entre-documentos.md) permitiu que uma ADR cite, em `verificacao`, o teste que a confere. Ela não diz o quanto a decisão é imposta nem o que o teste deixa de fora. Uma ADR com um teste que nunca reprovou parece mais forte do que é: o teste pode conferir vocabulário, e não o efeito.

Falhas conhecidas também não têm lugar. Uma falha aceita vira crítico a cada verify, e o registro deixa de ser lido, ou some sem registro. A lista "Fora do ciclo atual" tem a coluna "Sai quando", mas nada confere se a condição já se cumpriu.

O kit-esquadro, analisado a pedido do responsável, trata isso com a forma de imposição, o critério "visto reprovando", o impacto medido por comando e uma catraca de falhas que só encolhe.

## Decisão

- Uma ADR SHALL poder declarar `imposicao`:
  - `controle`: a verificação roda e a falha bloqueia;
  - `consultivo`: a verificação roda e a falha é registrada, sem bloquear;
  - `externo`: a regra mora na configuração de uma ferramenta do projeto;
  - `norma`: sob palavra.

  A ADR SHALL poder ter também a seção "Limite", com o que o mecanismo garante e o que fica sob palavra. Sem o campo, a ADR SHALL contar como `controle` se tiver `verificacao`, e como `norma` se não tiver.
- Uma verificação de ADR SHALL contar só depois de vista reprovando: uma execução com a violação injetada, que falha, e uma no caso limpo, que passa. Uma ADR MUST NOT ser promovida a `controle` sem essa prova.
- O custo de endurecer uma decisão sobre código existente SHALL ser medido por comando, e não estimado. Cada violação SHALL receber um destino.
- O `estado-atual.md` SHALL poder manter "Falhas aceitas", uma catraca que só encolhe:
  - uma linha só entra por um proposal aprovado;
  - falha fora da lista é regressão;
  - uma linha cuja falha sumiu tem de sair.
- O "Sai quando" das listas de débitos e de falhas aceitas SHALL ser um fato conferível, e o verify SHALL cobrar a condição já cumprida.

## Alternativas consideradas

| Alternativa | Por que não foi escolhida |
|---|---|
| Script que compara a saída dos comandos com a catraca | Cada ferramenta escreve as falhas num formato diferente; um parser por ferramenta embutiria stack no padrão ([ADR-0003](0003-padrao-sem-stack-embutida.md)) |
| Toda ADR com verificação nasce `controle` | Um verificador que nasce bloqueante e erra tende a ser desligado no primeiro incidente; `consultivo` permite medir antes de promover |
| Aceitar falhas no `lacunas.md` | Lacuna é divergência entre o código e uma fonte de referência; falha aceita é o resultado de um comando, com identificador exato e saída conferida a cada verify |

## Consequências

- O registro do verify passa a dizer a diferença entre o que está garantido e o que está afirmado.
- Escrever uma verificação de ADR custa uma tarefa a mais: a prova de reprovação.
- A catraca depende do verify, que lê a saída dos comandos. A CI do projeto não a aplica sozinha.
- ADRs antigas continuam válidas, sem migração.

## Limite

- **Garante:** a CI do padrão confere que os trechos desta decisão estão nos comandos, nas skills e nos modelos. É uma conferência de texto.
- **Fica sob palavra:** que o agente aplique a severidade pela imposição, cobre a prova de reprovação e compare as falhas com a catraca no verify. Nenhum mecanismo do padrão executa essas regras; a `verification.md` de cada change é o registro.
