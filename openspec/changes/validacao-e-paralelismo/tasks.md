# Tasks

## 1. CI

- [ ] 1.1 Aplicar o D5 (passo "Ids de teste com sufixo" no job `root`). Verificar rodando-o no Git Bash: deve falhar, listando os ids fixos atuais.
- [ ] 1.2 Aplicar o D3 nos passos que registram store e o D4 nos dois jobs. Verificar com o passo da 1.1 passando e com todos os passos do job `store` passando no Git Bash, sem nenhum id `ci-` registrado no fim (`openspec store list --json`).

## 2. Propose e regras

- [ ] 2.1 Aplicar o D1 nos dois arquivos do propose e o D2 no `rules.md`, e regenerar a raiz com `sync-root.mjs`. Verificar com "Trechos customizados das skills" (com a checagem nova de "Check concurrent changes"), "Smoke test dos blocos de agentes" e `sync-root --check` passando.

## 3. Documentação, versão e integração

- [ ] 3.1 Aplicar o D6 e o D7 com a versão combinada. Verificar com o lint nos dois lugares sem issues e o passo "Versão e changelog" passando.
- [ ] 3.2 Avisar a outra sessão, rodar os comandos de verificação do `openspec/project.md` localmente e conferir no PR os três jobs. Verificar que todos passam.

## Workflow follow-up

- Rebasear sobre a `main` depois do merge da `subagentes-e-ganchos`, que também toca o `validate.yml`, o `VERSION` e o `CHANGELOG`.
