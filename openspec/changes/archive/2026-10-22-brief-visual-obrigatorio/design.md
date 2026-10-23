# Design

## Context

- A `qualidade-de-interface` (1.12.0) criou a skill `interface-quality`, o script de validação, o subagente validador e o trecho "Interface quality gate" do verify, que só age quando o `design.md` tem "Brief visual".
- O propose decide sozinho se escreve o `design.md`, que o schema `spec-driven` trata como condicional (`commands/opsx/propose.md`, passo 6b).
- O verify da `qualidade-de-interface` registrou um warning sobre essa brecha (`openspec/changes/archive/2026-10-22-qualidade-de-interface/verification.md`).

## Architecture Decisions

Não há ADR nova: a change completa o fluxo da `qualidade-de-interface`, sem decisão transversal nova.

## Goals / Non-Goals

**Goals:**

- Nenhuma change com telas chega ao archive sem brief e sem relatório de interface, a menos que o responsável diga que não há tela.

**Non-Goals:**

- Detectar telas pelo código ou pela stack.

## Decisions

### D1. Trecho "Interface brief" no propose

No comando e na skill do propose, logo antes do "Architectural Decision Check" (que trata do que vem antes de escrever o `design.md`), um bloco **"Interface brief"**:

> When the change creates or changes screens, pages or visual components (in any front-end technology), write `design.md` even where the schema treats it as optional, and include a `## Brief visual` section following the template in the `interface-quality` skill. In `tasks.md`, name the states of each screen (loading, empty, error, success) and add, before marking a screen task, a browser validation with `docs/openspec-validar-interface.mjs` and a final grade of "médio" or better. Follow the `interface-quality` skill.

O passo 6b, que hoje permite pular um artefato condicional, ganha a exceção: o `design.md` de uma change com telas não é pulado.

### D2. Caso novo no "Interface quality gate"

No verify, o trecho "Interface quality gate" ganha a frase:

> When the change has no `design.md`, or its `design.md` has no "Brief visual" section, but tasks, design or delta specs mention a screen, page, form, layout, visual component, front-end or UI in the sense of something a user sees (in Portuguese: tela, página, formulário, layout, componente visual, front-end, interface de usuário), or the change has `interface/jornadas.json`, add a WARNING "Screens without visual brief" that quotes the words or files that triggered it, and ask the user whether the change has screens. If they confirm, turn it into a CRITICAL issue and recommend `/opsx:update` to add the brief, the screen states and the browser validation. If they say no, keep one line under `Itens:`: `[warning] Screens without visual brief: o responsável disse que não há tela (<trigger>)`. Without an answer, keep the WARNING and do not continue to archive, also under `Escopo: archive`.

O título "Screens without visual brief" vira marcador conferido pela CI.

### D3. Skill `interface-quality`

Na "Ordem de trabalho", o item 1 passa a citar o trecho "Interface brief" do propose e o warning do verify, no lugar do parágrafo atual sobre a brecha.

### D4. CI, documentação e versão

- **"Trechos customizados":**
  - "Interface brief" nos dois arquivos do propose;
  - "Screens without visual brief" nos dois arquivos do verify.
- **README:** uma frase na seção da skill `interface-quality`.
- **CHANGELOG:** itens em "O que mudou" da seção 1.12.0 aberta; "Ações no projeto": nenhuma.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `commands/opsx/propose.md`, `skills/openspec-propose/SKILL.md` | D1 | cópias da raiz, trechos customizados |
| `commands/opsx/verify.md`, `skills/openspec-verify-change/SKILL.md` | D2 | cópias da raiz, trechos customizados |
| `skills/interface-quality/SKILL.md` | D3 | cópia da raiz |
| `.github/workflows/validate.yml`, `README.md`, `CHANGELOG.md` | D4 | CI, lint |

## Risks / Trade-offs

- [Palavras como "tela" em changes de back-end geram o warning] → o warning só pergunta; o crítico depende da resposta do responsável.
- [Conflito de texto com a `lacunas-e-adrs-verificaveis` e a `aprovacao-por-conteudo` no propose e no verify] → trechos em pontos diferentes; quem entrar depois faz o rebase.

## Migration Plan

Nenhuma migração. Rollback: reverter os commits.

## Open Questions

Nenhuma.
