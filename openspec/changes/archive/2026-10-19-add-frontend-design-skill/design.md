# Design

## Context

- Em `install-skills.mjs`, cada stack tem um único texto `officialSkills`, exibido ao final da instalação quando há `--stack`.
- A `nextjs-implementation` já cita as skills da Vercel na seção "Relationship with other skills", mas não diz nada sobre design visual nem sobre onde registrar decisões de interface.
- A `frontend-design` trabalha em duas passadas: primeiro um plano de tokens (paleta, tipografia, layout, princípios) revisado contra o briefing, depois o código. Ela pede para confirmar o rumo com o cliente.

## Architecture Decisions

Não há ADR nova. A mudança segue a [ADR-0001](../../../adrs/0001-padrao-openspec-fonte-unica.md): a skill externa não é copiada para a fonte única, e a única skill alterada (`nextjs-implementation`) é editada em `padrao-openspec/` e espelhada pelo sync.

## Goals / Non-Goals

**Goals:**

- Recomendar a `frontend-design` no momento em que o dev já está instalando as skills oficiais da stack.
- Trazer as decisões visuais para o artefato que o fluxo revisa (`design.md`).

**Non-Goals:**

- Validar se a skill externa está instalada no consumidor.

## Decisions

### D1. `officialSkills` vira uma lista

Cada stack passa a ter uma lista de recomendações, e o instalador imprime uma linha por item. A `nextjs` ganha a `frontend-design` como segundo item.

- Alternativa descartada: concatenar a recomendação no texto existente. Isso produz uma linha longa e difícil de testar com `grep`.

### D2. Plano de design registrado no `design.md`

Na seção "2. Planning" da `nextjs-implementation`, o item **Design** ganha uma orientação: quando a change cria ou redesenha interface, o `design.md` registra o plano visual (paleta com valores hex, tipografia e papéis, conceito de layout, princípios), produzido com a `frontend-design` quando disponível. Na seção "Relationship with other skills", a skill passa a citar a `frontend-design` com o comando de instalação e a regra de mencioná-la uma vez sem instalar, como já é feito com as skills da Vercel.

O rumo visual é decisão de produto. Por isso, a confirmação com o cliente que a `frontend-design` pede acontece na revisão dos artefatos, antes do `/opsx:apply`, e não durante a implementação.

### D3. Sem subagente novo

O Code Implementer usa a skill nas tarefas de UI, e o Spec Architect pode usá-la ao rascunhar o design. Nenhum dos dois muda de limite.

## Risks / Trade-offs

- **[O repositório externo muda de caminho ou nome da skill]** → o comando fica em um só lugar no instalador e nos READMEs. O smoke test confere só a presença da recomendação, não o acesso à rede.
- **[A skill incentiva "risco estético", que pode conflitar com um design system já adotado]** → a `nextjs-implementation` manda seguir primeiro as escolhas de UI que o projeto já tem, como no item 5 da descoberta; o plano visual vale para o que o projeto ainda não decidiu.
