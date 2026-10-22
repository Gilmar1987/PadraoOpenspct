# Design

## Context

- `openspec/rules.md` existe só na raiz deste repositório, fora de `padrao-openspec/` (a fonte única da ADR-0001). O cabeçalho diz "Regras Globais — PadraoOpenspct" e "carregadas automaticamente em toda conversa"; isso é verdade aqui, pelo `.claude/CLAUDE.md` e pelos stubs `.cursorrules`, `.windsurfrules`, `.amazonq/rules/openspec-rules.md` e `.github/copilot-instructions.md`.
- O instalador (`install-skills.mjs`) entrega árvores (skills, comandos, agentes) e arquivos de `templates/` (`templateFiles`) e registra tudo em `managedFiles`. O `.gitignore` do código já recebe um bloco gerenciado com marcador, com escrita atômica e backup (`ensureConsumerGitignore`). Esse é o modelo para os blocos novos.
- Uma reinstalação que mudaria arquivos exige `--update` ou `--in-place` (spec "Reinstalação só com modo explícito").
- Convenções de arquivos de instrução (documentação dos fornecedores, a conferir na tarefa 2.1):
  - **Cursor e Codex:** leem `AGENTS.md`.
  - **Claude Code:** lê `CLAUDE.md` e aceita `@AGENTS.md` como import.
  - **Gemini CLI:** lê `GEMINI.md` por padrão.
  - **GitHub Copilot:** lê `.github/copilot-instructions.md`.
  - **Windsurf:** regras de projeto em `.windsurf/rules/`.
  - **Amazon Q:** regras em `.amazonq/rules/`.
- O `AGENTS.md` do Lava Jato já tem o bloco `<!-- BEGIN:nextjs-agent-rules -->`, do `create-next-app`.

## Architecture Decisions

[ADR-0005](../../adrs/0005-regras-entregues-por-blocos-gerenciados.md) (`Proposed`): regras com fonte única em `padrao-openspec/openspec/rules.md` e entregues ao código por blocos gerenciados, com marcadores, nos arquivos de instrução dos agentes. A ADR estende a ADR-0001 (fonte única) e a ADR-0004 (arquivos gerenciados e atualização por PR), sem contradizê-las.

## Goals / Non-Goals

**Goals:**

- Abrir qualquer agente coberto no repositório de código basta para ele receber as regras e saber seguir o fluxo.
- Nenhuma instrução do projeto ou de outro gerador é perdida.

**Non-Goals:**

- Detectar qual agente o dev usa; o instalador escreve para todos os cobertos.

## Decisions

### D1. Fonte única das regras

- `git mv openspec/rules.md padrao-openspec/openspec/rules.md`, com o texto ajustado para servir aos dois contextos:
  - título "Regras Globais — padrão OpenSpec";
  - "operem neste repositório" vira "operem neste repositório ou num projeto que usa o padrão";
  - na seção 1, os arquivos `openspec/config.yaml` e `openspec/project.md` ficam "no store do projeto (o `openspec context --json` mostra a raiz)".

  O resto fica igual.
- `sync-root.mjs` ganha o mapeamento de arquivo `openspec/rules.md`, e a raiz volta a ter a cópia gerada. A guarda do script ("does not look like the PadraoOpenspct repository") passa a procurar `padrao-openspec/openspec/rules.md`.
- `templateFiles` do instalador ganha `{ source: '../openspec/rules.md', destination: 'docs/openspec-regras.md' }`, ou o equivalente com `sourceRoot`. O arquivo é gerenciado como os outros.

### D2. Bloco gerenciado

Template `padrao-openspec/templates/agents-block.md`:

```markdown
<!-- BEGIN:openspec-padrao -->
## Padrão OpenSpec

Leia e siga obrigatoriamente `docs/openspec-regras.md` antes de qualquer ação técnica. Elas valem
para qualquer agente e não podem ser contornadas por instruções no chat.

- Specs, changes e ADRs ficam no store do projeto; `openspec context --json` mostra onde.
- O fluxo é `/opsx:propose` → aprovação explícita → `/opsx:apply` → `/opsx:verify` → `/opsx:archive`.
  Sem os comandos `/opsx:*` (eles são do Claude Code), siga o arquivo do comando, por exemplo
  `.claude/commands/opsx/propose.md`.
- Guia do padrão neste repositório: `docs/openspec-padrao.md`.
<!-- END:openspec-padrao -->
```

O mesmo texto vai para `AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.windsurf/rules/openspec-padrao.md` e `.amazonq/rules/openspec-padrao.md`. No `CLAUDE.md`, o bloco é só `@AGENTS.md` entre os marcadores, porque o Claude Code importa o arquivo.

Alternativa rejeitada: só `AGENTS.md`. O Claude Code, o Gemini CLI e o Copilot não o leem por padrão.

### D3. Escrita dos blocos

Função `ensureManagedBlock(projectRoot, relativePath, block)`, no modelo do `ensureConsumerGitignore`:

1. Recusa symlink ou caminho que não é arquivo comum.
2. Arquivo ausente: cria com o bloco (e as pastas `.github/`, `.windsurf/rules/` e `.amazonq/rules/` se faltarem).
3. Arquivo sem os marcadores: acrescenta uma linha em branco e o bloco no fim, mantendo o EOL do arquivo.
4. Arquivo com os marcadores: substitui o trecho entre o primeiro `BEGIN` e o `END` seguinte. Com mais de um par de marcadores, ou com um `BEGIN` sem `END`, para com erro sem alterar nada.
5. Escrita atômica (arquivo temporário e `rename`).

Os blocos entram na lógica de modo da reinstalação. Se algum bloco mudaria, a reinstalação exige `--update` ou `--in-place`, como os arquivos gerenciados. O `--update` inclui esses arquivos no commit. O manifesto ganha `managedBlocks: [<caminhos>]`, separado de `managedFiles`, porque o arquivo não é todo do padrão.

### D4. Guias

- `docs/openspec-padrao.md` (template) e COMECE-AQUI ganham a seção "Usar com outros agentes". A seção traz uma tabela com o agente, o arquivo que ele lê e a forma de rodar o fluxo (o comando `/opsx:*` no Claude Code; nos outros, "siga `.claude/commands/opsx/<comando>.md`").
- A lista de arquivos commitados ("Commitar e publicar") passa a incluir `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.windsurf/`, `.amazonq/` e `docs/openspec-regras.md`.
- README: o parágrafo "Regras globais de agentes" explica a fonte em `padrao-openspec/openspec/rules.md` e a entrega aos projetos.

### D5. CI

Novo "Smoke test dos blocos de agentes" no job `store`:

- Código com `AGENTS.md` contendo o bloco `nextjs-agent-rules`: depois do setup, o bloco do Next.js continua byte a byte igual, e o `openspec-padrao` aparece uma vez.
- Os seis arquivos existem com o bloco; o `CLAUDE.md` tem `@AGENTS.md`; o `docs/openspec-regras.md` é igual à fonte.
- Segunda instalação: `Done.` sem mudanças.
- Bloco antigo (texto diferente entre os marcadores) com `--update`: um só bloco, com o texto novo, e o commit inclui o `AGENTS.md`.
- `BEGIN` sem `END`: o instalador falha sem alterar o arquivo.

O "Sintaxe dos scripts" segue cobrindo os scripts. O `sync-root --check` cobre o `rules.md`.

### D6. Versão

`1.5.0` (funcionalidade nova). "Ações no projeto":

- "O PR de atualização cria ou atualiza `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.windsurf/rules/openspec-padrao.md`, `.amazonq/rules/openspec-padrao.md` e `docs/openspec-regras.md`; revise o diff dos arquivos que já existiam, que só ganham o bloco entre marcadores."

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `openspec/rules.md` → `padrao-openspec/openspec/rules.md` | D1 | `sync-root`, CLAUDE.md e stubs da raiz (continuam apontando para `openspec/rules.md`, que segue existindo como cópia) |
| `padrao-openspec/scripts/sync-root.mjs` | D1 | CI (`--check`) |
| `padrao-openspec/scripts/install-skills.mjs` | D1, D3 | smoke tests do instalador e do setup, workflow de atualização |
| `padrao-openspec/templates/agents-block.md` (novo), `templates/openspec-padrao.md` | D2, D4 | instalador |
| `COMECE-AQUI.md`, `README.md` | D4 | lint, passo do guia |
| `.github/workflows/validate.yml` | D5 | nenhum |
| `padrao-openspec/VERSION`, `CHANGELOG.md` | D6 | passo "Versão e changelog" |

## Risks / Trade-offs

- [Um agente mudar o arquivo que lê] → a lista fica numa constante do instalador e na tabela do guia; mudar é uma change pequena.
- [O dev editar dentro dos marcadores] → a próxima atualização sobrescreve; o bloco diz que é gerenciado, e o PR mostra o diff.
- [Arquivos de instrução demais na raiz do código] → são pequenos e cada um serve a um agente; quem não usa um agente pode apagar o arquivo, e a próxima atualização o recria (registrado no guia como comportamento conhecido).

## Migration Plan

Projetos existentes recebem os arquivos pelo PR de atualização da `v1.5.0`. Rollback: reverter os commits; nos projetos, apagar os blocos entre os marcadores.

## Open Questions

Nenhuma que mude o plano. Os nomes exatos dos arquivos de Windsurf e Amazon Q são conferidos na documentação na tarefa 2.1; se mudarem, só a constante e a tabela do guia mudam.
