---
id: ADR-0003
status: Accepted
date: 2026-10-19
supersedes: ADR-0001
superseded_by:
related_changes: [tornar-padrao-generalista]
---

# ADR-0003: Padrão sem stack embutida, com padrao-openspec como fonte única

## Contexto

A ADR-0001 fez de `padrao-openspec/` a fonte única de skills, comandos e agentes, e mandou expressar as variações por stack como presets e skills de stack. O padrão passou a manter presets e skills só para .NET e Next.js. No teste de ponta a ponta com Django (2026-10-19), o projeto não tinha preset: usou `--stack none`, o init completou a stack sozinho, e nada no fluxo registrava os comandos que validam o código. Cada stack nova exigiria preset, skill, smoke tests e cópia das regras base. O responsável decidiu tornar a ferramenta generalista. Veja a change `tornar-padrao-generalista`.

## Decisão

- `padrao-openspec/` continua a única fonte editável de skills (`.claude/skills/`), comandos (`.claude/commands/opsx/`), agentes (`.github/agents/`) e modelos de ADR (`openspec/adrs/README.md` e `template.md`).
- As cópias na raiz SHALL ser geradas por `padrao-openspec/scripts/sync-root.mjs` e MUST NOT ser editadas diretamente; a CI falha em qualquer divergência.
- O padrão MUST NOT conter presets de stack nem skills específicas de uma stack. Toda skill da fonte única é neutra.
- A stack de cada projeto e os comandos que a verificam (instalar, executar, testar, lint, typecheck ou build, migrar) SHALL ser registrados pelo `/opsx:init` no `project.md` do projeto, e o apply e o verify SHALL usar esses comandos.

## Alternativas consideradas

| Alternativa | Por que não foi escolhida |
|---|---|
| Manter os presets e criar um para Django | Cada stack nova repete preset, skill, smoke tests e regras base; a lista nunca cobre todos os projetos. |
| Presets mantidos pela comunidade, fora deste repositório | Volta ao problema da ADR-0001: cópias paralelas que divergem da fonte única. |
| Skills de stack sem presets | Ainda privilegia algumas stacks e não resolve onde ficam os comandos de verificação de um projeto. |

## Consequências

- Uma stack nova não exige mudança no padrão: o init a registra no `project.md`.
- A orientação específica de framework passa a vir das skills oficiais do fornecedor, instaladas à parte, e das decisões registradas pelo projeto.
- `--stack` deixa de existir no setup e no instalador; automações antigas falham com mensagem de migração.
- Projetos já configurados com preset continuam válidos; o instalador não remove skills de stack já instaladas.
