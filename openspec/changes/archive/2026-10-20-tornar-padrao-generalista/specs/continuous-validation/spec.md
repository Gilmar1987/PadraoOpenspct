# Spec Delta

## MODIFIED Requirements

### Requirement: Validações do store

O workflow SHALL executar, dentro de `padrao-openspec/`, as validações existentes: `openspec validate --all --strict`, carga do config base sem avisos, lint de Markdown, sintaxe dos scripts e smoke tests do instalador e do setup. Os smoke tests SHALL cobrir a instalação dos comandos OPSX, o destino padrão `both` e a recusa da opção `--stack` pelo instalador e pelo setup.

#### Scenario: Comando ausente na instalação

- **WHEN** uma mudança faz o instalador deixar de copiar `init.md` para `.claude/commands/opsx/`
- **THEN** o smoke test do instalador falha

#### Scenario: Opção de stack aceita por engano

- **WHEN** uma mudança faz o setup voltar a aceitar `--stack`
- **THEN** o smoke test do setup falha
