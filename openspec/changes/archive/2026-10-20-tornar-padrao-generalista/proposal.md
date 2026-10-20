# Proposal

## Why

O padrão mantém presets e skills só para .NET e Next.js. O teste de ponta a ponta com Django (controleCondominio, 2026-10-19) mostrou o custo disso: sem preset, o projeto caiu em `--stack none`, e nada no fluxo dizia quais comandos validam o código. O init completou a stack por conta própria, e o apply improvisou a verificação em navegador. Manter um preset por stack não escala: cada stack nova exige preset, skill, smoke tests e manutenção das regras base copiadas em cada `config.yaml`.

O responsável decidiu tornar a ferramenta generalista: o padrão não traz nenhuma stack embutida. A stack de cada projeto vem da entrevista do `/opsx:init`, que passa a registrar também os comandos de verificação usados pelo apply e pelo verify.

## What Changes

- **BREAKING** Remove os presets `dotnet`, `nextjs` e `dotnet-nextjs` (`padrao-openspec/presets/`).
- **BREAKING** Remove as skills de stack `dotnet-implementation` e `nextjs-implementation`, inclusive os espelhos na raiz.
- **BREAKING** Remove a opção `--stack` do `setup-project.mjs` e do `install-skills.mjs`. Quem passar `--stack` recebe um erro que explica a remoção. O setup deixa de substituir `project.md` e `config.yaml`: ele só grava o nome do projeto.
- Remove a recomendação de skills oficiais externas por stack ao fim da instalação.
- O `project.md` neutro ganha a seção **Comandos de verificação** (instalar dependências, executar localmente, testes, lint, typecheck/build, migrações), e o config base orienta o apply e o verify a usar esses comandos.
- O `/opsx:init` substitui o bloco 7, que complementava os campos do preset, por um bloco que registra os comandos de verificação do projeto e completa os campos da Stack Summary que continuarem "A definir".
- As perguntas de stack do init deixam de privilegiar .NET e Next.js: cada pergunta traz opções de ecossistemas diferentes, além de "Outro".
- A skill `docker` troca os exemplos de .NET e Next.js por orientações e um esqueleto que valem para qualquer stack.
- A CI deixa de validar presets e skills de stack e passa a conferir que `--stack` é rejeitado. O `test-setup.ps1` perde o parâmetro `-Stack`.
- ADR-0003 substitui a ADR-0001: mantém `padrao-openspec/` como fonte única e troca "variações por stack como presets e skills de stack" por "padrão sem stack embutida".
- READMEs da raiz e de `padrao-openspec/` atualizados, com uma seção de migração para quem usava `--stack`.

### Fora do escopo

- Criar presets ou skills para outras stacks, inclusive Django.
- Mudar projetos consumidores já configurados. As skills de stack instaladas neles continuam onde estão; o instalador não as remove.
- As demais correções do teste de ponta a ponta (remoto e revisão no init, registro do verify, fluxo de commits e aprovação do archive). Elas ficam nas changes `init-e-setup-orientados-ao-ambiente`, `registro-de-verificacao-detalhado` e `fluxo-de-change-auditavel`.
- Mudar o OpenSpec CLI ou o schema `spec-driven`.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `skill-installation`: o conjunto distribuído passa a ser só de skills neutras; a recomendação de skills oficiais por stack é removida; `--stack` é rejeitado.
- `store-setup`: o setup deixa de aplicar presets; o requisito de backup de arquivos substituídos pelo preset é removido, e entra o requisito de gravar só o nome do projeto.
- `project-initialization`: o complemento dos campos do preset vira o registro dos comandos de verificação; as opções de stack passam a cobrir vários ecossistemas; a precedência da decisão de testes deixa de citar preset.
- `continuous-validation`: as validações do store deixam de carregar presets e passam a conferir a rejeição de `--stack`.
- `nextjs-implementation-guidance`: removida inteira, junto com a skill que ela descreve.

## Impact

- **Scripts:** `padrao-openspec/scripts/setup-project.mjs`, `install-skills.mjs` e `test-setup.ps1`.
- **Fonte única:** remoção de `padrao-openspec/presets/` e de `padrao-openspec/.claude/skills/{dotnet,nextjs}-implementation/`; `skills/docker/`, `commands/opsx/init.md` e `openspec/project.md` e `config.yaml` neutros. O sync remove os espelhos órfãos da raiz.
- **CI:** `.github/workflows/validate.yml`.
- **Documentação:** `README.md` da raiz e `padrao-openspec/README.md`.
- **ADRs:** nova ADR-0003; ADR-0001 passa a `Superseded`.
- **Riscos:**
  - Dados pessoais, autenticação e superfície exposta: não se aplicam; a change só mexe em scripts, skills e documentação do padrão.
  - Esquema de dados e variáveis de ambiente: não se aplicam.
  - **Compatibilidade:** é uma quebra para quem automatiza o setup com `--stack`. A mensagem de erro e a seção de migração dos READMEs dizem como seguir. Stores já configurados com preset continuam válidos, porque o `project.md` e o `config.yaml` deles já pertencem ao projeto.

## Aprovação

- Responsável: gilmar.campelo
- Data: 2026-10-19
- Escopo: archive
- Condições: `openspec validate --all --strict` passa na raiz e em `padrao-openspec/`; `sync-root.mjs --check` passa; o lint de Markdown passa nos dois lugares; os smoke tests locais do instalador e do setup passam; o verify termina sem críticos; nenhum arquivo fora do raio de impacto é alterado sem confirmação. Commits na branch `feat/padrao-generalista-e-correcoes`; push e PR só com pedido do responsável.
- Origem: respostas do usuário no chat, depois de "implemente toda as correções e aprimoramentos": "Por tema, 4 changes (Recomendado)"; à pergunta sobre o preset Django, "O ideal é remover as outra .NET e NextJs  deixar a ferramenta generalista"; e à pergunta "Qual autorização você dá?", "Até o archive, com condições (Recomendado)", cuja opção dizia "condições 'validate --strict, sync-root --check e markdownlint passando; sem mudar arquivos fora do raio de impacto'" e "Commits em branch; push e PR só com seu pedido"
