# Design

## Context

- `padrao-openspec/presets/` tem três presets (`dotnet`, `nextjs`, `dotnet-nextjs`). Cada um traz um `project.md` com a Stack Summary pré-preenchida e um `config.yaml` que repete as regras base e acrescenta as da stack.
- `setup-project.mjs` exige `--stack` (ou pergunta), aplica o preset, faz backup de arquivos editados e chama o instalador com `--stack` quando há skills de stack.
- `install-skills.mjs` separa as skills de stack (`dotnet-implementation`, `nextjs-implementation`) das neutras e, com `--stack`, recomenda skills oficiais externas.
- O bloco 7 do `/opsx:init` lê a Stack Summary "do preset ativo" e pergunta os campos "A definir" com as opções do preset.
- A CI valida o config base e cada preset (passo de configs), instala skills de stack nos smoke tests e roda o setup com `--stack dotnet-nextjs` e `--stack nextjs`.
- No teste com Django, o projeto usou `--stack none`. O `project.md` neutro não tinha onde registrar os comandos de teste, lint e build, e o config base dizia só "usar ferramentas de teste, lint e build existentes".

## Architecture Decisions

- **ADR-0003 — Padrão sem stack embutida** (`openspec/adrs/0003-padrao-sem-stack-embutida.md`, nasce `Accepted` pela decisão explícita do responsável citada na proposal). Mantém a decisão de fonte única da ADR-0001 e troca a cláusula "variações por stack MUST ser expressas como presets e skills de stack" por "o padrão MUST NOT conter presets nem skills de stack; a stack e os comandos de verificação de cada projeto vêm do `/opsx:init`".
- **ADR-0001** passa a `Superseded`, com `superseded_by: ADR-0003`. É a única edição permitida numa ADR aceita, pela regra do README de ADRs.

## Goals / Non-Goals

**Goals:**

- Nenhuma menção operacional a presets ou skills de stack na fonte única, nos scripts, na CI e nos READMEs, exceto na seção de migração.
- Um lugar único, no `project.md`, para os comandos de verificação do projeto, usado pelo apply e pelo verify.
- Erro claro para automações que ainda passam `--stack`.

**Non-Goals:**

- Remover skills de stack já instaladas em projetos consumidores.
- Reescrever as perguntas do init além das opções de stack e do bloco 7.

## Decisions

### D1. Setup sem presets

- Remover o objeto `presets`, a pergunta da stack, `applyPreset`, `backupIfEdited`, `committedVersion` e o aviso de "aplique presets no store do projeto".
- `--stack` passa a lançar o erro: `--stack was removed: the standard has no stack presets. Define the stack and the validation commands with /opsx:init.` O erro sai em `parseArgs`, antes de qualquer pergunta ou escrita.
- Com `--name`, o setup troca `{{Nome do Projeto}}` no `project.md`, como já fazia com `none`. Sem `--name`, nada muda no store.
- O resumo do plano perde a linha "Stack". A mensagem final passa a orientar: "Rode /opsx:init no repositório de código para registrar a stack, os comandos de verificação e as ADRs".
- Sem terminal, só `<code-repo>` continua obrigatório.

*Alternativa:* aceitar `--stack` e ignorá-lo com aviso. Rejeitada: uma automação antiga acharia que a stack foi aplicada.

### D2. Instalador sem skills de stack

- Remover o objeto `stacks`, `stackSkillNames`, o filtro de skills de stack e o bloco de recomendações finais. Todas as skills de `.claude/skills/` são instaladas.
- `--stack` lança: `--stack was removed: the standard has no stack skills. Record the project's validation commands in openspec/project.md (see /opsx:init).` O erro sai em `parseArgs`, antes de qualquer cópia.

### D3. Comandos de verificação no `project.md` neutro

Nova seção, depois de "Stack Summary":

```markdown
## Comandos de verificação

| Finalidade | Comando | Observações |
|---|---|---|
| Instalar dependências | <!-- A definir --> | |
| Executar localmente | <!-- A definir --> | |
| Testes | <!-- A definir --> | |
| Lint | <!-- A definir ou não aplicável --> | |
| Typecheck/build | <!-- A definir ou não aplicável --> | |
| Migrações | <!-- A definir ou não aplicável --> | |
```

No `config.yaml` neutro, a orientação do apply "Usar ferramentas de teste, lint e build existentes no projeto consumidor" vira "Usar os comandos da seção Comandos de verificação do project.md; se um comando faltar, perguntar antes de inventar um". O CI de configs confere que essa regra continua presente.

### D4. Bloco 7 do init

O bloco "Complemento da stack" é reescrito em dois passos:

1. **Comandos de verificação:** uma pergunta por finalidade da tabela do D3, com sugestões coerentes com a stack escolhida nas 3.x e 5.4 (por exemplo, `pytest` para Pytest), mais "Não aplicável", "Adiar" e "Outro".
2. **Campos sem decisão:** cada campo da Stack Summary que continua "A definir" e nenhum bloco cobriu, com opções coerentes com a stack escolhida, mais "Adiar" e "Outro".

O arquivo de respostas aceita, no bloco 7, o nome da finalidade ou do campo. A geração do `project.md` deixa de dizer "template do preset ativo" e passa a dizer "template de `<root>/openspec/project.md`"; a do `config.yaml` passa a citar a orientação padrão do config base em vez do preset.

### D5. Opções de stack do init

Ajustes mínimos para não privilegiar uma stack, mantendo 5 opções numeradas + "Outro":

- 3.1: o item Python cita "Django, FastAPI, Flask".
- 3.7 (validação): Zod, FluentValidation, Pydantic, Bean Validation (Java), validação manual.
- 3.8 (jobs): pg-boss, BullMQ, Celery (Python), Hangfire (.NET), Sidekiq (Ruby).
- 5.3: "Lint (ESLint, Ruff, dotnet format, golangci-lint etc.)" e "Typecheck/build (tsc, mypy, compilação .NET/Java/Go)".
- 5.4: Vitest/Jest, Pytest, xUnit/NUnit, JUnit, Go test.
- 4.1: "Vercel" deixa de dizer "ideal para Next.js" e passa a "Vercel / Netlify (front-end e funções)".
- 3.2 e 3.5 (acrescentados depois da primeira verificação, que encontrou só dois ecossistemas no front-end): o front-end passa a oferecer Next.js, SPA em JavaScript/TypeScript, renderização pelo back-end (Django, Rails, Laravel, Razor Pages, Thymeleaf), Blazor e aplicativo móvel ou desktop; o ORM passa a oferecer Prisma/Drizzle, EF Core/Dapper, ORM do próprio framework (Django ORM, Active Record, Eloquent), SQLAlchemy e JPA/Hibernate.

### D6. Skill `docker` sem stack

- `SKILL.md`: os blocos ".NET (multi-stage)" e "Next.js (standalone output)" dão lugar a um esqueleto genérico com estágios `build` e `runtime` e a uma tabela "O que preencher por stack" (imagem de build, comando de build, artefato copiado, imagem de runtime, comando de entrada). O compose de exemplo troca `node worker.js` por `<comando do worker>`, e o `.dockerignore` lista artefatos de várias stacks.
- `docker-guidelines.md`: as seções de Dockerfile e compose específicas de .NET e Next.js viram uma seção genérica "Dockerfile multi-stage" e um compose "aplicação + PostgreSQL" com marcadores. As seções de produção com override, `.dockerignore`, `.env.example`, boas práticas e comandos úteis permanecem.

### D7. CI

- Passo de configs: o laço passa a cobrir só `openspec/config.yaml`; o nome vira "Config base carrega sem avisos".
- Smoke do instalador: remove as asserções de skills de stack e de recomendações; acrescenta `if node scripts/install-skills.mjs "$x" --stack dotnet; then exit 1; fi` e `test ! -e "$x/.agents"` num repositório limpo.
- Smoke do setup: roda sem `--stack`, confere que o `config.yaml` do store ficou igual ao neutro (`cmp` com `git show HEAD:./openspec/config.yaml`), que o nome foi gravado e que `--stack nextjs` falha sem alterar o store.
- Smoke do setup em subpasta: perde a parte de `.bak` (D1) e passa a conferir que o setup sem `--name` não altera `project.md` nem `config.yaml`.
- Smoke da declaração do store: troca `--stack nextjs` e `--stack none` por nada.

### D8. Sync e espelhos

`sync-root.mjs` já remove destinos órfãos em `.claude/skills/`; rodá-lo depois de apagar as skills de stack da fonte remove os espelhos. `openspec/specs/nextjs-implementation-guidance/` é removida pelo archive; se o CLI deixar o arquivo sem requisitos, ele é apagado no commit do archive.

### D9. Documentação

- README da raiz: remove "Qual preset usar" e "Skills de stack"; o setup perde `--stack`; "Skills oficiais externas" vira uma nota curta de que skills de fornecedor podem ser instaladas à parte; "Migração dos stores removidos" ganha "Migração do `--stack`".
- `padrao-openspec/README.md`: remove o diálogo "Qual a stack do projeto?", as menções a presets na árvore e na tabela de skills, o parágrafo do `create-next-app` vira genérico ("gerador de projeto que recusa pasta não vazia"), e a validação contínua deixa de citar presets.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/presets/**` | removidos | `setup-project.mjs`, CI, READMEs |
| `padrao-openspec/.claude/skills/{dotnet,nextjs}-implementation/` | removidos | instalador, espelhos da raiz (sync) |
| `padrao-openspec/scripts/setup-project.mjs` | D1 | CI (smokes de setup), `test-setup.ps1` |
| `padrao-openspec/scripts/install-skills.mjs` | D2 | CI (smoke do instalador), `setup-project.mjs` |
| `padrao-openspec/scripts/test-setup.ps1` | perde `-Stack` e os checks de preset | nenhum |
| `padrao-openspec/openspec/project.md`, `config.yaml` | D3 | `/opsx:init`, CI de configs |
| `padrao-openspec/.claude/commands/opsx/init.md` | D4, D5 | espelho da raiz |
| `padrao-openspec/.claude/skills/docker/SKILL.md`, `docker-guidelines.md` | D6 | espelhos da raiz |
| `.github/workflows/validate.yml` | D7 | nenhum |
| `README.md`, `padrao-openspec/README.md`, `padrao-openspec/presets/README.md` (removido) | D9 | nenhum |
| `openspec/adrs/0001-padrao-openspec-fonte-unica.md`, `0003-padrao-sem-stack-embutida.md` | Superseded; nova | `README.md` (cita a ADR-0001) |
| `.claude/**`, `openspec/adrs/{README,template}.md` da raiz | regenerados pelo sync | nenhum |
| `padrao-openspec/scripts/sync-root.mjs` | descoberto no apply: `pruneEmptyDirs` usava `rmSync` sem `recursive` numa pasta vazia e falhava com `EISDIR` ao remover uma skill inteira; passa a usar `rmdirSync` | job `root` da CI (`--check`) |

## Risks / Trade-offs

- [Quebra para automações com `--stack`] → erro explícito no D1 e no D2, seção de migração nos READMEs, smoke da CI que garante a recusa.
- [Projetos perdem a orientação de stack das skills removidas] → os comandos de verificação passam a ser registrados no init (D3, D4); skills de fornecedor continuam disponíveis por instalação direta.
- [O archive deixar `nextjs-implementation-guidance` sem requisitos e a validação estrita falhar] → conferir com `openspec validate --all --strict` logo depois do archive e apagar a spec vazia no mesmo commit (D8).

## Migration Plan

Projetos já configurados não precisam fazer nada: o `project.md` e o `config.yaml` deles pertencem ao projeto. Quem reinstala as skills com `install-skills.mjs --force` mantém as skills de stack antigas, que o instalador não apaga, e pode removê-las à mão. Rollback: reverter os commits da change.

## Open Questions

Nenhuma.
