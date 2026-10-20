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
