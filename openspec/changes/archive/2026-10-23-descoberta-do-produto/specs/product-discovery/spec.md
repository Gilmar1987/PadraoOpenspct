# Spec Delta

## Purpose

Define como o `/opsx:discover` conduz a descoberta do produto: uma conversa em que o agente questiona e recomenda até chegar a uma ideia concreta, registrada em `openspec/descoberta.md` para orientar a entrevista do init.

## ADDED Requirements

### Requirement: Abertura da descoberta

O `/opsx:discover` SHALL abrir a conversa perguntando ao dev qual é a ideia do projeto. Quando houver brief do `/opsx:ingest` na conversa, SHALL começar pelas lacunas, contradições e perguntas em aberto desse brief, em vez da pergunta aberta.

#### Scenario: Sem documentos

- **WHEN** o dev roda `/opsx:discover` sem brief do ingest
- **THEN** a primeira mensagem do agente pergunta qual é a ideia do projeto

#### Scenario: Com brief do ingest

- **WHEN** o init chama o discover depois de um ingest cujo brief tem o conflito C01 e a pergunta em aberto P01
- **THEN** o agente começa pelo C01 ou pela P01, citando o brief, e não pede ao dev que repita o que os documentos já dizem

### Requirement: Postura crítica do agente

Na descoberta, o agente MUST NOT só concordar. A cada afirmação do dev que afete escopo, público, restrições ou funcionalidades, SHALL questionar a premissa ou apontar a contradição quando houver, e numa decisão em aberto SHALL apresentar duas ou três opções, cada uma com justificativa e desvantagem, dizendo qual recomenda e por quê.

#### Scenario: Escopo grande demais para o MVP

- **WHEN** o dev lista doze funcionalidades para o MVP e diz que o time é de uma pessoa
- **THEN** o agente aponta o conflito entre escopo e time e oferece opções de corte, com justificativa e a sua recomendação

#### Scenario: Contradição com o brief do ingest

- **WHEN** o dev diz que o produto não guarda dados pessoais e o brief do ingest cita cadastro com CPF
- **THEN** o agente aponta a contradição com a origem do brief e pede ao dev que decida

### Requirement: Uma pergunta por vez

O agente SHALL fazer uma pergunta por vez na descoberta, dizendo em uma frase por que ela importa, e SHALL resolver antes as perguntas de que outras dependem.

#### Scenario: Público antes de funcionalidades

- **WHEN** o dev ainda não disse para quem é o produto
- **THEN** o agente pergunta o público antes de detalhar as funcionalidades, e a mensagem tem uma única pergunta

### Requirement: Conhecimento do agente marcado

O que o agente afirmar sobre o negócio, o mercado ou o domínio sem ter vindo do dev nem dos documentos SHALL aparecer no `descoberta.md` com a marca `[INFERIDO: <base>]`. A recomendação do agente, apresentada como recomendação, não leva a marca.

#### Scenario: Prática de mercado

- **WHEN** o agente afirma que clínicas costumam exigir confirmação de consulta por mensagem e o dev não confirma
- **THEN** o `descoberta.md` registra a afirmação com `[INFERIDO: prática comum de clínicas]`

### Requirement: Critério de ideia concreta

A descoberta SHALL acompanhar um checklist de ideia concreta: problema e público, funcionalidades do MVP, o que fica fora do MVP, integrações com outros sistemas, restrições (volume, dados pessoais, prazo, tamanho do time) e critério de sucesso. Quando todos os itens estiverem respondidos ou em aberto, o agente SHALL mostrar o checklist e propor encerrar.

#### Scenario: Checklist completo

- **WHEN** o dev respondeu a todos os itens do checklist
- **THEN** o agente mostra o checklist preenchido e pergunta se a ideia está pronta para ser registrada

#### Scenario: Checklist incompleto

- **WHEN** falta o critério de sucesso
- **THEN** o agente não propõe encerrar e pergunta o critério de sucesso

### Requirement: Encerramento pelo dev

O dev SHALL poder encerrar ou adiar a descoberta a qualquer momento. Um item do checklist sem resposta MUST ir para "Em aberto" no brief, e o agente MUST NOT tratar silêncio ou aceite genérico como resposta.

#### Scenario: Dev encerra antes do fim

- **WHEN** o dev diz "chega, vamos para as perguntas" sem ter respondido as integrações
- **THEN** o brief registra as integrações em "Em aberto" e a descoberta termina

### Requirement: Brief da ideia gravado com confirmação

Ao encerrar, o agente SHALL mostrar o brief da ideia e só gravá-lo em `<root>/openspec/descoberta.md` depois da confirmação explícita do dev. O brief SHALL ter as seções do checklist, "Em aberto", as decisões tomadas e o status "Concluída". O brief MUST NOT reproduzir dados pessoais, credenciais nem nomes de clientes.

#### Scenario: Dev confirma

- **WHEN** o dev confirma o brief
- **THEN** o `descoberta.md` existe com as seções do checklist e o status "Concluída"

#### Scenario: Dev pede ajuste

- **WHEN** o dev pede para trocar uma funcionalidade do MVP
- **THEN** o agente ajusta o brief, mostra de novo e só grava depois da nova confirmação

### Requirement: Descoberta retomável

Quando o dev interromper a conversa antes do fim, o agente SHALL oferecer gravar o brief parcial com o status "Em andamento". Um `/opsx:discover` sobre um `descoberta.md` "Em andamento" SHALL retomar dos itens que faltam, sem refazer os respondidos. Sobre um "Concluída", SHALL perguntar se o dev quer revisar a descoberta ou mantê-la.

#### Scenario: Retomada no dia seguinte

- **WHEN** o dev roda `/opsx:discover` e o `descoberta.md` está "Em andamento" com integrações e critério de sucesso em falta
- **THEN** o agente resume o que já foi decidido e pergunta pelas integrações

#### Scenario: Descoberta já concluída

- **WHEN** o dev roda `/opsx:discover` e o `descoberta.md` está "Concluída"
- **THEN** o agente pergunta se o dev quer revisar ou manter, e nada muda até a resposta

### Requirement: Descoberta não implementa nem decide arquitetura

O `/opsx:discover` MUST NOT escrever código, criar change nem gravar `project.md`, `config.yaml`, `arquitetura.md` ou ADRs. O único arquivo que grava é o `descoberta.md`. Ao terminar sem ter sido chamado pelo init, SHALL indicar o `/opsx:init` quando o projeto ainda não foi inicializado, e o `/opsx:propose` quando já foi.

#### Scenario: Pedido de código na descoberta

- **WHEN** o dev pede para criar a tela de login durante a descoberta
- **THEN** o agente não escreve código, registra a funcionalidade no checklist e explica que a implementação passa por uma change

#### Scenario: Descoberta avulsa num projeto inicializado

- **WHEN** o dev roda `/opsx:discover` num store com `project.md` preenchido e confirma o brief
- **THEN** só o `descoberta.md` muda, e o agente indica o `/opsx:propose` como próximo passo
