# Spec Delta

## ADDED Requirements

### Requirement: Commit inicial em pasta de código com histórico

Quando o script de entrada instala o padrão numa pasta de código que já tem histórico, o commit inicial SHALL incluir todos os arquivos que o padrão escreveu nela, inclusive o `.gitattributes` com o bloco do padrão e o `.claude/settings.json` com as entradas do padrão, e MUST NOT incluir outro trabalho da pasta. Depois do commit, a árvore SHALL ficar limpa.

#### Scenario: Pasta de gerador com um commit

- **WHEN** o dev informa uma pasta criada por um gerador, já com um commit, e aceita o commit inicial
- **THEN** o código fica com dois commits, o `.gitattributes` e o `.claude/settings.json` estão versionados e o `git status` fica vazio
