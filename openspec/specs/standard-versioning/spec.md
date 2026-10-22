# standard-versioning Specification

## Purpose

Dá ao padrão uma versão identificável e um registro do que muda em cada versão, para que os projetos saibam o que instalaram, o que há de novo e o que precisam fazer ao atualizar.

## Requirements

### Requirement: Versão do padrão

O padrão SHALL ter um único número de versão no formato semver (`MAJOR.MINOR.PATCH`), guardado em `padrao-openspec/VERSION`. Cada versão publicada SHALL corresponder a uma tag `vMAJOR.MINOR.PATCH` no repositório do padrão.

#### Scenario: Versão lida pelo instalador

- **WHEN** o instalador roda a partir de um clone do padrão cujo `VERSION` contém `1.2.0`
- **THEN** o manifesto gravado no projeto registra a versão `1.2.0`

### Requirement: Changelog com ações no projeto

O `CHANGELOG.md` da raiz do padrão SHALL ter uma seção por versão, da mais nova para a mais antiga, cada uma com "O que mudou" e "Ações no projeto". "Ações no projeto" MUST listar todo passo manual que um projeto precisa fazer ao atualizar, ou dizer "Nenhuma".

#### Scenario: Versão que exige passo manual

- **WHEN** uma versão acrescenta uma seção que o `project.md` do store deve ter
- **THEN** a seção dessa versão no CHANGELOG traz, em "Ações no projeto", o que acrescentar e onde

#### Scenario: Versão sem passo manual

- **WHEN** uma versão só corrige texto de skills
- **THEN** "Ações no projeto" diz "Nenhuma"

### Requirement: Trecho do changelog entre versões

O padrão SHALL fornecer um script que imprime as seções do `CHANGELOG.md` entre duas versões, excluindo a de origem e incluindo a de destino, na ordem do arquivo.

#### Scenario: Atualização de duas versões

- **WHEN** o script recebe origem `1.0.0` e destino `1.2.0` e o CHANGELOG tem `1.2.0`, `1.1.0` e `1.0.0`
- **THEN** a saída traz as seções `1.2.0` e `1.1.0`, e não a `1.0.0`

### Requirement: Publicação de release documentada

O README do padrão SHALL descrever como publicar uma versão: atualizar `VERSION` e o `CHANGELOG.md` no mesmo PR, fazer o merge, criar a tag e a GitHub Release com as notas da seção da versão e com o `comecar.mjs` anexado. A publicação MUST ser feita só com pedido explícito do responsável.

#### Scenario: Release depois do merge

- **WHEN** um PR que muda `VERSION` para `1.1.0` é mergeado e o responsável pede a publicação
- **THEN** existe a tag `v1.1.0` e uma GitHub Release cujas notas são a seção `1.1.0` do CHANGELOG

#### Scenario: Script anexado à release

- **WHEN** a release `v1.3.0` é publicada seguindo o README
- **THEN** `https://github.com/Gilmar1987/PadraoOpenspct/releases/latest/download/comecar.mjs` baixa o `comecar.mjs` da `v1.3.0`
