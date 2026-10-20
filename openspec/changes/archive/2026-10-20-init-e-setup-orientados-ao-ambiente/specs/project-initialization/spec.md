# Spec Delta

## ADDED Requirements

### Requirement: Remoto e tamanho do time

O `/opsx:init` SHALL perguntar onde o repositório de código fica hospedado, com a opção "Sem remoto por enquanto", e quantas pessoas desenvolvem e revisam o código. As duas respostas SHALL ir para o `project-setup.md` e para a convenção "Git e revisão" do `project.md`.

#### Scenario: Projeto sem remoto

- **WHEN** o responsável responde "Sem remoto por enquanto"
- **THEN** o `project.md` registra em "Git e revisão" que o projeto não tem remoto

#### Scenario: Projeto solo no GitHub

- **WHEN** o responsável responde GitHub e "Uma pessoa"
- **THEN** o `project-setup.md` registra as duas respostas

### Requirement: Checagem de coerência das respostas

Antes da confirmação final, o `/opsx:init` SHALL listar as combinações incoerentes entre as respostas e pedir, para cada uma, que o responsável ajuste a resposta ou a mantenha com uma justificativa. O `project-setup.md` SHALL registrar cada combinação apontada e a decisão tomada. Sem combinações incoerentes, o init SHALL dizer isso e seguir.

#### Scenario: Aprovação de PR com uma pessoa só

- **WHEN** o responsável exige aprovação de PR e informa que só uma pessoa desenvolve e revisa
- **THEN** o init aponta que a plataforma não permite aprovar o próprio PR e oferece registrar a revisão por subagente (`requesting-code-review`) como substituta

#### Scenario: CI no PR sem remoto

- **WHEN** o responsável escolhe CI no GitHub Actions e "Sem remoto por enquanto"
- **THEN** o init aponta que o CI remoto não roda sem remoto e oferece registrar as verificações como locais até o remoto existir

#### Scenario: Fila sem processamento em background

- **WHEN** o responsável escolhe uma biblioteca de filas e responde que o sistema não tem jobs nem processamento em background
- **THEN** o init aponta a combinação e o responsável ajusta uma das respostas ou registra a justificativa
