# Design

## Context

- O passo 6 do comando e da skill de apply diz, para cada tarefa: "Rerun the apply instructions and confirm that task is now done and progress changed".
- Medições: na CI, o passo de configs, com 16 chamadas ao CLI, leva 4 segundos. Nesta máquina, cada chamada leva de 40 a 90 segundos.
- O repositório não tem `.gitattributes`. O índice está em LF, e a árvore de trabalho no Windows mistura CRLF e LF conforme o arquivo foi tocado pelo git.

## Architecture Decisions

Não há ADR nova. A mudança segue a [ADR-0001](../../adrs/0001-padrao-openspec-fonte-unica.md) (skills editadas em `padrao-openspec/` e espelhadas pelo sync).

## Goals / Non-Goals

**Goals:**

- Apply de uma change típica com poucas chamadas ao CLI.
- `sync-root.mjs --check` confiável no Windows.

**Non-Goals:**

- Medir ou otimizar o tempo do CLI em cada máquina.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/.claude/commands/opsx/apply.md`, `skills/openspec-apply-change/SKILL.md` | confirmação por grupo | espelhos (sync); passo de CI de trechos customizados |
| `.gitattributes` | novo | todos os arquivos de texto do repositório na árvore de trabalho |
| `.github/workflows/validate.yml` | marcador novo | job `store` |
| `README.md` | seção "Desempenho e ambiente"; trecho customizado | nenhum |

## Decisions

### D1. Confirmação por grupo

No passo 6 do comando e da skill de apply, a linha "Rerun the apply instructions and confirm that task is now done and progress changed" é trocada pelo texto abaixo, com o mesmo texto nos dois arquivos:

> **Confirm progress per task group**: after the last task of each `##` group, and once more at the end, rerun the apply instructions and confirm that the group's tasks are done and the progress changed. Between tasks of the same group, marking the checkbox at the returned `sourcePath` and `line` is enough.

O marcador "Confirm progress per task group" entra no passo de CI de trechos customizados.

### D2. `.gitattributes`

```text
* text=auto eol=lf
```

Depois do commit, um `git add --renormalize .` confere que o índice não muda, porque ele já está em LF. A árvore de trabalho local é atualizada no próximo checkout.

### D3. README, "Desempenho e ambiente"

A seção nova, depois de "Validação contínua", traz:

- a medição: 16 chamadas ao CLI em 4 segundos na CI, contra 40 a 90 segundos por chamada numa máquina Windows carregada;
- o que fazer:
  - excluir do antivírus a pasta do projeto, a pasta do store e o cache do npm;
  - encerrar processos `node` órfãos de tarefas interrompidas (no Windows, parar a tarefa nem sempre encerra os filhos);
  - evitar rodar várias sessões pesadas em paralelo.

## Risks / Trade-offs

- **[Confirmar só por grupo pode atrasar a detecção de um checkbox marcado errado]** → a confirmação acontece no máximo ao fim do grupo, e o estado final `all_done` é sempre conferido.
- **[`.gitattributes` muda a árvore de trabalho de quem já clonou]** → só a quebra de linha muda; o conteúdo no repositório é o mesmo.
