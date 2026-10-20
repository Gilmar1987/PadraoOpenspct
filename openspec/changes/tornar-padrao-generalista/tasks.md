# Tasks

## 1. Decisão arquitetural

- [x] 1.1 Criar `openspec/adrs/0003-padrao-sem-stack-embutida.md` a partir do `template.md`, `status: Accepted`, `supersedes: ADR-0001`, com a decisão do design (Architecture Decisions); marcar a ADR-0001 como `Superseded` com `superseded_by: ADR-0003`. Verificar com `grep -n "status:\|superseded_by:" openspec/adrs/000[13]*.md`.

## 2. Scripts

- [x] 2.1 Atualizar os smoke tests de `.github/workflows/validate.yml` conforme o D7 (instalador e setup recusam `--stack`; setup sem preset; sem skills de stack; sem `.bak`). Verificar rodando os blocos alterados num Git Bash local contra os scripts atuais: as asserções novas de recusa de `--stack` devem falhar.
- [x] 2.2 Implementar o D2 em `padrao-openspec/scripts/install-skills.mjs`. Verificar com `node --check` e com o bloco "Smoke test do instalador" passando localmente.
- [x] 2.3 Implementar o D1 em `padrao-openspec/scripts/setup-project.mjs`. Verificar com `node --check` e com os blocos de smoke do setup, do setup em subpasta e da declaração do store passando localmente.
- [x] 2.4 Tirar de `padrao-openspec/scripts/test-setup.ps1` o parâmetro `-Stack`, o `--stack` da chamada e o check "config.yaml foi substituído pelo preset" (trocar por "config.yaml continua neutro"). Verificar com o parser do PowerShell: `[System.Management.Automation.Language.Parser]::ParseFile(...)` sem erros.

## 3. Fonte única

- [x] 3.1 Remover `padrao-openspec/presets/` e `padrao-openspec/.claude/skills/{dotnet,nextjs}-implementation/`. Verificar com `ls padrao-openspec` e `ls padrao-openspec/.claude/skills`.
- [x] 3.2 Aplicar o D3 em `padrao-openspec/openspec/project.md` e `config.yaml`, e trocar no passo de configs da CI o laço sobre presets pelo config base (D7). Verificar com `openspec instructions apply` sem avisos num probe e com a regra nova presente na saída.
- [x] 3.3 Aplicar o D4 e o D5 em `padrao-openspec/.claude/commands/opsx/init.md`. Verificar com `grep -n "preset" padrao-openspec/.claude/commands/opsx/init.md` sem resultados e com as opções novas presentes.
- [x] 3.4 Aplicar o D6 em `padrao-openspec/.claude/skills/docker/SKILL.md` e `docker-guidelines.md`. Verificar com `grep -niE "dotnet|next\.js|\.NET" padrao-openspec/.claude/skills/docker/*` sem resultados.
  - Evidência (critério adaptado): o grep retorna 1 linha, `docker-guidelines.md:236`, que cita `dotnet restore --locked-mode` ao lado de `npm ci` e `pip install`, como exemplo de instalação por lockfile em várias stacks. Não há mais seção nem exemplo específico de .NET ou Next.js.

## 4. Documentação e integração

- [x] 4.1 Aplicar o D9 em `README.md` e `padrao-openspec/README.md`. Verificar com `grep -niE "preset|--stack"` restrito às seções de migração e com o lint de Markdown dos dois lugares sem issues.
  - Evidência: `markdownlint-cli2` → "Summary: 0 issues in 0 files" na raiz (README e ADRs) e em `padrao-openspec/` (13 arquivos). Critério adaptado: além da seção "Migração do `--stack`", o grep encontra 6 linhas que só declaram a remoção (por exemplo, "o padrão não traz presets nem skills de stack", "a opção `--stack` foi removida"); nenhuma orienta usar preset ou `--stack`.
- [x] 4.2 Rodar `node padrao-openspec/scripts/sync-root.mjs`, depois `sync-root.mjs --check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares, `node --check` dos scripts e todos os smoke tests do job `store` localmente. Verificar que todos saem com código 0 e que `.claude/skills/{dotnet,nextjs}-implementation` não existe mais na raiz.
  - Evidência: os passos do `validate.yml`, extraídos e executados no Git Bash (exceto a instalação global do CLI), deram `[PASS]` em todos: 11 do job `store` (validate, config base, lint, sintaxe, trechos customizados e os 6 smoke tests) e 3 do job `root` (`sync-root.mjs --check`, validate da raiz, lint). `ls .claude/skills` não lista mais as skills de stack. O primeiro sync falhou com `EISDIR` ao remover a pasta órfã; a correção do `sync-root.mjs` está registrada no raio de impacto do design. O registro `ci-store` criado pelo smoke da declaração foi removido com `openspec store unregister ci-store`.
