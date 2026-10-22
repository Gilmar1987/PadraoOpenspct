# Design

## Context

- `COMECE-AQUI.md` (passo 2), o README da raiz ("Fluxo validado" e "Exemplo real") e o `padrao-openspec/README.md` ("Usar em um novo projeto") clonam a `main` com `git clone https://github.com/Gilmar1987/PadraoOpenspct <store>`.
- O guia do projeto (`docs/openspec-padrao.md`) já usa `git clone --depth 1 --branch vX.Y.Z` para a atualização à mão, num clone temporário que não recebe commits.
- O setup lê `padrao-openspec/VERSION` do clone para o manifesto; na `main`, depois de um merge sem release, o `VERSION` pode não corresponder a uma tag publicada.
- `git clone --branch <tag>` deixa HEAD destacado e não cria branch local.

## Architecture Decisions

Não há ADR nova. A change aplica a [ADR-0004](../../adrs/0004-distribuicao-versionada-do-padrao.md) ao ponto de partida dos projetos.

## Goals / Non-Goals

**Goals:**

- Um projeto novo começa da última release publicada, numa branch `main` comum.

**Non-Goals:**

- Impedir que alguém clone a `main` de propósito (por exemplo, para testar o padrão antes de uma release).

## Decisions

### D1. Passo de clone do guia

```powershell
# Última release do padrão (ou veja https://github.com/Gilmar1987/PadraoOpenspct/releases)
gh release view --repo Gilmar1987/PadraoOpenspct --json tagName -q .tagName

# Store do projeto: clone da release, com a branch main criada a partir dela
git clone --branch vX.Y.Z https://github.com/Gilmar1987/PadraoOpenspct C:\openspec\<projeto>-openspec
git -C C:\openspec\<projeto>-openspec switch -c main
```

- Clone completo (sem `--depth`): o store recebe commits do projeto e, depois, `git fetch padrao` para comparar com versões novas; um clone raso complicaria isso.
- `switch -c main` cria a branch local na tag. O clone por tag não cria a `main` local, então o nome está livre.
- Texto curto antes do bloco: troque `vX.Y.Z` pela última release; sem o `gh`, veja a página Releases.

### D2. Problemas comuns

Linha nova: "`git status` diz `HEAD detached at vX.Y.Z`" → "Rode `git -C <store> switch -c main` (passo 2) antes de commitar".

### D3. READMEs

- README da raiz, "Fluxo validado": o passo 1 usa `--branch vX.Y.Z` e o `switch -c main`, com o comentário sobre a última release.
- README da raiz, "Exemplo real" (Livraria): `--branch v1.2.0` e o `switch -c main`. O exemplo fixa uma versão real, como os outros valores do exemplo.
- `padrao-openspec/README.md`, "Usar em um novo projeto": o mesmo do "Fluxo validado".

### D4. CI

O passo "Guia de primeiros passos" ganha:

```bash
grep -qF 'git clone --branch v' COMECE-AQUI.md
grep -qF 'switch -c main' COMECE-AQUI.md
```

### D5. Versão

`1.2.1` no `VERSION` e seção `## 1.2.1` no topo do CHANGELOG ("O que mudou": guia e READMEs clonam a última release; "Ações no projeto": Nenhuma).

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `COMECE-AQUI.md` | D1, D2 | CI (passo do guia) |
| `README.md`, `padrao-openspec/README.md` | D3 | lint |
| `.github/workflows/validate.yml` | D4 | nenhum |
| `padrao-openspec/VERSION`, `CHANGELOG.md` | D5 | passo "Versão e changelog" |

## Risks / Trade-offs

- [Dev sem `gh`] → o guia mostra a página Releases como alternativa.
- [Exemplo com versão fixa envelhecer] → o exemplo é ilustrativo; o fluxo principal usa `vX.Y.Z` com a instrução de pegar a última.

## Migration Plan

Nenhuma migração. Rollback: reverter os commits.

## Open Questions

Nenhuma.
