# agent-context-discipline Specification

## Purpose

Define como os agentes que operam no padrão e nos stores consumidores economizam contexto sem comprometer o fluxo OpenSpec: o que é sempre lido por inteiro, o que pode ser filtrado e que evidência acompanha cada verificação.

## Requirements

### Requirement: Leitura integral dos artefatos de governança

Antes de planejar, implementar ou verificar, o agente MUST ler por inteiro, sem resumo nem leitura parcial: as regras do projeto, `config.yaml`, `project.md`, as ADRs `Accepted` relevantes, todos os artefatos da change ativa e as specs principais que a change afeta.

#### Scenario: Apply de uma change

- **WHEN** o agente inicia `/opsx:apply` em uma change com proposal, specs, design e tasks
- **THEN** ele lê os quatro artefatos por inteiro antes de editar código, mesmo que algum seja longo

#### Scenario: Pedido de economia pelo usuário

- **WHEN** o usuário pede ao agente para economizar tokens durante uma change
- **THEN** o agente continua lendo os artefatos de governança por inteiro e aplica a economia apenas a saídas volumosas e explorações

### Requirement: Filtro de saídas volumosas

O agente SHOULD filtrar saídas volumosas antes de lê-las (logs, saídas de build e de testes, JSON e CSV grandes), com busca, recorte do início ou do fim, ou extração de campos. O filtro MUST NOT ser aplicado aos artefatos de governança.

#### Scenario: Log de build extenso

- **WHEN** um build gera milhares de linhas de saída
- **THEN** o agente lê o código de saída e as linhas de erro ou do final da saída, em vez do log inteiro

### Requirement: Evidência de verificação

Toda verificação reportada MUST trazer o comando executado e o resultado relevante (código de saída e linhas de falha ou de resumo). Uma verificação sem saída MUST ser reportada como não verificada, nunca como aprovada.

#### Scenario: Teste não executado

- **WHEN** o agente não executou o comando de teste de uma tarefa
- **THEN** ele não marca a tarefa como concluída e reporta o teste como não verificado

#### Scenario: Teste executado

- **WHEN** o agente executa o comando de teste de uma tarefa e ele passa
- **THEN** o relatório inclui o comando e a linha de resumo da saída

### Requirement: Exploração começa por busca

Em explorações amplas do código, o agente SHOULD localizar os arquivos relevantes por busca (por nome ou conteúdo) ou por um subagente de exploração antes de abrir arquivos inteiros. Antes de alterar um trecho de código, o agente MUST lê-lo por inteiro.

#### Scenario: Localizar onde uma regra é aplicada

- **WHEN** o agente precisa encontrar onde uma regra de negócio é implementada em um repositório grande
- **THEN** ele busca por termos da regra antes de ler arquivos inteiros, e lê por inteiro os trechos que vai alterar

### Requirement: Escolha de modelo

A escolha do modelo de IA MUST permanecer com o usuário; as regras do projeto MUST NOT instruir o agente a trocar de modelo.

#### Scenario: Tarefa longa

- **WHEN** uma tarefa consome muito contexto
- **THEN** o agente pode sugerir ao usuário uma troca de modelo, mas não condiciona o trabalho a ela

### Requirement: Contagens vindas do CLI ou de lista

Toda contagem que o agente anunciar ao usuário (tarefas, achados, arquivos, itens) SHALL vir do OpenSpec CLI (por exemplo, `progress.total`) ou de uma lista montada na mesma resposta, e MUST NOT ser estimada de memória.

#### Scenario: Total de tarefas

- **WHEN** o agente informa quantas tarefas a change tem
- **THEN** o número é o `progress.total` das instruções de apply, e não uma estimativa

### Requirement: Precedência entre documentos

As regras do padrão e o modelo de `project.md` SHALL definir a ordem de precedência entre documentos num conflito: contrato de interface, specs principais, arquitetura (`arquitetura.md` e `project.md`), ADRs `Accepted` e, por último, o código. Código que diverge de um documento MUST convergir para ele, a menos que a divergência esteja declarada no registro de lacunas. O projeto MAY ajustar a ordem no próprio `project.md`, que então prevalece.

#### Scenario: Código diverge de uma spec

- **WHEN** o agente encontra no código um comportamento diferente do que a spec principal descreve e a divergência não está declarada
- **THEN** ele trata o código como o que precisa mudar e reporta a divergência, em vez de alterar a spec para combinar com o código

#### Scenario: Ordem própria do projeto

- **WHEN** o `project.md` do projeto põe as ADRs antes da arquitetura na precedência
- **THEN** o agente segue a ordem do `project.md`

### Requirement: Divergência entre documentos

Uma divergência entre o contrato de interface e as specs principais MUST ser reportada ao responsável, e o agente MUST NOT escolher sozinho qual dos dois seguir. Uma divergência entre outros documentos MUST ser reportada, e o trabalho em curso segue o de maior precedência.

#### Scenario: Contrato e spec divergem

- **WHEN** o contrato de interface declara um campo obrigatório que a spec principal descreve como opcional
- **THEN** o agente para, mostra a divergência ao responsável e não implementa nenhuma das duas versões até a decisão

#### Scenario: Divergência entre arquitetura e ADR

- **WHEN** o `arquitetura.md` descreve uma fila em Redis e a ADR `Accepted` de filas escolheu uma tabela no banco
- **THEN** o agente reporta a divergência e segue o `arquitetura.md`, que tem maior precedência, até o responsável corrigir um dos dois
