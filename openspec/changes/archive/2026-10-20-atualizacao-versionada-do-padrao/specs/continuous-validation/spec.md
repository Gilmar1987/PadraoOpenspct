# Spec Delta

## ADDED Requirements

### Requirement: Versão e changelog consistentes

O workflow de validação SHALL falhar quando o conteúdo de `padrao-openspec/VERSION` não for semver válido ou não for igual à primeira versão listada no `CHANGELOG.md`, ou quando essa seção não tiver "O que mudou" e "Ações no projeto".

#### Scenario: VERSION sem entrada no changelog

- **WHEN** um PR muda `VERSION` para `1.1.0` sem acrescentar a seção `1.1.0` ao CHANGELOG
- **THEN** o workflow falha no passo de versão

### Requirement: Smoke da atualização versionada

Os smoke tests do instalador SHALL cobrir o manifesto da primeira instalação, a recusa de reinstalação com mudanças sem modo, o `--update` num repositório limpo e a recusa do `--update` com alterações pendentes.

#### Scenario: Instalador volta a sujar a branch atual

- **WHEN** uma mudança faz a reinstalação com mudanças gravar arquivos sem `--update` nem `--in-place`
- **THEN** o smoke test do instalador falha
