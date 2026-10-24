# Design

## Context

- **`rules.md`, seção 2:** diz que o "Escopo `archive` autoriza seguir por apply, verify e archive sem nova confirmação enquanto todas as condições forem atendidas".
- **Propose:** tem a "Prior authorization exception". Com uma autorização até o archive no pedido, o agente registra a aprovação e pode começar o apply no mesmo turno. Os guardrails repetem a exceção.
- **Apply, passo 4a:** "If `Escopo` is `archive` [...] verify and archive may run without a new confirmation only while every condition holds".
- **Fim dos fluxos:**
  - o propose termina com "When you are ready, run `/opsx:apply`";
  - o apply, com "You can archive this change with `/opsx:archive`";
  - o update sugere `/opsx:apply` ou `/opsx:archive`;
  - o verify e o archive não indicam o próximo passo.
- **Bloco gerenciado (`templates/agents-block.md`):** mostra o fluxo como "`/opsx:propose` → aprovação explícita → `/opsx:apply` → `/opsx:verify` → `/opsx:archive`", com uma aprovação só.
- **Hook `contexto-de-sessao.mjs`:** mostra o estado das changes e o próximo comando, tirado do `portao.mjs estado`.
- **Change concorrente:** a `mensagens-descrevem-a-entrega`, da outra sessão, troca o nome da change por uma descrição da entrega nas mensagens. Ela também indica o próximo passo pelo comando sem o nome. Esta change parte desse formato e acrescenta a aprovação antes do comando.

## Architecture Decisions

- [ADR-0009](../../adrs/0009-cada-etapa-disparada-pelo-responsavel.md) (Proposed), criada por esta change: cada etapa é disparada pelo responsável, com a aprovação escrita e o comando, e o escopo vira limite. Ela tem `imposicao: norma`, e o "Limite" diz que nenhum mecanismo do padrão confere quem digitou o comando.
- Segue a [ADR-0005](../../adrs/0005-regras-entregues-por-blocos-gerenciados.md): a regra chega aos projetos pelo `rules.md`, pelos comandos e pelo bloco gerenciado.
- Não contraria a ADR-0006 (camada do Claude Code) nem a ADR-0007. O portão não muda.
- A ADR-0009 é promovida a `Accepted` na revisão do PR, antes do archive.

## Goals / Non-Goals

**Goals:**

- Nenhuma etapa com comando começa sem a aprovação escrita e o comando do responsável.
- Toda etapa termina parada, com o próximo passo em três partes: o que faz, a aprovação sugerida e o comando.
- O texto da regra é o mesmo em todos os fluxos, para a CI conferir.

**Non-Goals:**

- Uma trava mecânica de quem digitou o comando.
- Mudar o portão, o selo ou o formato da `## Aprovação`.
- Mudar o explore, o init, o ingest e o discover.

## Decisions

### D1. `rules.md`

- **Seção 2:** o item "Escopo `archive` autoriza seguir por apply, verify e archive sem nova confirmação [...]" passa a:
  > O Escopo é o limite do que a change pode alcançar: `apply` permite implementar; `archive` permite também verificar e arquivar enquanto as condições valem. Nenhum escopo autoriza começar uma etapa: cada uma espera a aprovação e o comando (seção 3).
- **Seção 3,** depois do ciclo, um parágrafo novo, "**Aprovação e comando por etapa**". Você MUST:
  - antes de cada etapa com comando (`/opsx:propose`, `/opsx:apply`, `/opsx:verify`, `/opsx:archive`, `/opsx:update`), descrever em uma linha o que ela vai fazer e propor a aprovação "Eu aprovo fazer <descrição>";
  - começar a etapa só depois de o responsável escrever a aprovação e digitar o comando; com só um dos dois, mostrar o que falta e esperar;
  - ao fim de cada etapa, parar e mostrar o próximo passo: o que faz, a aprovação sugerida e o comando;
  - em ações sem comando (push, PR, merge, release), seguir só com um pedido explícito ou uma condição registrada na aprovação.

### D2. Trecho comum "Stop and show the next step"

O mesmo parágrafo, em inglês como o resto dos fluxos, vai no fim do propose, do apply, do verify, do archive e do update, e nas skills espelho:

> **Stop and show the next step**: this workflow runs one stage only. When it ends, stop and show the next stage in three lines: what it will do (one line), the suggested approval (`Eu aprovo fazer <description>`), and the command to type (`/opsx:<stage>`). Never start the next stage yourself, even when `## Aprovação` has `Escopo: archive`: each stage starts only after the user writes its approval and types its command. A stage without a command (push, pull request, merge, release) needs an explicit request or a condition recorded in `## Aprovação`.

E, no início de cada fluxo, uma frase curta:

> **Approval and command**: start only when the user has written the approval for this stage and typed this command. With only one of the two, show what is missing and wait.

### D3. Propose

- A "Prior authorization exception" vira "**Prior authorization**": quando o pedido autoriza ir até o archive com condições, o agente registra a aprovação em `## Aprovação`, como hoje (com o selo). Ele MUST NOT começar o apply no mesmo turno.
- O item dos guardrails que repete a exceção sai.
- O "Prompt" final passa a seguir o D2.

### D4. Apply, verify, archive e update

- **Apply, passo 4a:** o item "If `Escopo` is `archive` [...] may run without a new confirmation [...]" passa a:
  > If `Escopo` is `archive`, keep its `Condições` in mind: verify and archive may follow, each after its own approval and command, only while every condition holds. Stop and report as soon as one fails.
- **Apply:** o "Output On Completion" troca "You can archive this change with `/opsx:archive`" pelo próximo passo do D2, que é o verify.
- **Update:** o passo 6 mostra o próximo passo no formato do D2.
- **Verify e archive:** recebem o trecho do D2. No archive, o próximo passo é o PR quando a aprovação o inclui; senão, nenhum.

### D5. Bloco gerenciado e hook

- **`templates/agents-block.md`:** o fluxo passa a "`/opsx:propose` → aprovação e `/opsx:apply` → aprovação e `/opsx:verify` → aprovação e `/opsx:archive`", com uma linha: "cada etapa só começa com a aprovação escrita do responsável ('Eu aprovo fazer ...') e o comando digitado por ele".
- **`contexto-de-sessao.mjs`:** depois da lista de changes, uma linha: "Cada etapa começa com a aprovação escrita do responsável e o comando /opsx:<etapa> digitado por ele."

### D6. CI, README e CHANGELOG

- **Passo "Trechos customizados das skills":**
  - "Prior authorization exception" é trocado por "Prior authorization" e "Stop and show the next step" no propose;
  - "Stop and show the next step" e "Approval and command" no apply, no verify, no archive e no update;
  - "Aprovação e comando por etapa" no `rules.md`;
  - "Eu aprovo fazer" no `templates/agents-block.md`.
- **Smoke test dos hooks:** a linha nova do `contexto-de-sessao.mjs` aparece na saída.
- **README:** os trechos novos na tabela de trechos customizados.
- **CHANGELOG:** um item na seção 1.15.0 aberta. A ação no projeto é nenhuma; o comportamento chega com a atualização do padrão.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/openspec/rules.md` | D1 | `docs/openspec-regras.md` e blocos dos agentes nos projetos; espelho da raiz |
| `commands/opsx/{propose,apply,verify,archive,update}.md` e skills espelho | D2, D3, D4 | espelhos; a `mensagens-descrevem-a-entrega` mexe nas mesmas saídas |
| `padrao-openspec/templates/agents-block.md` | D5 | bloco gerenciado no `AGENTS.md`, `CLAUDE.md` e afins dos projetos |
| `padrao-openspec/.claude/hooks/openspec-padrao/contexto-de-sessao.mjs` | D5 | smoke test dos hooks |
| `.github/workflows/validate.yml`, `README.md`, `CHANGELOG.md` | D6 | nenhum |

## Risks / Trade-offs

- **[Conflito com a `mensagens-descrevem-a-entrega` nos mesmos trechos]** → o apply só começa depois do merge dela, com rebase; o trecho do D2 usa o comando sem o nome da change, como ela.
- **[Um agente de outro fornecedor ignora a regra]** → ela chega pelo `rules.md` e pelo bloco gerenciado (ADR-0005); o "Limite" da ADR-0009 diz que é sob palavra.
- **[O responsável escreve uma aprovação em outro formato]** → o formato é sugerido. Vale uma declaração explícita de aprovação daquela etapa, como a regra de Origem já exige; um "ok" solto não é aprovação de etapa.
- **[Trecho regenerado pelo OpenSpec CLI some]** → os marcadores da CI apontam a falta.

## Migration Plan

- Os projetos recebem a regra pelo PR de atualização do padrão. Nenhuma ação manual.
- Rollback: reverter os commits.

## Open Questions

Nenhuma.
