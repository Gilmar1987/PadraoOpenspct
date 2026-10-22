# Spec Delta

## ADDED Requirements

### Requirement: Release com o script de entrada anexado

O repositório SHALL ter um workflow que roda quando uma release é publicada e garante que ela tem o `comecar.mjs` anexado, anexando o arquivo da própria tag quando ele faltar e falhando se o anexo continuar ausente.

#### Scenario: Release publicada sem o anexo

- **WHEN** uma release `vX.Y.Z` é publicada sem o `comecar.mjs`
- **THEN** o workflow anexa o `padrao-openspec/scripts/comecar.mjs` da tag `vX.Y.Z`, e a release passa a tê-lo

### Requirement: Portão testado na CI

A CI SHALL testar o portão contra um store registrado: aprovação pendente e completa no `apply`; tarefas pendentes, falta de `verification.md`, falta de `review.md` numa change de código e change pronta no `archive`; e o hook recusando um commit de change não aprovada.

#### Scenario: Portão que deixa passar aprovação pendente

- **WHEN** uma mudança faz o portão liberar `apply` com `Responsável: Pendente`
- **THEN** o smoke test do portão falha
