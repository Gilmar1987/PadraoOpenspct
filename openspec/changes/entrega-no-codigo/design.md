# Design

## Context

- O instalador (`padrao-openspec/scripts/install-skills.mjs`) já mantém uma entrada gerenciada no `.gitignore` do repositório de código (`ensureConsumerGitignore`):
  - um marcador seguido das linhas do padrão, no fim do arquivo;
  - cópias antigas do bloco são removidas antes de regravar;
  - a gravação é atômica, por arquivo temporário e cópia de segurança.

  Para o `.gitattributes`, o instalador não faz nada.
- O repositório do padrão tem `.gitattributes` com LF, por causa do `sync-root.mjs --check`. O repositório de código não recebe nada parecido.
- A skill `docker` (`SKILL.md` e `docker-guidelines.md`) traz um compose de exemplo:
  - a aplicação publica `"${APP_PORT:-8000}:<porta>"`, em todas as interfaces;
  - o banco não publica porta;
  - a skill não fala de interface de rede nem do `.env.example`.
- O explore pede perguntas focadas e "Avoid a fixed question format". Ele não diz nada sobre alternativas numeradas.
- O README tem a seção "Desempenho e ambiente", sem nada sobre o Git Bash nem sobre o `.env.example`.

## Architecture Decisions

Nenhuma ADR nova. As mudanças:

- seguem a [ADR-0005](../../adrs/0005-regras-entregues-por-blocos-gerenciados.md): o `.gitattributes` recebe um bloco gerenciado, e o conteúdo do projeto fica intocado;
- seguem a [ADR-0003](../../adrs/0003-padrao-sem-stack-embutida.md): as regras de rede e de quebra de linha valem para qualquer stack.

## Goals / Non-Goals

**Goals:**

- Nenhum aviso de CRLF num repositório de código novo instalado pelo padrão.
- Nenhum serviço de desenvolvimento publicado em todas as interfaces pelo compose que a skill orienta.
- Nenhuma decisão registrada no explore a partir de um "sim" ambíguo.

**Non-Goals:**

- Alterar um `.gitattributes` do projeto ou renormalizar arquivos já commitados.
- Regras de rede para produção.
- Mudar o formato livre das perguntas abertas do explore. A numeração vale só para perguntas com alternativas.

## Decisions

### D1. `.gitattributes` gerenciado

- **Função nova `ensureConsumerGitattributes(projectRoot)`** no instalador, chamada junto da `ensureConsumerGitignore`, com o bloco entre marcadores:

  ```text
  # BEGIN openspec-padrao
  * text=auto eol=lf
  *.bat text eol=crlf
  *.cmd text eol=crlf
  # END openspec-padrao
  ```

- **Arquivo ausente:** cria o arquivo só com o bloco e escreve "Created: .gitattributes (...)".
- **Arquivo com o bloco** (as duas linhas de marcador, uma vez cada): troca só o trecho entre os marcadores, se mudou. Se não mudou, escreve "Unchanged: ...".
- **Arquivo sem o bloco:** não toca. Escreve um aviso com as linhas sugeridas: "Kept: .gitattributes belongs to the project; consider adding: ...".
- **Arquivo com marcadores fora de ordem, ou mais de um bloco:** não toca. Avisa para revisar à mão, como o `withManagedBlock` faz nos arquivos de instrução.
- **Arquivo ignorado pelo projeto ou que não é regular** (link, pasta): não toca e avisa.
- **Gravação:** atômica (arquivo temporário e `rename`), no mesmo estilo da `ensureConsumerGitignore`, preservando o fim de linha do arquivo existente.
- **Manifesto:** o `.gitattributes` não entra em `managedFiles`. Ele é do projeto, e o padrão só gerencia o bloco. Assim, o instalador nunca o apaga numa desinstalação ou numa troca de versão.

### D2. Skill `docker`

- **`SKILL.md`, em "Princípios":** item novo dizendo que serviços de desenvolvimento (bancos, filas, caches, painéis de administração) MUST publicar portas só em `127.0.0.1` (`"127.0.0.1:${DB_PORT:-5432}:5432"`). Um serviço que outra máquina precisa alcançar exige justificativa no `design.md`.
- **Exemplo de compose:**
  - a aplicação passa a `"127.0.0.1:${APP_PORT:-8000}:<porta>"`;
  - o banco ganha `ports: - "127.0.0.1:${DB_PORT:-5432}:5432"`;
  - um comentário diz que, sem o IP, a porta abre em todas as interfaces.
- **`.env.example`:** o item novo diz que o arquivo traz marcadores (`POSTGRES_PASSWORD=<troque>`), e não senhas que funcionem.
- **`docker-guidelines.md`:** a mesma regra na seção "docker-compose" e os marcadores na seção ".env.example".
- **Checklist antes de arquivar** (`SKILL.md`): item "portas de serviços de desenvolvimento só em `127.0.0.1`".

### D3. Explore

No `explore.md` e na skill `openspec-explore`, com o mesmo texto, um item novo depois de "Keep questions focused":

> **Number the alternatives** - When a question offers alternatives ("A or B?"), number them (`1)`, `2)`, …) and ask for the number, as the init interview does. A reply that does not pick one (for example "sim") is ambiguous: do not record a decision from it; ask again with the numbered options.

O "Avoid a fixed question format" continua valendo para as perguntas abertas.

### D4. README

Em "Desempenho e ambiente", dois parágrafos:

- **Git Bash:** o MSYS converte argumentos que parecem caminhos POSIX (por exemplo, `/fr` numa URL vira `C:/Program Files/Git/fr`). Use o PowerShell para esses comandos, ou `MSYS_NO_PATHCONV=1` só em comandos sem caminho de arquivo, porque a variável também desliga a conversão de caminhos legítimos.
- **`.env.example`:** um `.gitignore` com `.env*` (comum nos geradores) ignora também o `.env.example`. Acrescente `!.env.example` depois dele.

### D5. CI, CHANGELOG e versão

- **Smoke test do instalador:**
  - depois da primeira instalação, `test -f "$consumer/.gitattributes"` e `grep -qx '\* text=auto eol=lf'`;
  - depois da segunda, `grep -c '^# BEGIN openspec-padrao$'` igual a 1;
  - num segundo consumidor com um `.gitattributes` próprio, o arquivo continua byte a byte igual.
- **Passo "Trechos customizados das skills":** marcadores "Number the alternatives" no explore (comando e skill) e `127.0.0.1` na skill `docker`.
- **CHANGELOG:** itens na seção 1.15.0, ou a abre, com a ação recomendada: nos projetos sem `.gitattributes`, rodar o instalador com `--update`, ou criar o arquivo à mão, e decidir se renormaliza.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/scripts/install-skills.mjs` | D1 | `setup-project.mjs` e `comecar.mjs` (chamam o instalador); smoke tests do instalador, do setup e do script de entrada |
| `padrao-openspec/.claude/skills/docker/SKILL.md`, `docker-guidelines.md` | D2 | espelho da raiz; projetos que recebem a skill |
| `padrao-openspec/.claude/commands/opsx/explore.md`, `skills/openspec-explore/SKILL.md` | D3 | espelhos |
| `README.md` | D4 | nenhum |
| `.github/workflows/validate.yml`, `VERSION`, `CHANGELOG.md` | D5 | nenhum |

## Risks / Trade-offs

- **[`* text=auto eol=lf` muda o checkout de arquivos de texto no Windows]** → só vale para repositórios sem `.gitattributes`. `*.bat` e `*.cmd` ficam em CRLF. O CHANGELOG avisa que os arquivos já commitados só mudam com uma renormalização decidida pelo projeto.
- **[Arquivo binário tratado como texto]** → `text=auto` deixa o Git detectar os binários; o bloco não força `text` em nada além de `*.bat` e `*.cmd`.
- **[Smoke tests de setup e de entrada passam a ver um arquivo novo]** → rodar a suíte completa. Os testes que contam arquivos ou comparam árvores são ajustados na mesma tarefa.
- **[Conflito no README com a `descoberta-do-produto`]** → as seções são diferentes; rebase depois do merge dela.

## Migration Plan

- Projetos novos recebem o `.gitattributes` no setup.
- Projetos existentes sem o arquivo o recebem no próximo `--update`. Os que já têm o arquivo só veem a sugestão.
- Rollback: reverter os commits e voltar o `VERSION`. Um `.gitattributes` já criado num projeto fica, porque é do projeto.

## Open Questions

Nenhuma.
