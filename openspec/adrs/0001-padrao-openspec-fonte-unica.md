---
id: ADR-0001
status: Proposed
date: 2026-10-17
supersedes:
superseded_by:
related_changes: [consolidate-padrao-openspec-source]
---

# ADR-0001: padrao-openspec como fonte única de skills, comandos e agentes

## Contexto

Skills, comandos `/opsx:*` e agentes existiam em quatro cópias divergentes: `.claude/` da raiz, `openspec-store-dotnet/`, `openspec-store-nextjs/` e `padrao-openspec/`. O instalador distribuía a cópia mais pobre, e funcionalidades novas (`/opsx:init`, `/opsx:ingest`, checagem de ADR) eram adicionadas só na raiz e não chegavam aos projetos consumidores. Veja a change `consolidate-padrao-openspec-source`.

## Decisão

- `padrao-openspec/` é a única fonte editável de skills (`.claude/skills/`), comandos (`.claude/commands/opsx/`), agentes (`.github/agents/`) e modelos de ADR (`openspec/adrs/README.md` e `template.md`).
- As cópias na raiz do repositório SHALL ser geradas por `padrao-openspec/scripts/sync-root.mjs` e MUST NOT ser editadas diretamente; a CI falha em qualquer divergência.
- Variações por stack MUST ser expressas como presets e skills de stack dentro de `padrao-openspec/`, nunca como stores paralelos.

## Alternativas consideradas

| Alternativa | Por que não foi escolhida |
|---|---|
| Raiz `.claude/` como fonte | O instalador e os presets já vivem em `padrao-openspec/`; inverter exigiria mover scripts e presets. |
| Links simbólicos da raiz para `padrao-openspec` | Não funcionam de forma confiável no Windows, e o instalador rejeita links. |
| Manter stores por stack | Triplica a manutenção, e os presets já cobrem as stacks. |

## Consequências

- Toda mudança em skill, comando ou agente é feita em `padrao-openspec/` e propagada com `node padrao-openspec/scripts/sync-root.mjs`.
- Quem clonava `openspec-store-dotnet` ou `openspec-store-nextjs` passa a usar `padrao-openspec` com `--stack`.
- O conteúdo vendorizado do OpenSpec CLI fica fora do lint de Markdown.
