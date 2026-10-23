---
id: ADR-0007
status: Accepted
date: 2026-10-22
supersedes:
superseded_by:
related_changes: [lacunas-e-adrs-verificaveis]
---

# ADR-0007: Lacunas declaradas com hash da fonte e precedência entre documentos

## Contexto

Um projeto quase nunca cumpre de uma vez tudo o que a sua referência pede (um modelo de dados, um contrato, uma ADR, um documento do cliente). Sem um registro, a diferença entre o que a referência pede e o que o código faz fica implícita, e o verify não consegue separar o que é atraso conhecido do que é regressão. Quando os documentos divergem entre si, também não há uma regra que diga qual vale.

Os projetos de referência (motor-calculo e marelli-sem-kit) resolvem isso de duas formas:

- **Lacunas congeladas:** cada lacuna é declarada com motivo e com o hash da fonte. Um gate falha nas duas direções: lacuna nova sem declaração, ou lacuna declarada que já fechou. Se o hash mudar, a declaração inteira tem de ser relida.
- **Ordem de precedência:** contrato → arquitetura → ADRs → código.

## Decisão

- Cada store SHALL poder manter um registro de lacunas em `openspec/lacunas.md`, em Markdown, com estas colunas, nesta ordem:
  - ID;
  - fonte;
  - SHA-256 da fonte;
  - item não cumprido;
  - motivo;
  - data;
  - encaminhamento.

  O motivo e a data MUST estar preenchidos.
- Se o hash de uma fonte mudar, a declaração SHALL ser relida inteira contra a versão nova. Atualizar só o hash MUST NOT ser aceito como correção.
- O verify SHALL cobrar o registro nas duas direções: lacuna nova não declarada, e lacuna declarada que já fechou.
- A precedência entre documentos SHALL ser: contrato de interface → specs principais → arquitetura → ADRs → código.
  - O código converge para os documentos, salvo lacuna declarada.
  - Uma divergência entre o contrato e as specs vai ao responsável.
  - Outras divergências são reportadas, e o trabalho segue o documento de maior precedência.
  - O `project.md` de cada projeto pode ajustar a ordem.
- Uma ADR SHALL poder citar, no campo `verificacao`, o teste ou o comando que a confere.

## Alternativas consideradas

| Alternativa | Por que não foi escolhida |
|---|---|
| Registro em JSON, como nos projetos de referência | O store é lido por pessoas e agentes, e os outros artefatos dele são Markdown |
| Registro no repositório de código | O planejamento fica no store (regra 2 do `rules.md`) |
| Data de modificação em vez de hash | Muda com o checkout e não diz se o conteúdo mudou |
| Ordem sem as specs (contrato → arquitetura → ADRs → código) | No OpenSpec, as specs principais são o contrato de comportamento; a ordem com as specs foi confirmada pelo responsável em 2026-10-22 |
| Exigir `verificacao` em toda ADR | Decisões de hospedagem ou de processo não se conferem por código |

## Consequências

- O atraso conhecido fica visível e datado, e o verify passa a distinguir atraso de regressão.
- Toda mudança numa fonte com lacuna obriga a reler a declaração, e esse custo é intencional.
- Os agentes recebem uma regra para escolher entre documentos divergentes, pelo `rules.md` e pelos blocos da ADR-0005.
- O registro precisa de manutenção a cada etapa. O verify cobra a lacuna fechada que ficou no registro.
