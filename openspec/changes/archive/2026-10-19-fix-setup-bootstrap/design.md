# Design

## Context

- `ensureConsumerGitignore` em `install-skills.mjs` mantém no fim do `.gitignore` um bloco com o marcador `# OpenSpec planning artifacts are maintained in the separate planning store.` e a linha `/openspec/`. Ele remove cópias anteriores do bloco por regex e considera o arquivo já correto quando as duas últimas linhas são o marcador e `/openspec/`.
- `committedVersion` em `setup-project.mjs` roda `git show HEAD:<caminho>` com `cwd` na pasta do store. No git, `HEAD:<caminho>` é relativo à raiz do repositório; `HEAD:./<caminho>` é relativo ao diretório atual. Com o store em `padrao-openspec/`, o comando lê `openspec/project.md` da raiz do repositório, que é outro arquivo.
- A CI testa o setup copiando `padrao-openspec/` para uma pasta temporária e fazendo `git init` nela. O store vira a raiz do repositório, e o defeito não aparece.
- O CLI do OpenSpec resolve o store declarado quando o `openspec/` do repositório de código só tem o `config.yaml` (ver a spec `store-setup`).

## Architecture Decisions

Não há ADR nova. A mudança corrige o instalador e o setup dentro das decisões existentes: segue a [ADR-0001](../../../adrs/0001-padrao-openspec-fonte-unica.md) (fonte única em `padrao-openspec/`, espelhada pelo sync).

## Goals / Non-Goals

**Goals:**

- Um clone novo do repositório de código já sabe qual store usar.
- O setup não gera backups falsos no fluxo recomendado.

**Non-Goals:**

- Mudar o formato da declaração do store.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/scripts/install-skills.mjs` | novo bloco do `.gitignore` e migração do antigo | `setup-project.mjs`, que chama o instalador; smoke test do instalador |
| `padrao-openspec/scripts/setup-project.mjs` | `committedVersion` com `HEAD:./` | `backupIfEdited`; smoke test do setup |
| `padrao-openspec/.claude/commands/opsx/init.md` | texto do próximo passo | espelho na raiz (sync) |
| `.github/workflows/validate.yml` | asserções novas e smoke do store em subpasta | job `store` |
| `README.md`, `padrao-openspec/README.md` | ordem com o `create-next-app` e regra do `.gitignore` | nenhum |

## Decisions

### D1. Bloco novo do `.gitignore`

```text
# OpenSpec planning artifacts are maintained in the separate planning store.
/openspec/*
!/openspec/config.yaml
```

- `/openspec/*` ignora o conteúdo da pasta, e não a pasta em si; só assim a negação `!/openspec/config.yaml` funciona. O git não reinclui arquivos de uma pasta inteira ignorada.
- Detecção de "já correto": as três últimas linhas não vazias são o bloco novo.
- **Migração:** a regex de limpeza passa a reconhecer o bloco antigo (marcador e `/openspec/`) e o novo (marcador, `/openspec/*` e `!/openspec/config.yaml`), remove os dois onde estiverem e grava o bloco novo no fim, como hoje.
- Alternativa descartada: um `openspec/.gitignore` dentro da pasta. Ele também ficaria ignorado pela regra do pai e exigiria a mesma exceção.

### D2. `committedVersion` relativo ao store

`git show HEAD:./<caminho>` com `cwd` na pasta do store. Funciona com o store na raiz e em subpasta, sem descobrir a raiz do repositório.

### D3. Smoke test do store em subpasta

Um passo novo, "Smoke test do setup em subpasta", que:

1. cria um repositório temporário;
2. copia `padrao-openspec/` para uma subpasta dele e faz o commit;
3. roda o setup com `--stack nextjs --no-register --yes`;
4. confere que não há `.bak`.

Em seguida, ele altera o `config.yaml` sem commit e roda com `--force`, para conferir que o `.bak` aparece.

### D4. Ordem com o `create-next-app`

Os READMEs ganham uma nota na seção de projeto novo:

- em projeto Next.js novo, rode o `create-next-app` no repositório de código antes do setup;
- se o setup já rodou, gere o app numa pasta temporária e copie os arquivos.

A orientação técnica completa sobre o Next 16 fica na skill, que é tratada pela change `update-nextjs-skill-next16`.

### D5. Texto do init

O próximo passo do `/opsx:init` diz: "`<root>` pode ser uma subpasta do repositório git (por exemplo, `padrao-openspec/`); o `git -C <root>` funciona a partir dela".

## Risks / Trade-offs

- **[Consumidores com o bloco antigo veem o `openspec/config.yaml` como arquivo novo]** → é o efeito desejado; o README explica que o arquivo deve ser commitado.
- **[Um consumidor pode guardar mais arquivos em `openspec/` esperando que sejam ignorados]** → só o `config.yaml` deixa de ser ignorado; o resto continua.
