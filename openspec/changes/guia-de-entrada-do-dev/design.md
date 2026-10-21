# Design

## Context

- `padrao-openspec/` é a fonte única de scripts e artefatos do padrão (ADR-0001); os scripts ficam em `padrao-openspec/scripts/` e são Node ESM sem dependências.
- O `setup-project.mjs` roda a partir do clone do padrão, registra como store a pasta `padrao-openspec` do clone, grava `store: <id>` no código, confere a resolução pelo CLI e renomeia o `origin` do padrão para `padrao`. Já pergunta o que falta quando há terminal e aceita tudo por opção.
- No Windows, `openspec` e `npm` são `.cmd`; o `setup-project.mjs` os chama por shell com `quoteForShell`.
- A release é publicada à mão com `gh release create` (README, "Como publicar uma release"). A `v1.2.0` é a última; a `1.2.1` está no `VERSION` e no CHANGELOG, mas não foi publicada.
- A CI tem os jobs `store` (em `padrao-openspec/`, com o OpenSpec CLI instalado) e `root`, com smoke tests do setup em Bash.

## Architecture Decisions

Não há ADR nova. O anexo do script à release aplica a [ADR-0004](../../adrs/0004-distribuicao-versionada-do-padrao.md) (distribuição versionada por release) à entrada do dev. O script fica em `padrao-openspec/scripts/`, conforme a ADR-0001, e não traz stack (ADR-0003).

## Goals / Non-Goals

**Goals:**

- O dev sai do link do padrão para o `/opsx:init` (projeto novo) ou para o `/opsx:propose` (projeto em andamento) com dois comandos e algumas respostas.
- Um único clone do padrão, já na pasta e na release certas.

**Non-Goals:**

- Desfazer automaticamente o que o script criou quando um passo falha no meio.
- Suportar Node abaixo de 18.

## Decisions

### D1. Distribuição

- Fonte: `padrao-openspec/scripts/comecar.mjs`. Não é copiado para a raiz pelo `sync-root.mjs`.
- Anexo da release: `gh release create vX.Y.Z --title "vX.Y.Z" --notes-file notas.md padrao-openspec/scripts/comecar.mjs`. O GitHub serve o anexo da última release em `releases/latest/download/comecar.mjs`.
- Comandos do guia:
  - Windows: `curl.exe -LO https://github.com/Gilmar1987/PadraoOpenspct/releases/latest/download/comecar.mjs` e `node comecar.mjs`. `curl.exe`, e não `curl`, porque no Windows PowerShell 5.1 `curl` é apelido do `Invoke-WebRequest`.
  - macOS/Linux: `curl -LO …` e `node comecar.mjs`.
- Alternativas rejeitadas: `irm | iex` (só Windows, executa sem salvar); `git clone` e depois o script (dois clones); `npx github:...` (precisa de `package.json` na raiz e baixa o repositório inteiro no cache do npm).

### D2. Conversa e opções

Ordem: ambiente (D3) → modo → pasta base (D4) → perguntas do modo (D5 ou D6) → resumo e confirmação → execução → próximo passo.

| Pergunta | Opção | Sugestão |
|---|---|---|
| Modo: 1) projeto novo 2) projeto em andamento | `--modo novo\|existente` | — |
| Pasta base | `--pasta <dir>` | pasta atual |
| Nome do projeto (novo) | `--nome <texto>` | — |
| Id do projeto (novo) | `--id <id>` | nome em minúsculas, sem acentos, espaços viram `-` |
| Pasta do código já gerada (novo) | `--codigo <dir>` | Enter: criar `<base>/<id>` |
| URL do código (existente) | `--url-codigo <url>` | — |
| URL do store (existente) | `--url-store <url>` | — |
| Confirmar o resumo | `--yes` | Sim |

Opções técnicas, para testes e para quem testa uma versão: `--origem <url-ou-pasta>` (repositório do padrão; padrão `https://github.com/Gilmar1987/PadraoOpenspct`) e `--tag <vX.Y.Z>` (padrão: a maior tag `vX.Y.Z` da origem).

- Id válido: `^[a-z0-9][a-z0-9-]*$`. Um id inválido repete a pergunta, ou falha com a opção errada citada.
- Sem terminal (`stdin` ou `stdout` sem TTY), uma resposta que falte faz o script parar com `Falta --<opção>`.
- Leitura das respostas pelo iterador de linhas, como o `createPrompter` do `setup-project.mjs`, para aceitar respostas coladas de uma vez.
- Textos em pt-BR, código e nomes de funções em inglês.

### D3. Ambiente

- `git --version`: ausente → para com "Instale o Git: `https://git-scm.com/downloads`".
- `process.versions.node` com major abaixo de 18 → para com "Atualize o Node.js para 18 ou mais recente: `https://nodejs.org`".
- `openspec --version`: ausente → pergunta "Instalar o OpenSpec CLI 1.14.2 agora (npm install -g @fission-ai/openspec@1.14.2)? [S/n]". Com sim, instala e confere de novo; com não, para com o comando. Versão diferente da 1.14.2 → só avisa.
- O Claude Code não é conferido. A mensagem final diz para abri-lo.

### D4. Pasta base

- `path.resolve(resposta)`, a partir da pasta atual; o resumo mostra o caminho completo.
- Não existe → pergunta "Criar `<pasta>`? [S/n]" (`--yes` cria).
- Pasta sincronizada: algum segmento do caminho casa com `onedrive`, `dropbox`, `google drive`, `googledrive` ou `icloud` (sem diferenciar maiúsculas), ou o caminho fica dentro de `%OneDrive%`. → aviso e "Continuar mesmo assim? [s/N]". Com `--yes`, só avisa.
- Destino existente (`<base>/<id>-openspec`, `<base>/<id>`, ou as pastas do modo existente) → para antes de criar qualquer coisa, citando a pasta. A pasta de `--codigo` é a exceção: precisa existir.

### D5. Projeto novo

1. Tag: `--tag`, ou a maior `vX.Y.Z` de `git ls-remote --tags --refs <origem> "v*"`. Sem tag → para.
2. `git clone --branch <tag> <origem> <base>/<id>-openspec` e `git -C <store> switch -c main`.
3. Código: com `--codigo`, usa a pasta e roda `git init -b main` se ela não for repositório; sem `--codigo`, cria `<base>/<id>` com `git init -b main`.
4. `node <store>/padrao-openspec/scripts/setup-project.mjs <código> --name <nome> --register-id <id> --yes`, com a saída do setup visível. O setup faz o registro, a declaração, a conferência pelo CLI e a troca do remote.
5. Mensagem final: as duas pastas, "Abra o Claude Code em <código> e rode /opsx:init", e o lembrete de commitar e criar os repositórios remotos (link para o guia).

### D6. Projeto em andamento

1. Pastas: o último segmento de cada URL sem `.git` (por exemplo, `livraria-online` e `livraria-online-openspec`), dentro da pasta base. Se os dois nomes coincidirem, o do store ganha `-openspec`.
2. `git clone <url-codigo> <base>/<pasta-codigo>` e `git clone <url-store> <base>/<pasta-store>`.
3. Id: a linha `store:` de `<código>/openspec/config.yaml` (ou `config.yml`), com o mesmo padrão do setup. Ausente → para dizendo que o projeto não está ligado a um store e que o tech lead precisa rodar o setup e commitar o `openspec/config.yaml`.
4. Raiz do store: `<store>/padrao-openspec` se tiver `openspec/`; senão `<store>` se tiver `openspec/`; senão para dizendo que a URL não parece de um store.
5. `openspec store register <raiz> --id <id> --yes`. Falha → mostra a saída do CLI. Se o id já estiver registrado para outra pasta, mostra o `openspec store unregister <id>` a rodar antes.
6. `openspec context --json` com `cwd` no código; `root.path` tem de ser a raiz do passo 4 (comparada por `realpathSync`). Diferente → para com o caminho resolvido e o comando de registro.
7. Mensagem final: "O projeto já está inicializado: não rode /opsx:init. Abra o Claude Code em <código> e comece por /opsx:propose".

### D7. Falha no meio

O script não apaga nada. Se um passo falhar depois que algo foi criado, ele lista o que já fez e as pastas criadas, para o dev apagar e rodar de novo. Código de saída diferente de zero.

### D8. Execução de comandos

- `git`: `spawnSync('git', args)`, sem shell.
- `openspec` e `npm`: como o `runOpenspec` do setup; no Windows, por shell com cada argumento citado.
- O script só baixa código pelo `git clone` da origem e pelo `npm install -g` do CLI, depois da confirmação.

### D9. Guias

- **`COMECE-AQUI.md`:**
  1. aviso: "Não clone este repositório para começar. Baixe e rode o script";
  2. os comandos (D1) e a frase "o arquivo é salvo antes de rodar; abra-o se quiser conferir";
  3. o que pedir ao tech lead:
     - novo: nome, quem responde a entrevista e permissão para criar os repositórios e mudar as configurações de Actions;
     - existente: as URLs dos dois repositórios, com acesso;
  4. exemplo de cada conversa;
  5. depois do script: `/opsx:init` e commit e publicação (projeto novo) e a primeira change;
  6. "Sem o script": os passos manuais dos dois casos, com o registro de `<store>\padrao-openspec`;
  7. macOS/Linux na própria seção manual;
  8. problemas comuns (os atuais e os do script: pasta já existe, CLI ausente, `store:` ausente, id registrado em outra pasta, pasta sincronizada).
- **README da raiz:** o aviso do topo vira os dois comandos e o link para o guia; o parágrafo "Quem clona um repositório de código já configurado" indica o script com `--modo existente` e o caminho `<store>\padrao-openspec` para o registro manual; "Como publicar uma release" anexa o `comecar.mjs` no `gh release create`.
- **`padrao-openspec/README.md`:** "Usar em um novo projeto" começa pelo script e mantém o fluxo manual.
- **`templates/openspec-padrao.md`:** seção "Entrar neste projeto" entre a introdução e "Primeiros passos", com o download, `node comecar.mjs --modo existente` e o link para o `COMECE-AQUI.md`. O item 1 de "Primeiros passos" passa a dizer "Se o projeto é novo, …".

### D10. CI

- "Sintaxe dos scripts": `node --check scripts/comecar.mjs`.
- "Smoke test do script de entrada", no job `store`:
  - cria um repositório local com a árvore do checkout, commita, cria as tags `v1.0.0` e `v<VERSION>`;
  - **modo novo:** `--origem <repo> --pasta <tmp>/a --nome "CI Entrada" --id ci-entrada --yes`; confere que o store está na tag `v<VERSION>` e na branch `main`, que o código tem `.claude/commands/opsx/init.md` e `store: ci-entrada`, e que a saída cita o `/opsx:init`;
  - commita o código e o store gerados, cria repositórios bare a partir deles e desregistra `ci-entrada`;
  - **modo existente:** `--modo existente --pasta <tmp>/b --url-codigo <bare> --url-store <bare> --yes`; confere que o `openspec context --json` no código clonado resolve `<tmp>/b/<store>/padrao-openspec` e que a saída não manda rodar o `/opsx:init`;
  - recusas: rodar de novo o modo novo na mesma pasta falha sem alterar nada; o modo existente com um código sem `store:` falha sem registrar; sem TTY e sem `--nome`, falha com `Falta --nome`.
- "Guia de primeiros passos": ganha `grep -qF 'releases/latest/download/comecar.mjs'` no `COMECE-AQUI.md` e no `README.md`, `grep -qF '## Entrar neste projeto'` no template e `grep -qF 'comecar.mjs' README.md` na seção de release. As checagens atuais continuam.

### D11. Versão

`padrao-openspec/VERSION` = `1.3.0`. A seção `## 1.2.1` do CHANGELOG vira `## 1.3.0`, com dois itens em "O que mudou" (clone pela release e script de entrada) e, em "Ações no projeto": "Nenhuma obrigatória. O `docs/openspec-padrao.md` ganha a seção 'Entrar neste projeto' pelo PR de atualização."

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/scripts/comecar.mjs` (novo) | D1–D8 | CI |
| `COMECE-AQUI.md` | D9 | passo do guia, lint |
| `README.md`, `padrao-openspec/README.md` | D9 | passo do guia, lint |
| `padrao-openspec/templates/openspec-padrao.md` | D9 | instalador, smoke tests do instalador e do setup |
| `.github/workflows/validate.yml` | D10 | nenhum |
| `padrao-openspec/VERSION`, `CHANGELOG.md` | D11 | passo "Versão e changelog", manifesto dos projetos |

## Risks / Trade-offs

- [O link `latest/download` não existe até a `v1.3.0` sair com o anexo] → o guia novo chega aos devs na mesma release; a tarefa de publicação lembra o anexo.
- [Release futura publicada sem o anexo faz o link apontar para uma release sem o arquivo] → o passo do README e a checagem do D10 mantêm o anexo no comando de publicação.
- [Antivírus ou política corporativa bloqueia o script baixado] → a seção "Sem o script" continua completa.
- [Repositórios privados pedem credencial no `git clone`] → o Git da máquina pede como em qualquer clone; o script não lê nem guarda credenciais.
- [Registro do OpenSpec CLI é global da máquina e a CI desregistra ids de teste] → os testes usam ids próprios (`ci-entrada`) e desregistram no fim.

## Migration Plan

Nenhuma migração. Rollback: reverter os commits; o fluxo manual continua igual.

## Open Questions

Nenhuma.
