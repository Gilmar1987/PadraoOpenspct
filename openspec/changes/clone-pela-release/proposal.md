# Proposal

## Why

Desde a ADR-0004, o padrão publica versões (`v1.0.0` e `v1.2.0` já existem), mas o guia de primeiros passos e os READMEs ainda mandam clonar a `main`. Um projeto novo começa então de um commit qualquer da `main`, que pode ter mudanças ainda não publicadas, e o manifesto `.openspec-padrao.json` registra uma versão que não corresponde a nenhuma release. Começar da última release dá ao projeto uma versão revisada, com changelog, e alinha o ponto de partida ao mecanismo de atualização, que compara releases.

Clonar uma tag tem um detalhe: `git clone --branch vX.Y.Z` deixa o repositório sem branch (HEAD destacado), e os commits que o projeto fizer no store ficariam soltos. O guia precisa criar a branch `main` a partir da tag logo depois do clone.

## What Changes

- **`COMECE-AQUI.md`:** o passo 2 passa a:
  - descobrir a última release (página Releases do GitHub ou `gh release view --repo Gilmar1987/PadraoOpenspct --json tagName -q .tagName`);
  - clonar com `git clone --branch vX.Y.Z ...`;
  - criar a branch com `git -C <store> switch -c main`.
  A tabela de problemas comuns ganha a linha do HEAD destacado.
- **READMEs:** os comandos de clone do README da raiz ("Fluxo validado" e "Exemplo real") e do `padrao-openspec/README.md` usam a tag e criam a branch `main`.
- **CI:** o passo "Guia de primeiros passos" confere que o guia clona por tag e cria a branch.
- **Versão:** `1.2.1` no `VERSION` e no `CHANGELOG.md` (correção de documentação; o guia entregue aos projetos não muda).

### Fora do escopo

- Fazer o setup recusar ou avisar quando o store não está numa release.
- Mudar o instalador ou o workflow de atualização.
- Alterar projetos já configurados: eles seguem a `main` que clonaram e se alinham às releases pelo PR de atualização.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `project-onboarding`: o guia orienta a clonar a última release publicada e criar a branch `main` a partir dela.

## Impact

- **Documentação:** `COMECE-AQUI.md`, `README.md` e `padrao-openspec/README.md`.
- **CI:** `.github/workflows/validate.yml` (passo "Guia de primeiros passos").
- **Versão:** `padrao-openspec/VERSION` e `CHANGELOG.md`.
- **Riscos:**
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - **Compatibilidade:** nenhuma quebra. Quem já clonou a `main` continua funcionando; quem seguir o guia novo começa de uma release.

## Aprovação

- Responsável: Pendente
- Data: —
- Escopo: —
- Condições: —
- Origem: —
