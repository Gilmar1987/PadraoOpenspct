# Design

## Context

- O `/opsx:init` já registra no `project.md` as decisões que os pilares do guia pedem:
  - a ferramenta de validação de entrada (3.7);
  - logs, monitoramento de erros e tracing (6.1 a 6.3);
  - dados pessoais (1.5) e controles de LGPD (6.5).
- Nada usa essas decisões depois do init:
  - o apply não pede que a change as aplique;
  - o verify não confere fronteiras nem erros;
  - a revisão de código tem critérios genéricos ("Clean separation of concerns?", "Security concerns?").
- O `rules.md` tem, na seção 5, "Remover ou contornar validações de entrada (Zod ou equivalente)" e "Expor dados pessoais em logs ou respostas de API". Ninguém confere nenhum dos dois.
- O config base já exige um cenário por requisito e que o teste do cenário venha antes da implementação, mas o teste não precisa dizer qual cenário cobre.
- A "Product Vision" do `project.md` guarda o objetivo do produto, mas o "Why" do proposal não precisa citá-la.
- O guia trazido pelo responsável usa exemplos de TypeScript (Zod, OpenTelemetry, Jest e Gherkin) e manda "implementar irrestritamente".

## Architecture Decisions

Nenhuma ADR nova. As mudanças são regras de processo, cobradas no planejamento, na revisão e no verify, sem decisão de stack. Seguem a [ADR-0003](../../adrs/0003-padrao-sem-stack-embutida.md): toda regra aponta para a ferramenta que o projeto registrou, e os exemplos citam vários ecossistemas. Seguem também a [ADR-0005](../../adrs/0005-regras-entregues-por-blocos-gerenciados.md): as regras chegam aos projetos pelo `rules.md` e pelos blocos dos agentes. O "implementar irrestritamente" do guia não entra, porque contraria a regra de aprovação e o portão.

## Goals / Non-Goals

**Goals:**

- Cada princípio dos três pilares tem um lugar no fluxo onde é pedido (`rules.md` e config) e um onde é conferido (revisão e verify).
- As regras usam as decisões do `project.md`, então valem para qualquer stack.
- Um projeto pode desligar o log de três estados com justificativa, sem perder o resto.

**Non-Goals:**

- Auditar ou reescrever código existente.
- Escolher ferramenta de log, de validação ou de teste.
- Tornar Gherkin obrigatório.

## Decisions

### D1. `rules.md`

- **Seção 3**, depois do fluxo, um bloco "Princípios de engenharia (valem para o código que a change escreve)":
  - responsabilidade única: cada módulo, classe ou função tem um motivo para mudar;
  - extensão sem modificação: comportamento novo entra por extensão (interface, polimorfismo, estratégia) quando o código já tem esse ponto, e não por mais um `if` no meio do existente;
  - padrões existentes primeiro: replicar o padrão que o código já usa; um padrão novo exige justificativa no design;
  - contrato de entrada tipado em todo fluxo novo, e entidade de domínio separada do esquema de persistência;
  - teste de cenário que cita o requisito e o cenário.
- **Seção 5**, três itens novos em "Você MUST":
  - validar toda entrada de fronteira externa com a ferramenta registrada no `project.md`;
  - registrar os estados iniciado, sucesso e falha em mutações e fronteiras críticas, com a ferramenta de log do `project.md`, salvo "Não aplicável" registrado;
  - devolver ao cliente só mensagens de erro genéricas, sem a mensagem interna, o stack trace ou dados pessoais.
- **Seção 5**, o item de validação passa a "Remover ou contornar validações de entrada (a ferramenta registrada no `project.md`)", sem citar o Zod.

### D2. Config base

- `proposal`: "O Why cita o objetivo do produto (Product Vision) ou a capability do project.md que a change atende; uma change interna diz qual capability ou qualidade preserva".
- `design`: "Indicar o padrão de projeto existente que a change segue, ou justificar um novo; para fluxo novo, o contrato de entrada e onde a entidade se separa do esquema de persistência".
- `tasks`: "O teste de cada cenário cita o requisito e o cenário no nome ou num comentário".

### D3. Revisão de código

O template `requesting-code-review/code-reviewer.md` e o corpo do `openspec-code-reviewer` ganham um bloco "Engineering principles":

- responsabilidade única, extensão sem modificação e padrões existentes;
- contrato de entrada e entidade separada do esquema;
- validação nas fronteiras;
- log de três estados;
- erro e log sem vazamento;
- teste que cita o cenário.

Os critérios citam o `project.md` como fonte das ferramentas. O resto do template continua igual.

### D4. Verify

Heurística nova, com o mesmo texto no comando e na skill, depois das heurísticas existentes:

> **Engineering principles**: for a change that altered code, read the "Princípios de engenharia" line and the validation and logging decisions of `project.md`, then check the code the change wrote. An external input (request, message, file, environment variable) used without the project's validation tool is a WARNING. A mutation or critical boundary without the initiated, success and failed log states is a WARNING, unless `project.md` marks that item "Não aplicável". An error response that returns an internal exception message, a stack trace or personal data, or a log that writes personal data or credentials unmasked, is CRITICAL. A scenario test that does not cite its requirement and scenario is a SUGGESTION. Cite file and line for each.

As severidades seguem o efeito: vazamento é dano real (crítico); falta de validação ou de log reduz defesa e diagnóstico (warning); rastreabilidade é qualidade do registro (sugestão).

### D5. Init e `project.md`

- **`project.md` (modelo):** em "Development Conventions", a linha nova `- **Princípios de engenharia:** <!-- A definir -->`.
- **Init, pergunta nova 7.4**, depois da 7.3: o log de três estados se aplica ao projeto? A validação na fronteira e o erro sem detalhe interno valem sempre. As opções:
  - 0) Sim (recomendado);
  - 1) Não, com a justificativa em uma frase;
  - Outro.
