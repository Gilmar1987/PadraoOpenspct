# Spec Delta

## MODIFIED Requirements

### Requirement: Conjunto de skills distribuído

O instalador SHALL distribuir todas as skills da fonte única, que são todas neutras quanto à stack, incluindo as versões completas das sete skills `openspec-*`, `docker`, `requesting-code-review` e `versioning-ci-cd`. A fonte única MUST NOT conter skills específicas de uma stack.

#### Scenario: Skills neutras presentes

- **WHEN** o instalador roda
- **THEN** o consumidor recebe `docker`, `requesting-code-review` e `versioning-ci-cd`, e não recebe `dotnet-implementation` nem `nextjs-implementation`

#### Scenario: Skill de propose com checagem de ADR

- **WHEN** o instalador conclui a instalação
- **THEN** o `SKILL.md` de `openspec-propose` instalado é idêntico ao da fonte única, e o comando `propose.md` instalado contém a seção de checagem de decisão arquitetural

## ADDED Requirements

### Requirement: Opção de stack rejeitada

O instalador SHALL recusar a opção `--stack` com uma mensagem que explique que o padrão não tem skills de stack e que os comandos de verificação do projeto ficam no `project.md`. Ao recusar, o instalador MUST NOT alterar nenhum arquivo do consumidor.

#### Scenario: Automação antiga com --stack

- **WHEN** o instalador roda com `--stack dotnet`
- **THEN** ele termina com código diferente de zero, a mensagem cita a remoção de `--stack`, e o consumidor continua sem `.agents/` e sem `.claude/`

## REMOVED Requirements

### Requirement: Recomendação de skills oficiais por stack

**Reason**: O padrão deixou de ter stacks embutidas (ADR-0003). Sem `--stack`, não há stack para a qual recomendar skills externas.

**Migration**: Quem quiser skills oficiais de uma stack as instala direto, pelo comando do fornecedor. O `/opsx:init` registra a stack e os comandos de verificação do projeto no `project.md`.
