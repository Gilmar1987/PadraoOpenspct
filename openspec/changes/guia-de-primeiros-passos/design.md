# Design

## Context

- O `README.md` da raiz tem "Como iniciar um projeto novo" como segunda seção, com os passos 1 a 4 (o 4 é o `/opsx:init`), um "Exemplo real" que para no setup, a explicação do que o setup faz e notas sobre geradores de projeto e registro do store. Pré-requisitos não aparecem.
- O `padrao-openspec/README.md` cita Node.js 18 ou mais recente só na parte do instalador. O CLI aparece apenas como `npx @fission-ai/openspec@1.14.2 validate` na validação; o setup chama o executável `openspec` (`setup-project.mjs`, `runOpenspec`).
- O modelo `padrao-openspec/templates/openspec-padrao.md` (PR #16) é instalado como `docs/openspec-padrao.md` e trata de versão e atualização.
- A mensagem final do setup lista: rodar `/opsx:init`, commitar os dois repositórios, ligar a permissão de Actions e, quando renomeou o remote, criar o remoto do store.

## Architecture Decisions

Não há ADR nova. A change é documentação e uma mensagem do setup. Segue a [ADR-0003](../../adrs/0003-padrao-sem-stack-embutida.md) (o guia não presume stack) e a [ADR-0004](../../adrs/0004-distribuicao-versionada-do-padrao.md) (o guia do projeto é arquivo gerenciado, entregue e atualizado pelo instalador).

## Goals / Non-Goals

**Goals:**

- Um dev que nunca usou o padrão sai do clone até a primeira change aprovada seguindo um único guia.
- O repositório de código diz, no próprio projeto, quais são os próximos passos.

**Non-Goals:**

- Ensinar OpenSpec em geral ou a stack do projeto.

## Decisions

### D1. Conteúdo do `COMECE-AQUI.md`

Seções, nesta ordem, em pt-BR e sem presumir stack:

1. **Antes de começar:** Git; Node.js 18 ou mais recente; OpenSpec CLI (`npm install -g @fission-ai/openspec@1.14.2`, a versão usada pela CI); um agente com suporte aos comandos `/opsx:*` (Claude Code, Copilot ou outro); e, para PRs, o `gh` opcional. Comandos de conferência: `git --version`, `node --version`, `openspec --version`.
2. **Criar o projeto:** os passos 1 a 3 do README (clone como `<projeto>-openspec`, repositório de código com `git init`, setup com `--name` e `--register-id`), com uma linha sobre o que o setup faz e o link para a explicação completa no README.
3. **Inicializar:** abrir o repositório de código no editor e rodar `/opsx:init`; o que a entrevista registra (stack, comandos de verificação, ADRs) e que ela termina com a confirmação e o nome do responsável.
4. **Commitar e publicar:** o que commitar no repositório de código (skills, comandos, agentes, `.gitignore`, `openspec/config.yaml`, `.openspec-padrao.json`, `docs/`, workflow) e no store (`project.md`, `config.yaml`, `project-setup.md`, ADRs); criar os dois remotos (o do store não existe, porque o setup renomeia o `origin` do padrão para `padrao`); ligar a permissão de Actions para o PR de atualização.
5. **Primeira change:** `/opsx:explore` (opcional) → `/opsx:propose <nome>` → aprovar no chat com frase explícita (exemplo) → `/opsx:apply` → `/opsx:verify` → `/opsx:archive`; push e PR só com pedido explícito.
6. **Problemas comuns:** `openspec` não encontrado (CLI não instalado ou fora do PATH); o setup recusa `--stack` (a stack vem do `/opsx:init`); o CLI não resolve o store (rodar `openspec store register` com o comando que o setup mostra); gerador de projeto que exige pasta vazia (rodar antes do setup); CLI lento no Windows (seção "Desempenho e ambiente" do README).
7. **Para saber mais:** links para o README (referência), o `CHANGELOG.md` e o `openspec/rules.md`.

### D2. README da raiz

- Logo depois do primeiro parágrafo: `> **Vai começar um projeto?** Siga o [COMECE-AQUI.md](COMECE-AQUI.md): pré-requisitos, passos até a primeira change e problemas comuns. Este README é a referência completa.`
- No "Exemplo real" (Livraria), acrescentar ao fim o comentário e o `/opsx:init`, como no fluxo validado.
- No início de "Como iniciar um projeto novo", uma linha remetendo ao `COMECE-AQUI.md` para pré-requisitos e próximos passos.

### D3. Guia do projeto

Nova seção `## Primeiros passos` em `padrao-openspec/templates/openspec-padrao.md`, logo depois da introdução:

- se o `/opsx:init` ainda não rodou: rodá-lo neste repositório;
- o que commitar (os arquivos gerenciados e `openspec/config.yaml`);
- o ciclo de uma change, com a regra de aprovação explícita e de push só com pedido;
- link para o `COMECE-AQUI.md` do padrão (URL do repositório público).

As seções sobre versão e atualização ficam depois.

### D4. Mensagem final do setup

O item 1 da mensagem final passa a dizer: "No repositório de código, rode /opsx:init … Os próximos passos estão em docs/openspec-padrao.md."

### D5. CI

Passo novo no job `root`, "Guia de primeiros passos":

```bash
test -f COMECE-AQUI.md
grep -qF '](COMECE-AQUI.md)' README.md
grep -qF 'setup-project.mjs' COMECE-AQUI.md
grep -qF '/opsx:init' COMECE-AQUI.md
grep -qF '## Primeiros passos' padrao-openspec/templates/openspec-padrao.md
```

O lint de Markdown da raiz já cobre o `COMECE-AQUI.md`.

### D6. Versão

Entrada nova no topo do `CHANGELOG.md` e o mesmo número no `VERSION`, com "Ações no projeto: Nenhuma" (o guia chega pelo PR de atualização). O número é a próxima minor livre na hora da implementação: hoje a `1.1.0` está reservada pela change `coerencia-de-seguranca-e-triagem`, então esta usa a `1.2.0`; se a ordem dos merges mudar, o rebase ajusta o número e a CI ("Versão e changelog") confere.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `COMECE-AQUI.md` (novo) | D1 | README (link), CI |
| `README.md` | D2 | nenhum |
| `padrao-openspec/templates/openspec-padrao.md` | D3 | instalador (arquivo gerenciado), smoke do instalador |
| `padrao-openspec/scripts/setup-project.mjs` | D4 | smokes de setup |
| `.github/workflows/validate.yml` | D5 | nenhum |
| `padrao-openspec/VERSION`, `CHANGELOG.md` | D6 | passo "Versão e changelog" |
| `.markdownlint-cli2.jsonc` (raiz e `padrao-openspec/`) | descoberto no apply: com duas versões, o CHANGELOG repete "O que mudou" e "Ações no projeto" e a MD024 falhava; passa a valer `siblings_only` | lint dos jobs `root` e `store` |

## Risks / Trade-offs

- [Guia e README divergirem com o tempo] → o guia remete ao README para detalhes em vez de repeti-los; a CI confere os pontos essenciais.
- [Versão do CLI desatualizada no guia] → o guia usa a mesma versão fixada na CI, e quem sobe a versão da CI acha o texto pela busca.
- [Conflito de número de versão com a outra change] → regra do D6 e checagem da CI.

## Migration Plan

Projetos existentes recebem o guia novo pelo PR de atualização; nenhuma ação manual. Rollback: reverter os commits.

## Open Questions

Nenhuma.
