# Design

## Context

- A 6.5 fica em `padrao-openspec/.claude/commands/opsx/init.md:629-639`. Ela é `[OPCIONAL]`, com as opções 0 a 6, e não tem a nota de múltipla escolha que outras perguntas do mesmo arquivo usam (por exemplo, a linha 615: "_(Múltipla escolha — separe os números por vírgula)_").
- O 1.5 tem as opções 1 a 3 (sim, com tipos de dado), 4 (Não), 5 (Ainda não sei) e 6 (Outro).
- A checagem de coerência é uma tabela "Combinação | Consequência | Proposta" no mesmo arquivo.
- A cópia da raiz é gerada pelo `sync-root.mjs`; a CI confere com `--check`. O passo "Trechos customizados das skills" não cita a 6.5.

## Architecture Decisions

Não há ADR nova.

## Goals / Non-Goals

**Goals:**

- A 6.5 registra exatamente os controles escolhidos, e a combinação perigosa (dados pessoais sem controles) aparece na checagem.

**Non-Goals:**

- Tornar obrigatório algum controle: a checagem propõe, e o responsável decide.

## Decisions

### D1. Texto da 6.5

```markdown
**6.5 — Quais controles de LGPD/GDPR serão implementados?** `[OPCIONAL]`

_(Múltipla escolha — separe os números por vírgula. Faça esta pergunta só se o 1.5 não for 4 (Não); se for, registre "Não aplicável" e siga para a 6.6. Se um arquivo de respostas trouxer controles na 6.5 com o 1.5 = 4, aponte a combinação na checagem de coerência.)_

0) Não aplicável
1) Consentimento explícito com registro de aceite
2) Direito de exclusão de dados (right to erasure)
3) Exportação de dados do usuário (portabilidade)
4) Anonimização de dados em logs e relatórios
5) Todos os controles de 1 a 4
6) Outro (digitar livremente)
```

Alternativa rejeitada: tirar a opção 5. As regras da entrevista pedem 5 opções numeradas mais o "Outro".

### D2. Checagem de coerência

Linha nova na tabela:

| Combinação | Consequência | Proposta |
|---|---|---|
| 1.5 é 1, 2 ou 3 (dados pessoais ou sensíveis) e 6.5 é 0 | Dados pessoais sem nenhum controle de LGPD/GDPR | Registrar ao menos o consentimento com registro de aceite e o direito de exclusão (1,2), ou justificar |

### D3. Versão

Item novo em "O que mudou" da seção `1.3.1` do CHANGELOG; "Ações no projeto" continua "Nenhuma".

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/.claude/commands/opsx/init.md` | D1, D2 | cópia da raiz (sync-root), instalador |
| `.claude/commands/opsx/init.md` | gerado | `sync-root --check` |
| `CHANGELOG.md` | D3 | passo "Versão e changelog" |

## Risks / Trade-offs

- [O agente ignorar a regra de pular a 6.5] → a regra fica na nota da própria pergunta, onde o agente lê ao chegar nela.

## Migration Plan

Nenhuma migração. Rollback: reverter os commits.

## Open Questions

Nenhuma.
