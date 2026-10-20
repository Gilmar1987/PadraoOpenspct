# Spec Delta

## ADDED Requirements

### Requirement: Remote do padrão desligado do store

Quando o `origin` do repositório git do store aponta para o repositório PadraoOpenspct, o setup SHALL renomeá-lo para `padrao` e mostrar como adicionar o remoto do projeto e como desfazer a troca. Com `--keep-origin`, o setup MUST NOT alterar os remotes. Um `origin` que aponta para outro repositório MUST permanecer inalterado.

#### Scenario: Store clonado do padrão

- **WHEN** o setup roda com `--yes` num store cujo `origin` é `https://github.com/Gilmar1987/PadraoOpenspct.git`
- **THEN** o repositório do store passa a ter o remote `padrao` com essa URL e nenhum `origin`, e a saída mostra `git remote add origin <url-do-projeto>` e `git remote rename padrao origin`

#### Scenario: Opção para manter o origin

- **WHEN** o setup roda com `--keep-origin` num store clonado do padrão
- **THEN** o `origin` continua apontando para o PadraoOpenspct e nenhum remote `padrao` é criado

#### Scenario: Store com remoto próprio

- **WHEN** o `origin` do store aponta para `https://github.com/acme/livraria-openspec.git`
- **THEN** o setup não altera os remotes
