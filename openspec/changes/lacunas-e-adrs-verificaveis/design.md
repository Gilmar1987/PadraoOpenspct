# Design

## Context

- O store de um projeto é um clone do padrão; a raiz OpenSpec dele é `padrao-openspec/`. Um arquivo novo em `padrao-openspec/openspec/` chega a todo store novo, e os scripts de `padrao-openspec/scripts/` (Node.js sem dependências) já rodam a partir do store, como o `flow-metrics.mjs`.
- O verify (comando e skill, com o mesmo texto) tem as heurísticas "Project validation commands", "Evidence reuse" e "External report triage", e registra itens e comandos no `verification.md`.
- O modelo de ADR (`padrao-openspec/openspec/adrs/template.md`) tem o frontmatter `id`, `status`, `date`, `supersedes`, `superseded_by` e `related_changes`. O `adrs/README.md` diz que ADR aceita não é reescrita. Os dois são espelhados na raiz pelo `sync-root.mjs` (ADR-0003).
- O propose, ao criar uma ADR, segue a lista do passo 5 da "Architectural Decision Check".
- `rules.md` chega aos projetos como `docs/openspec-regras.md` e aos blocos gerenciados dos agentes (ADR-0005); as seções 1 (leitura obrigatória) e 8 (quando em dúvida) são as mais próximas do tema de precedência.
- Não há `project-setup.md` no PadraoOpenspct. As ADRs `Accepted` são 0002 a 0005; nenhuma é contrariada (ver "Architecture Decisions").

## Goals / Non-Goals

**Goals:**

- Uma lacuna conhecida tem dono, motivo, data e uma fonte com hash, e o verify percebe quando ela aparece sem declaração ou some sem atualização.
- Uma ADR cuja regra se confere por código aponta o teste, e o verify o roda.
- O agente sabe qual documento seguir num conflito e quando parar para perguntar.

**Non-Goals:**

- Detectar lacunas automaticamente para qualquer stack: comparar o código com um modelo de dados ou contrato é trabalho de um teste do projeto, que o `project.md` registra como "Conferência de lacunas".
- Bloquear o archive por script: a cobrança fica no verify; o portão mecânico é da `guardas-mecanicas`.

## Architecture Decisions

Nenhuma ADR nova é criada nesta change (ver "Open Questions"). A change segue a ADR-0003 (o script é Node.js sem dependências, como os outros, e os exemplos citam vários ecossistemas), a ADR-0004 (versão e CHANGELOG) e a ADR-0005 (a regra de precedência chega aos agentes pelo `rules.md`).

## Decisions

### D1. Registro em Markdown no store

`padrao-openspec/openspec/lacunas.md`, com uma introdução curta e esta tabela:

```markdown
| ID | Fonte | SHA-256 da fonte | Item não cumprido | Motivo | Desde | Encaminhamento |
|---|---|---|---|---|---|---|
| L-001 | docs/modelo-de-dados.sql | 3f1c… (64 hex) | Tabela `tb_folha_horista` | Depende do calendário de dias trabalhados | 2026-10-22 | change `calendario-de-trabalho` |
```

- `Fonte` é um caminho relativo à raiz OpenSpec do store, ou `codigo:<caminho>` para um arquivo do repositório de código, resolvido pelo `--codigo <dir>` do script; sem essa opção, uma linha `codigo:` é reportada como "informe --codigo" e o script sai com erro.
- O modelo traz a tabela com a linha de exemplo comentada; um store sem lacunas fica com a tabela vazia.
- **Alternativa:** JSON (como nos projetos de referência). Rejeitada porque o registro é lido por pessoas e agentes no store, e os outros artefatos do store são Markdown; o script lê a tabela.
- **Alternativa:** registro no repositório de código. Rejeitada para manter o planejamento no store (regra 2 do `rules.md`); um teste do projeto que precise do registro lê o store pelo caminho que o próprio projeto configura.

### D2. Script `lacunas.mjs`

`node padrao-openspec/scripts/lacunas.mjs [--raiz <dir>] [--codigo <dir>]`:

1. Lê a tabela de `openspec/lacunas.md` da raiz (padrão: a raiz OpenSpec atual).
2. Para cada linha: `ID` único, `Motivo` e `Desde` (AAAA-MM-DD válida) preenchidos, `SHA-256` com 64 caracteres hexadecimais, fonte existente.
3. Calcula o SHA-256 de cada fonte (uma vez por fonte) e compara.
4. Saída: `ok: <n> lacunas, <m> fontes` com código 0; ou uma linha por problema e código 1. Para hash divergente: `fonte alterada: <fonte> (lacunas <ids>) — releia a declaração inteira contra a versão nova; não troque só o hash`.
5. Sem `openspec/lacunas.md`: `sem registro de lacunas`, código 0.

- **Por que hash do conteúdo inteiro:** é o que os projetos de referência usam e torna explícito que a fonte mudou; normalizar fim de linha (CRLF → LF) antes do hash evita falso alarme entre Windows e Linux.
- **Alternativa:** comparar data de modificação. Rejeitada: muda com checkout e não diz se o conteúdo mudou.

### D3. Heurística "Declared gaps" no verify

Texto igual no comando e na skill, depois de "External report triage":

> **Declared gaps**: when the store has `openspec/lacunas.md`, run `node padrao-openspec/scripts/lacunas.mjs` (adding `--codigo <code repository>` when a row cites `codigo:`) and record the result under `Comandos:`; a failure is a CRITICAL issue. When `project.md` records a "Conferência de lacunas" command under "Comandos de verificação", run it too. For each reference source the change touches (main specs it affects, ADRs it cites, documents named in the proposal or design), add a CRITICAL issue for (a) a divergence the change introduced or revealed that is neither fixed nor declared in the registry, and (b) a declared gap the change closed while its row is still in the registry. Without the registry, skip this check without an issue.

### D4. Campo `verificacao` nas ADRs e heurística "ADR verification"

- Modelo: `verificacao:` no frontmatter, depois de `related_changes`, com uma lista de comandos ou caminhos de teste (vazia por padrão). O `adrs/README.md` explica o campo e que acrescentá-lo a uma ADR `Accepted` não muda a decisão.
- Propose, passo 5 da "Architectural Decision Check", item novo: "If the decision can be checked by code (layer dependencies, forbidden imports, schema conformance), fill `verificacao` with the test that checks it and add a task to write that test."
- Verify, heurística nova depois de "Declared gaps":

> **ADR verification**: for each Accepted ADR with a non-empty `verificacao` that the change touches (cited in `design.md` or tied to the affected capabilities), run each listed command or test, or reuse its evidence as **Evidence reuse** allows, and record it under `Comandos:`. A missing or failing test is a CRITICAL issue naming the ADR.

- **Alternativa:** exigir `verificacao` em toda ADR. Rejeitada: decisões de hospedagem ou de processo não se conferem por código.

### D5. Precedência

- `rules.md`, seção 1, parágrafo novo "Precedência entre documentos" com a ordem e as regras do requisito (código converge, salvo lacuna declarada; contrato × specs vai ao responsável; outras divergências são reportadas e o trabalho segue o de maior precedência; o `project.md` pode ajustar a ordem).
- Modelo de `project.md`: seção "Precedência dos documentos", depois de "Key Constraints", com a lista padrão para o projeto ajustar ("contrato de interface: não aplicável" quando não houver).
- Modelo de `project.md`, "Comandos de verificação": linha "Conferência de lacunas", com "Não aplicável" como orientação inicial.
- **Ordem escolhida:** contrato → specs → arquitetura → ADRs → código. Confirmada pelo responsável em 2026-10-22 ("Precedência dos documentos (lacunas): a proposta pôs as specs principais logo depois do contrato: contrato → specs → arquitetura → ADRs → código"). Os projetos de referência usam contrato → arquitetura → ADRs → código; o padrão acrescenta as specs principais logo depois do contrato, porque elas são o contrato de comportamento do OpenSpec.

### D6. CI e README

- "Trechos customizados das skills": `check "$f" "Declared gaps"` e `check "$f" "ADR verification"` no laço do verify; `check "$f" "verificacao"` no laço do propose.
- "Sintaxe dos scripts": `node --check scripts/lacunas.mjs`.
- Passo novo "Smoke test do registro de lacunas" num diretório temporário: registro em dia (código 0), linha sem motivo (código 1), fonte alterada (código 1 e a mensagem "releia a declaração inteira"), fonte ausente (código 1), sem registro (código 0).
- README: os trechos novos na tabela de trechos customizados e uma linha sobre o `lacunas.mjs` na lista de scripts.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/openspec/lacunas.md` (novo) | D1 | stores novos |
| `padrao-openspec/scripts/lacunas.mjs` (novo) | D2 | verify; CI |
| `padrao-openspec/.claude/commands/opsx/verify.md`, `skills/openspec-verify-change/SKILL.md` | D3, D4 | espelhos da raiz |
| `padrao-openspec/.claude/commands/opsx/propose.md`, `skills/openspec-propose/SKILL.md` | D4 | espelhos da raiz |
| `padrao-openspec/openspec/adrs/template.md`, `adrs/README.md` | D4 | espelhos da raiz |
| `padrao-openspec/openspec/rules.md` | D5 | `docs/openspec-regras.md` e blocos gerenciados nos projetos |
| `padrao-openspec/openspec/project.md` | D5 | stores novos |
| `.github/workflows/validate.yml`, `README.md` | D6 | nenhum |
| `padrao-openspec/VERSION`, `CHANGELOG.md` | versão | workflow de atualização dos projetos |

## Risks / Trade-offs

- [Lacuna "nova" depende do julgamento do agente quando o projeto não tem teste de conferência] → a heurística limita a busca às fontes que a change toca, e o `project.md` pode registrar um comando de conferência que torna a checagem mecânica.
- [Registro vira lista de desculpas] → motivo e data obrigatórios, e o encaminhamento à vista; o verify cobra a lacuna fechada que ficou no registro.
- [Hash muda por diferença de fim de linha] → normalização CRLF → LF antes do hash (D2).
- [Conflito de edição com a outra sessão] → rebasear na `main` antes do apply e combinar a versão.

## Migration Plan

Projetos existentes recebem o modelo `lacunas.md`, o script, o campo `verificacao` e as heurísticas pelo PR de atualização; as ações do CHANGELOG pedem para acrescentar a seção "Precedência dos documentos" e a linha "Conferência de lacunas" ao `project.md` do store, e para preencher `verificacao` nas ADRs que se conferem por código. Rollback: reverter os commits e voltar o `VERSION`.

## Open Questions

- **ADR para o registro e a precedência:** o formato do registro de lacunas e a ordem de precedência valem para todo projeto e restringem changes futuras, o que atende aos critérios de ADR do `adrs/README.md`. Esta proposta não cria a ADR por orientação recebida; cabe ao responsável decidir, antes do apply, se uma ADR `Proposed` (por exemplo, "Lacunas declaradas e precedência entre documentos") entra nesta change, o que acrescentaria uma tarefa de redigi-la e promovê-la.
