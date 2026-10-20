# Spec Delta

## ADDED Requirements

### Requirement: Manifesto da versão instalada

Ao instalar, o instalador SHALL gravar `.openspec-padrao.json` na raiz do repositório de código, com a versão do padrão, o commit e o repositório de origem quando disponíveis, o destino das skills, a data e a lista de arquivos que ele gerencia.

#### Scenario: Primeira instalação

- **WHEN** o instalador roda num repositório git vazio a partir do padrão `1.0.0`
- **THEN** o repositório passa a ter `.openspec-padrao.json` com a versão `1.0.0`, o destino `both` e a lista dos arquivos instalados

### Requirement: Reinstalação só com modo explícito

Quando uma reinstalação mudaria arquivos já gerenciados no repositório de código, o instalador SHALL exigir `--update` ou `--in-place` e, sem nenhum dos dois, MUST terminar com erro antes de alterar qualquer arquivo. Uma primeira instalação e uma reinstalação sem nenhuma mudança MUST continuar funcionando sem flag.

#### Scenario: Reinstalação com mudanças, sem modo

- **WHEN** o projeto tem skills de uma versão anterior e o instalador roda sem `--update` nem `--in-place`
- **THEN** o instalador termina com erro citando os dois modos, e nenhum arquivo muda

#### Scenario: Reinstalação sem mudanças

- **WHEN** o instalador roda duas vezes seguidas da mesma versão
- **THEN** a segunda execução termina com sucesso e informa que nada mudou

### Requirement: Modo de atualização em branch própria

Com `--update`, o instalador SHALL exigir que o repositório de código não tenha alterações não commitadas, criar a branch `chore/padrao-vX.Y.Z` a partir da branch atual, instalar, atualizar o manifesto e commitar só os arquivos gerenciados, com a mensagem `chore: atualiza padrão OpenSpec para vX.Y.Z`. Com alterações não commitadas, MUST terminar com erro sem alterar nada.

#### Scenario: Atualização num repositório limpo

- **WHEN** o instalador roda com `--update` num repositório limpo na branch `main`
- **THEN** existe a branch `chore/padrao-vX.Y.Z` com um commit da atualização, e a `main` não muda

#### Scenario: Repositório com alterações pendentes

- **WHEN** o instalador roda com `--update` e há um arquivo alterado sem commit
- **THEN** o instalador termina com erro, cita as alterações pendentes, e nenhum arquivo nem branch muda

### Requirement: Workflow e documentação de atualização distribuídos

O instalador SHALL entregar ao repositório de código o workflow de atualização do padrão em `.github/workflows/` e o guia `docs/openspec-padrao.md`, com a versão instalada, como atualizar, o que o workflow faz e a permissão de Actions que ele exige. Os dois arquivos MUST entrar na lista de arquivos gerenciados do manifesto.

#### Scenario: Projeto novo pelo setup

- **WHEN** o setup roda para um projeto novo
- **THEN** o repositório de código já tem o workflow de atualização, o guia e o manifesto, sem passo manual
