# Tasks

## 1. Teste da mensagem final

- [x] 1.1 Acrescentar ao "Smoke test do script de entrada" as checagens do D5 (`pasta do workspace` nas saídas dos dois modos). Verificar rodando o passo no Git Bash: deve falhar.
  - Evidência: `[FAIL (1)] Smoke test do script de entrada` com as duas checagens de `pasta do workspace`, antes da mudança na mensagem (exit 1, esperado).

## 2. Correções nos scripts

- [x] 2.1 Aplicar o D1 e o D2 em `setup-project.mjs` e `comecar.mjs`. Verificar rodando, no Git Bash do Windows, o `comecar.mjs` nos dois modos com `--pasta "c:/..."` (drive em minúscula) contra um padrão local com tags: os dois terminam com código 0, e o `openspec context --json` no código resolve o store. Antes da correção, o modo novo falha com "not this store".
  - Evidência: antes da correção, `comecar.mjs --modo novo --pasta "c:\...\a"` → exit 1 com "resolves C:\... not this store (c:\...)", e o modo existente → exit 1 com "o CLI resolve C:\... e não c:\..."; depois do D1 e do D2, os dois modos → exit 0, "✔ O CLI encontra o store a partir do código", e `openspec context --json` no código clonado → `C:\...\drive-teste-openspec\padrao-openspec`. Com TTY simulado, as perguntas "Pasta onde os repositórios vão ficar", "Nome do projeto", "Id do projeto" e "Confirmar?" continuam aparecendo. O redesenho do console real fica para o teste do responsável.
- [x] 2.2 Aplicar o D3 no `comecar.mjs`. Verificar com o passo da 1.1 passando e com a saída mostrando a linha `code "..."` nesta máquina, que tem o VS Code.
  - Evidência: `[PASS] Smoke test do script de entrada` (exit 0); saída dos dois modos com "Abra a pasta do projeto como pasta do workspace", `code "c:\...\drive-teste"` (o VS Code existe nesta máquina), o caminho do menu e "Se /opsx não aparecer, o Claude Code foi aberto em outra pasta.".

## 3. Guia e versão

- [ ] 3.1 Aplicar o D4 no `COMECE-AQUI.md` e o D6 no `VERSION` e no `CHANGELOG.md`. Verificar com o lint da raiz sem issues e com os passos "Guia de primeiros passos" e "Versão e changelog" passando.
- [ ] 3.2 Rodar `sync-root.mjs --check` e todos os passos dos jobs `store` e `root` localmente. Verificar que todos saem com código 0.

## Workflow follow-up

- Condição da aprovação: o responsável repete o teste no console real (PowerShell), com o `comecar.mjs` deste branch, antes da release.
- Depois do archive: PR, merge e release `v1.3.1` com o `comecar.mjs` anexado; conferir o download.
