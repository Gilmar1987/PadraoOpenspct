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

### Requirement: Triagem de relatório de ferramenta externa

Quando houver um relatório de ferramenta de análise externa sobre o código da change (SAST, scanner de dependências, revisão automatizada), o verify SHALL conferir cada achado no código e nas decisões registradas e classificá-lo como real, não se aplica, risco aceito ou falso positivo, sempre com evidência. Um achado confirmado MUST manter a severidade do relatório ou maior, e um achado não conferido MUST ficar como não verificado.

#### Scenario: Falso positivo de CSRF

- **WHEN** o relatório aponta CSRF numa view cujo formulário tem o token CSRF e cujo middleware de proteção está ativo
- **THEN** o verify classifica o achado como falso positivo e cita o arquivo e a linha do middleware e do token

#### Scenario: Dependência vulnerável confirmada

- **WHEN** o relatório aponta um CVE numa dependência e a versão fixada no projeto está na faixa afetada
- **THEN** o verify classifica o achado como real, mantém a severidade e registra a correção recomendada

#### Scenario: Risco já aceito

- **WHEN** o relatório aponta a falta de limite de requisições e o projeto registrou "sem proteção contra ataques no MVP"
- **THEN** o verify classifica o achado como risco aceito e cita a decisão registrada

#### Scenario: Achado sem evidência suficiente

- **WHEN** o verify não consegue confirmar nem descartar um achado
- **THEN** o achado fica como não verificado, com o motivo

### Requirement: Changes concorrentes apontadas no propose

Ao criar uma change, o `/opsx:propose` SHALL listar as outras changes ativas cujas delta specs tocam as mesmas capabilities da change nova, registrar cada uma numa linha "Changes concorrentes" do Impact do proposal e mostrá-las ao usuário antes da aprovação, com uma sugestão de ordem. Sem sobreposição, SHALL registrar "Changes concorrentes: nenhuma".

#### Scenario: Duas changes na mesma capability

- **WHEN** existe uma change ativa com delta em `project-initialization` e o usuário propõe outra que também modifica `project-initialization`
- **THEN** o proposal novo cita a change ativa em "Changes concorrentes", e o agente mostra a sobreposição e sugere a ordem antes de pedir a aprovação

#### Scenario: Sem sobreposição

- **WHEN** nenhuma change ativa toca as capabilities da change nova
- **THEN** o Impact registra "Changes concorrentes: nenhuma"

### Requirement: Trabalho em paralelo

As regras globais SHALL orientar que, com mais de uma sessão ou agente no mesmo repositório, cada change fique numa worktree e numa branch próprias, com uma sessão por worktree; que a versão e o número de uma ADR nova sejam combinados antes do apply; e que quem for rodar uma suíte que usa recursos compartilhados da máquina avise antes.

#### Scenario: Segunda sessão no mesmo repositório

- **WHEN** uma segunda sessão vai começar uma change num repositório em que outra sessão já trabalha
- **THEN** as regras orientam criar uma worktree e uma branch para a change e combinar a versão antes do apply

### Requirement: ADR com verificação declarada

O modelo de ADR SHALL ter o campo opcional `verificacao`, com o teste ou comando que confere a decisão no código (um teste de arquitetura, por exemplo). Ao criar uma ADR cuja regra pode ser conferida por código, o `/opsx:propose` SHALL preencher o campo e criar a tarefa que escreve esse teste. Acrescentar `verificacao` a uma ADR `Accepted` SHALL ser permitido sem nova ADR, porque não muda a decisão.

#### Scenario: ADR de camadas criada no propose

- **WHEN** o propose cria uma ADR que proíbe a camada de domínio de importar a de infraestrutura
- **THEN** a ADR traz em `verificacao` o teste de dependência entre camadas, e o `tasks.md` tem a tarefa de escrevê-lo

#### Scenario: Decisão que não se confere por código

- **WHEN** a ADR registra a escolha de um provedor de hospedagem
- **THEN** o campo `verificacao` fica vazio, sem tarefa de teste, e a ADR declara a imposição `norma`

### Requirement: Verificação de ADR cobrada pelo verify

Para cada ADR `Accepted` com `verificacao` que a change toca (citada no `design.md` ou ligada às capabilities afetadas), o `/opsx:verify` SHALL rodar a verificação, ou reaproveitar a evidência conforme a heurística de reaproveitamento, e SHALL registrar o resultado em `Comandos:`. Um teste ausente SHALL ser crítico; um teste falhando SHALL ter a severidade da imposição da ADR.

#### Scenario: Teste de arquitetura falhando

- **WHEN** a change faz o domínio importar um cliente HTTP e a ADR de camadas, de imposição `controle`, tem o teste em `verificacao`
- **THEN** o verify roda o teste, registra o crítico com a ADR e o teste, e não declara a change pronta para arquivar

#### Scenario: Teste citado que não existe

- **WHEN** o campo `verificacao` cita um teste que não está no repositório
- **THEN** o verify registra um crítico "verificação de ADR ausente" com o caminho citado

### Requirement: Débitos relacionados no explore e no propose

Quando o store tem `openspec/estado-atual.md`, o explore e o propose SHALL ler a lista "Fora do ciclo atual" e citar no proposal os débitos que a change fecha e os que ela abre por adiar algo explicitamente. Sem o arquivo, SHALL dizer que ele não existe e seguir.

#### Scenario: Change que fecha um débito

- **WHEN** o projeto tem "Autenticação" em "Fora do ciclo atual" e a change implementa o login
- **THEN** o proposal cita esse débito como fechado pela change

#### Scenario: Store antigo

- **WHEN** o store não tem `estado-atual.md`
- **THEN** o propose informa que o arquivo não existe e cria a change normalmente

### Requirement: Débitos atualizados no archive

Ao arquivar uma change, o archive SHALL atualizar a lista "Fora do ciclo atual" do `estado-atual.md`, quando ela existir: SHALL remover os débitos que o proposal cita como fechados, registrando a change e a data no commit do archive, e SHALL acrescentar os que o proposal cita como abertos. Um débito MUST NOT sair da lista por outro motivo que não ser feito ou uma ADR Accepted dizer que não será feito.

#### Scenario: Débito fechado

- **WHEN** a change arquivada fechou o débito "Autenticação"
- **THEN** o débito sai da lista no mesmo commit do archive

#### Scenario: Débito ainda aberto

- **WHEN** uma change não cita o débito "Observabilidade" como fechado
- **THEN** o débito continua na lista depois do archive, mesmo que não esteja planejado

### Requirement: Forma de imposição da ADR

O modelo de ADR SHALL ter o campo opcional `imposicao`, com um dos valores `controle`, `consultivo`, `externo` ou `norma`, e a seção "Limite", que separa o que o mecanismo garante do que fica sob palavra. Sem o campo, a ADR SHALL contar como `controle` quando tem `verificacao` e como `norma` quando não tem.

#### Scenario: ADR antiga sem o campo

- **WHEN** uma ADR `Accepted` sem `imposicao` tem um teste em `verificacao`
- **THEN** o verify a trata como `controle`, como fazia antes

#### Scenario: Limite declarado

- **WHEN** o propose cria uma ADR de camadas conferida por um teste de importação
- **THEN** a seção "Limite" diz que o teste garante as importações declaradas e que o acoplamento por outro meio fica sob palavra

### Requirement: Severidade pela forma de imposição

O `/opsx:verify` SHALL registrar a falha da verificação de uma ADR `controle` como crítico e a de uma ADR `consultivo` como warning. Uma ADR `controle` ou `consultivo` sem `verificacao` SHALL ser crítico. Numa ADR `externo`, o verify SHALL conferir que a regra citada está na configuração da ferramenta e não está desligada. Uma ADR `norma` SHALL ficar sem verificação automática.

#### Scenario: Verificação consultiva falhando

- **WHEN** a ADR de nomes de pastas é `consultivo` e a verificação dela falha
- **THEN** o verify registra um warning com a ADR e a saída, e a falha não bloqueia o archive

#### Scenario: Controle sem verificador

- **WHEN** uma ADR declara `imposicao: controle` e o campo `verificacao` está vazio
- **THEN** o verify registra um crítico "verificador ausente" com a ADR

#### Scenario: Regra externa desligada

- **WHEN** uma ADR `externo` cita uma regra do linter que está desligada na configuração
- **THEN** o verify registra um crítico com o arquivo de configuração e a regra

### Requirement: Verificação de ADR vista reprovando

Quando uma change acrescenta ou muda uma `verificacao`, ou promove uma ADR a `controle`, o `tasks.md` SHALL ter uma tarefa que roda a verificação com a violação injetada, que falha, e no caso limpo, que passa, com os dois códigos de saída na evidência. Sem essa evidência, o verify SHALL registrar warning, ou crítico na promoção a `controle`.

#### Scenario: Teste novo visto reprovando

- **WHEN** a change escreve o teste de camadas de uma ADR
- **THEN** a evidência da tarefa mostra o teste falhando com uma importação proibida injetada e passando depois de retirada

#### Scenario: Promoção sem prova

- **WHEN** a change muda uma ADR de `consultivo` para `controle` sem a evidência da violação injetada
- **THEN** o verify registra um crítico com a ADR

### Requirement: Verificação sem nada a varrer

Quando a verificação de uma ADR roda sem nada a varrer, porque os arquivos ou pastas da superfície ainda não existem, o `/opsx:verify` SHALL registrá-la em "Não verificado", com o motivo "nada a varrer", e MUST NOT contá-la como aprovada.

#### Scenario: Camada que ainda não existe

- **WHEN** a ADR confere a pasta `apps/web/` e essa pasta ainda não existe
- **THEN** o registro põe a verificação em "Não verificado (nada a varrer)"

### Requirement: Impacto medido de decisão de arquitetura

Quando o `/opsx:propose` cria uma ADR com `verificacao`, ou acrescenta ou endurece a verificação de uma ADR `Accepted`, o `design.md` SHALL ter a seção "Impacto medido", com o comando, o código de saída e as violações que o código tem hoje. Cada violação SHALL ter um destino: tarefa da change, linha em `lacunas.md` ou falha aceita. Uma estimativa MUST NOT substituir a medida.

#### Scenario: Regra nova sobre código existente

- **WHEN** a change cria uma ADR que proíbe importação entre módulos e o código tem três importações assim
- **THEN** o design lista as três, com o comando que as achou, e diz o destino de cada uma

#### Scenario: Teste ainda não escrito

- **WHEN** o teste da ADR só vai existir no apply
- **THEN** a tarefa que escreve o teste registra as violações medidas antes de corrigir qualquer uma

### Requirement: Catraca de falhas aceitas no verify

Quando o `estado-atual.md` tem a seção "Falhas aceitas", o `/opsx:verify` SHALL comparar as falhas dos comandos que rodou com a lista: uma falha fora da lista SHALL seguir como crítico; uma falha da lista SHALL ser registrada como aceita; uma linha cuja falha não acontece mais SHALL ser warning, pedindo a retirada da linha.

#### Scenario: Falha nova

- **WHEN** a lista aceita a falha de um teste e o verify encontra a falha de outro teste
- **THEN** o verify registra a falha nova como crítico

#### Scenario: Lista envelhecida

- **WHEN** um teste da lista passa a passar
- **THEN** o verify registra um warning pedindo a retirada da linha

### Requirement: Falhas aceitas no ciclo das changes

Uma linha SHALL entrar em "Falhas aceitas" só pela linha `Falhas aceitas:` do Impact de um proposal aprovado, com motivo e condição de saída, e o archive SHALL aplicá-la, acrescentando e retirando linhas. Uma linha MUST NOT sair por outro motivo que não ser corrigida ou uma ADR Accepted dizer que não será.

#### Scenario: Falha aceita por uma change

- **WHEN** o proposal aprovado diz "Falhas aceitas: aceita o teste de lentidão do relatório (motivo: depende do índice novo; sai quando: a change `indice-de-relatorio` for arquivada)"
- **THEN** o archive acrescenta a linha em "Falhas aceitas" com a data e a change de origem

### Requirement: Condição de saída conferível

O "Sai quando" das tabelas "Fora do ciclo atual" e "Falhas aceitas" SHALL ser um fato conferível no repositório ou no store, como um caminho que passa a existir, uma change arquivada, uma ADR aceita ou uma linha do `project.md`. O `/opsx:verify` SHALL registrar warning para a condição já cumprida com a linha ainda na tabela e sugestão para a condição que não se confere.

#### Scenario: Condição cumprida com a linha de pé

- **WHEN** o débito "Front-end" sai quando "o primeiro arquivo em `apps/web/`" e esse arquivo já existe
- **THEN** o verify registra um warning pedindo que uma change feche o débito ou que o motivo seja renovado

#### Scenario: Condição vaga

- **WHEN** o "Sai quando" de um débito diz "quando der tempo"
- **THEN** o verify registra uma sugestão para reescrever a condição como fato conferível

### Requirement: Alternativas numeradas no explore

Quando o `/opsx:explore` faz uma pergunta com alternativas ("isto ou aquilo"), o agente SHALL numerar as opções e pedir o número, como a entrevista do init. Uma resposta que não indica a alternativa (por exemplo, "sim") SHALL ser tratada como ambígua, e o agente SHALL perguntar de novo antes de registrar a decisão.

#### Scenario: Pergunta com duas alternativas

- **WHEN** o agente precisa saber se o material é fixo por serviço ou varia por lavagem
- **THEN** ele pergunta com as opções "1) fixo por serviço" e "2) varia por lavagem" e pede o número

#### Scenario: Resposta ambígua

- **WHEN** o usuário responde "sim" a uma pergunta "isto ou aquilo"
- **THEN** o agente não registra a decisão e repete a pergunta com as opções numeradas

### Requirement: Mensagem descreve a entrega

Ao citar uma change para o usuário (anúncio do fluxo, resumo de propose, apply, verify, archive, update ou sync, e próximo passo), o agente SHALL descrever em uma linha o que ela entrega. O nome da change MUST NOT ser usado como rótulo da mensagem, e SHALL aparecer só quando for indispensável, como para escolher entre duas changes ativas.

#### Scenario: Resumo do apply

- **WHEN** o apply de uma change que acrescenta `.gitattributes` e prende as portas do Docker a 127.0.0.1 termina
- **THEN** o resumo diz em uma linha o que foi entregue e não usa o nome kebab-case da change como título

#### Scenario: Duas changes ativas

- **WHEN** há duas changes ativas e o usuário roda `/opsx:verify` sem argumento
- **THEN** o agente lista as duas com a descrição de cada uma e o nome, para o usuário escolher

### Requirement: Próximo passo pelo comando sem o nome

Quando indicar o próximo passo do ciclo, o agente SHALL mostrar só o comando, sem o nome da change como argumento (por exemplo, `/opsx:verify`), já que o comando descobre a change pelo contexto ou pergunta qual é.

#### Scenario: Fim do propose

- **WHEN** o propose termina e a change é a única ativa
- **THEN** a mensagem indica `/opsx:apply`, sem o nome da change

### Requirement: Versões consultadas no propose

Para cada dependência nova que o design acrescenta, o `/opsx:propose` SHALL consultar o registro do ecossistema no momento do propose e registrar no `design.md` o pacote, a versão escolhida, a fonte e a data da consulta e as restrições de runtime e de pares que o registro informa. Sem acesso ao registro, a versão MUST ficar marcada `[INFERIDO: sem consulta ao registro]`.

#### Scenario: Biblioteca npm nova

- **WHEN** o design acrescenta o Vitest a um projeto Node.js
- **THEN** o `design.md` tem uma linha com `vitest`, a versão exata escolhida, "npm view vitest dist-tags engines peerDependencies" com a data e as restrições de `engines.node`

#### Scenario: Sem rede

- **WHEN** o agente não consegue consultar o registro
- **THEN** a versão aparece com `[INFERIDO: sem consulta ao registro]`, e o portão de apply bloqueia até o responsável confirmar

### Requirement: Versão exata e estável

A versão escolhida no propose SHALL ser exata e estável. Uma pré-release (`rc`, `beta`, `alpha`, `preview`, `next`, `canary` ou `dev`) MUST NOT ser escolhida, mesmo quando a tag `latest` aponta para ela. A tarefa que instala a dependência SHALL citar a versão exata.

#### Scenario: Latest aponta para uma RC

- **WHEN** `npm view prisma dist-tags` devolve `latest: 8.0.0-rc.24` e a estável mais recente é a 7.10.1
- **THEN** o design registra a 7.10.1, diz por que recusou a RC, e a tarefa instala `prisma@7.10.1`

### Requirement: ADR do propose no commit do planejamento

Quando o `/opsx:propose` cria uma ADR em `openspec/adrs/`, o commit do planejamento SHALL incluir essa ADR, além da pasta da change, com pathspec explícito para cada arquivo, e MUST NOT incluir outros arquivos.

#### Scenario: Change com ADR nova

- **WHEN** o propose cria `openspec/adrs/0012-cache-distribuido.md` com `status: Proposed`
- **THEN** o commit `docs: propõe <change>` contém a pasta da change e esse arquivo, e nada mais
