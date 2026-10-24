# Spec Delta

## MODIFIED Requirements

### Requirement: Escopos de aprovação

O campo Escopo SHALL aceitar dois valores, que limitam até onde a change pode ir: `apply` permite implementar as tarefas; `archive` permite também verificar e arquivar, desde que as condições listadas no campo Condições sejam atendidas. Com qualquer escopo, o agente MUST NOT começar uma etapa sozinho. Se uma condição falhar, o agente MUST parar e informar o usuário.

#### Scenario: Autorização prévia com condições

- **WHEN** o proposal registra Escopo `archive` com a condição "openspec validate --all --strict passa", a validação passa e o apply termina com todas as tarefas marcadas
- **THEN** o agente para e mostra a aprovação sugerida e o comando do verify, sem começar o verify

#### Scenario: Condição não atendida

- **WHEN** o proposal registra Escopo `archive` e o verify encontra um problema crítico
- **THEN** o agente para antes do archive e reporta o problema ao usuário

## ADDED Requirements

### Requirement: Aprovação e comando em cada etapa

Cada etapa com comando (`/opsx:propose`, `/opsx:apply`, `/opsx:verify`, `/opsx:archive` e `/opsx:update`) SHALL começar só quando o responsável escrever a aprovação daquela etapa, no formato sugerido "Eu aprovo fazer <descrição>", e digitar o comando. O agente MUST NOT começar uma etapa só com a aprovação, nem só com o comando.

#### Scenario: Aprovação sem comando

- **WHEN** o responsável escreve "Eu aprovo fazer o verify da change" e não digita o comando
- **THEN** o agente confirma a aprovação, mostra o comando a digitar e não começa o verify

#### Scenario: Comando sem aprovação

- **WHEN** o responsável digita `/opsx:archive` sem ter escrito a aprovação do archive
- **THEN** o agente descreve o que o archive vai fazer, propõe o texto da aprovação e espera

### Requirement: Próximo passo com aprovação e comando

Ao fim de cada etapa, o fluxo SHALL parar e mostrar o próximo passo em três partes: o que a próxima etapa vai fazer, em uma linha; a aprovação sugerida; e o comando a digitar. O propose MUST NOT começar o apply no mesmo turno, mesmo quando o pedido autoriza ir até o archive.

#### Scenario: Fim do propose

- **WHEN** o propose termina os artefatos de uma change cujo pedido autorizou ir até o archive
- **THEN** o agente registra a autorização em `## Aprovação`, para e mostra a aprovação sugerida e o `/opsx:apply`

#### Scenario: Ação sem comando

- **WHEN** o archive termina e a aprovação tem a condição "com PR"
- **THEN** o agente mostra o que o PR vai incluir e abre o PR só depois de um pedido explícito ou da confirmação de que a condição registrada vale

### Requirement: Aprovação da etapa como confirmação

A aprovação escrita de uma etapa, citada, SHALL valer como a confirmação que o fluxo pede nela: no apply, a aprovação de uma change Pendente; no archive com Escopo `apply`, o item `Archive:`. A aprovação do propose autoriza só o planejamento e MUST NOT preencher `## Aprovação`. A reconfirmação do selo MUST continuar pedindo a confirmação depois de o agente mostrar o que mudou. O verify SHALL rodar com qualquer escopo.

#### Scenario: Archive com escopo apply

- **WHEN** a change tem Escopo `apply` e o responsável escreve "Eu aprovo fazer o archive" e digita `/opsx:archive`
- **THEN** o archive registra o item `Archive:` citando essa aprovação, sem pedir outra confirmação

#### Scenario: Verify com escopo apply

- **WHEN** a change tem Escopo `apply` e o responsável aprova e digita `/opsx:verify`
- **THEN** o verify roda

#### Scenario: Selo vencido

- **WHEN** o portão diz que a aprovação venceu e o responsável escreveu "Eu aprovo fazer o apply"
- **THEN** o agente mostra o que mudou no planejamento e pede a confirmação antes de registrar a reconfirmação

### Requirement: Etapa pedida pelo nome fora do Claude Code

Num agente sem os comandos `/opsx:*`, o equivalente ao comando SHALL ser o dev pedir a etapa pelo nome, e o agente SHALL seguir o arquivo `.claude/commands/opsx/<etapa>.md`. A ativação de uma skill ou de um fluxo pelo próprio agente MUST NOT valer como o comando.

#### Scenario: Agente sem comandos

- **WHEN** o dev escreve a aprovação do verify e "rode o verify" num agente sem `/opsx:*`
- **THEN** o agente segue o `verify.md` e, ao fim, mostra a aprovação e o pedido da próxima etapa

#### Scenario: Skill ativada pelo modelo

- **WHEN** o dev escreve só a aprovação do apply e o modelo ativa a skill do apply por conta própria
- **THEN** o agente não começa o apply e mostra o comando a digitar
