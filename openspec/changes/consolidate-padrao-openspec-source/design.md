# Design

## Context

Estado atual observado (motivação em `proposal.md`):

- O instalador (`padrao-openspec/scripts/install-skills.mjs`) copia `padrao-openspec/.claude/skills/*` e `padrao-openspec/.github/agents/` e nunca lê comandos.
- As skills da raiz e dos stores dotnet/nextjs são idênticas entre si. Foram geradas pelo OpenSpec CLI 1.14.2 e têm de 109 a 356 linhas. As de `padrao-openspec` são resumos escritos à mão, de 21 a 30 linhas.
- O `propose.md` da raiz contém a checagem de ADR; o dos stores, não.
- O workflow está em `padrao-openspec/.github/workflows/validate.yml`, com caminhos relativos a `padrao-openspec/`.
- O OpenSpec CLI resolve um store declarado quando o repositório tem um `openspec/` contendo só um `config.yaml` com `store: <id>`. Se esse `openspec/` tiver estrutura de planejamento (`specs/`, `changes/`), a declaração é ignorada com um aviso.
- O lint de Markdown, com a config de `padrao-openspec`, acusa dezenas de erros nas skills e comandos gerados pelo CLI e alguns no `README.md`, no `openspec/rules.md` e no `openspec/project.md` da raiz.

## Goals / Non-Goals

**Goals:**

- Uma única cópia editável de cada skill, comando, agente e modelo de ADR.
- A raiz continua funcional para quem trabalha neste repositório com Claude Code, mas como saída gerada.
- Scripts sem dependências npm novas (Node 18+, só `node:*`).

**Non-Goals:**

- Unificar as duas raízes OpenSpec (`openspec/` e `padrao-openspec/openspec/`); fica para a change de layout de store único.
- Reescrever o conteúdo das skills geradas pelo CLI.

## Architecture Decisions

- [ADR-0001](../../adrs/0001-padrao-openspec-fonte-unica.md), `Proposed`: `padrao-openspec` como fonte única de skills, comandos e agentes. Ela é promovida a `Accepted` na revisão do PR, antes do archive.

## Decisions

### D1. Versões completas geradas pelo CLI como conteúdo canônico

As skills `openspec-*` completas substituem os resumos em `padrao-openspec/.claude/skills/`. Elas trazem a lógica de seleção de store e de checagem de raiz de que o fluxo com store separado precisa; os resumos só dizem "resolva pelo CLI".

- Alternativa descartada: manter os resumos e só acrescentar comandos. O consumidor continuaria sem as instruções que o próprio CLI considera necessárias.

### D2. Comandos instalados sempre em `.claude/commands/opsx/`

Os comandos usam o formato de slash command do Claude Code e não têm destino equivalente em `.agents/`. Por isso, são instalados como os agentes: sempre, em um caminho fixo, como uma operação a mais na lista `operations` do instalador. Herdam a checagem de conflito, `--force`, staging e backup.

- Alternativa descartada: instalar só com `--target claude|both`. Isso cria uma regra a mais, e com o novo padrão `both` o resultado seria o mesmo na maioria dos casos.

### D3. Padrão `--target both`

O teste de clone mostrou que o padrão `agents` deixa o Claude Code sem skills. Gravar nos dois destinos custa só espaço em disco e cobre Copilot e Claude Code. O setup herda o novo padrão.

### D4. `sync-root.mjs` dentro de `padrao-openspec/scripts/`

- **Mapeamento fixo:**
  - `.claude/skills` → `../.claude/skills`
  - `.claude/commands/opsx` → `../.claude/commands/opsx`
  - `.github/agents` → `../.github/agents`
  - `openspec/adrs/README.md` e `openspec/adrs/template.md` → `../openspec/adrs/`
- Diretórios são espelhados de forma exata: copia o que falta ou difere e remove os órfãos. Arquivos avulsos são só copiados.
- Antes de escrever, o script confirma que o diretório pai é este repositório, exigindo `../openspec/rules.md`. Assim, não escreve fora do lugar quando `padrao-openspec` é usado isoladamente.
- `--check` compara byte a byte sem escrever e lista `diff`, `missing` e `orphan`.
- Rejeita links simbólicos, como o instalador.
- O espelho inclui as skills de stack (`dotnet-implementation`, `nextjs-implementation`). Na raiz, elas só são acionadas quando há código .NET ou Next.js, o que não acontece aqui. Filtrar exigiria duplicar a lista de stacks do instalador.
- Alternativa descartada: links simbólicos da raiz para `padrao-openspec`. Não funcionam de forma confiável no Windows sem modo de desenvolvedor, e o instalador já rejeita links.

### D5. CI na raiz com dois jobs

`.github/workflows/validate.yml` terá dois jobs:

- **`store`**: tem `defaults.run.working-directory: padrao-openspec` e executa os passos atuais sem mudar a lógica. Os smoke tests ganham:
  - a checagem de `.claude/commands/opsx/init.md` e `ingest.md` no consumidor;
  - a checagem do padrão `both`;
  - um setup com `--register-id ci-store` que confere a declaração `store:` e a resolução via `openspec context --json`. O runner é efêmero, então o registro não deixa resíduo.
- **`root`**: executa `node padrao-openspec/scripts/sync-root.mjs --check`, `openspec validate --all --strict` e o lint com o novo `.markdownlint-cli2.jsonc` da raiz.

O arquivo de `padrao-openspec/.github/workflows/` é removido para não haver dois workflows.

### D6. Lint: conteúdo vendorizado fica de fora

O `.markdownlint-cli2.jsonc` de `padrao-openspec` passa a ignorar `.claude/skills/openspec-*/**`, `.claude/commands/opsx/**` e `.claude/skills/requesting-code-review/**`. Os dois primeiros são saída do OpenSpec CLI; o terceiro é cópia de skill externa. Corrigir o estilo deles divergiria da origem a cada regeneração.

O `.markdownlint-cli2.jsonc` da raiz:

- repete as regras de `padrao-openspec`;
- ignora `padrao-openspec/**` (já coberto pelo job `store`), `.claude/**` (espelho) e `.github/agents/**` (espelho).

`README.md`, `openspec/rules.md` e `openspec/project.md` são corrigidos para passar.

### D7. Declaração e verificação do store no setup

A etapa `[3/3]` do setup passa a ter quatro passos:

1. **Registrar o store**, como hoje. Se o registro falhar, a etapa vira erro em vez de aviso.
2. **Gravar a declaração** em `<code>/openspec/config.yaml`:
   - se o arquivo não existir, cria com a linha `store: <id>`;
   - se existir e já declarar `<id>`, mantém;
   - se declarar outro id, falha, a menos que haja `--force`;
   - se existir sem a chave `store`, acrescenta a linha.
3. **Verificar a resolução** com `openspec context --json` executado em `<code>`, comparando `root.path` (via `realpath`) com `storeRoot`.
4. **Em caso de divergência**, falhar exibindo `openspec store register "<storeRoot>" --id <id>` e o caminho do `config.yaml`.

`/openspec/` já é ignorado no `.gitignore` do código, então a declaração é local a cada máquina. Isso é coerente com o registro, que também é local.

### D8. `init.md` e `ingest.md` resolvem a raiz pelo CLI

Os dois comandos recebem os mesmos blocos "Store selection" e "Project check" usados nos demais comandos. Passam também a usar `root.path` de `openspec context --json` como base de todos os caminhos `openspec/...`. O conteúdo da entrevista não muda.

### D9. Agentes e `rules.md`

`.github/agents/` da raiz passa a ser espelhado pelo sync. A seção 4 do `rules.md` ganha uma linha para o Business Requirements Ingestor e uma nota: os agentes são subagentes VS Code/Copilot em `.github/agents/`, e em outras ferramentas os limites valem para o papel equivalente que o agente principal assumir.

### D10. Ajustes identificados durante a implementação

- **Smoke test do setup com commit inicial.** Com a CI na raiz, a cópia de `padrao-openspec/` deixou de levar `.git`, e o setup passava a tratar o template como editado, gerando `.bak`. O passo agora faz `git init` e um commit inicial na cópia, restaurando a premissa original do teste. Isso ajusta o D5, que previa "sem mudar a lógica".
- **Id padrão do store.** Quando o store está em `<projeto>-openspec/padrao-openspec`, o id sugerido pelo setup é o nome da pasta do clone, e não `padrao-openspec`.
- **`openspec init` no repositório de código.** O README do `padrao-openspec` deixa de recomendá-lo: o setup já instala skills, comandos e a declaração do store. O comando respeita a declaração `store:`, mas é redundante.
- **`test-setup.ps1` no PowerShell 5.1.** Para cumprir a verificação da tarefa 6.5, foram corrigidos três defeitos preexistentes:
  - arquivo salvo com BOM UTF-8, porque sem ele travessões viram aspas tipográficas;
  - `git clone` e `git init` com `--quiet`, sem `2>&1`, que tornava o stderr um erro terminante;
  - operador `&` no lugar de `Start-Process`, que não preserva argumentos com espaço.

## Risks / Trade-offs

- **[Edição direta na raiz é perdida no próximo sync]** → a CI falha em qualquer divergência; os READMEs e um comentário no topo do `sync-root.mjs` indicam que a fonte é `padrao-openspec/`.
- **[Remoção dos stores dotnet/nextjs quebra quem os clona]** → o README da raiz ganha uma seção de migração que aponta para `padrao-openspec` com `--stack`; o histórico do Git preserva os stores.
- **[`--target both` conflita com customizações em `.claude/skills`]** → a checagem de conflito do instalador aborta sem copiar nada e lista os caminhos; `--target agents` restaura o comportamento antigo.
- **[Um `openspec/` no repositório de código com `specs/` ou `changes/` faz o CLI ignorar a declaração]** → a verificação do D7 detecta a raiz errada e falha com a explicação.
- **[Skills geradas pelo CLI ficam desatualizadas quando o CLI evoluir]** → a versão do CLI segue fixada em 1.14.2 na CI; a regeneração é uma change própria.
- **[Lint deixa de cobrir conteúdo vendorizado]** → trade-off aceito; o conteúdo continua validado pelos smoke tests de presença e igualdade.

## Migration Plan

1. Mesclar o PR: a CI da raiz passa a rodar a partir dele.
2. Projetos já configurados: rodar de novo `install-skills.mjs <codigo> --force` para receber os comandos e as skills completas. Para registrar a declaração do store, rodar o setup com `--register-id <id> --force`, ou criar `openspec/config.yaml` no código com `store: <id>`.
3. Rollback: reverter o commit. Os stores removidos e o workflow antigo voltam com o revert.
