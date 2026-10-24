# Design

## Context

- Os seis fluxos que selecionam uma change (`propose`, `apply`, `verify`, `archive`, `update` e `sync`) existem como comando (`commands/opsx/*.md`) e como skill (`skills/openspec-*/SKILL.md`), gerados pelo OpenSpec CLI 1.14.2 e com trechos próprios do padrão conferidos pela CI.
- Cinco deles têm, no passo 1, o anúncio `Always announce: "Using change: <name>" and how to override`. Apply e archive têm modelos de saída com `**Change:** <change-name>`, e o propose lista "Change name and location" no resumo.
- O passo 1 de cada fluxo já infere a change pelo contexto, seleciona a única ativa ou pergunta quando há ambiguidade. Por isso o comando sem argumento funciona.
- As regras chegam aos projetos pelo `rules.md` (fonte em `padrao-openspec/openspec/rules.md`) e pelos blocos gerenciados (ADR-0005).

## Architecture Decisions

Não há ADR nova: é uma regra de comunicação nos fluxos existentes. A change segue a [ADR-0005](../../adrs/0005-regras-entregues-por-blocos-gerenciados.md) (a regra chega pelo `rules.md`) e a [ADR-0004](../../adrs/0004-distribuicao-versionada-do-padrao.md) (versão e CHANGELOG).

## Goals / Non-Goals

**Goals:**

- O dev lê o que foi feito sem precisar decifrar o nome da change.
- O próximo passo é um comando que se digita como está.

**Non-Goals:**

- Mudar o identificador técnico (pasta, trailer, argumento aceito).

## Decisions

### D1. Regra no `rules.md`

Item novo no fim da lista da seção 3:

```text
- Ao citar uma change para o usuário, descreva em uma linha o que ela entrega. O nome da
  change só aparece quando for indispensável (por exemplo, para escolher entre duas changes
  ativas). O próximo passo é indicado pelo comando sem o nome, como `/opsx:verify`: o
  comando descobre a change pelo contexto ou pergunta qual é.
```

### D2. Trecho "Describe the delivery" nos seis fluxos

**Anúncio.** Nos cinco fluxos que o têm, a frase `Always announce: "Using change: <name>" and how to override (e.g., /opsx:<fluxo> <other>).` passa a ser:

```text
**Describe the delivery**: always announce the selected change by what it delivers, in one line (for example, "Entrega: adds `.gitattributes` to the code repository and binds Docker ports to 127.0.0.1"). Show the change name only when it is needed to tell two active changes apart, or when the user asks for it. When asking the user to pick a change, list each one with its one-line delivery and its name. To work on another change, the user names it or passes its name to the command. When you point to the next step, show the command alone, without the change name (for example, `/opsx:verify`).
```

O propose não tem anúncio. Nele, o trecho entra no "Output", logo depois do "Prompt:", com texto próprio: "describe the new change by what it delivers, in one line (...). Show the change name only when the user asks for it. The next step is `/opsx:apply`, shown without the change name." O item "Change name and location" passa a ser "What the change delivers, in one line, and where its files are". No update, a lista de escolha de change ganha o campo "One-line delivery".

**Modelos de saída.** No apply e no archive, `**Change:** <change-name>` vira `**Entrega:** <one line on what the change delivers>`. Os títulos `## Implementing: <change-name>`, `## Verification Report: <change-name>` e `## Specs Synced: <change-name>` perdem o nome e ganham a linha `**Entrega:**` logo abaixo.

**Próximo passo.** O trecho termina com: "When you point to the next step, show the command alone, without the change name (for example, `/opsx:verify`)."

O comando e a skill de cada fluxo recebem o mesmo texto.

Alternativa descartada: manter o nome entre parênteses em todo anúncio. O responsável pediu explicitamente a mensagem sem o nome.

### D3. CI e documentação

- **Marcadores:** `check "$g" "Describe the delivery"` para os seis pares, comando e skill, e `check "$g" "**Entrega:** <one line on what the change delivers>"` para os oito arquivos de apply, verify, archive e sync, no passo "Trechos customizados das skills".
- **README:** a linha "\"Describe the delivery\"" na tabela de trechos customizados, citando os seis fluxos.
- **CHANGELOG:** item na 1.15.0, sem ação obrigatória.

## Risks / Trade-offs

- [Com duas changes ativas, o anúncio sem nome é ambíguo] → O trecho manda mostrar o nome justamente nesse caso.
- [Um `openspec update` do CLI apaga o trecho] → Marcadores na CI e linha no README, como os outros trechos customizados.
- [Descrição longa demais] → O trecho pede uma linha.

## Migration Plan

Nenhuma migração. Os projetos recebem os fluxos novos na próxima atualização do padrão.
