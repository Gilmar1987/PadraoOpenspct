# Spec Delta

## MODIFIED Requirements

### Requirement: Publicação de release documentada

O README do padrão SHALL descrever como publicar uma versão: atualizar `VERSION` e o `CHANGELOG.md` no mesmo PR, fazer o merge, criar a tag e a GitHub Release com as notas da seção da versão e com o `comecar.mjs` anexado. A publicação MUST ser feita só com pedido explícito do responsável.

#### Scenario: Release depois do merge

- **WHEN** um PR que muda `VERSION` para `1.1.0` é mergeado e o responsável pede a publicação
- **THEN** existe a tag `v1.1.0` e uma GitHub Release cujas notas são a seção `1.1.0` do CHANGELOG

#### Scenario: Script anexado à release

- **WHEN** a release `v1.3.0` é publicada seguindo o README
- **THEN** `https://github.com/Gilmar1987/PadraoOpenspct/releases/latest/download/comecar.mjs` baixa o `comecar.mjs` da `v1.3.0`
