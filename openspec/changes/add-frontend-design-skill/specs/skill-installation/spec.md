# Spec Delta

## ADDED Requirements

### Requirement: Recomendação de skills oficiais por stack

Ao concluir uma instalação com `--stack`, o instalador SHALL listar as skills oficiais externas recomendadas para cada stack pedida, com o comando de instalação, sem instalá-las. Para `nextjs`, a lista SHALL incluir as skills da Vercel e a skill `frontend-design`. Sem `--stack`, nenhuma recomendação SHALL ser exibida.

#### Scenario: Stack Next.js

- **WHEN** o instalador roda com `--stack nextjs`
- **THEN** a saída recomenda `npx skills add vercel-labs/agent-skills` e `npx skills add https://github.com/anthropics/skills --skill frontend-design`, e nenhuma pasta `frontend-design` é criada no consumidor

#### Scenario: Stack .NET

- **WHEN** o instalador roda com `--stack dotnet`
- **THEN** a saída recomenda as skills oficiais .NET e não menciona `frontend-design`

#### Scenario: Sem stack

- **WHEN** o instalador roda sem `--stack`
- **THEN** a saída não recomenda nenhuma skill oficial externa
