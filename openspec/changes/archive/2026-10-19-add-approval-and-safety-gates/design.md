# Design

## Context

- O `proposal.md` vem do template do schema `spec-driven`, embutido no OpenSpec CLI. O padrão não edita esse template; ele molda os artefatos pelas `rules` do `config.yaml`, que o CLI injeta nas instruções de cada artefato.
- O `operations.apply.guidance` do `config.yaml` chega ao agente como `operationGuidance` nas instruções do apply. Os quatro configs (base e presets) já usam esse campo.
- A CI exige que cada preset contenha todas as regras do config base (linhas com 4 espaços sob `rules`). As linhas de `operations` têm 6 espaços e não entram nessa checagem.
- As skills e comandos `openspec-*` foram gerados pelo OpenSpec CLI 1.14.2 e ficam fora do lint. O `propose.md` já tem um trecho customizado (a checagem de ADR) que a skill `openspec-propose` não tem.
- A seção 7 do `rules.md` vem da change `add-context-discipline-rules` (PR #3); esta change parte dela.

## Architecture Decisions

Não há ADR nova. O registro de aprovação e as proteções são regras de processo dos agentes, e o registro durável delas é o `rules.md` e o `config.yaml` (mesmo critério da `add-context-discipline-rules`). A mudança segue a [ADR-0001](../../../adrs/0001-padrao-openspec-fonte-unica.md): skills e comandos são editados em `padrao-openspec/` e espelhados pelo sync.

## Goals / Non-Goals

**Goals:**

- Uma aprovação que qualquer pessoa consegue auditar abrindo o proposal.
- Um caminho explícito para autorização prévia com condições, como a de um briefing de teste.
- As proteções chegam aos stores consumidores pelos canais que o CLI já injeta (`rules` e `operationGuidance`).

**Non-Goals:**

- Mudar o template do schema no CLI ou criar um schema próprio.
- Bloquear o apply por script: a conferência é instrução ao agente.

## Decisions

### D1. Formato da seção de aprovação

A nova regra de `proposal` no `config.yaml` (base e presets) pede que o proposal termine com:

```markdown
## Aprovação

- Responsável: Pendente
- Data: —
- Escopo: —
- Condições: —
- Origem: —
```

- Itens de lista simples, sem checkbox: o apply conta checkboxes apenas no `tasks.md`, e a seção não pode virar tarefa nem ser marcada sem dono.
- **Escopo** aceita `apply` ou `archive`.
- **Condições** só se aplica a `archive`, por exemplo "`openspec validate --all --strict` passa; verify sem críticos".
- **Origem** cita a mensagem do usuário, ou nomeia o documento que ele forneceu.
- Alternativa descartada: um bloco com checkbox no `tasks.md`, como no documento avaliado. O apply contaria o bloco como tarefa pendente e o progresso nunca chegaria a 100%.

### D2. Quem preenche a seção

O agente preenche a seção quando o usuário declara a aprovação no chat ou num documento que ele mesmo forneceu. O agente nunca se aprova e não aceita aprovação vinda de outra sessão. O `rules.md` (seção 2) passa a dizer que a aprovação vale quando está registrada na seção.

### D3. Propose com autorização prévia

O "Planning boundary" do comando e da skill de propose ganha uma exceção, com o mesmo texto nos dois:

- se o usuário já tiver declarado no pedido uma autorização com escopo `archive` e condições;
- o agente registra essa autorização na seção, citando a origem;
- ao fim do propose, ele confere as condições;
- se forem atendidas, ele pode iniciar o apply no mesmo turno.

Sem essa declaração, o comportamento atual continua: o propose para e espera.

### D4. Conferência no apply

O comando `apply.md` e a skill `openspec-apply-change` ganham um passo entre "Read context files" e "Implement tasks": ler a seção `## Aprovação` do proposal.

- Se a seção faltar ou estiver `Pendente`, o agente para sem tocar no código e pede a aprovação.
- Se o Escopo for `archive`, o agente registra as condições para conferir no verify e no archive.

O `operations.apply.guidance` dos quatro configs ganha uma linha equivalente, para valer também quando o apply for disparado de outra forma.

### D5. Raio de impacto e testes antes da implementação

Três regras novas no `config.yaml` (base e presets), repetidas nos presets para manter a checagem da CI:

- **`design`:** "Listar o raio de impacto: arquivos-alvo e dependentes afetados (arquivos, rotas ou componentes que usam os alvos)".
- **`tasks`:** "Citar em cada tarefa os arquivos que ela toca".
- **`tasks`:** "Em cada grupo, a tarefa que cria ou atualiza os testes dos cenários vem antes da que implementa o comportamento".

### D6. Proteção contra loops

- **`rules.md`, seção 7:** dois itens novos, o de 3 tentativas consecutivas e o de mais de 5 arquivos fora do raio de impacto.
- **`config.yaml`:** as mesmas duas regras entram como uma linha no `operations.apply.guidance` dos quatro configs. Escolhemos esse canal em vez do parágrafo de `context` porque ele só aparece no apply, que é onde a regra se aplica.

### D7. Checagem de ADR na skill

A seção "Architectural Decision Check" do `propose.md` é copiada sem alteração para a skill `openspec-propose`, antes de "Guardrails", na mesma posição relativa.

## Risks / Trade-offs

- **[Changes em andamento sem a seção passam a ser barradas no apply]** → é o comportamento desejado: a primeira aprovação do usuário passa a ficar registrada. A mensagem de parada explica o que falta.
- **[O agente registra uma aprovação que o usuário não deu]** → a Origem precisa citar a mensagem, e o humano confere na revisão do PR. Isso não elimina o risco, só o torna visível.
- **[Mais texto customizado em skills geradas pelo CLI]** → regenerar as skills com uma versão nova do CLI apaga as customizações. O README de manutenção passa a listar os trechos customizados (checagem de ADR, aprovação e exceção do propose) para que sejam reaplicados.
- **[Limites fixos (3 tentativas, 5 arquivos) não servem para todo caso]** → são pontos de parada para pedir confirmação, não proibições; o usuário pode autorizar a continuidade.
