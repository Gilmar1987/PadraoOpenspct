# Tasks

## 1. Testes na CI

- [x] 1.1 Criar as fixtures `boa/` e `ruim/` e o `jornadas.json` (D6), e acrescentar ao `validate.yml` o "Smoke test da validação de interface", a sintaxe do script e "Interface quality gate" nos trechos customizados. Verificar rodando os passos no Git Bash: devem falhar (o script e o trecho não existem).
  - Evidência: fixtures em `padrao-openspec/scripts/test-fixtures/interface/` (`boa/` com título, `lang`, favicon, formulário rotulado, `sobre.html` e `404.html`; `ruim/` sem título e sem `lang`, imagem sem `alt`, `console.error` e link para `/promocoes.html` inexistente; `jornadas.json` com três jornadas; `servidor.mjs` estático); passos rodados no Git Bash com `runstep.py` → "Sintaxe dos scripts" FAIL (script ausente), "Trechos customizados das skills" FAIL (Interface quality gate e as duas linhas do init ausentes), "Smoke test dos hooks do Claude Code" FAIL (validador não restrito), "Smoke test da validação de interface" FAIL (script ausente), todos exit 1 como esperado. O formato de jornadas ganhou nome por jornada (`{"jornadas": [{"nome", "passos"}]}`); o script também aceita a lista de passos do D2.

## 2. Script

- [x] 2.1 Consultar no registro as versões estáveis de `playwright` e `@axe-core/playwright` (`npm view <pkg> dist-tags`, `engines`), fixá-las e criar `padrao-openspec/scripts/validar-interface.mjs` conforme o D2, entregue pelo instalador como `docs/openspec-validar-interface.mjs`. Verificar com o smoke test da 1.1 passando no Git Bash (fixture boa → saída 0 e nota ≥ médio; ruim → saída 1 citando `alt`, console e link) e com os smoke tests do instalador passando.
  - Evidência: `npm view` → playwright latest 1.64.1 (2026-10-14, engines node >=20) e @axe-core/playwright latest 4.14.0 (2026-10-15), sem rc/beta; fixados no script, que exige Node 20+. `padrao-openspec/scripts/validar-interface.mjs` criado e entregue pelo instalador como `docs/openspec-validar-interface.mjs` (`templateFiles`). Git Bash: "Smoke test da validação de interface" → PASS (boa: saída 0, nota bom, três jornadas aprovadas, capturas em 390/768/1280; ruim: saída 1, nota fraco, cita `image-alt`, o `console.error` e `/promocoes.html`; porta fechada: saída 2; lint dos dois relatórios sem issues); "Sintaxe dos scripts", "Smoke test do instalador", da camada do Claude Code, do setup (dois), do portão e dos blocos de agentes → PASS. Desvio corrigido: na primeira execução, o `playwright install` removeu do cache compartilhado `%LOCALAPPDATA%\ms-playwright` navegadores que considerou sem uso (`chromium-1234`, `chromium_headless_shell-1234`, `ffmpeg-1011`); o script passou a usar `PLAYWRIGHT_BROWSERS_PATH` na própria pasta temporária, e a segunda execução não tocou no cache compartilhado. Fora do D2, o relatório também passou a conferir rolagem horizontal, meta description e lint de Markdown.

## 3. Skill, subagente e fluxos

- [ ] 3.1 Criar a skill `interface-quality` (D1) e os dois arquivos do subagente (D3), no formato da `subagentes-e-ganchos` já mergeada, acrescentar `'openspec-validador-de-interface'` ao `Set` `verdictAgents` de `padrao-openspec/.claude/hooks/openspec-padrao/somente-leitura.mjs`, e acrescentar ao passo "Smoke test dos hooks do Claude Code" os casos `expect deny somente-leitura.mjs "$(payload Bash command 'echo x > a.txt' '' openspec-validador-de-interface)"` e o `allow` equivalente para `node docs/openspec-validar-interface.mjs http://localhost:3000`. Verificar com esse passo, a "Paridade de papéis" e o lint passando.
- [ ] 3.2 Aplicar o D4 no verify e o D5 no init e regenerar a raiz com `sync-root.mjs`. Verificar com "Trechos customizados das skills" e `sync-root --check` passando.
- [ ] 3.3 Validar uma página real: rodar o subagente sobre um app de exemplo com uma tela (pasta temporária), conferindo que o relatório traz as capturas nas três larguras, a nota automática e a avaliação do subagente. Verificar com o `interface-report.md` gerado e citado na evidência.

## 4. Documentação, versão e integração

- [ ] 4.1 Atualizar README, COMECE-AQUI e guia do projeto com a validação de interface, e aplicar o D7 (1.12.0). Verificar com o lint nos dois lugares e os passos "Guia de primeiros passos" e "Versão e changelog" passando.
- [ ] 4.2 Avisar a outra sessão, rodar os comandos de verificação do `openspec/project.md` localmente e conferir no PR os três jobs. Verificar que todos passam.

## Workflow follow-up

- O apply só começa depois do merge da `subagentes-e-ganchos` (formato dos subagentes e "Paridade de papéis").
- O script é interativo? Não: roda sem perguntas, e por isso não exige o teste em console real da regra do `project.md`.
