# Spec Delta

## ADDED Requirements

### Requirement: Quebras de linha normalizadas

O repositório SHALL normalizar os arquivos de texto para LF na árvore de trabalho, em qualquer sistema, para que a checagem de divergência do sync não acuse diferenças que existam só na quebra de linha.

#### Scenario: Checkout no Windows

- **WHEN** o repositório é clonado no Windows com `core.autocrlf` ligado
- **THEN** os arquivos de texto ficam em LF na árvore de trabalho e o `sync-root.mjs --check` sai com código 0
