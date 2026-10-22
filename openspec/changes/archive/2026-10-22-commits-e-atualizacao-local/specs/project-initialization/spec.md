# Spec Delta

## ADDED Requirements

### Requirement: Init commita os artefatos no store

Depois de gerar os artefatos, o `/opsx:init` SHALL commitar só a pasta `openspec/` da raiz OpenSpec, quando ela estiver num repositório Git, com uma mensagem Conventional Commits, e MUST NOT fazer push. Fora de um repositório Git, SHALL dizer que não commitou e seguir.

#### Scenario: Store num repositório Git

- **WHEN** o responsável confirma a entrevista num projeto cujo store é um repositório Git
- **THEN** o store tem um commit novo com `project-setup.md`, `project.md`, `config.yaml`, `arquitetura.md` e as ADRs, e nada mais do que estava preparado no índice entra nele

#### Scenario: Sem Git

- **WHEN** a raiz OpenSpec não está num repositório Git
- **THEN** o init gera os arquivos, informa que não houve commit e termina sem erro
