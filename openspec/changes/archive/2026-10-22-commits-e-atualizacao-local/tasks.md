# Tasks

## 1. Testes na CI

- [x] 1.1 Aplicar o D5 no `validate.yml`. Verificar rodando no Git Bash os passos "Smoke test do script de entrada" e "Trechos customizados das skills": devem falhar (o script ainda não commita, e os trechos novos não existem).
  - Evidência: no Git Bash, `[FAIL (2)] Smoke test do script de entrada` (o script ainda não commita) e `[FAIL (1)] Trechos customizados das skills` ("offer to update now" ausente nos 8 arquivos e "Commit the init" no `init.md`), exit diferente de 0, esperado; o `trap` não deixou nenhum id de teste registrado.

## 2. Commits

- [x] 2.1 Aplicar o D2 no `comecar.mjs` e ajustar o "Smoke test do drive minúsculo" (commits manuais condicionais). Verificar com o "Smoke test do script de entrada" e o do drive passando no Git Bash, e com uma execução sem identidade Git (`GIT_CONFIG_GLOBAL` vazio, `GIT_AUTHOR_NAME` e `GIT_COMMITTER_NAME` vazios) terminando com código 0 e o aviso.
  - Evidência: `initialCommit` no `comecar.mjs` (pergunta, `--yes`, `--sem-commit`, commit do código e do store, aviso sem falhar); o teste passou a conferir a tag como a mais próxima (`describe --abbrev=0`), já que o commit de configuração fica por cima dela. No Git Bash, `[PASS] Smoke test do script de entrada` (um commit no código, "configura o store" no store, árvores limpas, `--sem-commit` sem histórico) e `[PASS] Smoke test do drive minúsculo`, sem ids de teste registrados no fim. Com `GIT_CONFIG_GLOBAL` vazio e `GIT_AUTHOR_NAME`/`GIT_COMMITTER_NAME` vazios → exit 0, "Aviso: não consegui fazer o commit inicial: fatal: empty ident name ...", comandos de commit na mensagem final e código sem commit.
- [x] 2.2 Aplicar o D1 no `init.md`. Verificar com `grep` mostrando "Commit the init" e os novos "Próximos passos", e com o passo "Trechos customizados das skills" passando nessa parte.
  - Evidência: seção "## Commit the init" no `init.md` (pathspec `openspec/`, sem push, aviso fora do Git) e item 3 dos "Próximos passos" reescrito; `grep -c` → 1 para "## Commit the init" e para "Os artefatos foram commitados no store", 0 para o comando manual antigo; o passo "Trechos customizados das skills" deixou de acusar o `init.md`.

## 3. Atualização oferecida

- [x] 3.1 Aplicar o D3 nos 8 arquivos com "Standard version check" e regenerar a raiz com `sync-root.mjs`. Verificar com "Trechos customizados das skills" passando inteiro e `sync-root --check` em dia.
  - Evidência: texto do D3 nos 8 arquivos (4 comandos e 4 skills); `sync-root.mjs` → "Synced 9 paths." (as 8 cópias e o `init.md` da 2.2), `--check` → em dia; `[PASS] Trechos customizados das skills`, com "offer to update now" e "Commit the init" (exit 0).

## 4. Guias, versão e integração

- [x] 4.1 Aplicar o D4 e o D6. Verificar com o lint nos dois lugares sem issues e os passos "Guia de primeiros passos" e "Versão e changelog" passando.
  - Evidência: COMECE-AQUI com a pergunta e a linha do commit inicial no exemplo e a "Commitar e publicar" focada em publicar; `templates/openspec-padrao.md` com os commits automáticos nos "Primeiros passos" e a oferta de atualização no "Atualizar à mão"; `VERSION` → 1.6.0 e seção `## 1.6.0` no CHANGELOG. `[PASS]` em "Lint de Markdown" (nos dois lugares), "Versão e changelog" e "Guia de primeiros passos" (exit 0).
- [x] 4.2 Rodar os comandos de verificação do `openspec/project.md` (passos dos jobs `store` e `root`) localmente e, no PR, conferir os três jobs (`store (ubuntu-latest)`, `store (windows-latest)` e `root`). Verificar que todos passam.
  - Evidência: localmente, 17 `[PASS]` no `store` e 4 no `root` (exit 0), e de novo nos passos afetados depois das correções da revisão; no PR #25 (run 39792391395), `store (ubuntu-latest)` pass, `store (windows-latest)` pass e `root` pass.

## Workflow follow-up

- Teste do responsável num console real do Windows (PowerShell) com o `comecar.mjs` deste branch, antes da release, conforme o `openspec/project.md`: conferir a pergunta do commit, os commits feitos e a mensagem final.
- Depois do teste: merge e release `v1.6.0` com o `comecar.mjs` anexado.
