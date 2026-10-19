# Tasks

## 1. Fonte única em padrao-openspec

- [x] 1.1 Substituir as sete skills `openspec-*` de `padrao-openspec/.claude/skills/` pelas versões completas da raiz. Verificar com `diff -r` entre as duas pastas: sem diferença para essas sete skills.
- [x] 1.2 Copiar as skills `docker` e `requesting-code-review` para `padrao-openspec/.claude/skills/`. Verificar que cada uma tem `SKILL.md` e os arquivos auxiliares idênticos aos da raiz.
- [x] 1.3 Criar `padrao-openspec/.claude/commands/opsx/` com os nove comandos da raiz (incluindo `init.md`, `ingest.md` e `propose.md` com checagem de ADR). Verificar com `diff -r` contra `.claude/commands/opsx/`.
- [x] 1.4 Acrescentar a `init.md` e `ingest.md` da fonte os blocos "Store selection" e "Project check" e a resolução de `root.path` via `openspec context --json` antes de qualquer caminho `openspec/...` (D8). Verificar que `grep -c "openspec context --json"` encontra ao menos uma ocorrência em cada arquivo e que nenhum caminho de leitura ou escrita fica sem a base resolvida.
- [x] 1.5 Ajustar `padrao-openspec/.markdownlint-cli2.jsonc` para ignorar `.claude/skills/openspec-*/**`, `.claude/commands/opsx/**` e `.claude/skills/requesting-code-review/**` (D6), e corrigir o que restar em `docker`. Verificar que `npx markdownlint-cli2@0.23.2 "**/*.md"` em `padrao-openspec/` sai com 0 issues.

## 2. Instalador

- [x] 2.1 Adicionar a `install-skills.mjs` a operação que instala `.claude/commands/opsx/` (D2), com a mesma checagem de conflito, staging e `--force`. Verificar que, num repositório Git vazio, os nove comandos são instalados e que uma segunda execução reporta `0 installed`.
- [x] 2.2 Mudar o padrão de `--target` para `both` no instalador e no setup, atualizando `usage()` dos dois (D3). Verificar que, sem `--target`, as skills aparecem em `.agents/skills` e `.claude/skills`, e que, com `--target agents`, `.claude/skills` não é criado.
- [x] 2.3 Atualizar os smoke tests do job `store` com os cenários de `skill-installation`: comandos presentes, padrão `both`, conflito em `propose.md` sem `--force`, e skills `docker`, `requesting-code-review` e `versioning-ci-cd` presentes sem `--stack`. Verificar rodando o bloco de smoke test localmente no Git Bash.

## 3. Setup com declaração e verificação do store

- [x] 3.1 Implementar em `setup-project.mjs` a gravação de `store: <id>` em `<code>/openspec/config.yaml`, com as regras de criar, manter, acrescentar e falhar se houver conflito sem `--force` (D7). Verificar os três cenários de "Declaração do store no repositório de código" num diretório temporário.
- [x] 3.2 Transformar a falha de `openspec store register` em erro e acrescentar a verificação via `openspec context --json` em `<code>`, comparando `root.path` com `storeRoot` (D7). Verificar que o setup com `--register-id` termina em 0 e imprime a confirmação, e que um id já usado por outro caminho faz o setup terminar com código ≠ 0 e exibir o comando de correção. Ao final, remover o registro de teste com `openspec store unregister`.
- [x] 3.3 Atualizar a mensagem final para o caso `--no-register`, explicando como registrar e declarar depois. Verificar pela saída do setup com `--no-register`.
- [x] 3.4 Acrescentar ao smoke test do setup um passo com `--register-id ci-store` que confere `store: ci-store` no config do código e que `openspec context --json` resolve para o store. Verificar rodando o passo localmente e desregistrando `ci-store` em seguida.

## 4. Espelhamento da raiz

- [x] 4.1 Criar `padrao-openspec/scripts/sync-root.mjs` com o mapeamento do D4, espelho exato, guarda por `../openspec/rules.md`, rejeição de links simbólicos e modo `--check`. Verificar com `node --check`.
- [x] 4.2 Rodar o sync para gerar `.claude/skills`, `.claude/commands/opsx`, `.github/agents` e `openspec/adrs/{README,template}.md` na raiz. Verificar que `sync-root.mjs --check` sai em 0, e que `.claude/CLAUDE.md`, `.github/copilot-instructions.md` e `openspec/adrs/0001-*.md` continuam inalterados.
- [x] 4.3 Verificar os cenários de `source-sync`: editar um arquivo espelhado na raiz faz `--check` sair ≠ 0 citando o caminho sem alterar nada; criar um órfão em `.claude/commands/opsx/` e rodar o sync o remove. Desfazer as alterações de teste ao final.

## 5. CI na raiz

- [x] 5.1 Criar `.github/workflows/validate.yml` com os jobs `store` (passos atuais com `working-directory: padrao-openspec`) e `root` (sync `--check`, `openspec validate --all --strict`, lint), e remover `padrao-openspec/.github/workflows/validate.yml` (D5). Verificar que o YAML é válido (`npx --yes yaml-lint` ou parser do Node) e que só há um workflow no repositório.
- [x] 5.2 Criar `.markdownlint-cli2.jsonc` na raiz (D6) e corrigir `README.md`, `openspec/rules.md` e `openspec/project.md`. Verificar que `npx markdownlint-cli2@0.23.2 "**/*.md"` na raiz sai com 0 issues.
- [x] 5.3 Verificar que `openspec validate --all --strict` passa na raiz com esta change ativa.

## 6. Remoções e documentação

- [x] 6.1 Remover `openspec-store-dotnet/`, `openspec-store-nextjs/` e a pasta vazia `openspec/schemas/`. Verificar com `git status` que só esses caminhos aparecem como removidos.
- [x] 6.2 Atualizar a seção 4 de `openspec/rules.md` com o Business Requirements Ingestor e a nota sobre onde os agentes vivem (D9). Verificar que as seis linhas da tabela correspondem aos seis arquivos de `.github/agents/`.
- [x] 6.3 Atualizar o `README.md` da raiz: estrutura sem os stores removidos e sem AgendaFácil, tabela "Qual store usar" com presets, seção de migração dos stores removidos, regra "edite em `padrao-openspec/` e rode o sync" e padrão `--target both`. Verificar que `grep -i "agendaf\|openspec-store-"` só encontra a seção de migração.
- [x] 6.4 Atualizar `padrao-openspec/README.md` e `presets/README.md`: fluxo de clone igual ao da raiz, localização do workflow, comandos instalados, padrão `both` e declaração do store. Verificar que os caminhos de comando citados existem com `test -f` em cada um.
- [x] 6.5 Atualizar `padrao-openspec/scripts/test-setup.ps1`: remover os checks dos stores removidos e do AgendaFácil, e incluir checks de `.claude/skills`, `.claude/commands/opsx/init.md` e `ingest.md` no código. Verificar executando `test-setup.ps1 -RepoUrl <caminho local do repositório>` com todos os checks em PASS.

## 7. Integração

- [x] 7.1 Rodar de ponta a ponta, no Git Bash, os passos dos dois jobs da CI. Verificar que todos saem com código 0.
- [x] 7.2 Revisar a ADR-0001 e promovê-la de `Proposed` para `Accepted` no PR. Verificar que o frontmatter mostra `status: Accepted` antes do archive.

## Workflow follow-up

- Rodar `/opsx:verify` e, depois da revisão do PR, `/opsx:archive`.
- Abrir changes próprias para o que ficou fora do escopo: layout de store único por projeto, stubs de regras no consumidor, divergência entre `project.md` e o design, detecção de `[x]` sem evidência e redução do `init.md`.
