# Design

## Context

- As skills e os comandos `apply`, `verify` e `update` são gerados pelo OpenSpec CLI 1.14.2 e recebem trechos próprios do padrão. Cada trecho tem um título em negrito em inglês (por exemplo, "**Record task evidence**"), e o passo "Trechos customizados das skills" da CI confere que eles existem nos dois arquivos de cada par (comando e skill). O README lista esses trechos numa tabela.
- O verify já registra um crítico "Code review missing or unresolved" quando falta `review.md`, mas só no fim do relatório. No Lava Jato, ele foi chamado com a revisão ainda rodando.
- O `rules.md` (fonte em `padrao-openspec/openspec/rules.md`) tem a seção 2 (nenhuma implementação sem change aprovada) e a 7 (disciplina de contexto).
- O `config.yaml` neutro tem regras de `tasks` (linhas 48-52).
- Pela ADR-0003, as regras não citam stack. Os exemplos do relatório (Next.js, Prisma, `engines.node`) viram termos gerais: modo de produção, requisito de runtime, gerador de arquivos.

## Architecture Decisions

Não há ADR nova: são salvaguardas do fluxo, no mesmo nível das que já existem no apply e no verify.

## Goals / Non-Goals

**Goals:**

- Cada falha do relatório que vem de uma lacuna do fluxo ganha uma regra explícita, no ponto do fluxo em que ela aconteceu.

**Non-Goals:**

- Provar automaticamente que o agente segue as regras; a CI confere a presença dos trechos.

## Decisions

### D1. Trechos novos no apply

Um parágrafo por trecho, em inglês como os demais, inserido na lista do passo 6 ("Implement tasks"), depois do "**Record task evidence**":

- **Unrequested fixes are scope**: a behavior change that no task or requirement asks for is new scope, even when it fixes a defect (for example, making an error page follow the route's language). Stop, describe it and ask whether it goes into this change through `/opsx:update` or into another change.
- **Check the library API**: before writing an adapter, parser or wrapper around a library, read its public API (types, signatures, installed docs) and record in the task evidence what was checked and why the library does not already handle the case.
- **Revalidate requirements after a version change**: when a deviation changes a dependency version, recheck the project's runtime requirement and the compatibility constraints of the other dependencies, and record the result.
- **Tool generators outside the repository**: run commands that generate files (`init`, `create`, scaffolds) in a temporary folder and copy only what the task needs, after checking whether the tool wrote agent instructions or skills (`.claude/`, `.agents/` and similar), secrets or environment files.
- **Simulate CI on a clean copy**: when the change creates or changes a CI workflow, run its steps on a copy with only the tracked files, without local environment files and without installed dependencies, before marking the task done.
- **Production-mode check**: verify changes to server or routing behavior also in the project's production mode, with the build and run commands from the "Comandos de verificação" of `project.md`, not only in development mode.

### D2. Trechos novos no verify

- **Review before verify** (novo passo 1a, antes do passo 2): if the change altered code (same definition as apply step 6a) and `review.md` is missing, stop before any other check, write no `verification.md`, say that the code review is a prerequisite and offer to run it. The existing "Code review record" check stays for a review that exists but is unresolved or stale.
- **Dependencies in Impact** (em Completeness): list the dependencies named in the proposal's Impact and check each against the tasks and the project's dependency manifest; add a WARNING `Dependency in Impact without task or manifest entry: <name>` for each miss.
- **Agent-run browser scripts** (em Scenario Coverage): when the evidence of a browser verification script says an agent ran it without real interaction (HTTP requests, no clicks), report the scenario as partially covered under "Não verificado" and ask for a human run before archive.

### D3. Trecho novo no update

**Scope change resets approval**, no passo 5 ("Confirm and apply"):

- **O que é mudança de escopo:** uma revisão confirmada que muda o "What Changes" do proposal, requisitos ou cenários das delta specs, ou que acrescenta ou retira tarefas.
- **O que o update faz:** move o registro atual para uma linha `- Aprovação anterior: <Responsável>, <Data>, <Escopo>; Origem: "<...>"` e volta os itens a `Pendente`, `—`, `—`, `—`, `—`.
- **O que ele diz ao usuário:** que a change precisa de nova aprovação antes do apply.
- **Correções de redação:** não contam como mudança de escopo, e a aprovação fica como está.

O apply já para com `Responsável: Pendente`, então nenhuma mudança é necessária nele para esse caso.

### D4. Regras globais e config base

- **`rules.md`, seção 2:** acrescenta "Toda correção, inclusive urgente, passa por uma change; uma change pequena, com uma tarefa, basta."
- **`rules.md`, seção 7:** acrescenta "Contagens que você anunciar (tarefas, achados, arquivos) MUST vir do CLI (por exemplo, `progress.total`) ou de uma lista montada na mesma resposta, nunca de memória."
- **`config.yaml`:** `rules.tasks` ganha "Toda dependência citada no Impact do proposal precisa aparecer numa tarefa."

### D5. CI e README

- **"Trechos customizados das skills":**
  - os 6 títulos do D1 nos dois arquivos do apply;
  - os 3 do D2 nos dois do verify;
  - o do D3 nos dois do update (par novo na checagem).
- **README:** a tabela de trechos ganha as linhas correspondentes.

### D6. Versão

`1.7.0`. "Ações no projeto": "Nenhuma obrigatória. As regras novas do apply, do verify e do update chegam pelo PR de atualização."

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `commands/opsx/apply.md`, `skills/openspec-apply-change/SKILL.md` | D1 | cópias da raiz, instalador, trechos customizados |
| `commands/opsx/verify.md`, `skills/openspec-verify-change/SKILL.md` | D2 | idem |
| `commands/opsx/update.md`, `skills/openspec-update-change/SKILL.md` | D3 | idem |
| `padrao-openspec/openspec/rules.md` | D4 | cópia da raiz, `docs/openspec-regras.md` dos projetos |
| `padrao-openspec/openspec/config.yaml` | D4 | "Config base carrega sem avisos" |
| `.github/workflows/validate.yml`, `README.md` | D5 | nenhum |
| `padrao-openspec/VERSION`, `CHANGELOG.md` | D6 | "Versão e changelog" |

São 13 arquivos de origem, todos listados.

## Risks / Trade-offs

- [Skills maiores e mais caras de ler] → cada trecho tem duas ou três frases.
- [O update zerar a aprovação numa revisão pequena demais] → a definição de mudança de escopo é explícita, e correções de redação ficam de fora.

## Migration Plan

Nenhuma migração. Rollback: reverter os commits.

## Open Questions

Nenhuma.
