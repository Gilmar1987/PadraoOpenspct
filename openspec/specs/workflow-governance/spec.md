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

### Requirement: Tarefas que dependem de remoto

O `tasks.md` de uma change SHALL incluir tarefas que dependem de push, pull request ou CI remoto somente quando o `project.md` registra um remoto para o repositório de código. Sem remoto registrado, a tarefa MUST usar a verificação local equivalente e dizer qual é.

#### Scenario: Projeto sem remoto

- **WHEN** o `project.md` registra "sem remoto" e a change cria um workflow de CI
- **THEN** a tarefa verifica o workflow localmente (por exemplo, validando o YAML e rodando os mesmos comandos) e não exige "CI verde no PR"

#### Scenario: Projeto com remoto

- **WHEN** o `project.md` registra o GitHub como remoto
- **THEN** a change pode ter uma tarefa que exige o CI verde no PR

### Requirement: Comandos de verificação do projeto no verify

O verify SHALL obter a evidência de testes, lint, typecheck ou build pelos comandos da seção "Comandos de verificação" do `project.md` que se aplicam à change, rodando-os ou reaproveitando a evidência do apply pelas regras de reaproveitamento. Um comando ausente ou adiado no `project.md` MUST ser reportado como não verificado, com o motivo, e não substituído por um comando inventado.

#### Scenario: Projeto com comando de testes

- **WHEN** o `project.md` registra `pytest -q` como comando de testes e o código mudou depois do apply
- **THEN** o verify roda `pytest -q` e registra o resultado na lista de comandos do `verification.md`

#### Scenario: Comando adiado

- **WHEN** o `project.md` registra o lint como "Adiado: definir na primeira change que precisar"
- **THEN** o verify registra o lint como não verificado, com esse motivo

### Requirement: Pedido explícito de push

O agente SHALL fazer push, abrir pull request ou fazer deploy somente com pedido explícito do usuário na conversa ou quando uma condição registrada na `## Aprovação` os incluir. Fornecer a URL de um repositório, criar um repositório ou pedir para configurar o remoto MUST NOT ser tratado como pedido de push: o agente configura o remoto e pergunta antes de publicar.

#### Scenario: Usuário passa a URL do repositório

- **WHEN** o usuário informa a URL do repositório remoto recém-criado
- **THEN** o agente configura o remoto e pergunta se deve fazer push, sem publicar nada

#### Scenario: Usuário pede o PR

- **WHEN** o usuário escreve "faça push e abra o PR"
- **THEN** o agente faz o push e abre o PR

### Requirement: Evidência registrada na tarefa

Ao marcar uma tarefa como concluída, o apply SHALL registrar logo abaixo dela uma linha `Evidência:` com o comando executado e o resultado relevante. Quando o critério escrito não pôde ser seguido como estava, a linha MUST dizer o que foi feito no lugar e por quê.

#### Scenario: Critério seguido

- **WHEN** o agente conclui uma tarefa verificada por `pytest -q`
- **THEN** a tarefa marcada tem abaixo a linha `Evidência:` com `pytest -q` e o resultado

#### Scenario: Critério adaptado

- **WHEN** a tarefa pede "web respondendo em localhost:8000" e a porta 8000 está ocupada por outro processo
- **THEN** a linha `Evidência:` registra a porta usada, o motivo da troca e o resultado da checagem

### Requirement: Revisão de código por change

Ao terminar as tarefas de uma change que alterou código, o apply SHALL obter uma revisão do intervalo de commits da change, por subagente revisor ou por uma pessoa, e SHALL gravar `review.md` na pasta da change com o intervalo, quem revisou, as contagens por severidade e uma linha por achado crítico ou importante com a correção ou a justificativa. Uma change sem alteração de código SHALL registrar a revisão como não aplicável.

#### Scenario: Revisão com achado importante corrigido

- **WHEN** o revisor aponta um achado importante e o agente o corrige
- **THEN** o `review.md` lista o achado com o commit da correção

#### Scenario: Achado contestado

- **WHEN** o agente discorda de um achado importante por razão técnica
- **THEN** o `review.md` lista o achado como justificado, com a razão

#### Scenario: Change só de documentação

- **WHEN** a change altera só documentação e artefatos de planejamento
- **THEN** o `review.md` registra "não aplicável" e o motivo

### Requirement: Revisão cobrada pelo verify

O verify SHALL registrar um item crítico quando a change alterou código e não tem `review.md`, ou quando o `review.md` traz achado crítico ou importante sem correção nem justificativa.

#### Scenario: Revisão ausente

- **WHEN** o verify roda numa change que alterou código e não tem `review.md`
- **THEN** o `verification.md` registra um `[crítico]` de revisão ausente

#### Scenario: Revisão completa

- **WHEN** o `review.md` tem todos os achados críticos e importantes corrigidos ou justificados
- **THEN** o verify não registra item de revisão
