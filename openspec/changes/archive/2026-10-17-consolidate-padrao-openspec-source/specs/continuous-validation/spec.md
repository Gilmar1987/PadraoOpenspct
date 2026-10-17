# Spec Delta

## Purpose

Define as validações automáticas que protegem este repositório em pull requests e na `main`, garantindo que a fonte única, os scripts e os artefatos OpenSpec continuem consistentes.

## ADDED Requirements

### Requirement: Execução da CI no repositório

O repositório SHALL ter um workflow em `.github/workflows/` da raiz que rode em todo pull request e em push na `main`. Nenhum workflow SHALL permanecer em `padrao-openspec/.github/workflows/`.

#### Scenario: Pull request aberto

- **WHEN** um pull request é aberto contra a `main`
- **THEN** o workflow de validação é executado pelo GitHub Actions

### Requirement: Validações do store

O workflow SHALL executar, dentro de `padrao-openspec/`, as validações existentes: `openspec validate --all --strict`, carga do config base e dos presets sem avisos, lint de Markdown, sintaxe dos scripts e smoke tests do instalador e do setup. Os smoke tests SHALL cobrir a instalação dos comandos OPSX e o destino padrão `both`.

#### Scenario: Comando ausente na instalação

- **WHEN** uma mudança faz o instalador deixar de copiar `init.md` para `.claude/commands/opsx/`
- **THEN** o smoke test do instalador falha

### Requirement: Validações da raiz

O workflow SHALL falhar quando a checagem do sync detectar divergência, quando `openspec validate --all --strict` falhar na raiz ou quando o lint de Markdown falhar nos documentos da raiz. Skills e comandos gerados pelo OpenSpec CLI SHALL ficar fora do lint.

#### Scenario: Raiz editada sem passar pela fonte

- **WHEN** um pull request altera `.claude/commands/opsx/init.md` da raiz sem alterar `padrao-openspec/.claude/commands/opsx/init.md`
- **THEN** o workflow falha no passo de checagem do sync

#### Scenario: Change inválida na raiz

- **WHEN** um pull request adiciona em `openspec/changes/` um requisito sem cenário
- **THEN** o workflow falha no passo de validação OpenSpec da raiz
