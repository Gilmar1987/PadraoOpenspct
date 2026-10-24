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
