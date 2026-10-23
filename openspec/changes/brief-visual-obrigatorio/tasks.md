# Tasks

## 1. Testes na CI

- [ ] 1.1 Acrescentar aos "Trechos customizados das skills" os marcadores "Interface brief" (par do propose) e "Screens without visual brief" (par do verify). Verificar rodando o passo no Git Bash: deve falhar (os trechos não existem).

## 2. Fluxos

- [ ] 2.1 Aplicar o D1 no propose, o D2 no verify e o D3 na skill `interface-quality`, e regenerar a raiz com `sync-root.mjs`. Verificar com "Trechos customizados das skills", `sync-root --check` e o lint passando.

## 3. Documentação e integração

- [ ] 3.1 Atualizar README e CHANGELOG (itens na 1.12.0). Verificar com o lint e o passo "Versão e changelog" passando.
- [ ] 3.2 Avisar a outra sessão, rodar os comandos de verificação do `openspec/project.md` localmente, fazer o verify e o archive, e só então abrir o PR e conferir os três jobs. Verificar que todos passam.

## Workflow follow-up

- Os fluxos são texto de prompt: o efeito real (propose escrevendo o brief, verify perguntando) só aparece numa change com telas num projeto; registrar como não verificado no verify desta change.
