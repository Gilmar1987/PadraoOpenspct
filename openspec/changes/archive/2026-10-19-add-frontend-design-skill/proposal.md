# Proposal

## Why

Projetos com interface criados a partir do padrão não recebem orientação de design visual: as skills de stack cobrem código, testes e migrações, mas não direção estética, tipografia ou acessibilidade visual. A skill oficial `frontend-design` (anthropics/skills, Apache 2.0) cobre essa lacuna, mas hoje nada no padrão a indica. Além disso, quando o agente toma decisões de design visual, elas ficam só na conversa, e não no `design.md` da change.

## What Changes

- Ao final de uma instalação com `--stack nextjs`, o instalador passa a recomendar também a skill `frontend-design`, ao lado das skills oficiais da Vercel. O instalador não a instala, como já acontece com as demais skills oficiais.
- Os READMEs da raiz e do `padrao-openspec` passam a listar a `frontend-design` na tabela de skills oficiais externas, com o comando de instalação.
- A skill `nextjs-implementation` passa a orientar que, em changes com interface nova ou redesenhada, o plano de design (paleta, tipografia, layout e princípios) seja registrado no `design.md` da change, usando a `frontend-design` quando ela estiver disponível.
- O smoke test do instalador passa a cobrir a recomendação.

### Fora do escopo

- Copiar a `frontend-design` para `padrao-openspec/.claude/skills/`: ela continua com o próprio ciclo de atualização.
- Criar um subagente de frontend: a skill é usada pelo agente que implementa a tarefa (Code Implementer), sem um papel novo no fluxo.
- Recomendar a skill para `--stack dotnet`: projetos .NET podem não ter front-end próprio. Projetos `dotnet-nextjs` recebem a recomendação pela parte Next.js.
- Instalar automaticamente qualquer skill oficial.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `skill-installation`: acrescenta o requisito de recomendar as skills oficiais externas por stack ao final da instalação, incluindo a `frontend-design` para Next.js.

## Impact

- **Código:** `padrao-openspec/scripts/install-skills.mjs` (recomendações por stack).
- **Conteúdo:**
  - `padrao-openspec/.claude/skills/nextjs-implementation/SKILL.md` e seu espelho em `.claude/skills/`, regenerado pelo sync;
  - `README.md` e `padrao-openspec/README.md`.
- **CI:** smoke test do instalador em `.github/workflows/validate.yml`.
- **Riscos:**
  - Dados pessoais e autenticação: não se aplicam.
  - Não há esquema de dados nem segredos novos.
  - Compatibilidade: nenhuma quebra; a saída do instalador só ganha linhas.
  - Dependência externa: o comando recomendado aponta para um repositório de terceiros que pode mudar de estrutura. O padrão só documenta o comando, sem executá-lo.
