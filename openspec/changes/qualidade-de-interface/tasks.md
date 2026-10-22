# Tasks

## 1. Testes na CI

- [ ] 1.1 Criar as fixtures `boa/` e `ruim/` e o `jornadas.json` (D6), e acrescentar ao `validate.yml` o "Smoke test da validação de interface", a sintaxe do script e "Interface quality gate" nos trechos customizados. Verificar rodando os passos no Git Bash: devem falhar (o script e o trecho não existem).

## 2. Script

- [ ] 2.1 Consultar no registro as versões estáveis de `playwright` e `@axe-core/playwright` (`npm view <pkg> dist-tags`, `engines`), fixá-las e criar `padrao-openspec/scripts/validar-interface.mjs` conforme o D2, entregue pelo instalador como `docs/openspec-validar-interface.mjs`. Verificar com o smoke test da 1.1 passando no Git Bash (fixture boa → saída 0 e nota ≥ médio; ruim → saída 1 citando `alt`, console e link) e com os smoke tests do instalador passando.

## 3. Skill, subagente e fluxos

- [ ] 3.1 Criar a skill `interface-quality` (D1) e os dois arquivos do subagente (D3), no formato da `subagentes-e-ganchos` já mergeada, e acrescentar `openspec-validador-de-interface` à lista `verdictAgents` do `somente-leitura.mjs`. Verificar com o passo "Paridade de papéis", o lint e o teste do hook (entrada com `agent_type: openspec-validador-de-interface` e um `rm` → negado; `node docs/openspec-validar-interface.mjs` → liberado) passando.
- [ ] 3.2 Aplicar o D4 no verify e o D5 no init e regenerar a raiz com `sync-root.mjs`. Verificar com "Trechos customizados das skills" e `sync-root --check` passando.
- [ ] 3.3 Validar uma página real: rodar o subagente sobre um app de exemplo com uma tela (pasta temporária), conferindo que o relatório traz as capturas nas três larguras, a nota automática e a avaliação do subagente. Verificar com o `interface-report.md` gerado e citado na evidência.

## 4. Documentação, versão e integração

- [ ] 4.1 Atualizar README, COMECE-AQUI e guia do projeto com a validação de interface, e aplicar o D7 (1.12.0). Verificar com o lint nos dois lugares e os passos "Guia de primeiros passos" e "Versão e changelog" passando.
- [ ] 4.2 Avisar a outra sessão, rodar os comandos de verificação do `openspec/project.md` localmente e conferir no PR os três jobs. Verificar que todos passam.

## Workflow follow-up

- O apply só começa depois do merge da `subagentes-e-ganchos` (formato dos subagentes e "Paridade de papéis").
- O script é interativo? Não: roda sem perguntas, e por isso não exige o teste em console real da regra do `project.md`.
