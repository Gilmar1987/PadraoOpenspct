# Tasks

## 1. Testes na CI

- [x] 1.1 Acrescentar ao `validate.yml` os casos do D6 (portão e hooks), a lista `placed` do D5 e o `node --check` dos três scripts. Verificar rodando os passos no Git Bash: os casos novos devem falhar (o comando e os scripts não existem).
  - Evidência: casos do D6 em `validate.yml` (`estado` no "Smoke test do portão"; `protege-ganchos`, `exige-change` com portão falso, cache positivo e sem portão, e `contexto-de-sessao` no "Smoke test dos hooks do Claude Code"), os três pares da lista `placed` e o `node --check` dos três scripts. Git Bash: "Sintaxe dos scripts" FAIL (exit 1), "Smoke test dos hooks do Claude Code" FAIL (exit 2, scripts ausentes) e "Smoke test da camada do Claude Code no instalador" FAIL (exit 1), como esperado. O "Smoke test do portão" (registra store) fica para a suíte completa.

## 2. Portão e hooks

- [ ] 2.1 Implementar o comando `estado` no `portao.mjs` (D1). Verificar com os casos do `estado` no "Smoke test do portão" passando no Git Bash e no PowerShell.
- [ ] 2.2 Criar `contexto-de-sessao.mjs`, `protege-ganchos.mjs` e `exige-change.mjs` (D2–D4) sobre o `comum.mjs` e acrescentá-los ao template (D5). Verificar com o "Smoke test dos hooks do Claude Code" e o smoke da camada do Claude Code no instalador passando.
- [ ] 2.3 Testar os três hooks no Claude Code real, num projeto de teste com o padrão instalado:
  - abrir a sessão e ver o estado no contexto;
  - pedir `git commit --no-verify` e ver a negação;
  - pedir uma edição de código sem change aprovada e ver a pergunta.

  Verificar com o roteiro executado pelo responsável e o resultado citado na evidência.

## 3. Documentação, versão e integração

- [ ] 3.1 Atualizar README e guia do projeto com os três hooks e o `estado`, e aplicar o D7 com a versão aprovada. Verificar com o lint e o passo "Versão e changelog" passando.
- [ ] 3.2 Avisar a outra sessão, rodar os comandos de verificação do `openspec/project.md` localmente e conferir no PR os três jobs. Verificar que todos passam.

## Workflow follow-up

- O apply começa depois do merge da `subagentes-e-ganchos` e da `aprovacao-por-conteudo`, com rebase.
- Os hooks rodam dentro do Claude Code: a tarefa 2.3 é o teste em ambiente real exigido para o que não dá para simular só por entrada JSON.
