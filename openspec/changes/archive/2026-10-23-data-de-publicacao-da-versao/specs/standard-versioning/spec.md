# Spec Delta

## ADDED Requirements

### Requirement: Data da versão na publicação

Antes de criar a tag de uma versão, a cabeça da seção dessa versão no `CHANGELOG.md` SHALL trazer a data da publicação, e não a data em que a seção foi aberta. O passo a passo de publicação do README SHALL incluir esse acerto.

#### Scenario: Seção aberta antes da publicação

- **WHEN** a seção "## 1.13.0 — 2026-10-24" foi aberta numa change e o responsável pede a publicação em 2026-10-30
- **THEN** a cabeça vira "## 1.13.0 — 2026-10-30" num commit da `main` antes da tag `v1.13.0`, e as notas da release saem com essa data
