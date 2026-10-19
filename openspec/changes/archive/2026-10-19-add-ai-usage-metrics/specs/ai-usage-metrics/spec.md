# Spec Delta

## Purpose

Mede o consumo de IA por change a partir das sessões locais do Claude Code, sem depender de números declarados pelo agente, sem dupla contagem e sem expor o conteúdo das conversas.

## ADDED Requirements

### Requirement: Leitura opt-in das sessões locais

Com `--usage <pasta>`, o script SHALL ler os arquivos de sessão do Claude Code da pasta de projeto que corresponde a cada caminho informado, dentro da pasta de sessões (`--usage-dir`, padrão `~/.claude/projects`), e gravar `uso-ia.csv` no diretório de saída. Sem `--usage`, o script MUST NOT ler arquivos de sessão nem gravar `uso-ia.csv`.

#### Scenario: Execução sem a opção

- **WHEN** o script roda sem `--usage`
- **THEN** nenhum arquivo de sessão é lido e o diretório de saída não tem `uso-ia.csv`

#### Scenario: Pasta sem sessões

- **WHEN** o script roda com `--usage` apontando para uma pasta que nunca teve sessão do Claude Code
- **THEN** o `uso-ia.csv` tem as colunas de consumo vazias e o resumo informa que nenhuma sessão foi encontrada para aquela pasta

### Requirement: Contagem única por resposta

Cada resposta da IA SHALL ser contada uma única vez, identificada por `message.id`, mesmo quando aparece em várias linhas do arquivo de sessão.

#### Scenario: Resposta repetida em duas linhas

- **WHEN** duas linhas do arquivo de sessão têm o mesmo `message.id` com 100 tokens de saída cada
- **THEN** a change recebe 1 resposta e 100 tokens de saída

### Requirement: Atribuição por branch

Um registro cuja branch contém o nome de exatamente uma change, como segmento ou sufixo, SHALL ser atribuído a essa change.

#### Scenario: Branch da change

- **WHEN** um registro tem `gitBranch` igual a `feat/add-busca`
- **THEN** o consumo do registro é atribuído à change `add-busca`

### Requirement: Atribuição por janela de datas

Um registro sem branch correspondente SHALL ser atribuído à única change cuja janela (data de criação até a data do archive, ou até hoje para changes ativas) contém a data do registro. Um registro na janela de mais de uma change MUST ficar como ambíguo, e um registro fora de qualquer janela MUST ficar como não atribuído; nenhum dos dois soma em change alguma.

#### Scenario: Uma única janela

- **WHEN** um registro na branch `main` tem data dentro da janela só da change `add-catalogo`
- **THEN** o consumo é atribuído a `add-catalogo`

#### Scenario: Janelas sobrepostas

- **WHEN** um registro na branch `main` tem data dentro das janelas de duas changes
- **THEN** o consumo não é atribuído a nenhuma delas e o resumo conta 1 registro ambíguo

### Requirement: Privacidade das sessões

O script MUST ler das sessões apenas `message.id`, `timestamp`, `gitBranch`, `cwd`, `message.model` e `message.usage`. O `uso-ia.csv` e o resumo MUST NOT conter conteúdo de mensagens, nomes de branch nem caminhos de pasta.

#### Scenario: Sessão com conteúdo sensível

- **WHEN** um arquivo de sessão contém uma mensagem com o texto `segredo-xyz` e a branch `feat/cliente-acme-add-busca`
- **THEN** nem `segredo-xyz` nem `cliente-acme` aparecem no `uso-ia.csv` ou no `resumo.md`
