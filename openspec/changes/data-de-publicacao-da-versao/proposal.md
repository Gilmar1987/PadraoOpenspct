# Proposal

## Why

A release v1.12.0 foi publicada em 2026-10-23, mas a cabeça da seção no `CHANGELOG.md` ficou "## 1.12.0 — 2026-10-22", a data em que a primeira change da versão abriu a seção. Com o modelo de versão acumulada, a seção é aberta numa change e publicada dias depois, e o passo a passo de publicação do README não manda acertar a data. As notas da GitHub Release, tiradas da seção, também saíram com a data de abertura.

## What Changes

- **Correção da 1.12.0:** a cabeça vira "## 1.12.0 — 2026-10-23" no `CHANGELOG.md` da `main`, e as notas da GitHub Release v1.12.0 são regeradas com a data certa. A tag v1.12.0 não muda: ela já foi publicada, e o conteúdo dela é o mesmo, fora a data.
- **Passo de publicação:** no README, "Como publicar uma release" ganha um passo antes da tag: acertar a data da seção para a da publicação, num PR curto, e só então criar a tag no commit do merge.
- **Versão:** nenhuma. A change corrige uma seção já publicada e o processo de manutenção do padrão, que não chega aos projetos; não sobe o `VERSION` nem acrescenta item ao CHANGELOG.

### Fora do escopo

- Reescrever a tag v1.12.0 ou republicar a release.
- Checagem automática da data na CI (a data da publicação só é conhecida no dia da release).

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `standard-versioning`: a publicação acerta a data da seção da versão antes da tag.

## Impact

- **Arquivos:** `CHANGELOG.md` (cabeça da 1.12.0), `README.md` ("Como publicar uma release").
- **GitHub:** as notas da Release v1.12.0 (edição, sem mudar a tag nem os anexos).
- **Changes concorrentes:** a `debitos-e-camadas-de-verificacao` (outra sessão) vai abrir a seção 1.13.0 no topo do CHANGELOG; as duas mexem em linhas diferentes, e quem entrar depois faz o rebase.
- **Riscos:** nenhum relevante; só texto.

## Aprovação

- Responsável: gilmar.campelo
- Data: 2026-10-23
- Escopo: archive
- Condições: PR, merge e edição das notas da Release v1.12.0, se a CI passar nos três jobs.
- Origem: "Aprovo a data-de-publicacao-da-versao até o archive, com PR, merge e edição das notas da release, se a CI passar"
