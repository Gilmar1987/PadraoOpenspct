## ADDED Requirements

### Requirement: Troca das entradas de gancho na forma antiga

Quando o `.claude/settings.json` do código tiver entradas de gancho do padrão na forma antiga (`"command": "node"` com o caminho em `args`), o instalador com `--update` ou `--in-place` SHALL trocá-las pelas entradas do template, na forma de comando único, e MUST NOT deixar a entrada antiga e a nova lado a lado. As entradas do projeto MUST NOT mudar.

#### Scenario: Atualização de um projeto da v1.18.0

- **WHEN** o projeto tem as entradas de gancho da v1.18.0, com `args`, e um hook próprio, e o instalador roda com `--update`
- **THEN** cada gancho do padrão aparece uma vez, sem `args`, e o hook do projeto continua igual

#### Scenario: Reinstalação sem modo

- **WHEN** o projeto tem as entradas da v1.18.0 e o instalador roda sem `--update` nem `--in-place`
- **THEN** o instalador termina com erro citando `--update` e `--in-place`, e o `settings.json` não muda
