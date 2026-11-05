# Design

## Context

- As skills `openspec-*` e os comandos `/opsx:*` de `padrao-openspec/.claude/` são a saída do `openspec init --tools claude` no CLI 1.14.2, com o perfil `custom` e os workflows `propose`, `explore`, `apply`, `verify`, `update`, `sync` e `archive`. Por cima dessa saída, o padrão acrescentou os trechos da tabela "Manutenção do padrão" do `README.md`. As cópias da raiz (`.claude/`) saem do `sync-root.mjs`.
- O `README.md` manda regenerar e reaplicar os trechos à mão. Hoje a tabela tem 25 linhas; 14 dos arquivos que ela cita são gerados pelo CLI (as sete skills e os sete comandos correspondentes).
- A saída pura das duas versões, gerada numa pasta temporária em 2026-11-04, difere em 175 linhas de diff, em 10 arquivos:
  - 1.14.3: a escolha e a checagem do caminho de um artefato por glob dentro da `changeRoot` antes de gravar (`propose` e `explore`, em comando e skill; o `update` já tinha esse texto na 1.14.2 e só muda o `generatedBy`);
  - 1.15.0: o casamento exato do nome de um requisito REMOVED no `verify` (comando e skill);
  - o campo `generatedBy` nas sete skills.
- Esse diff, aplicado com `git apply --check` sobre `padrao-openspec/.claude/`, entra em todos os arquivos menos um trecho, nas "Artifact Creation Guidelines" do `propose` (comando e skill): o padrão inseriu cinco bullets antes da linha que o upstream altera, e o contexto do patch não casa.
- A versão do CLI aparece fixada em `comecar.mjs` (`cliVersion`), `portao.mjs` (mensagem de CLI ausente), nos dois passos "Instalar OpenSpec CLI" do `validate.yml`, no `generatedBy` das skills e em textos do `README.md`, do `padrao-openspec/README.md`, do `COMECE-AQUI.md` e do `openspec/project.md`. Nenhuma checagem confere que esses lugares batem.
- `openspec validate --all --strict` com o 1.15.0 já passa hoje: raiz com 22 de 22, e `padrao-openspec/` sem itens.

## Architecture Decisions

Nenhuma ADR nova. A change atualiza uma ferramenta que o padrão já fixa e segue a ADR-0004 (distribuição versionada, com "Ações no projeto" no CHANGELOG) e a ADR-0009 (os trechos de aprovação por etapa continuam intactos).

## Goals / Non-Goals

**Goals:**

- As skills e os comandos ficam com o texto do upstream 1.15.0 e com todos os trechos do padrão.
- A versão do CLI é a mesma em todos os lugares, e a CI garante isso nas próximas atualizações.
- A próxima atualização do CLI segue um roteiro escrito e repetível.

**Non-Goals:**

- Automatizar a atualização num script do padrão.
- Mudar a conferência de Node.js do script de entrada.

## Decisions

### D1. Alvo 1.15.0

- **Escolha:** `@fission-ai/openspec@1.15.0`.
- **Alternativas:**
  - 1.14.3: traz as correções de hooks, `braces` e glob, mas deixa de fora o casamento exato no verify e o `update --dry-run`. A diferença de esforço para a 1.15.0 é nenhuma, porque o delta das skills é quase o mesmo.
  - 1.16.0 (`latest`): exige Node.js 22.12 nas instalações por npm, e o `--strict` passa a falhar em cenário sem WHEN/GIVEN ou THEN, o que pode reprovar projetos consumidores. Isso pede uma decisão sobre o Node mínimo e um piloto, então fica para outra change.

### D2. Delta do upstream em vez de regenerar

- **Escolha:** gerar a saída pura das duas versões numa pasta temporária e aplicar a diferença sobre `padrao-openspec/.claude/` com `git apply`:
  1. numa pasta fora do repositório, criar um `config.json` do OpenSpec com `profile: custom`, `delivery: both` e os sete workflows, e apontar `XDG_CONFIG_HOME` para ela, para não usar nem alterar a configuração global da máquina (seção 8 das regras);
  2. com `OPEN_SPEC_INTERACTIVE=0`, `CI=1` e `DO_NOT_TRACK=true`, rodar `npx -y @fission-ai/openspec@<versão> init --tools claude --no-animation .` numa pasta vazia com `git init`, uma vez para a versão antiga e outra para a nova;
  3. `diff -ru` entre as duas `.claude/`, com os caminhos reescritos para `padrao-openspec/.claude/`, e `git apply` na branch da change;
  4. o trecho que não aplica é resolvido à mão (D3), e o `sync-root.mjs` copia o resultado para a raiz.
- **Alternativa:** regenerar com o 1.15.0 e reaplicar os trechos pela tabela, como o `README.md` descreve hoje. Isso reescreveria 14 arquivos e dependeria de reaplicar as 25 linhas da tabela sem esquecer nenhuma. O passo "Trechos customizados das skills" só confere frases-chave, então uma perda no meio de um trecho passaria.
- **Alternativa:** um script do padrão que faz os passos 1 a 3. A atualização é rara, e um script pediria smoke test próprio. O roteiro no `README.md` basta por enquanto.
- O teste em 2026-11-04 confirmou que a configuração isolada por `XDG_CONFIG_HOME` gera a mesma saída que a configuração global desta máquina.

### D3. Conflito nas "Artifact Creation Guidelines" do propose

No `commands/opsx/propose.md` e na `skills/openspec-propose/SKILL.md`, a linha `- If the \`instruction\` field directs you to use a specific skill or command to create the artifact, invoke it instead of writing the artifact directly` recebe à mão o final do upstream 1.15.0: ` - but only once you have chosen and checked the output path, and only if it can write there`. Os cinco bullets do padrão antes dela ficam como estão.

### D4. Checagem de coerência da versão do CLI

- Um passo novo no job `root` do `validate.yml`, "Versão do OpenSpec CLI coerente", logo depois de "Raiz em dia com padrao-openspec".
- A versão de referência é a `cliVersion` do `comecar.mjs`. O passo extrai cada versão e falha com `::error file=<arquivo>::` citando a versão divergente:
  - `portao.mjs`: o `@fission-ai/openspec@<versão>` da mensagem;
  - `validate.yml`: cada `@fission-ai/openspec@<versão>` e cada `= "<versão>"` dos passos "Instalar OpenSpec CLI";
  - `generatedBy: "<versão>"` em `padrao-openspec/.claude/skills/openspec-*/SKILL.md` e `.claude/skills/openspec-*/SKILL.md`;
  - `@fission-ai/openspec@<versão>` no `README.md`, no `padrao-openspec/README.md`, no `COMECE-AQUI.md` e no `openspec/project.md`.
- O `CHANGELOG.md` e as changes arquivadas ficam de fora, porque registram versões antigas de propósito.
- Os textos sem o nome do pacote ("gerados pelo OpenSpec CLI 1.14.2", a saída de exemplo `OpenSpec CLI . 1.14.2 ok` do `COMECE-AQUI.md`) não entram na checagem e são atualizados à mão na tarefa da documentação. Uma busca por `1.14.2` fora do `CHANGELOG.md` e do arquivo confere que nenhum sobrou.
- O script do passo usa aspas simples nas expressões com crase (lição registrada: crase dentro de aspas duplas vira substituição de comando).

### D5. Versão do padrão e CHANGELOG

- Pelo modelo de versão acumulada, a seção é a 1.17.0: se a change da outra sessão já a tiver aberto na `main`, esta só acrescenta itens; senão, esta abre a 1.17.0 (`VERSION` e seção). A tarefa 1.1 combina isso com a outra sessão.
- Item em "O que mudou": "OpenSpec CLI 1.15.0", com as duas correções que chegam às skills e a checagem de coerência.
- "Ações no projeto": `npm install -g @fission-ai/openspec@1.15.0`. Com o CLI 1.14.2, os comandos continuam funcionando, e o script de entrada mostra `ok (o padrão usa 1.15.0)`.

## Dependency versions

| Pacote | Versão | Fonte e data | Restrições |
|---|---|---|---|
| `@fission-ai/openspec` | `1.15.0` | `npm view @fission-ai/openspec versions dist-tags engines`, 2026-11-04 | `engines.node >=20.19.0`; sem peer dependencies. `latest` aponta para 1.16.0, recusada no D1 (Node 22.12 nas instalações por npm) |

## Risks / Trade-offs

- [O delta não aplica depois do rebase sobre a change da outra sessão, que também muda as skills] → Rodar o `git apply --check` depois do rebase. Um conflito novo é resolvido como no D3 e registrado na evidência da tarefa.
- [Um projeto tem Node.js entre 18 e 20.18: o script de entrada aceita, mas o CLI exige 20.19.0] → A situação já existe com o 1.14.2 e fica fora do escopo. O `npm install` avisa com `EBADENGINE`.
- [Saída do CLI 1.15.0 diferente em algum passo da suíte (por exemplo, a linha de progresso do `new change`, que agora cita o schema real)] → A suíte local completa roda com o 1.15.0 antes do verify.
- [A checagem do D4 deixa de fora textos sem o nome do pacote] → Busca por `1.14.2` na tarefa da documentação. A checagem cobre o que se repete a cada atualização.

## Migration Plan

- No padrão: a release que levar a 1.17.0 traz a "Ação no projeto". Até lá, nada muda para os consumidores.
- Rollback: reverter o commit da change. As skills voltam ao texto do 1.14.2, e a checagem do D4 continua valendo para a versão revertida.
