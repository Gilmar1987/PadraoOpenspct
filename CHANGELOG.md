# Changelog

Versões do padrão OpenSpec (PadraoOpenspct). Cada versão traz o que mudou e as ações que um
projeto precisa fazer ao atualizar. A versão vigente está em `padrao-openspec/VERSION`, e cada
versão publicada tem uma tag `vX.Y.Z` com uma GitHub Release ([ADR-0004](openspec/adrs/0004-distribuicao-versionada-do-padrao.md)).

## 1.0.0 — 2026-10-20

Primeira versão numerada. Registra o estado do padrão depois do teste de ponta a ponta com
Django e das correções que vieram dele.

### O que mudou

- **Padrão generalista:** saem os presets e as skills de .NET e Next.js; `setup-project.mjs` e
  `install-skills.mjs` recusam `--stack`. A stack e os "Comandos de verificação" de cada projeto
  são registrados pelo `/opsx:init` no `project.md` do store ([ADR-0003](openspec/adrs/0003-padrao-sem-stack-embutida.md)).
- **Setup e init orientados ao ambiente:** o setup renomeia para `padrao` o `origin` do store
  que aponta para o PadraoOpenspct; o init pergunta remoto (5.8) e tamanho do time (5.9) e checa
  a coerência das respostas antes da confirmação final.
- **Verify com registro detalhado:** o `verification.md` traz "Itens:", "Comandos:" e
  "Cobertura fora da suíte", e o verify usa os comandos de verificação do `project.md`.
- **Fluxo de change auditável:** o propose e o archive commitam no store; o archive pede e
  registra a confirmação quando a aprovação é só para `apply`; a Origem cita a pergunta quando
  a resposta depende dela; push e PR só com pedido explícito; cada tarefa registra a evidência.
- **Revisão de código e segurança por change:** o apply revisa o intervalo de commits da change
  e grava `review.md`; o verify cobra a revisão; a varredura de secrets roda antes de cada commit
  e a auditoria de dependências quando a change as altera.
- **Versões e atualização:** `VERSION`, este CHANGELOG, o manifesto `.openspec-padrao.json` no
  repositório de código, o modo `install-skills.mjs --update` (branch e commit próprios), o
  workflow `.github/workflows/openspec-padrao-update.yml`, que abre um PR quando sai versão nova,
  e o aviso de versão nos comandos `/opsx:*` do ciclo.

### Ações no projeto

- No `openspec/project.md` do store, acrescente a seção "Comandos de verificação" (copie a
  tabela do `padrao-openspec/openspec/project.md` deste repositório) e preencha os comandos do
  projeto, inclusive "Auditoria de dependências" e "Varredura de secrets". Sem ela, o apply e o
  verify registram testes, lint e segurança como "não verificado".
- Automações que chamam o setup ou o instalador com `--stack` precisam tirar a opção.
- Para receber os PRs de atualização, ligue no GitHub do repositório de código "Settings →
  Actions → General → Workflow permissions → Allow GitHub Actions to create and approve pull
  requests" (veja `docs/openspec-padrao.md`).
- Projetos configurados antes desta versão adotam o mecanismo rodando uma vez, a partir de um
  clone do padrão na tag `v1.0.0`: `node padrao-openspec/scripts/install-skills.mjs <repositório-de-código> --update`.
