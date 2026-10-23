# Tasks

## 1. Preparação e proteção na CI

- [ ] 1.1 Depois do merge do PR #43, rebasear a branch na `main` e confirmar com a outra sessão a ordem com a `imposicao-e-catraca`. Acrescentar ao `.github/workflows/validate.yml` os marcadores do D8 (init e bloco do `discover.md`) e o `test -f` do `discover.md` instalado. Verificar rodando o passo "Trechos customizados das skills" localmente: ele deve falhar só nos marcadores novos.

## 2. Comando de descoberta

- [ ] 2.1 Criar `padrao-openspec/.claude/commands/opsx/discover.md` conforme o D1, o D2 e o D3: cabeçalho padrão, estado inicial, postura do agente, checklist de ideia concreta, template do `descoberta.md`, encerramento com confirmação, gravação "Em andamento", commit avulso e guardrails. Verificar com `grep -n` dos marcadores do D8 e com o lint de Markdown do arquivo.
- [ ] 2.2 Conferir o `discover.md` contra cada requisito da spec `product-discovery`, de "Abertura" a "não implementa", e anotar na evidência a seção que atende cada um. Verificar que nenhum requisito ficou sem seção.

## 3. Init e ingest

- [ ] 3.1 Aplicar o D4 e o D5 em `padrao-openspec/.claude/commands/opsx/init.md`:
  - seção "Antes da entrevista" com as duas perguntas;
  - uso do `descoberta.md` existente;
  - regra de pular a seção com arquivo de respostas;
  - regra da recomendação em "Regras da entrevista".

  Verificar com `grep -n "Antes da entrevista\|Recomendação:"` e com o lint do arquivo.
- [ ] 3.2 Aplicar o D7 no `init.md`: linha "Base das recomendações" no Arquivo 1 e item 4 dos próximos passos. Verificar com `grep -n "Base das recomendações"`.
- [ ] 3.3 Aplicar o D6 em `padrao-openspec/.claude/commands/opsx/ingest.md`. Verificar com `grep -n "/opsx:init"` no arquivo e com o lint.

## 4. Testes, versão e documentação

- [ ] 4.1 Acrescentar `discover` à lista `$cmds` de `padrao-openspec/scripts/test-setup.ps1`. Verificar com `grep -n "'discover'"`.
- [ ] 4.2 Atualizar `README.md`, `COMECE-AQUI.md` e `padrao-openspec/README.md` conforme o D8, e o `CHANGELOG.md`, com um item na seção aberta (1.14.0). Verificar com os passos "Versão e changelog", "Lint de Markdown da raiz" e "Guia de primeiros passos" passando.
- [ ] 4.3 Rodar `sync-root.mjs` e `sync-root.mjs --check`, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, e todos os passos dos jobs `store` e `root` localmente, depois de avisar a outra sessão. Verificar que todos saem com código 0.

## 5. Verificação de comportamento

- [ ] 5.1 Roteiro manual numa cópia temporária de store, fora do repositório, registrado na evidência:
  - (a) `/opsx:discover` avulso: confirmar a primeira pergunta, uma pergunta por vez e uma afirmação contraditória do dev ("12 funcionalidades, time de 1 pessoa") contestada com opções e recomendação;
  - (b) interromper e conferir o `descoberta.md` "Em andamento", depois retomar;
  - (c) `/opsx:init` com "não" e "não": a entrevista começa no Bloco 1 sem linha de recomendação;
  - (d) `/opsx:init` com o `descoberta.md` "Concluída": a 1.4 mostra a recomendação com a fonte, e uma pergunta não coberta mostra "o brief não cobre".

  Verificar que os quatro itens se comportam como os cenários das specs.

## Workflow follow-up

- `/opsx:verify` e `/opsx:archive` depois do apply; PR e merge só quando o responsável pedir.
- Avisar a outra sessão no archive, porque quem arquivar por último rebaseia.
