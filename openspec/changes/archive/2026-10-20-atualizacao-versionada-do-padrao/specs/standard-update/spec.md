# Spec Delta

## Purpose

Avisa o projeto quando existe uma versão nova do padrão e entrega a atualização como um pull request revisável, sem sujar a branch de ninguém e sem exigir que o padrão tenha acesso aos projetos.

## ADDED Requirements

### Requirement: Workflow de atualização por PR

O projeto SHALL receber um workflow que roda toda semana e sob demanda, lê a versão instalada no manifesto, consulta a última release pública do padrão e, quando ela for mais nova, abre um pull request numa branch `chore/padrao-vX.Y.Z` com a atualização instalada pelo modo `--update`. Quando a versão instalada já for a última, o workflow MUST terminar sem criar branch nem PR.

#### Scenario: Versão nova disponível

- **WHEN** o manifesto registra `1.0.0` e a última release do padrão é `v1.1.0`
- **THEN** o workflow abre um PR da branch `chore/padrao-v1.1.0` com os arquivos atualizados e o manifesto em `1.1.0`

#### Scenario: Projeto em dia

- **WHEN** o manifesto registra a mesma versão da última release
- **THEN** o workflow termina com sucesso sem criar branch nem PR

#### Scenario: PR já aberto para a versão

- **WHEN** já existe um PR aberto da branch `chore/padrao-v1.1.0`
- **THEN** o workflow não abre outro PR

### Requirement: Conteúdo do PR de atualização

A descrição do PR de atualização SHALL trazer a versão de origem e a de destino, as seções do CHANGELOG entre elas e, em destaque, a lista de "Ações no projeto" de todas essas versões.

#### Scenario: Ação manual pendente

- **WHEN** a versão `1.1.0` traz em "Ações no projeto" um passo no `project.md` do store
- **THEN** a descrição do PR mostra esse passo na lista de ações, antes do changelog

### Requirement: Aviso de versão nos comandos do ciclo

Os comandos e skills de propose, apply, verify e archive SHALL, no início, comparar a versão do manifesto do repositório de código com a última tag do padrão e, se a instalada for mais antiga, mostrar uma linha "há atualização do padrão: vA → vB". Sem manifesto, sem rede ou com erro na consulta, MUST seguir sem aviso e sem falhar.

#### Scenario: Atualização disponível

- **WHEN** o usuário roda `/opsx:apply` num projeto com manifesto `1.0.0` e a última tag do padrão é `v1.2.0`
- **THEN** o agente mostra "há atualização do padrão: v1.0.0 → v1.2.0" e continua o apply

#### Scenario: Sem rede

- **WHEN** a consulta das tags falha por falta de rede
- **THEN** o agente segue o comando sem aviso e sem erro
