# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
