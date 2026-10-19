# Design

## Context

- `.openspec.yaml` de cada change guarda `created: AAAA-MM-DD`, só a data.
- O archive move a pasta para `changes/archive/AAAA-MM-DD-<nome>/`, e o prefixo é a data do archive.
- A seção `## Aprovação` (PR #4) tem o campo `- Data: AAAA-MM-DD` quando preenchida.
- O relatório do `/opsx:verify` não é gravado em lugar nenhum hoje.
- O git interpreta trailers, e `git log --format=%(trailers:key=OpenSpec-Change,valueonly)` devolve o valor; isso foi testado com `git interpret-trailers`.
- Os scripts do padrão são Node ESM sem dependências (`install-skills.mjs`, `setup-project.mjs`, `sync-root.mjs`), com mensagens em inglês e saída por `console.log`.
- O comando e a skill de verify não são idênticos entre si; os de apply são. Os trechos customizados são protegidos pelo passo de CI "Trechos customizados das skills".

## Architecture Decisions

- [ADR-0002](../../adrs/0002-rastreabilidade-commit-change.md), `Proposed`: trailer `OpenSpec-Change` liga commits de código às changes. É promovida a `Accepted` na revisão do PR.
- Segue a [ADR-0001](../../adrs/0001-padrao-openspec-fonte-unica.md): skills e comandos são editados em `padrao-openspec/` e espelhados pelo sync.

## Goals / Non-Goals

**Goals:**

- Números que ninguém consegue inflar declarando: tudo vem de datas, contagens de texto e Git.
- Rodar em qualquer máquina com Node e Git, inclusive no Windows.
- Degradar com clareza: dado ausente vira coluna vazia com aviso no resumo, nunca zero.

**Non-Goals:**

- Persistir histórico de métricas: cada execução recalcula tudo a partir das fontes.
- Interpretar os números; o resumo apresenta, sem metas nem notas.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/scripts/flow-metrics.mjs` | novo | nenhum (não é importado por outros scripts) |
| `padrao-openspec/.claude/commands/opsx/apply.md` e `skills/openspec-apply-change/SKILL.md` | instrução do trailer | espelhos na raiz (sync); projetos que reinstalarem |
| `padrao-openspec/.claude/commands/opsx/verify.md` e `skills/openspec-verify-change/SKILL.md` | passo de gravação do `verification.md` | espelhos na raiz (sync); projetos que reinstalarem |
| `.github/workflows/validate.yml` | marcadores novos no passo de trechos customizados; smoke test do script | job `store` |
| `README.md` e `padrao-openspec/README.md` | seção de métricas; lista de trechos customizados | nenhum |

## Decisions

### D1. Formato do `verification.md`

Uma seção por execução, a mais recente por último, com itens fixos que o script lê por prefixo:

```markdown
# Verificações — <nome-da-change>

## 2026-10-17

- Críticos: 0
- Warnings: 2
- Sugestões: 1
- Não verificado: Execução no GitHub Actions (sem push)
- Avaliação: Sem críticos; 2 warnings a considerar.
```

- Sem checagem não verificada, a linha fica `- Não verificado: —`. Com várias, elas são separadas por `;`.
- O script usa a última seção `## AAAA-MM-DD` do arquivo.
- Alternativa descartada: frontmatter YAML, que o agente edita com mais erro e que não acomoda um histórico.

### D2. Onde o verify grava

O passo 8 ("Generate Verification Report") do comando e da skill de verify ganha um fechamento, com o mesmo texto nos dois:

- depois de apresentar o relatório, o agente acrescenta a entrada ao `verification.md` na pasta da change, criando o arquivo se ele não existir;
- isso vale inclusive para uma change sem problemas.

O marcador "Write the verification record" entra no passo de CI de trechos customizados.

### D3. Trailer no apply

O passo 6 ("Implement tasks") do comando e da skill de apply ganha uma instrução: todo commit de código da change leva o trailer `OpenSpec-Change: <nome>`. O apply não obriga a commitar; ele só define o formato quando houver commit. O marcador "OpenSpec-Change:" entra no passo de CI.

### D4. Interface do script

```text
node padrao-openspec/scripts/flow-metrics.mjs [--store <dir>] [--code <repo>]... [--ci] [--out <dir>]
```

- `--store`: diretório que contém `openspec/`. O padrão é o diretório onde está a pasta `scripts/` do script, ou seja, o próprio `padrao-openspec/`.
- `--code`: repetível; sem ele, retrabalho fica vazio.
- `--ci`: consulta o GitHub com `gh`; sem `gh` autenticado, emite aviso e segue.
- `--out`: diretório da saída; o padrão é o diretório atual. É o único lugar onde o script escreve.

### D5. Colunas do `metrics.csv`

`change, estado, criada, aprovada, arquivada, dias_ate_aprovacao, dias_execucao, lead_time_dias, requisitos, cenarios, tarefas, tarefas_concluidas, retrabalho, criticos, warnings, sugestoes, nao_verificados, ci_falhas_antes_do_verde`

- `estado` é `ativa` ou `arquivada`.
- As datas seguem o formato ISO `AAAA-MM-DD`.
- As contagens de requisitos e cenários vêm de `### Requirement:` e `#### Scenario:` nas delta specs da change; as de tarefas, do `tasks.md` com o mesmo critério do CLI (só `x` ou `X` contam como concluídas).
- Valor ausente é campo vazio.
- Separador vírgula, aspas quando necessário, codificação UTF-8 com BOM para o Excel abrir acentos corretamente.

### D6. Fallbacks de data

- **Criação:** `created` do `.openspec.yaml`; se faltar, a data do primeiro commit que tocou a pasta da change no store.
- **Archive:** o prefixo da pasta.
- **Aprovação:** só a seção `## Aprovação`; não há fallback, porque inventar uma data seria pior que deixar o campo vazio.

### D7. Retrabalho

Para cada `--code`, o script roda um `git log` em todas as branches com assunto, data e trailer. O separador de registro é `%x1e` e o de campo é `%x1f`, para não quebrar com caracteres na mensagem. Ele conta os commits cujo assunto começa com `fix` (`fix:` ou `fix(`), cujo trailer é o nome de uma change arquivada e cuja data é estritamente posterior à do archive.

### D8. CI via `gh`

- Para cada change, o script busca o pull request por `gh pr list --state all --search "<nome> in:title,body"`.
- No primeiro resultado, conta as execuções com `conclusion: failure` anteriores à primeira `success` do workflow, com `gh run list --branch <headRefName>`.
- **Heurística declarada:** com mais de um PR possível, usa o primeiro; sem PR, o campo fica vazio.

### D9. Resumo

O `resumo.md` traz:

- período coberto;
- changes ativas e arquivadas;
- vazão por mês e por semana ISO, com a mediana do lead time;
- mediana de espera até a aprovação e de execução;
- total de commits de retrabalho;
- distribuição de críticos e warnings;
- uma seção "Limites" com o que não foi coletado (sem `--code`, sem trailer, sem `gh`) e a resolução de dias.

## Risks / Trade-offs

- **[Commits feitos fora do fluxo sem trailer escapam do retrabalho]** → o resumo mostra quantos commits `fix` não têm trailer, para dar ideia do que ficou de fora.
- **[O agente pode esquecer de gravar o `verification.md`]** → o marcador no passo de CI protege a instrução, não o comportamento. A ausência do arquivo aparece como coluna vazia no CSV.
- **[A busca do PR por nome é heurística]** → só é usada com `--ci` e fica marcada como heurística no resumo.
- **[Métricas viram metas e passam a ser manipuladas]** → o padrão não define metas; o resumo apresenta números sem ranking nem pessoas, e o README explica o uso esperado.
