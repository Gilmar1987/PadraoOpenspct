---
id: ADR-0002
status: Proposed
date: 2026-10-17
supersedes:
superseded_by:
related_changes: [add-flow-metrics]
---

# ADR-0002: Trailer `OpenSpec-Change` liga commits de código às changes

## Contexto

O padrão separa o store OpenSpec, onde ficam o planejamento e as specs, do repositório de código. Sem um vínculo explícito, não há como saber qual commit de código implementou qual change, nem medir o retrabalho de uma entrega. A change `add-flow-metrics` precisa desse vínculo para a métrica de retrabalho, e auditorias e revisões também se beneficiam dele. O hábito de escrever `OpenSpec change: <nome>` no corpo dos commits já existe, mas em formato livre, que o Git não interpreta.

## Decisão

- Todo commit de código feito durante o `/opsx:apply` de uma change MUST conter o trailer git `OpenSpec-Change: <nome-da-change>`.
- Correções de comportamento entregue por uma change já arquivada MUST usar o tipo `fix` e o trailer com o nome dessa change.
- Ferramentas do padrão SHALL ler o vínculo com `git log --format=%(trailers:key=OpenSpec-Change,valueonly)`, nunca por texto livre.

## Alternativas consideradas

| Alternativa | Por que não foi escolhida |
|---|---|
| Texto livre no corpo ("OpenSpec change: X") | O Git não interpreta; a extração por regex é frágil. |
| Nome da branch contendo a change | Branches são apagadas depois do merge e não sobrevivem a squash. |
| Arquivo de mapeamento commit → change no store | Exige manutenção manual e diverge do histórico real. |

## Consequências

- O histórico do código fica rastreável até o planejamento, e o retrabalho por change passa a ser mensurável.
- O agente e as pessoas precisam lembrar do trailer. A skill de apply pede isso, mas commits manuais fora do fluxo podem ficar sem trailer, e as métricas os ignoram.
- Commits anteriores à adoção não têm trailer; o retrabalho só é medido a partir dela.
