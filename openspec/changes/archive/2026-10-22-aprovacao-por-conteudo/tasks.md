# Tasks

## 1. Testes na CI

- [x] 1.1 Acrescentar ao "Smoke test do portão" os casos do D7 e aos "Trechos customizados" o "Approval content seal". Verificar rodando os passos no Git Bash: os casos novos devem falhar (o comando `selo` e o trecho não existem).
  - Evidência: casos do D7 no "Smoke test do portão" (selo estável com caixas e evidências, tarefa nova → "venceu", reconfirmação → libera, sem selo → `avisos`, `[INFERIDO:` no design → `design.md:3`, entre crases → libera, CRLF = LF) e marcadores "Approval content seal" (propose, apply, archive, update), "Declared inference" (propose) e `[INFERIDO: <base>]` (init) nos "Trechos customizados". Git Bash: "Trechos customizados das skills" → FAIL com os 11 trechos ausentes (exit 1), como esperado. O "Smoke test do portão" registra um store e não rodou antes da implementação porque a outra sessão pediu a máquina para a suíte dela; o comportamento novo foi conferido antes numa raiz OpenSpec local sem store (tarefa 2.1).

## 2. Portão

- [x] 2.1 Implementar no `portao.mjs` o comando `selo` (D1), a checagem do selo e o campo `avisos` (D2), e as marcas de inferência (D3). Verificar com o "Smoke test do portão" passando no Git Bash e no PowerShell (selo igual com CRLF e LF), e com o hook `portao-do-archive.mjs` da `subagentes-e-ganchos` lendo só `motivos` sem erro.
  - Evidência: `portao.mjs` com o comando `selo` (D1), a checagem do selo com `avisos` e "selo ilegível" (D2) e as marcas `[INFERIDO:` fora de código (D3), com as correções da revisão (cce145f). Suíte local completa no Git Bash → "Smoke test do portão" PASS com todos os casos do D7 e da revisão (Aprovação anterior, `.inputs/`, marca confirmada, selo malformado); PowerShell: selo LF = CRLF (`sha256:c8d5fa40…`) e apply liberado (exit 0); "Smoke test dos hooks do Claude Code" PASS, com o `portao-do-archive.mjs` lendo só `motivos`.

## 3. Fluxos e regras

- [x] 3.1 Aplicar o D4 em propose, apply, update e archive (comandos e skills), o D5 no init e o D6 no `rules.md`, e regenerar a raiz com `sync-root.mjs`. Verificar com "Trechos customizados das skills", `sync-root --check` e o lint passando.
  - Evidência: trecho "Approval content seal" em apply (4a), propose (depois da autorização prévia), archive (4a, item `Archive:`) e update (reconfirmação e `Aprovação anterior` com o selo antigo), comandos e skills; "Declared inference" nas Artifact Creation Guidelines do propose; regra da marca `[INFERIDO: <base>]` e etapa "Inferências" antes do commit no init; duas regras novas na seção de aprovação do `rules.md`; raiz regenerada (10 caminhos). Git Bash: "Trechos customizados das skills" e "Lint de Markdown" → PASS; `sync-root --check` → em dia.
- [x] 3.2 Validar o fluxo de ponta a ponta numa pasta temporária com o setup do padrão:
  - aprovar uma change com selo;
  - acrescentar uma tarefa → o portão bloqueia;
  - reconfirmar → o portão libera;
  - pôr uma marca de inferência → o portão bloqueia citando a linha.

  Verificar com as saídas do portão citadas na evidência.
  - Evidência: projeto temporário de repositório único (sem store, para não usar o registro compartilhado enquanto a outra sessão rodava a suíte; o setup com store é coberto pelo "Smoke test do portão") com `docs/openspec-portao.mjs` da change: aprovada com `Conteúdo:` → "✔ liberado" (exit 0); tarefa 1.2 acrescentada → "A aprovação venceu" (exit 1); `Reconfirmação` com o selo novo → "✔ liberado" (exit 0); design com `[INFERIDO: prática do mercado]` → "Inferência não confirmada em design.md:3" (exit 1).

## 4. Documentação, versão e integração

- [x] 4.1 Atualizar README e guia do projeto com o selo, a reconfirmação e as marcas, e aplicar o D8 com a versão aprovada. Verificar com o lint e o passo "Versão e changelog" passando.
  - Evidência: README (parágrafo sobre o selo e as inferências no Fluxo de trabalho), guia `templates/openspec-padrao.md` (comando `selo` e explicação na seção Portão) e dois itens em "O que mudou" e um em "Ações no projeto" da seção 1.12.0 aberta do CHANGELOG, sem subir o `VERSION` (modelo de versão confirmado pelo responsável). Git Bash: "Lint de Markdown" (padrão e raiz), "Versão e changelog", "Raiz em dia" e "Guia de primeiros passos" → PASS.
- [x] 4.2 Avisar a outra sessão, rodar os comandos de verificação do `openspec/project.md` localmente e conferir no PR os três jobs. Verificar que todos passam.
  - Evidência: outra sessão avisada antes e depois; suíte local completa no Git Bash → `store` 22/22 e `root` 5/5 PASS, 0 ids `ci-*`; PR #35 (rascunho), run 39885706984 (head 813e23a) → store (ubuntu-latest), store (windows-latest) e root = success.

## Workflow follow-up

- O apply vem depois da `qualidade-de-interface` e das changes de SDD da outra sessão, na versão que o responsável aprovar.
- O portão não é interativo, e por isso não exige o teste em console real da regra do `project.md`.
