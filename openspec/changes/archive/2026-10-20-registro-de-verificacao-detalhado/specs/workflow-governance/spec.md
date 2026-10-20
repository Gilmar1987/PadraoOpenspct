# Spec Delta

## ADDED Requirements

### Requirement: Comandos de verificação do projeto no verify

O verify SHALL obter a evidência de testes, lint, typecheck ou build pelos comandos da seção "Comandos de verificação" do `project.md` que se aplicam à change, rodando-os ou reaproveitando a evidência do apply pelas regras de reaproveitamento. Um comando ausente ou adiado no `project.md` MUST ser reportado como não verificado, com o motivo, e não substituído por um comando inventado.

#### Scenario: Projeto com comando de testes

- **WHEN** o `project.md` registra `pytest -q` como comando de testes e o código mudou depois do apply
- **THEN** o verify roda `pytest -q` e registra o resultado na lista de comandos do `verification.md`

#### Scenario: Comando adiado

- **WHEN** o `project.md` registra o lint como "Adiado: definir na primeira change que precisar"
- **THEN** o verify registra o lint como não verificado, com esse motivo
