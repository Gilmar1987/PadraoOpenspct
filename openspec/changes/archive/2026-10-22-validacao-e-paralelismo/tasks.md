# Tasks

## 1. CI

- [x] 1.1 Aplicar o D5 (passo "Ids de teste com sufixo" no job `root`). Verificar rodando-o no Git Bash: deve falhar, listando os ids fixos atuais.
  - Evidência: passo "Ids de teste com sufixo" no job `root`; no Git Bash, antes da troca dos ids → falha listando as 12 linhas com ids fixos (`--register-id ci-store`, `--id ci-entrada`, `store unregister ci-semcommit`…), exit 1, esperado.
- [x] 1.2 Aplicar o D3 nos passos que registram store e o D4 nos dois jobs. Verificar com o passo da 1.1 passando e com todos os passos do job `store` passando no Git Bash, sem nenhum id `ci-` registrado no fim (`openspec store list --json`).
  - Evidência: sufixo `sfx="${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-0}-$$-$RANDOM"` nos passos da declaração do store (que ganhou `trap`), do script de entrada, do drive minúsculo e do portão, com os ids, caminhos, URLs e conferências usando `$sfx`; instalação do CLI nos dois jobs pulada quando `openspec --version` = 1.14.2. No Git Bash, `[PASS]` em "Ids de teste com sufixo" e nos quatro passos alterados; `openspec store list --json` → nenhum id `ci-` no fim; com o CLI 1.14.2 instalado, a condição do passo de instalação o pula.

## 2. Propose e regras

- [x] 2.1 Aplicar o D1 nos dois arquivos do propose e o D2 no `rules.md`, e regenerar a raiz com `sync-root.mjs`. Verificar com "Trechos customizados das skills" (com a checagem nova de "Check concurrent changes"), "Smoke test dos blocos de agentes" e `sync-root --check` passando.
  - Evidência: passo "6a. **Check concurrent changes**" nos dois arquivos do propose, antes do "7. **Show final status**"; seção "8. Trabalho em paralelo" no `rules.md`, com a antiga 8 virando "9. Quando em dúvida" (nenhum outro arquivo cita a seção pelo número); checagem do trecho no passo da CI; `sync-root.mjs` → "Synced 3 paths.", `--check` → em dia; `[PASS]` em "Trechos customizados das skills", "Smoke test dos blocos de agentes" (as regras entregues aos projetos seguem iguais à fonte) e "Lint de Markdown"; nenhum id `ci-` registrado no fim.

## 3. Documentação, versão e integração

- [x] 3.1 Aplicar o D6 e o D7 com a versão combinada. Verificar com o lint nos dois lugares sem issues e o passo "Versão e changelog" passando.
  - Evidência: `padrao-openspec/VERSION` 1.11.0 e seção "1.11.0" no `CHANGELOG.md`, depois do rebase sobre a main com a v1.10.0 (041a92d); passo "Versão e changelog" rodado no Git Bash → VERSAO-OK (exit 0); `markdownlint-cli2` no `CHANGELOG.md` e na change → 0 issues (exit 0). O D6 já estava aplicado (8f742a4).
- [x] 3.2 Avisar a outra sessão, rodar os comandos de verificação do `openspec/project.md` localmente e conferir no PR os três jobs. Verificar que todos passam.
  - Evidência: outra sessão avisada antes e depois; suíte local completa no Git Bash sobre a main com a v1.10.0 → job `store` 21/21 e `root` 5/5 PASS, sem id `ci-*` sobrando no registro; depois do rebase sobre 2f1df07 e das correções da revisão (d35221b), passos afetados → PASS; PR #32, run 39868122612 (head 27c743b) → store (ubuntu-latest), store (windows-latest) e root = success.

## Workflow follow-up

- Rebasear sobre a `main` depois do merge da `subagentes-e-ganchos`, que também toca o `validate.yml`, o `VERSION` e o `CHANGELOG`.
