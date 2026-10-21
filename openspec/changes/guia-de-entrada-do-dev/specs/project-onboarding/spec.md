# Spec Delta

## ADDED Requirements

### Requirement: Script de entrada distribuído pela release

O padrão SHALL ter um script de entrada, `comecar.mjs`, que roda com Node.js 18 ou mais recente sem dependências e é baixado sozinho, sem clonar o padrão, pelo link `releases/latest/download/comecar.mjs` do repositório do padrão.

#### Scenario: Dev baixa o script

- **WHEN** um dev roda `curl -LO https://github.com/Gilmar1987/PadraoOpenspct/releases/latest/download/comecar.mjs` e depois `node comecar.mjs`
- **THEN** o script começa a conversa sem que o dev tenha clonado o padrão

### Requirement: Conferência do ambiente pelo script

Antes de qualquer pergunta sobre o projeto, o script SHALL conferir Git, Node.js 18 ou mais recente e o OpenSpec CLI. Quando o CLI faltar, o script SHALL oferecer instalar a versão `1.14.2`; quando Git ou Node.js faltarem ou estiverem abaixo do mínimo, SHALL parar dizendo o que instalar, sem criar nada.

#### Scenario: CLI ausente

- **WHEN** o dev roda o script numa máquina sem o OpenSpec CLI e aceita a instalação
- **THEN** o script instala o `@fission-ai/openspec@1.14.2` e segue para as perguntas do projeto

#### Scenario: Git ausente

- **WHEN** o dev roda o script numa máquina sem Git
- **THEN** o script termina com código diferente de zero, diz para instalar o Git e não cria pastas

### Requirement: Pasta base escolhida pelo dev

O script SHALL perguntar a pasta base dos repositórios, sugerindo a pasta atual, e SHALL aceitar qualquer caminho, absoluto ou relativo, mostrando o caminho completo no resumo. Se a pasta base não existir, SHALL perguntar antes de criá-la. Se ela estiver numa pasta sincronizada por OneDrive, Dropbox ou Google Drive, SHALL avisar e pedir confirmação.

#### Scenario: Pasta em outro disco

- **WHEN** o dev responde `D:\Trabalho\Clientes` e o id do projeto é `livraria`
- **THEN** o resumo mostra o store em `D:\Trabalho\Clientes\livraria-openspec` e o código em `D:\Trabalho\Clientes\livraria`

#### Scenario: Pasta sincronizada

- **WHEN** a pasta base informada está dentro de uma pasta do OneDrive
- **THEN** o script avisa que a sincronização pode travar o Git e só segue se o dev confirmar

### Requirement: Confirmação antes de criar

O script SHALL mostrar um resumo com as pastas que vai criar e o que vai fazer, e SHALL criar algo só depois da confirmação do dev ou da opção `--yes`. O script SHALL recusar, sem alterar nada, uma pasta de destino de store ou de código que já exista, exceto a pasta de código informada como gerada antes por um gerador de projeto.

#### Scenario: Dev recusa o resumo

- **WHEN** o dev responde não à confirmação
- **THEN** o script termina sem criar pastas, clonar ou registrar nada

#### Scenario: Pasta do projeto já existe

- **WHEN** a pasta `<base>/<id>-openspec` já existe
- **THEN** o script termina com código diferente de zero citando a pasta e não altera nada

### Requirement: Projeto novo pelo script

No modo projeto novo, o script SHALL perguntar o nome e o id do projeto, clonar a última release do padrão em `<base>/<id>-openspec`, criar a branch `main` nela, criar o repositório de código em `<base>/<id>` (ou usar a pasta gerada informada) e rodar o setup com o nome e o id. O script SHALL terminar mandando rodar o `/opsx:init` no repositório de código.

#### Scenario: Projeto novo completo

- **WHEN** existem as releases `v1.2.0` e `v1.3.0` e o dev escolhe projeto novo com o nome `Livraria Online` e o id `livraria-online`
- **THEN** o store fica em `<base>/livraria-online-openspec` na tag `v1.3.0`, na branch `main`; o código em `<base>/livraria-online` tem os comandos `/opsx:*` e `openspec/config.yaml` com `store: livraria-online`; e a mensagem final cita o `/opsx:init`

### Requirement: Projeto em andamento pelo script

No modo projeto em andamento, o script SHALL perguntar as URLs do código e do store, cloná-los na pasta base, ler o id na linha `store:` do `openspec/config.yaml` do código, registrar a pasta `padrao-openspec` do store com esse id e conferir que o CLI, rodado no código, resolve essa pasta. O script MUST NOT rodar o setup nem mandar rodar o `/opsx:init`.

#### Scenario: Dev entra num projeto configurado

- **WHEN** o dev escolhe projeto em andamento e informa as URLs de um código e de um store configurados
- **THEN** o OpenSpec CLI, rodado no código clonado, resolve a pasta `padrao-openspec` do store clonado, e a mensagem final manda começar pelo `/opsx:propose`

#### Scenario: Código sem declaração de store

- **WHEN** o código clonado não tem a linha `store:` em `openspec/config.yaml`
- **THEN** o script termina com código diferente de zero, diz que o projeto não está ligado a um store e o que pedir ao tech lead, sem registrar nada

### Requirement: Respostas por opção

Toda pergunta do script SHALL ter uma opção equivalente na linha de comando. Sem terminal interativo, uma resposta que falte SHALL fazer o script parar com a opção que a informa.

#### Scenario: Execução sem terminal

- **WHEN** o script roda com `--modo novo --pasta <dir> --nome "CI" --id ci --yes` sem terminal interativo
- **THEN** ele cria o projeto sem fazer perguntas

### Requirement: Guia começa pelo script

O `COMECE-AQUI.md` SHALL começar com um aviso para não clonar o padrão e com os comandos que baixam e rodam o script no Windows e no macOS/Linux, seguidos do que pedir ao tech lead em cada caso e de um exemplo de cada conversa. O passo a passo manual SHALL continuar no guia, numa seção "Sem o script".

#### Scenario: Dev que só tem o link

- **WHEN** um dev abre o `COMECE-AQUI.md`
- **THEN** antes de qualquer outra instrução ele encontra os dois comandos do script e o aviso de que não precisa clonar o padrão

#### Scenario: Dev que prefere os passos manuais

- **WHEN** o dev não quer ou não pode rodar o script
- **THEN** a seção "Sem o script" mostra os passos do projeto novo e do projeto em andamento, incluindo o registro da pasta `padrao-openspec` do store

### Requirement: Entrada pelo guia do projeto

O guia entregue ao repositório de código (`docs/openspec-padrao.md`) SHALL ter uma seção "Entrar neste projeto", antes de "Primeiros passos", com o comando do script no modo projeto em andamento e o link para o `COMECE-AQUI.md`.

#### Scenario: Dev chega pelo repositório de código

- **WHEN** um dev abre o `docs/openspec-padrao.md` de um projeto configurado
- **THEN** a primeira seção depois da introdução diz como baixar o script e rodá-lo no modo projeto em andamento

## MODIFIED Requirements

### Requirement: README aponta para o guia

O `README.md` da raiz SHALL apontar para o `COMECE-AQUI.md` antes de qualquer outra seção, mostrando os comandos do script de entrada, e todo exemplo de início de projeto no README MUST incluir o `/opsx:init` depois do setup. A orientação do README para quem clona um repositório de código já configurado MUST indicar o script no modo projeto em andamento e o registro da pasta `padrao-openspec` do store.

#### Scenario: Leitor do README no GitHub

- **WHEN** alguém abre o README do padrão no GitHub
- **THEN** a primeira orientação depois do título são os comandos do script e o link para o `COMECE-AQUI.md`

#### Scenario: Exemplo copiado do README

- **WHEN** o dev copia o exemplo de início de projeto do README
- **THEN** o exemplo inclui o `/opsx:init` depois do setup

#### Scenario: Leitor que vai entrar num projeto existente

- **WHEN** o leitor do README procura como trabalhar num projeto já configurado
- **THEN** o README indica o script no modo projeto em andamento e o caminho `padrao-openspec` do store para o registro manual

### Requirement: Guia protegido pela CI

A CI SHALL falhar quando o `COMECE-AQUI.md` não existir, quando o README não o linkar, quando o guia deixar de citar o `setup-project.mjs`, o `/opsx:init` ou o link de download do `comecar.mjs`, ou quando o guia do projeto perder a seção "Entrar neste projeto". A CI SHALL rodar o `comecar.mjs` nos modos projeto novo e projeto em andamento contra um repositório local com tag.

#### Scenario: Guia removido por engano

- **WHEN** um PR apaga o `COMECE-AQUI.md`
- **THEN** a CI falha no passo do guia de primeiros passos

#### Scenario: Script quebrado

- **WHEN** um PR faz o `comecar.mjs` deixar de registrar o store no modo projeto em andamento
- **THEN** a CI falha no smoke test do script
