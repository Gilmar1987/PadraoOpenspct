# Spec Delta

## ADDED Requirements

### Requirement: Portão entregue ao código

O instalador SHALL entregar o portão como o arquivo gerenciado `docs/openspec-portao.mjs`, listado em `managedFiles`. O bloco `openspec-padrao` dos arquivos de instrução dos agentes SHALL dizer que os comandos `/opsx:*` são fluxos do agente e não comandos do OpenSpec CLI, que `openspec archive` não deve ser rodado direto, que o portão roda antes de escrever código e antes de arquivar, e que `--store <id>` resolve o store quando a pasta não o declara.

#### Scenario: Projeto instalado

- **WHEN** o setup instala o padrão num repositório de código
- **THEN** o código tem `docs/openspec-portao.mjs`, e o `AGENTS.md` traz as orientações sobre o CLI, o portão e o `--store`

### Requirement: Hook de commit opcional

O portão SHALL oferecer o subcomando `instalar-hook`, que instala no repositório de código um hook `commit-msg` que recusa um commit cuja mensagem tenha `OpenSpec-Change: <change>` quando o portão de apply dessa change não liberar. O instalador MUST NOT instalar o hook por conta própria.

#### Scenario: Commit de change não aprovada

- **WHEN** o hook está instalado e um commit traz `OpenSpec-Change: x` para uma change com aprovação pendente
- **THEN** o commit é recusado com o motivo do portão
