# Design

## Context

- `padrao-openspec/scripts/comecar.mjs`, no modo projeto novo com `--codigo`:
  - antes do setup, calcula `codeHadWork`: a pasta tem `.git` e tem commits ou `git status --porcelain` não vazio;
  - depois do setup, o `initialCommit` commita o código com o pathspec de `standardPaths(codeDir)`. A lista vem do manifesto (`managedFiles`, `managedBlocks`), mais `.openspec-padrao.json`, `.gitignore`, `openspec/config.yaml`, o `.gitattributes` com o bloco e o `.claude/settings.json`, sem os caminhos ignorados e não versionados;
  - o `commitRepository` roda `git add -- <caminhos>` e `git commit -- <caminhos>`. O Git leva cada arquivo inteiro, inclusive as linhas do dev que ainda não estavam commitadas.
- O "Smoke test do script de entrada" já cobre a pasta de gerador com um commit (árvore limpa depois) e o `.claude/settings.json` ignorado. Nenhum caso tem edição anterior num arquivo do padrão.
- A decisão de deixar o arquivo de fora, em vez de não commitar nada ou recusar antes do setup, foi do responsável, nesta proposta.

## Architecture Decisions

Nenhuma ADR nova: a mudança é local ao commit inicial do script de entrada e segue o requisito "Commit inicial em pasta de código com histórico" (`project-onboarding`), que já proíbe levar outro trabalho da pasta.

## Goals / Non-Goals

**Goals:**

- Nenhuma edição do projeto que ainda não estava commitada entra no commit inicial.
- O dev sabe quais arquivos ficaram de fora e como commitá-los.
- Sem edições anteriores, o resultado é o de hoje, com a árvore limpa.

**Non-Goals:**

- Separar linhas do padrão e do projeto dentro de um arquivo.
- Mudar o `install-skills.mjs`, o commit do store ou a pasta criada pelo script.

## Decisions

### D1. Arquivos com edições antes do setup

- Quando `codeHadWork` é verdadeiro, o script roda, antes do setup, `git -C <código> status --porcelain=v1 -z --untracked-files=all`. Ele guarda o conjunto dos caminhos que aparecem: modificados, encenados, apagados e não versionados. Numa renomeação, guarda o nome novo e o antigo.
- Saída de erro do `git status` (por exemplo, repositório corrompido): o script trata como "não sei" e deixa de fora todos os arquivos do padrão que já existiam antes do setup. Assim, nada do dev entra por engano. O aviso final diz isso.

### D2. Commit inicial

- No `initialCommit`, a lista de `standardPaths(codeDir)` se divide em duas:
  - **fora:** cada caminho que está no conjunto do D1, ou que é uma pasta com algum caminho do conjunto dentro dela (por exemplo, `.claude/commands/opsx` com um arquivo do dev);
  - **dentro:** o resto, commitado como hoje.
- Sem nada dentro, o commit do código não acontece, e a mensagem final mostra o comando de sempre.
- O pathspec do commit nunca inclui um caminho de fora, então o encenado do dev também fica de fora.

### D3. Mensagem final

- Depois do commit, quando há arquivos de fora, o script escreve:

  ```text
  ! Ficaram fora do commit inicial, porque já tinham edições suas antes do setup:
      CLAUDE.md
    Eles têm as suas edições junto das do padrão. Revise e commite:
      git -C "<código>" add -- CLAUDE.md
      git -C "<código>" commit -m "chore: inclui o padrão OpenSpec nos arquivos já editados" -- CLAUDE.md
    Até lá, o install-skills --update pede a árvore limpa.
  ```

- A linha do plano, antes de confirmar, diz que os arquivos do padrão com edições não commitadas ficarão de fora, listando-os quando já se sabe quais são.

### D4. CI e CHANGELOG

- **"Smoke test do script de entrada":** cenário novo, "Edições do projeto fora do commit inicial":
  - pasta de gerador com um commit que já tem `CLAUDE.md`, mais uma linha `linha do dev` acrescentada sem commit;
  - depois do `comecar.mjs`: dois commits; o `CLAUDE.md` não está no último commit; `git diff -- CLAUDE.md` ainda mostra a `linha do dev`; o `AGENTS.md` está no último commit; a saída lista o `CLAUDE.md` e o comando;
  - o id do store entra no `trap` de limpeza.
- **CHANGELOG:** um item na seção da versão aberta (1.16.0, aberta por esta change ou pela da outra sessão). A ação no projeto é nenhuma.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/scripts/comecar.mjs` | D1, D2, D3 | "Smoke test do script de entrada"; cópia baixada por `releases/latest/download/comecar.mjs` depois da próxima release |
| `.github/workflows/validate.yml` | D4 | nenhum |
| `CHANGELOG.md`, `padrao-openspec/VERSION` | D4 | "Versão e changelog" |

## Risks / Trade-offs

- **[A árvore fica suja depois do commit]** → é o efeito da decisão; a mensagem final mostra o comando e avisa do `--update`.
- **[Uma pasta inteira do padrão fica de fora por um arquivo do dev dentro dela]** → raro (as pastas do padrão são dele); o aviso lista a pasta, e o dev decide.
- **[Conflito no `validate.yml` e no CHANGELOG com a change da outra sessão]** → passos e seções diferentes; quem entrar por último rebaseia.

## Migration Plan

- Nada a migrar: o comportamento vale para projetos novos criados pelo `comecar.mjs` depois da próxima release.
- Rollback: reverter os commits.

## Open Questions

Nenhuma.
