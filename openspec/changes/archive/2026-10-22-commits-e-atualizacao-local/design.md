# Design

## Context

- O propose, o apply e o archive têm passos de commit ("Commit the planning", commits do apply e "Commit the archive"), conferidos pelo passo "Trechos customizados das skills" da CI. O `init.md` termina em "Próximos passos" mandando commitar à mão (`git -C <root> add openspec/`).
- O `comecar.mjs` (modo novo) clona o store, cria o código com `git init` e roda o setup; não faz commit. O código fica sem histórico, e o `install-skills.mjs --update` exige repositório com commits e árvore limpa (`requireCleanRepository`).
- O "Standard version check" está em 8 arquivos (4 comandos e 4 skills: propose, apply, verify e archive) e só mostra uma linha. O guia do projeto tem a seção "Atualizar à mão" com dois comandos: clonar a tag numa pasta temporária e rodar o instalador com `--update`.
- O `comecar.mjs` é interativo: pela regra do `openspec/project.md`, a change exige o teste do responsável num console real antes da release.

## Architecture Decisions

Não há ADR nova. Os commits seguem a ADR-0002 (rastreabilidade commit ↔ change, sem push) e a atualização segue a ADR-0004 (branch própria pelo `--update`).

## Goals / Non-Goals

**Goals:**

- Um projeto criado pelo script ou inicializado pelo init termina com histórico e árvore limpa.
- Um projeto sem remoto consegue se atualizar a partir do próprio fluxo, com um "sim" do usuário.

**Non-Goals:**

- Push, abertura de PR ou atualização sem confirmação.

## Decisions

### D1. "Commit the init"

Novo passo no `init.md`, depois de gerar todos os arquivos e antes dos "Próximos passos":

> **Commit the init**: when `git -C "<root>" rev-parse --is-inside-work-tree` succeeds, run `git -C "<root>" add -- openspec/` and `git -C "<root>" commit -m "chore: inicializa o projeto <Nome do Projeto>" -- openspec/`. Committing with the pathspec keeps out anything else the user has staged. If the root is not in a Git repository, say the init was not committed. Never push.

O item 3 dos "Próximos passos" vira "Os artefatos foram commitados no store (ou: não houve commit, porque o store não está num repositório Git)".

### D2. Commit inicial no `comecar.mjs`

Depois do passo "Setup concluído", no modo novo:

1. Pergunta: `Fazer o commit inicial do código e do store? [S/n]`. Com `--yes`, sim; com `--sem-commit`, não, sem perguntar. Sem terminal e sem nenhuma das duas, sim (é o padrão aceito).
2. Código: `git -C <código> add -A` e `git -C <código> commit -q -m "chore: instala o padrão OpenSpec v<versão>"`.
3. Store: `git -C <store> add -A` e `git -C <store> commit -q -m "chore: configura o store do projeto <id>"`, só se houver mudança (`git diff --cached --quiet`).
4. Falha em qualquer commit (por exemplo, "empty ident name" ou "Please tell me who you are"): aviso `Não consegui commitar: <motivo>. Configure a identidade com git config --global user.name ... e rode: <comandos>`, e o script segue com código 0.
5. A mensagem final passa a citar os commits feitos ou os comandos para fazê-los.

A versão vem do `padrao-openspec/VERSION` do store clonado. O modo existente não faz commit, porque clona repositórios que já têm histórico.

### D3. Oferta de atualização no "Standard version check"

Texto novo, igual nos 8 arquivos:

> **Standard version check**: if the code repository has `.openspec-padrao.json`, read its `version` and `source`, and run `git ls-remote --tags --refs "<source>" "v*"`. If the highest `vX.Y.Z` tag is newer than the installed version, show one line: `há atualização do padrão: v<installed> → v<latest> (veja docs/openspec-padrao.md)`. If the code repository has no remote (`git remote` is empty), or the user asks for it, also offer to update now: show the two commands of "Atualizar à mão" in `docs/openspec-padrao.md` with `v<latest>` and a temporary folder, and run them only after the user explicitly agrees in this conversation and `git status --porcelain` is empty; otherwise say why it was not run. After a successful update, say that it is on branch `chore/padrao-v<latest>` to review and merge, then continue the command. If the file is missing, the command fails, or there is no network, continue silently. Never update anything without that agreement.

O cabeçalho "Standard version check" continua, para a checagem da CI.

### D4. Guias

- **`templates/openspec-padrao.md`:**
  - a "Primeiros passos" diz que o `comecar.mjs` e o `/opsx:init` commitam o que geram;
  - a "Atualizar à mão" diz que os comandos do ciclo oferecem rodá-la quando o projeto não tem remoto.
- **COMECE-AQUI:**
  - o exemplo da conversa ganha a pergunta do commit e a linha "✔ Commit inicial do código e do store";
  - a "Commitar e publicar" passa a tratar só da publicação (remotos e push), dizendo que os commits já foram feitos.

### D5. CI

- **"Smoke test do script de entrada":**
  - o modo novo (com `--yes`) confere `git -C <código> log --oneline | wc -l` = 1, árvore limpa nos dois repositórios e o store com o commit de configuração;
  - os commits manuais do teste viram condicionais (só commitam o que sobrar);
  - um caso novo com `--sem-commit` confere que o código fica sem commits.
- **"Trechos customizados das skills":**
  - confere "Commit the init" no `init.md`;
  - confere "offer to update now" nos 8 arquivos com "Standard version check".
- **Identidade Git:** o passo do script de entrada exporta `GIT_AUTHOR_*` e `GIT_COMMITTER_*`, como o passo dos blocos de agentes, porque o commit agora acontece dentro do script.

### D6. Versão

`1.6.0`. "Ações no projeto":

- "Nenhuma obrigatória.";
- "Projetos sem remoto passam a receber, nos comandos do ciclo, a oferta de atualizar à mão."

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/.claude/commands/opsx/init.md` | D1 | cópia da raiz, instalador |
| `commands/opsx/{propose,apply,verify,archive}.md` e `skills/openspec-{propose,apply-change,verify-change,archive-change}/SKILL.md` | D3 | cópias da raiz, instalador, trechos customizados |
| `padrao-openspec/scripts/comecar.mjs` | D2 | smoke tests do script de entrada e do drive minúsculo |
| `templates/openspec-padrao.md`, `COMECE-AQUI.md` | D4 | lint, guia de primeiros passos |
| `.github/workflows/validate.yml` | D5 | nenhum |
| `padrao-openspec/VERSION`, `CHANGELOG.md` | D6 | passo "Versão e changelog" |

São 13 arquivos-alvo de origem (mais as cópias geradas da raiz); o limite de 5 arquivos fora do raio de impacto não se aplica a eles, porque estão todos listados.

## Risks / Trade-offs

- [O passo do drive minúsculo (Windows) também passa pelo modo novo e agora commita] → ele já commita à mão; os commits manuais viram condicionais, como no script de entrada.
- [Commit inicial grande com arquivos do gerador] → o dev viu o resumo e pode usar `--sem-commit`.

## Migration Plan

Nenhuma migração. Rollback: reverter os commits.

## Open Questions

Nenhuma.
