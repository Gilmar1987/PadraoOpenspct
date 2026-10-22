# Spec Delta

## ADDED Requirements

### Requirement: Revisão de código antes do verify

Numa change que alterou código, o `/opsx:verify` SHALL conferir, antes de qualquer outra checagem, se existe `review.md`. Sem ele, o verify MUST parar sem gravar `verification.md`, dizer que a revisão de código é pré-requisito e oferecer rodá-la.

#### Scenario: Verify chamado antes da revisão

- **WHEN** o usuário roda `/opsx:verify` numa change com commits de código e sem `review.md`
- **THEN** o verify não gera relatório nem `verification.md`, explica que falta a revisão e oferece rodá-la

#### Scenario: Change só de documentação

- **WHEN** a change não alterou código
- **THEN** o verify segue sem exigir revisão além do registro `não aplicável` previsto no apply

### Requirement: Dependências do Impact conferidas

O verify SHALL cruzar as dependências citadas no Impact do proposal com as tarefas da change e com o manifesto de dependências do projeto, e registrar como warning cada dependência sem tarefa ou ausente do manifesto.

#### Scenario: Dependência citada e nunca instalada

- **WHEN** o Impact cita uma biblioteca de validação que nenhuma tarefa instala e que não está no manifesto de dependências
- **THEN** o verify registra um warning que cita a dependência

### Requirement: Roteiro de navegador executado por agente

Quando um roteiro de verificação em navegador tiver sido executado por um agente sem interação real (por exemplo, por requisições HTTP, sem cliques), o verify SHALL registrar o cenário como coberto só em parte e pedir uma execução humana antes do archive.

#### Scenario: Roteiro rodado por HTTP

- **WHEN** a evidência do roteiro diz que o agente conferiu as páginas por HTTP, sem clicar
- **THEN** o `verification.md` registra a cobertura parcial em "Não verificado" e pede a execução humana
