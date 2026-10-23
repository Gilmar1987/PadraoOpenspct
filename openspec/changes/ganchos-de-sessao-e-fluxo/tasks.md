# Tasks

## 1. Testes na CI

- [x] 1.1 Acrescentar ao `validate.yml` os casos do D6 (portão e hooks), a lista `placed` do D5 e o `node --check` dos três scripts. Verificar rodando os passos no Git Bash: os casos novos devem falhar (o comando e os scripts não existem).
  - Evidência: casos do D6 em `validate.yml` (`estado` no "Smoke test do portão"; `protege-ganchos`, `exige-change` com portão falso, cache positivo e sem portão, e `contexto-de-sessao` no "Smoke test dos hooks do Claude Code"), os três pares da lista `placed` e o `node --check` dos três scripts. Git Bash: "Sintaxe dos scripts" FAIL (exit 1), "Smoke test dos hooks do Claude Code" FAIL (exit 2, scripts ausentes) e "Smoke test da camada do Claude Code no instalador" FAIL (exit 1), como esperado. O "Smoke test do portão" (registra store) fica para a suíte completa.

## 2. Portão e hooks

- [x] 2.1 Implementar o comando `estado` no `portao.mjs` (D1). Verificar com os casos do `estado` no "Smoke test do portão" passando no Git Bash e no PowerShell.
  - Evidência: comando `estado` no `portao.mjs` (D1): uma chamada `openspec list --json`, aprovação lida do proposal, selo válido/vencido/ilegível/ausente, inferências e próximo passo; texto `<change>: N/M tarefas, … → <próximo>` e JSON `{ok, acao: "estado", changes: [...]}`. Git Bash: "Smoke test do portão" → PASS (pendente → pedir a aprovação; tarefas abertas → /opsx:apply; sem verification.md → /opsx:verify; completo com escopo archive → /opsx:archive; linha de texto `ci-change: 2/2 tarefas`), 0 ids `ci-*` depois; nesta worktree, `estado` → "ganchos-de-sessao-e-fluxo: 1/6 tarefas, aprovada (archive), selo ausente → /opsx:apply" (exit 0).
- [x] 2.2 Criar `contexto-de-sessao.mjs`, `protege-ganchos.mjs` e `exige-change.mjs` (D2–D4) sobre o `comum.mjs` e acrescentá-los ao template (D5). Verificar com o "Smoke test dos hooks do Claude Code" e o smoke da camada do Claude Code no instalador passando.
  - Evidência: `contexto-de-sessao.mjs` (SessionStart, nunca bloqueia), `protege-ganchos.mjs` (nega `--no-verify`, `-n` em `git commit`, inclusive agrupado, e escrita de `core.hooksPath` por `git config` e `git -c`) e `exige-change.mjs` (`ask` sem change aprovada, cache positivo de 60 s por `session_id`, nada dentro de `openspec/` ou sem portão) sobre o `comum.mjs`; template `claude-settings.json` com o grupo `SessionStart`, o `protege-ganchos` no início do `Bash|PowerShell` e o `exige-change` no fim do `Edit|Write`. Git Bash: "Smoke test dos hooks do Claude Code", "Smoke test da camada do Claude Code no instalador" e "Sintaxe dos scripts" → PASS. A primeira rodada local falhou por um erro de citação do executor local (script passado por `bash -c` no Windows); o passo roda como arquivo, como no GitHub Actions, e passou.
- [x] 2.3 Testar os três hooks no Claude Code real, num projeto de teste com o padrão instalado:
  - abrir a sessão e ver o estado no contexto;
  - pedir `git commit --no-verify` e ver a negação;
  - pedir uma edição de código sem change aprovada e ver a pergunta.

  Verificar com o roteiro executado pelo responsável e o resultado citado na evidência.
  - Evidência: roteiro executado pelo responsável (gilmar.campelo) em 2026-10-23, no Claude Code real, em `C:\TesteOpenSpct	este-ganchos` (padrão desta branch instalado). Primeira rodada: estado no início da sessão citado pelo agente sem rodar comandos, duas vezes (1/3 tarefas, aprovação, selo e próximo passo de cada change); `git commit --no-verify` negado pelo hook; `git config core.hooksPath` (leitura) e `git log -n 1` liberados; escrita em `openspec/changes/teste-pendente/notas.md` sem pergunta. Nessa rodada o agente recusou por conta própria `-nm`, `core.hooksPath C:/temp` e as escritas em `src/`, sem acionar o hook. Segunda rodada, com pedido explícito de teste: `git commit --allow-empty -nm teste` e `git config core.hooksPath C:/temp` negados pelo hook com a mensagem do padrão; `src/tchau.txt` sem change aprovada → pedido de confirmação do Claude Code, negado pelo responsável, nada gravado; `src/ola.txt` com a `teste-aprovada` aprovada → gravado sem pergunta (portão de apply exit 0). O resumo do início da sessão mostrou a `teste-aprovada` pendente porque a conversa começou durante o passo 3: é a foto do início, e o agente conferiu o portão antes de escrever.

## 3. Documentação, versão e integração

- [x] 3.1 Atualizar README e guia do projeto com os três hooks e o `estado`, e aplicar o D7 com a versão aprovada. Verificar com o lint e o passo "Versão e changelog" passando.
  - Evidência: guia `templates/openspec-padrao.md` (três hooks de sessão novos, comando `estado` na seção Portão e passos 4 a 6 no "Roteiro de verificação no Claude Code"), README (hooks de sessão) e três itens em "O que mudou" e um em "Ações no projeto" da seção 1.12.0 aberta do CHANGELOG, sem subir o `VERSION`. Git Bash: "Lint de Markdown" (padrão e raiz), "Versão e changelog", "Raiz em dia", "Guia de primeiros passos" e validate da raiz → PASS.
- [ ] 3.2 Avisar a outra sessão, rodar os comandos de verificação do `openspec/project.md` localmente e conferir no PR os três jobs. Verificar que todos passam.

## Workflow follow-up

- O apply começa depois do merge da `subagentes-e-ganchos` e da `aprovacao-por-conteudo`, com rebase.
- Os hooks rodam dentro do Claude Code: a tarefa 2.3 é o teste em ambiente real exigido para o que não dá para simular só por entrada JSON.
