# Tasks

## 1. Testes na CI

- [ ] 1.1 Aplicar o D5 no `validate.yml`. Verificar rodando no Git Bash os passos "Smoke test do script de entrada" e "Trechos customizados das skills": devem falhar (o script ainda não commita, e os trechos novos não existem).

## 2. Commits

- [ ] 2.1 Aplicar o D2 no `comecar.mjs` e ajustar o "Smoke test do drive minúsculo" (commits manuais condicionais). Verificar com o "Smoke test do script de entrada" e o do drive passando no Git Bash, e com uma execução sem identidade Git (`GIT_CONFIG_GLOBAL` vazio, `GIT_AUTHOR_NAME` e `GIT_COMMITTER_NAME` vazios) terminando com código 0 e o aviso.
- [ ] 2.2 Aplicar o D1 no `init.md`. Verificar com `grep` mostrando "Commit the init" e os novos "Próximos passos", e com o passo "Trechos customizados das skills" passando nessa parte.

## 3. Atualização oferecida

- [ ] 3.1 Aplicar o D3 nos 8 arquivos com "Standard version check" e regenerar a raiz com `sync-root.mjs`. Verificar com "Trechos customizados das skills" passando inteiro e `sync-root --check` em dia.

## 4. Guias, versão e integração

- [ ] 4.1 Aplicar o D4 e o D6. Verificar com o lint nos dois lugares sem issues e os passos "Guia de primeiros passos" e "Versão e changelog" passando.
- [ ] 4.2 Rodar os comandos de verificação do `openspec/project.md` (passos dos jobs `store` e `root`) localmente e, no PR, conferir os três jobs (`store (ubuntu-latest)`, `store (windows-latest)` e `root`). Verificar que todos passam.

## Workflow follow-up

- Teste do responsável num console real do Windows (PowerShell) com o `comecar.mjs` deste branch, antes da release, conforme o `openspec/project.md`: conferir a pergunta do commit, os commits feitos e a mensagem final.
- Depois do teste: merge e release `v1.6.0` com o `comecar.mjs` anexado.
