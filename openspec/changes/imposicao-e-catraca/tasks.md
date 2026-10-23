# Tasks

## 1. Preparação e proteção na CI

- [x] 1.1 Esperar o merge da `principios-de-engenharia` (PR #43) e rebasear a branch na `main`. Confirmar com a outra sessão que ela não tem change nos arquivos do Impact, e combinar a versão: esta change acrescenta itens à seção 1.14.0 aberta, ou a abre se entrar antes. Verificar com `git log --oneline HEAD..origin/main` vazio e com a resposta da outra sessão e a versão citadas na evidência.
  - Evidência: PR #43 mergeado (362d8ab); rebase em `origin/main` sem conflito; `git log --oneline HEAD..origin/main` vazio; a outra sessão do projeto (projetoopenspct-57) respondeu que não usa ADR (a 0008 é desta change) e que a `descoberta-do-produto`, só planejada, toca `init.md` (Bloco 1, Arquivo 1 e próximos passos, não o Arquivo 6), CHANGELOG, README e `validate.yml`: conflitos só textuais, e quem arquivar por último rebaseia; versão: esta change acrescenta itens à seção 1.14.0 aberta pela `principios-de-engenharia`, sem mexer no `VERSION`
- [x] 1.2 Acrescentar ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml` os marcadores do D7. Verificar rodando o passo localmente antes da implementação: ele deve falhar só nos arquivos citados, o que vale como prova de reprovação dos marcadores.
  - Evidência: marcadores do D7 no passo "Trechos customizados das skills" (propose: "Impacto medido", "Falhas aceitas:", "seen failing"; verify: "ADR check seen failing", "nada a varrer", "Accepted failures", "Exit conditions"; archive: "Falhas aceitas:"; init: "## Falhas aceitas" e "Uma data sozinha não é condição"; `adrs/template.md`: `imposicao:` e "## Limite"; `adrs/README.md`; `config.yaml`: "Impacto medido"); `run-ci-steps.py ... "Trechos customizados"` antes da implementação → FAIL (exit 1) com 14 ausências na saída truncada, só nos pontos esperados

## 2. ADR e modelos

- [ ] 2.1 Revisar a [ADR-0008](../../adrs/0008-imposicao-declarada-e-catraca-de-falhas.md) com o responsável e promovê-la a `Accepted` antes do archive (com PR, na revisão do PR; sem PR, pela declaração do responsável citada no commit). Verificar com `grep -n "^status: Accepted" openspec/adrs/0008-*.md`.
- [ ] 2.2 Aplicar o D1 em `padrao-openspec/openspec/adrs/template.md` (campo `imposicao` e seção `## Limite`) e em `padrao-openspec/openspec/adrs/README.md` (item de Convenções). Verificar com `grep -n "imposicao\|## Limite"` no template, com o lint de Markdown e com os marcadores do D7 desses arquivos passando.
- [ ] 2.3 Aplicar o D5 e o D6 ao Arquivo 6 de `padrao-openspec/.claude/commands/opsx/init.md` (seção "Falhas aceitas", com a linha "Nenhuma", e o "Sai quando" conferível nas duas tabelas, com exemplos). Verificar com o marcador "Falhas aceitas" no init passando e com `grep -n "data sozinha"` no `init.md`.

## 3. Propose, archive e config

- [ ] 3.1 Aplicar o D3, o D4, o D5 e o D6 em `padrao-openspec/.claude/commands/opsx/propose.md` e em `skills/openspec-propose/SKILL.md`, com o mesmo texto: a tarefa de prova de reprovação, a seção "Impacto medido" no "Architectural Decision Check", a linha `Falhas aceitas:` depois de "Related debts" e o "sai quando" conferível. Verificar com `diff` vazio entre os trechos do comando e da skill e com o marcador "Impacto medido" passando.
- [ ] 3.2 Aplicar o D5 em `padrao-openspec/.claude/commands/opsx/archive.md` e em `skills/openspec-archive-change/SKILL.md` ("Update the open debts" também aplica `Falhas aceitas:`). Verificar com `diff` vazio entre os dois trechos e com o marcador "Falhas aceitas" no archive passando.
- [ ] 3.3 Aplicar as regras do D3 (`tasks`) e do D4 (`design`) em `padrao-openspec/openspec/config.yaml`. Verificar com o passo "Config base carrega sem avisos" passando.

## 4. Verify

- [ ] 4.1 Aplicar o D2 ao item "ADR verification" de `padrao-openspec/.claude/commands/opsx/verify.md` e de `skills/openspec-verify-change/SKILL.md` (severidade pela imposição, `externo` e verificador ausente). Verificar com `diff` vazio entre os dois itens.
- [ ] 4.2 Aplicar o D3 (heurística "ADR check seen failing" e "nada a varrer"), o D5 ("Accepted failures" em "Project validation commands") e o D6 (heurística "Exit conditions") no `verify.md` e na skill, com o mesmo texto. Verificar com `diff` vazio entre os trechos, com os marcadores do D7 passando e com o "Smoke test das métricas de fluxo" passando, o que mostra que as linhas de contagem não mudaram.

## 5. Documentação, versão e integração

- [ ] 5.1 Atualizar o `README.md` (trechos customizados novos), o `CHANGELOG.md` (itens na seção 1.14.0, ou a seção aberta, com as ações recomendadas do Migration Plan) e o `padrao-openspec/VERSION`, se esta change abrir a versão. Verificar com o lint e com o passo "Versão e changelog" passando.
- [ ] 5.2 Rodar o `sync-root.mjs` e o `--check`, o `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente. Antes, avisar a outra sessão e esperar que ela não esteja rodando a suíte dela. Verificar que todos saem com código 0.
