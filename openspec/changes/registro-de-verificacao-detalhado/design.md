# Design

## Context

- O passo "Write the verification record" da skill `openspec-verify-change` e do comando `verify.md` define o formato exato de cada entrada: contagens, "Não verificado" e "Avaliação", e manda não copiar o relatório.
- A heurística "Evidence reuse" já diz que uma checagem fora do repositório é "covered outside the suite", mas o formato não tem onde registrar isso.
- `flow-metrics.mjs` (`verificationCounts`) lê da última entrada só as linhas `^- Críticos:`, `^- Warnings:`, `^- Sugestões:` e `^- Não verificado:`.
- O passo "Trechos customizados das skills" da CI exige os marcadores "Write the verification record" e "Evidence reuse" nos dois arquivos.

## Architecture Decisions

Não há ADR nova. Segue a [ADR-0003](../../adrs/0003-padrao-sem-stack-embutida.md) (edição na fonte única, comandos de verificação no `project.md`).

## Goals / Non-Goals

**Goals:**

- Quem lê o `verification.md` depois do archive sabe o que foi apontado e como foi verificado.
- Métricas de fluxo inalteradas.

**Non-Goals:**

- Registrar o relatório completo ou a saída integral dos comandos.

## Decisions

### D1. Formato da entrada

```markdown
## YYYY-MM-DD

- Críticos: <n>
- Warnings: <n>
- Sugestões: <n>
- Não verificado: <check (reason); check (reason)>, or — when every check ran
- Cobertura fora da suíte: <scenario (where the evidence is; who ran it); ...>, or —
- Avaliação: <the final assessment in one line>

Itens:

- [crítico] <one-line summary> (`<file:line>` when there is one)
- [warning] <one-line summary>
- [sugestão] <one-line summary>

Comandos:

- `<command>` → <relevant result> (exit <code>)
- `<command>` → <relevant result> (exit <code>; reused from apply)
```

- Sem itens, a lista vira `Itens: nenhum`. Sem comandos (por exemplo, só inspeção), `Comandos: nenhum (<motivo>)`.
- Os marcadores `[crítico]`, `[warning]` e `[sugestão]` não começam com os rótulos das contagens, então o `flow-metrics.mjs` não os confunde.
- O resultado relevante é uma linha (por exemplo, `130 passed`, `0 issues`), nunca a saída inteira.

### D2. Comandos de verificação do projeto

Na heurística "Evidence reuse", antes da regra atual, entra:

> **Project validation commands**: take test, lint, typecheck and build evidence from the commands in the "Comandos de verificação" section of `openspec/project.md` that apply to the change. A command recorded as missing or postponed there is reported as not verified with that reason; never invent a replacement.

O texto da regra atual de reaproveitamento continua igual.

### D3. Proteção na CI

- Trechos customizados: os dois arquivos de verify passam a exigir também "Cobertura fora da suíte" e "Project validation commands".
- Smoke das métricas de fluxo: a entrada de 2026-10-08 do `verification.md` de exemplo ganha a linha "Cobertura fora da suíte", a lista "Itens:" com um `[warning]` e um `[sugestão]` e a lista "Comandos:". As asserções existentes do CSV (2 warnings, 1 sugestão, 1 não verificado) não mudam.

### D4. Documentação

A tabela de trechos customizados do `README.md` passa a citar "Cobertura fora da suíte" e "Project validation commands" na linha do verify.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/.claude/skills/openspec-verify-change/SKILL.md` | D1, D2 | espelho da raiz |
| `padrao-openspec/.claude/commands/opsx/verify.md` | D1, D2 | espelho da raiz |
| `.github/workflows/validate.yml` | D3 | nenhum |
| `README.md` | D4 | nenhum |
| `padrao-openspec/scripts/flow-metrics.mjs` | nenhuma (dependente) | lê o `verification.md`; protegido pelo smoke |

## Risks / Trade-offs

- [Registro mais longo] → uma linha por item e por comando, sem relatório.
- [Quebra das métricas] → marcadores distintos das contagens; smoke com o formato novo.

## Migration Plan

Entradas antigas continuam válidas; as novas seguem o formato D1. Rollback: reverter os commits.

## Open Questions

Nenhuma.
