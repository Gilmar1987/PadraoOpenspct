# Spec Delta

## ADDED Requirements

### Requirement: Backup apenas de arquivos editados

Antes de substituir `openspec/project.md` e `openspec/config.yaml` pelo preset, o setup SHALL criar backup `.bak` somente quando o arquivo difere da versão commitada desse mesmo arquivo e de todos os presets. Isso MUST valer quando o store é a raiz do repositório git e quando é uma subpasta dele.

#### Scenario: Store como subpasta de um repositório

- **WHEN** o setup roda num clone do PadraoOpenspct, com o store em `padrao-openspec/` e `project.md` e `config.yaml` iguais aos commitados
- **THEN** o preset é aplicado e nenhum arquivo `.bak` é criado em `padrao-openspec/openspec/`

#### Scenario: Arquivo editado localmente

- **WHEN** o `config.yaml` do store tem uma edição local não commitada, diferente de todos os presets, e o setup roda com `--force`
- **THEN** o setup cria um `.bak` do `config.yaml` antes de aplicar o preset
