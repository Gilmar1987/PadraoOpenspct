## ADDED Requirements

### Requirement: Adoção do padrão num projeto existente pelo script

O script de entrada SHALL oferecer um terceiro modo, adoção, para um código que já tem histórico e nunca usou o padrão, informado por caminho local ou URL. Nele, o script SHALL criar uma branch de adoção a partir da branch atual, clonar a última release do padrão em `<base>/<id>-openspec`, rodar o setup com o nome, o id e a marca de adoção, e terminar mandando rodar o `/opsx:init` e abrir o PR da branch depois dele.

#### Scenario: Adoção de um código local

- **WHEN** o dev escolhe a opção 3, informa `C:\repos\loja` (repositório na branch `main`, com commits e a árvore limpa), o nome `Loja` e o id `loja`, e confirma
- **THEN** o código fica na branch `chore/adota-padrao-openspec` com os comandos `/opsx:*` e `store: loja` no `openspec/config.yaml`, o store fica em `<base>/loja-openspec` na última release, e a mensagem final cita a branch, o `/opsx:init` e o PR

#### Scenario: Adoção por URL

- **WHEN** o dev informa a URL de um repositório de código em vez de um caminho
- **THEN** o script clona o código em `<base>/<nome-do-repositório>` e segue a adoção nessa pasta

#### Scenario: Adoção sem interação

- **WHEN** o script roda com `--modo adotar --pasta <dir> --codigo <dir> --nome "Loja" --id loja --yes` sem terminal interativo
- **THEN** ele faz a adoção sem perguntas, sem oferecer abrir o VS Code

### Requirement: Recusas antes da adoção

Antes de qualquer escrita, o modo adoção MUST terminar com erro, sem alterar nada, quando o código já declara um store, já tem `openspec/` sem store, não é um repositório Git ou não tem commits, tem arquivos rastreados com alterações sem commit, está com o HEAD destacado ou com rebase, merge, cherry-pick ou revert em andamento, ou quando a branch de adoção ou a pasta do store já existem. Cada erro SHALL dizer o motivo e o que fazer.

#### Scenario: Projeto que já usa o padrão

- **WHEN** o `openspec/config.yaml` do código tem a linha `store: loja`
- **THEN** o script termina com erro, diz que o projeto já usa o padrão e manda usar a opção 2, sem criar branch nem store

#### Scenario: Árvore suja

- **WHEN** um arquivo rastreado do código tem alteração sem commit
- **THEN** o script termina com erro, lista o arquivo e pede commit ou stash, sem criar branch nem store

#### Scenario: Repositório sem commits

- **WHEN** a pasta do código é um repositório Git sem nenhum commit, ou não é um repositório Git
- **THEN** o script termina com erro e mostra os comandos para criar o repositório e fazer o primeiro commit do código

### Requirement: Arquivos não rastreados na adoção

Arquivos não rastreados no código MUST NOT impedir a adoção. O script SHALL avisá-los no resumo, com até 10 caminhos e o total, e MUST NOT incluí-los no commit da adoção.

#### Scenario: Pasta de build não ignorada

- **WHEN** o código tem a pasta não rastreada `tmp/` e a árvore rastreada está limpa
- **THEN** o resumo avisa `tmp/`, a adoção segue, e o commit da adoção não inclui nada de `tmp/`

### Requirement: Branch de adoção com nome trocável

A branch de adoção SHALL se chamar `chore/adota-padrao-openspec`, salvo quando o dev informa outro nome com `--branch`. O script SHALL recusar um nome que o Git não aceita como branch.

#### Scenario: Outro nome de branch

- **WHEN** o dev roda o modo adoção com `--branch adota-openspec`
- **THEN** a adoção acontece na branch `adota-openspec`

#### Scenario: Branch de adoção já existe

- **WHEN** o código já tem a branch `chore/adota-padrao-openspec`
- **THEN** o script termina com erro antes de qualquer escrita e sugere apagá-la ou usar `--branch`

### Requirement: Commit da adoção só com os arquivos do padrão

No modo adoção, o script SHALL oferecer o commit dos arquivos do padrão na branch de adoção e o commit inicial do store, aceitos por padrão e pelo `--yes` e recusados pelo `--sem-commit`. No código, o commit SHALL ter a mensagem `chore: adota o padrão OpenSpec` e MUST NOT incluir outro arquivo. O script MUST NOT fazer push nem abrir PR.

#### Scenario: Commit da adoção

- **WHEN** a adoção termina e o dev aceita o commit
- **THEN** o último commit da branch de adoção tem a mensagem `chore: adota o padrão OpenSpec` e só arquivos do manifesto do padrão, e a branch principal continua como estava

### Requirement: Guia da adoção

O `COMECE-AQUI.md` SHALL ter a seção "Projeto que nunca usou o padrão", com o comando do script no modo adoção, o que ele recusa, a branch de adoção e o próximo passo (`/opsx:init` e PR).

#### Scenario: Tech lead com um projeto sem o padrão

- **WHEN** um tech lead com um repositório existente abre o `COMECE-AQUI.md`
- **THEN** ele encontra a seção "Projeto que nunca usou o padrão" com o comando da opção 3

### Requirement: Store fora do código na adoção

No modo adoção, a pasta do store MUST NOT ficar dentro da pasta do código. Nesse caso, o script SHALL terminar com erro antes do resumo, sem alterar nada, e pedir uma pasta base fora do código. Com o código informado por caminho, a pasta base sugerida SHALL ser a pasta que contém o código.

#### Scenario: Pasta base igual à do código

- **WHEN** o dev informa o código `C:\repos\loja` e a pasta base `C:\repos\loja`
- **THEN** o script termina com erro, diz que o store ficaria dentro do código e pede uma pasta fora dele, sem criar branch nem store

#### Scenario: Pasta base sugerida

- **WHEN** o dev informa o código `C:\repos\loja` e tecla Enter na pergunta da pasta base
- **THEN** o store fica em `C:\repos\<id>-openspec`, ao lado do código
