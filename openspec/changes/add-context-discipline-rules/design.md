# Design

## Context

- O `openspec/rules.md` tem sete seções. A seção 1 já exige ler `config.yaml` e `project.md`, mas não fala dos artefatos da change nem de saídas volumosas.
- O `rules.md` só vale neste repositório: os stubs de cada ferramenta (`.claude/CLAUDE.md`, `.cursorrules` etc.) apontam para ele, e o instalador não o leva aos consumidores.
- O `context` do `config.yaml` é injetado pelo OpenSpec CLI nas instruções de cada artefato. O config base e os três presets terminam o `context` com o mesmo bloco ("Inicialização do projeto").

## Architecture Decisions

Não há ADR nova. Regras de processo dos agentes têm o `rules.md` como registro durável; as ADRs registram decisões técnicas de arquitetura. A mudança não contraria a ADR-0001: nenhuma skill, comando ou agente é alterado.

## Goals / Non-Goals

**Goals:**

- Uma regra curta, que caiba numa leitura e não dependa de ferramenta específica.
- O mesmo conteúdo no `rules.md` e nos stores consumidores.

**Non-Goals:**

- Fiscalizar o comportamento automaticamente: a regra é prompt-level, como as demais seções do `rules.md`.

## Decisions

### D1. Nova seção 7 no `rules.md`, antes de "Quando em dúvida"

A seção entra como 7 e "Quando em dúvida" passa a 8, para que a regra geral de dúvida continue fechando o arquivo. Texto proposto:

```markdown
## 7. Disciplina de contexto

Economize contexto nas saídas, nunca nos artefatos.

- Você MUST ler por inteiro, sem resumir nem ler parcialmente: este arquivo,
  `openspec/config.yaml`, `openspec/project.md`, as ADRs `Accepted` relevantes,
  todos os artefatos da change ativa e as specs principais que ela afeta.
- Você SHOULD filtrar saídas volumosas antes de lê-las (logs, saídas de build e de
  testes, JSON e CSV grandes): busque o erro, leia o início ou o fim, extraia campos.
- Em explorações amplas, você SHOULD localizar os arquivos por busca antes de abrir
  arquivos inteiros; leia por inteiro os trechos que for alterar.
- Toda verificação reportada MUST trazer o comando executado e o resultado relevante.
  Sem saída, o resultado é "não verificado", nunca "passou".
- Economia de tokens MUST NOT justificar pular a leitura de um artefato, marcar uma
  tarefa sem verificação ou declarar sucesso sem evidência.
- A escolha do modelo de IA é do usuário. Você pode sugerir uma troca; não a exija.
```

- Alternativa descartada: estender a seção 1. Ela trata do que ler antes de responder; a nova regra cobre também saídas e evidência, e misturar as duas tornaria a seção 1 longa.

### D2. Parágrafo idêntico no `context` dos quatro `config.yaml`

O parágrafo é acrescentado logo após o bloco "Inicialização do projeto", com o mesmo texto nos quatro arquivos:

```text
  Disciplina de contexto: leia por inteiro, sem resumir, config.yaml, project.md, as
  ADRs Accepted relevantes, os artefatos da change e as specs afetadas. Filtre só
  saídas volumosas (logs, build, testes, JSON/CSV grandes). Toda verificação
  reportada traz o comando e o resultado; sem saída, é "não verificado". Economia de
  tokens nunca justifica pular leitura, marcar tarefa sem verificação ou declarar
  sucesso sem evidência.
```

- O texto é mais curto que a seção do `rules.md` porque é injetado em todas as instruções de artefato.
- Alternativa descartada: instalar o `rules.md` no consumidor. Isso depende de definir onde ele vive no consumidor (change de layout de store único).

## Risks / Trade-offs

- **[A regra é declarativa e não há como fiscalizá-la automaticamente]** → o mesmo vale para as demais seções do `rules.md`. A evidência de verificação fica visível no relatório do `/opsx:verify`, onde o humano confere.
- **[O parágrafo nos quatro `config.yaml` pode divergir com o tempo]** → uma tarefa verifica que o texto é idêntico nos quatro; a seção "Manutenção" do `presets/README.md` já manda atualizar os presets junto com o config base.
- **[Contexto maior em cada instrução de artefato]** → são seis linhas, pequenas perto do limite de 51.200 bytes do campo.
