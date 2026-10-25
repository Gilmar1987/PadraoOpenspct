# Spec Delta

## MODIFIED Requirements

### Requirement: Commit inicial em pasta de código com histórico

Quando o script de entrada instala o padrão numa pasta de código que já tem histórico, o commit inicial SHALL incluir todos os arquivos que o padrão escreveu nela, inclusive o `.gitattributes` com o bloco do padrão e o `.claude/settings.json` com as entradas do padrão, e MUST NOT incluir outro trabalho da pasta. Depois do commit, a árvore SHALL ficar limpa, salvo os arquivos que já tinham edições do projeto antes do setup.

#### Scenario: Pasta de gerador com um commit

- **WHEN** o dev informa uma pasta criada por um gerador, já com um commit, e aceita o commit inicial
- **THEN** o código fica com dois commits, o `.gitattributes` e o `.claude/settings.json` estão versionados e o `git status` fica vazio

## ADDED Requirements

### Requirement: Edições do projeto fora do commit inicial

Quando um arquivo que o padrão escreve já tinha edições não commitadas do projeto antes do setup, o commit inicial do script de entrada MUST NOT incluí-lo. O script SHALL commitar os outros arquivos do padrão e, no fim, SHALL listar os arquivos deixados de fora e mostrar o comando para commitá-los depois da revisão.

#### Scenario: CLAUDE.md com edição do dev

- **WHEN** a pasta do gerador tem um commit e um `CLAUDE.md` com uma linha do dev ainda não commitada, e o dev aceita o commit inicial
- **THEN** o commit inicial não inclui o `CLAUDE.md`, inclui os outros arquivos do padrão, e a mensagem final lista o `CLAUDE.md` com o comando para commitá-lo

#### Scenario: Sem edições anteriores

- **WHEN** a pasta do gerador tem um commit e nenhum arquivo modificado
- **THEN** o commit inicial inclui todos os arquivos do padrão, e a árvore fica limpa
