# Design

## Context

- Modelo de versão acumulada (README, "Como publicar uma release", passo 1): a primeira change depois de uma release abre a seção da versão; a release sai quando o responsável pede.
- O `changelog-range.mjs` copia a seção inteira, com a cabeça, para as notas da release.

## Architecture Decisions

Não há ADR nova.

## Goals / Non-Goals

**Goals:**

- A data publicada da 1.12.0 fica certa, e as próximas versões saem com a data da publicação.

**Non-Goals:**

- Mudar a tag v1.12.0 ou automatizar a data na CI.

## Decisions

### D1. Correção da 1.12.0

- `CHANGELOG.md`: "## 1.12.0 — 2026-10-22" → "## 1.12.0 — 2026-10-23".
- Notas da Release v1.12.0: regeradas com `changelog-range.mjs --from 1.11.0 --to 1.12.0` a partir do CHANGELOG corrigido e aplicadas com `gh release edit v1.12.0 --notes-file`, depois do merge.

### D2. Passo no README

Em "Como publicar uma release", antes do passo da tag:

> Acerte a data da seção da versão para o dia da publicação (`## X.Y.Z — AAAA-MM-DD`), num PR curto (`chore: data da versão X.Y.Z`), e crie a tag no commit do merge.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `CHANGELOG.md` | D1 | notas da Release v1.12.0, "Versão e changelog" (não muda: o número continua igual ao `VERSION`) |
| `README.md` | D2 | lint |

## Risks / Trade-offs

- [Conflito com a seção 1.13.0 que a outra sessão vai abrir] → linhas diferentes; rebase de quem entrar depois.

## Migration Plan

Nenhuma.

## Open Questions

Nenhuma.
