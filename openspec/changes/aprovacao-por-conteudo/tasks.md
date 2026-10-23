# Tasks

## 1. Testes na CI

- [x] 1.1 Acrescentar ao "Smoke test do portão" os casos do D7 e aos "Trechos customizados" o "Approval content seal". Verificar rodando os passos no Git Bash: os casos novos devem falhar (o comando `selo` e o trecho não existem).
  - Evidência: casos do D7 no "Smoke test do portão" (selo estável com caixas e evidências, tarefa nova → "venceu", reconfirmação → libera, sem selo → `avisos`, `[INFERIDO:` no design → `design.md:3`, entre crases → libera, CRLF = LF) e marcadores "Approval content seal" (propose, apply, archive, update), "Declared inference" (propose) e `[INFERIDO: <base>]` (init) nos "Trechos customizados". Git Bash: "Trechos customizados das skills" → FAIL com os 11 trechos ausentes (exit 1), como esperado. O "Smoke test do portão" registra um store e não rodou antes da implementação porque a outra sessão pediu a máquina para a suíte dela; o comportamento novo foi conferido antes numa raiz OpenSpec local sem store (tarefa 2.1).

## 2. Portão

- [ ] 2.1 Implementar no `portao.mjs` o comando `selo` (D1), a checagem do selo e o campo `avisos` (D2), e as marcas de inferência (D3). Verificar com o "Smoke test do portão" passando no Git Bash e no PowerShell (selo igual com CRLF e LF), e com o hook `portao-do-archive.mjs` da `subagentes-e-ganchos` lendo só `motivos` sem erro.

## 3. Fluxos e regras

- [ ] 3.1 Aplicar o D4 em propose, apply, update e archive (comandos e skills), o D5 no init e o D6 no `rules.md`, e regenerar a raiz com `sync-root.mjs`. Verificar com "Trechos customizados das skills", `sync-root --check` e o lint passando.
- [ ] 3.2 Validar o fluxo de ponta a ponta numa pasta temporária com o setup do padrão:
  - aprovar uma change com selo;
  - acrescentar uma tarefa → o portão bloqueia;
  - reconfirmar → o portão libera;
  - pôr uma marca de inferência → o portão bloqueia citando a linha.

  Verificar com as saídas do portão citadas na evidência.

## 4. Documentação, versão e integração

- [ ] 4.1 Atualizar README e guia do projeto com o selo, a reconfirmação e as marcas, e aplicar o D8 com a versão aprovada. Verificar com o lint e o passo "Versão e changelog" passando.
- [ ] 4.2 Avisar a outra sessão, rodar os comandos de verificação do `openspec/project.md` localmente e conferir no PR os três jobs. Verificar que todos passam.

## Workflow follow-up

- O apply vem depois da `qualidade-de-interface` e das changes de SDD da outra sessão, na versão que o responsável aprovar.
- O portão não é interativo, e por isso não exige o teste em console real da regra do `project.md`.
