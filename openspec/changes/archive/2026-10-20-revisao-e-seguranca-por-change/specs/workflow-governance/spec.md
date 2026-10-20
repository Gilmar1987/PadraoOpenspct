# Spec Delta

## ADDED Requirements

### Requirement: Revisão de código por change

Ao terminar as tarefas de uma change que alterou código, o apply SHALL obter uma revisão do intervalo de commits da change, por subagente revisor ou por uma pessoa, e SHALL gravar `review.md` na pasta da change com o intervalo, quem revisou, as contagens por severidade e uma linha por achado crítico ou importante com a correção ou a justificativa. Uma change sem alteração de código SHALL registrar a revisão como não aplicável.

#### Scenario: Revisão com achado importante corrigido

- **WHEN** o revisor aponta um achado importante e o agente o corrige
- **THEN** o `review.md` lista o achado com o commit da correção

#### Scenario: Achado contestado

- **WHEN** o agente discorda de um achado importante por razão técnica
- **THEN** o `review.md` lista o achado como justificado, com a razão

#### Scenario: Change só de documentação

- **WHEN** a change altera só documentação e artefatos de planejamento
- **THEN** o `review.md` registra "não aplicável" e o motivo

### Requirement: Revisão cobrada pelo verify

O verify SHALL registrar um item crítico quando a change alterou código e não tem `review.md`, ou quando o `review.md` traz achado crítico ou importante sem correção nem justificativa.

#### Scenario: Revisão ausente

- **WHEN** o verify roda numa change que alterou código e não tem `review.md`
- **THEN** o `verification.md` registra um `[crítico]` de revisão ausente

#### Scenario: Revisão completa

- **WHEN** o `review.md` tem todos os achados críticos e importantes corrigidos ou justificados
- **THEN** o verify não registra item de revisão
