# continuous-validation Specification

## Purpose

Define as validações automáticas que protegem este repositório em pull requests e na `main`, garantindo que a fonte única, os scripts e os artefatos OpenSpec continuem consistentes.

## Requirements

### Requirement: Execução da CI no repositório

O repositório SHALL ter um workflow em `.github/workflows/` da raiz que rode em todo pull request e em push na `main`. Nenhum workflow SHALL permanecer em `padrao-openspec/.github/workflows/`.

#### Scenario: Pull request aberto

- **WHEN** um pull request é aberto contra a `main`
- **THEN** o workflow de validação é executado pelo GitHub Actions

### Requirement: Validações do store

O workflow SHALL executar, dentro de `padrao-openspec/`, as validações existentes: `openspec validate --all --strict`, carga do config base sem avisos, lint de Markdown, sintaxe dos scripts e smoke tests do instalador e do setup. Os smoke tests SHALL cobrir a instalação dos comandos OPSX, o destino padrão `both` e a recusa da opção `--stack` pelo instalador e pelo setup.

#### Scenario: Comando ausente na instalação

- **WHEN** uma mudança faz o instalador deixar de copiar `init.md` para `.claude/commands/opsx/`
- **THEN** o smoke test do instalador falha

#### Scenario: Opção de stack aceita por engano

- **WHEN** uma mudança faz o setup voltar a aceitar `--stack`
- **THEN** o smoke test do setup falha

### Requirement: Validações da raiz

O workflow SHALL falhar quando a checagem do sync detectar divergência, quando `openspec validate --all --strict` falhar na raiz ou quando o lint de Markdown falhar nos documentos da raiz. Skills e comandos gerados pelo OpenSpec CLI SHALL ficar fora do lint.

#### Scenario: Raiz editada sem passar pela fonte

- **WHEN** um pull request altera `.claude/commands/opsx/init.md` da raiz sem alterar `padrao-openspec/.claude/commands/opsx/init.md`
- **THEN** o workflow falha no passo de checagem do sync

#### Scenario: Change inválida na raiz

- **WHEN** um pull request adiciona em `openspec/changes/` um requisito sem cenário
- **THEN** o workflow falha no passo de validação OpenSpec da raiz

### Requirement: Versão e changelog consistentes

O workflow de validação SHALL falhar quando o conteúdo de `padrao-openspec/VERSION` não for semver válido ou não for igual à primeira versão listada no `CHANGELOG.md`, ou quando essa seção não tiver "O que mudou" e "Ações no projeto".

#### Scenario: VERSION sem entrada no changelog

- **WHEN** um PR muda `VERSION` para `1.1.0` sem acrescentar a seção `1.1.0` ao CHANGELOG
- **THEN** o workflow falha no passo de versão

### Requirement: Smoke da atualização versionada

Os smoke tests do instalador SHALL cobrir o manifesto da primeira instalação, a recusa de reinstalação com mudanças sem modo, o `--update` num repositório limpo e a recusa do `--update` com alterações pendentes.

#### Scenario: Instalador volta a sujar a branch atual

- **WHEN** uma mudança faz a reinstalação com mudanças gravar arquivos sem `--update` nem `--in-place`
- **THEN** o smoke test do instalador falha

### Requirement: Validações do store também no Windows

As validações do store SHALL rodar em Linux e em Windows a cada pull request, e uma falha em qualquer um dos dois sistemas SHALL reprovar a CI. No Windows, a CI SHALL rodar o script de entrada nos dois modos com a pasta base em letra de drive minúscula e conferir que o OpenSpec CLI resolve o store a partir do código.

#### Scenario: Defeito só no Windows

- **WHEN** uma mudança faz um script falhar só no Windows (por exemplo, comparando caminhos com diferença de caixa na letra do drive)
- **THEN** a execução do job de validação do store no Windows falha e o pull request fica reprovado, mesmo com a execução no Linux passando

#### Scenario: Drive em minúscula

- **WHEN** o script de entrada roda no Windows com `--pasta` em letra minúscula, nos modos projeto novo e projeto em andamento
- **THEN** os dois modos terminam com código zero, e o CLI rodado no código resolve a pasta `padrao-openspec` do store

#### Scenario: Defeito só no Linux

- **WHEN** uma mudança faz um passo falhar só no Linux (por exemplo, um commit sem identidade Git configurada)
- **THEN** a execução no Linux falha e o pull request fica reprovado, mesmo com a execução no Windows passando

### Requirement: Release com o script de entrada anexado

O repositório SHALL ter um workflow que roda quando uma release é publicada e garante que ela tem o `comecar.mjs` anexado, anexando o arquivo da própria tag quando ele faltar e falhando se o anexo continuar ausente.

#### Scenario: Release publicada sem o anexo

- **WHEN** uma release `vX.Y.Z` é publicada sem o `comecar.mjs`
- **THEN** o workflow anexa o `padrao-openspec/scripts/comecar.mjs` da tag `vX.Y.Z`, e a release passa a tê-lo

### Requirement: Portão testado na CI

A CI SHALL testar o portão contra um store registrado: aprovação pendente e completa no `apply`; tarefas pendentes, falta de `verification.md`, falta de `review.md` numa change de código e change pronta no `archive`; e o hook recusando um commit de change não aprovada.

#### Scenario: Portão que deixa passar aprovação pendente

- **WHEN** uma mudança faz o portão liberar `apply` com `Responsável: Pendente`
- **THEN** o smoke test do portão falha
