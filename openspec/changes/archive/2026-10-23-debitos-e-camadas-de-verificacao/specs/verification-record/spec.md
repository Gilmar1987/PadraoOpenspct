# Spec Delta

## ADDED Requirements

### Requirement: Camadas exercitadas no registro de verificação

Quando o `project.md` tem a seção "Camadas de verificação", o verify SHALL registrar em cada entrada do `verification.md` uma linha `Camadas:` com as camadas que a change exercitou e o comando de cada uma. Uma camada que se aplica à change e não rodou MUST entrar em "Não verificado", com o motivo. Sem a seção, o verify SHALL dizer isso e seguir com os comandos de verificação.

#### Scenario: Change de interface sem E2E executado

- **WHEN** a change altera uma tela, a matriz tem E2E com Playwright e só os testes unitários rodaram
- **THEN** a entrada registra o unitário em `Camadas:` e põe o E2E em "Não verificado", com o motivo

#### Scenario: Projeto sem a matriz

- **WHEN** o `project.md` não tem a seção "Camadas de verificação"
- **THEN** o verify registra que a matriz não existe e não inventa camadas
