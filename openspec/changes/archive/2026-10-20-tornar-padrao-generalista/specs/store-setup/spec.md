# Spec Delta

## ADDED Requirements

### Requirement: Setup sem preset de stack

O setup SHALL deixar `openspec/project.md` e `openspec/config.yaml` do store com o conteúdo neutro, alterando apenas o marcador `{{Nome do Projeto}}` quando o nome for informado. O setup SHALL recusar a opção `--stack` antes de alterar qualquer arquivo, com uma mensagem que oriente a definir a stack pelo `/opsx:init`.

#### Scenario: Setup com nome do projeto

- **WHEN** o setup roda com `--name "Livraria"` num store recém-clonado
- **THEN** o `project.md` do store troca `{{Nome do Projeto}}` por `Livraria` e continua igual ao neutro no resto, e o `config.yaml` não muda

#### Scenario: Automação antiga com --stack

- **WHEN** o setup roda com `--stack nextjs`
- **THEN** ele termina com código diferente de zero antes de instalar skills, a mensagem cita o `/opsx:init`, e nenhum arquivo do store ou do repositório de código é alterado

## REMOVED Requirements

### Requirement: Backup apenas de arquivos editados

**Reason**: O backup protegia `project.md` e `config.yaml` quando o setup os substituía por um preset. Sem presets (ADR-0003), o setup não substitui esses arquivos.

**Migration**: Nenhuma. O setup só troca o marcador do nome do projeto, e só quando ele ainda está presente.
