# Spec Delta

## MODIFIED Requirements

### Requirement: Aviso de versão nos comandos do ciclo

Os comandos e skills de propose, apply, verify e archive SHALL, no início, comparar a versão do manifesto do repositório de código com a última tag do padrão e, se a instalada for mais antiga, mostrar uma linha "há atualização do padrão: vA → vB". Quando o repositório de código não tiver remoto, ou quando o usuário pedir, SHALL oferecer a atualização à mão na versão nova e só executá-la com a confirmação explícita do usuário e a árvore limpa. Sem manifesto, sem rede ou com erro na consulta, MUST seguir sem aviso e sem falhar.

#### Scenario: Atualização disponível

- **WHEN** o usuário roda `/opsx:apply` num projeto com manifesto `1.0.0` e a última tag do padrão é `v1.2.0`
- **THEN** o agente mostra "há atualização do padrão: v1.0.0 → v1.2.0" e continua o apply

#### Scenario: Sem rede

- **WHEN** a consulta das tags falha por falta de rede
- **THEN** o agente segue o comando sem aviso e sem erro

#### Scenario: Projeto sem remoto

- **WHEN** o usuário roda `/opsx:propose` num repositório de código sem remoto, com manifesto `1.3.0`, e a última tag é `v1.5.0`
- **THEN** o agente mostra o aviso, oferece atualizar com os comandos do "Atualizar à mão" na `v1.5.0` e não roda nada sem a confirmação do usuário

#### Scenario: Usuário aceita com a árvore suja

- **WHEN** o usuário aceita a atualização, mas o repositório de código tem mudanças não commitadas
- **THEN** o agente não atualiza, explica que o `--update` exige a árvore limpa e continua o comando
