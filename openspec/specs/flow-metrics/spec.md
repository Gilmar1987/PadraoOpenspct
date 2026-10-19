# flow-metrics Specification

## Purpose

Mede de forma passiva o fluxo das changes OpenSpec (tempo de entrega, vazão, retrabalho e qualidade) a partir de dados que o padrão e o Git já registram, sem dados declarados pelo agente e sem alterar nenhum artefato.

## Requirements

### Requirement: Somente leitura

O script de métricas MUST NOT criar, alterar ou remover arquivos no store ou nos repositórios de código. Ele SHALL escrever apenas os arquivos de saída, no diretório indicado por `--out`, ou no diretório atual quando a opção for omitida.

#### Scenario: Execução sobre um store com changes

- **WHEN** o script roda sobre um store com changes ativas e arquivadas
- **THEN** `git status` do store e dos repositórios de código continua igual ao de antes da execução, e só `metrics.csv` e `resumo.md` são criados no diretório de saída

### Requirement: Marcos de tempo por change

Para cada change, ativa ou arquivada, o script SHALL registrar a data de criação (`created` do `.openspec.yaml`), a data de aprovação (campo Data da seção `## Aprovação`, quando preenchido) e a data do archive (prefixo `AAAA-MM-DD` da pasta em `changes/archive/`). Ele SHALL calcular em dias o tempo até a aprovação, o tempo de execução e o lead time. Um marco ausente MUST aparecer vazio, nunca como zero.

#### Scenario: Change arquivada com aprovação

- **WHEN** uma change foi criada em 2026-10-01, aprovada em 2026-10-03 e arquivada em 2026-10-08
- **THEN** a linha da change tem espera até aprovação 2, execução 5 e lead time 7

#### Scenario: Change sem seção de aprovação

- **WHEN** uma change arquivada não tem a seção `## Aprovação`
- **THEN** as colunas de aprovação e de espera ficam vazias e o lead time é calculado entre criação e archive

### Requirement: Vazão por período

O `resumo.md` SHALL informar quantas changes foram arquivadas por semana ISO e por mês, além da mediana do lead time no período.

#### Scenario: Três changes no mesmo mês

- **WHEN** três changes foram arquivadas em outubro de 2026, com lead times de 2, 5 e 9 dias
- **THEN** o resumo mostra 3 changes em 2026-10 e mediana de 5 dias

### Requirement: Retrabalho

Com repositórios de código informados por `--code`, o script SHALL contar, para cada change arquivada, os commits do tipo `fix` com o trailer `OpenSpec-Change` dessa change e data posterior à do archive. Sem `--code`, ou sem nenhum commit com trailer, a coluna de retrabalho MUST ficar vazia.

#### Scenario: Correção depois do archive

- **WHEN** a change `add-catalogo` foi arquivada em 2026-10-08 e um commit `fix: corrige ordenação` de 2026-10-10 tem o trailer `OpenSpec-Change: add-catalogo`
- **THEN** a coluna de retrabalho de `add-catalogo` é 1

#### Scenario: Repositório sem a convenção

- **WHEN** nenhum commit do repositório de código tem o trailer `OpenSpec-Change`
- **THEN** a coluna de retrabalho fica vazia e o resumo avisa que a convenção não foi encontrada

### Requirement: Qualidade da verificação

Para cada change com `verification.md`, o script SHALL registrar as contagens de críticos, warnings, sugestões e checagens não verificadas da última verificação gravada. Com `--ci`, ele SHALL registrar quantas execuções da CI falharam no pull request da change antes da primeira bem-sucedida. Sem `gh` disponível, as colunas de CI MUST ficar vazias, e o resumo MUST dizer que a CI não foi coletada.

#### Scenario: Change verificada

- **WHEN** o `verification.md` de uma change registra 0 críticos, 2 warnings e 1 sugestão
- **THEN** a linha da change tem críticos 0, warnings 2 e sugestões 1

#### Scenario: CI solicitada sem gh

- **WHEN** o script roda com `--ci` numa máquina sem o `gh` autenticado
- **THEN** o CSV é gerado com as colunas de CI vazias e o resumo informa que a CI não foi coletada

### Requirement: Sem dados pessoais

O CSV e o resumo MUST NOT conter nomes, e-mails ou qualquer identificador de pessoa, e o script MUST NOT ler o autor dos commits.

#### Scenario: Histórico com vários autores

- **WHEN** o store e o repositório de código têm commits de vários autores
- **THEN** nenhum nome ou e-mail aparece no `metrics.csv` nem no `resumo.md`
