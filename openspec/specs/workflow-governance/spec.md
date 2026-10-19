# workflow-governance Specification

## Purpose

Define as regras do ciclo OpenSpec que todo agente do padrão segue, com ou sem subagentes: quais etapas são obrigatórias, quem pode fazer o quê, como uma ADR é aprovada, que evidência o verify aceita e o que o archive atualiza.

## Requirements

### Requirement: Explore opcional

O `/opsx:explore` SHALL ser opcional e recomendado quando o problema, o escopo ou a abordagem não estiverem claros. As etapas propose, apply, verify e archive MUST continuar obrigatórias, nessa ordem.

#### Scenario: Pedido já claro

- **WHEN** o usuário pede uma change com escopo e comportamento definidos
- **THEN** o agente pode começar pelo `/opsx:propose` sem violar o `rules.md`

### Requirement: Papéis com ou sem subagentes

Os limites de atuação SHALL ser definidos por papel (planejar, implementar, verificar, revisar consistência, ingerir material) e valer para qualquer agente que assuma o papel. Um ajuste de artefato de change depois do verify MUST passar pelo `/opsx:update`.

#### Scenario: Verify encontra divergência no design

- **WHEN** o verify aponta que o `design.md` diverge do que foi implementado
- **THEN** o agente no papel de verificação reporta a divergência sem editar o artefato, e a correção do `design.md` é feita pelo `/opsx:update`

### Requirement: Aprovação de ADR sem pull request

Em projetos sem pull request, uma ADR SHALL passar a `Accepted` somente com a declaração explícita do responsável, citada na mensagem do commit que muda o status. As ADRs fundacionais geradas pelo `/opsx:init` SHALL contar como aprovadas pelas respostas confirmadas na entrevista.

#### Scenario: Projeto só com main

- **WHEN** o responsável declara no chat que aprova uma ADR `Proposed`, num projeto sem pull request
- **THEN** o commit que muda o status para `Accepted` cita essa declaração na mensagem

### Requirement: Reaproveitamento de evidência no verify

O verify SHALL reaproveitar a evidência do apply somente quando ela foi registrada com comando e código de saída e o código não mudou depois dela. Caso contrário, MUST rodar o comando de novo. Uma verificação fora do repositório MUST NOT ser contada como cobertura automatizada.

#### Scenario: Código alterado depois do apply

- **WHEN** um arquivo de código mudou depois da última execução dos testes registrada no apply
- **THEN** o verify roda os testes de novo em vez de reaproveitar o resultado anterior

#### Scenario: Smoke fora do repositório

- **WHEN** um cenário só tem evidência num script guardado fora do repositório
- **THEN** o verify registra o cenário como coberto fora da suíte, e não como coberto por teste automatizado

### Requirement: Atualização do project.md no archive

Ao arquivar uma change que cria ou altera capabilities, o archive SHALL atualizar a tabela de capabilities do `project.md`, quando ela existir, com o nome, o estado e a change de cada capability.

#### Scenario: Capability nova

- **WHEN** uma change que cria a capability `catalogo-livros` é arquivada, e o `project.md` tem uma tabela de capabilities
- **THEN** a tabela passa a listar `catalogo-livros` com a change que a criou

### Requirement: Confirmação de progresso por grupo de tarefas

Durante o apply, o agente SHALL marcar cada tarefa concluída no checkbox indicado pelo CLI e SHALL confirmar o progresso com o CLI ao terminar cada grupo de tarefas e ao final da change. O agente MUST NOT ser obrigado a consultar o CLI depois de cada tarefa individual.

#### Scenario: Grupo com três tarefas

- **WHEN** o agente conclui as três tarefas de um grupo do `tasks.md`
- **THEN** ele marca os três checkboxes e consulta o CLI uma vez, ao fim do grupo, para confirmar o progresso

#### Scenario: Final da change

- **WHEN** o agente conclui a última tarefa da change
- **THEN** ele consulta o CLI e confirma que o estado é `all_done` antes de reportar a conclusão
