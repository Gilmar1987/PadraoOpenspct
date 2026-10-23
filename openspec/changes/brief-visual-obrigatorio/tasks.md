# Tasks

## 1. Testes na CI

- [x] 1.1 Acrescentar aos "Trechos customizados das skills" os marcadores "Interface brief" (par do propose) e "Screens without visual brief" (par do verify). Verificar rodando o passo no Git Bash: deve falhar (os trechos não existem).
  - Evidência: marcadores "Interface brief" (par do propose) e "Screens without visual brief" (par do verify) nos "Trechos customizados"; passo rodado no Git Bash → FAIL com os 4 trechos ausentes (exit 1), como esperado.

## 2. Fluxos

- [x] 2.1 Aplicar o D1 no propose, o D2 no verify e o D3 na skill `interface-quality`, e regenerar a raiz com `sync-root.mjs`. Verificar com "Trechos customizados das skills", `sync-root --check` e o lint passando.
  - Evidência: trecho **"Interface brief"** antes do "Architectural Decision Check" no propose (comando e skill) e exceção no passo 6b (o `design.md` de change com telas não é pulado); caso "Screens without visual brief" no "Interface quality gate" do verify (comando e skill); item 1 da "Ordem de trabalho" da skill `interface-quality` reescrito; raiz regenerada (5 caminhos). Git Bash: "Trechos customizados das skills" e "Lint de Markdown" → PASS; `sync-root --check` → em dia.

## 3. Documentação e integração

- [x] 3.1 Atualizar README e CHANGELOG (itens na 1.12.0). Verificar com o lint e o passo "Versão e changelog" passando.
  - Evidência: README (frase na seção da skill) e item "Brief visual obrigatório" em "O que mudou" da seção 1.12.0 do CHANGELOG, sem subir o `VERSION`; "Ações no projeto": nenhuma nova. Git Bash: "Lint de Markdown" (padrão e raiz) e "Versão e changelog" → PASS.
- [x] 3.2 Avisar a outra sessão, rodar os comandos de verificação do `openspec/project.md` localmente, fazer o verify e o archive, e só então abrir o PR e conferir os três jobs. Verificar que todos passam.
  - Evidência: outra sessão avisada antes; suíte local completa no Git Bash → 27 passos PASS (`store` e `root`), 0 ids `ci-*`; depois do rebase sobre a `aprovacao-por-conteudo` (conflito no CHANGELOG resolvido mantendo os itens das duas), validate, lint, versão, trechos e o job `root` → PASS; PR #36 (rascunho), run 39887206712 (head 8cce50a) → store (ubuntu-latest), store (windows-latest) e root = success. Verify e archive entram no mesmo PR antes do merge.

## Workflow follow-up

- Os fluxos são texto de prompt: o efeito real (propose escrevendo o brief, verify perguntando) só aparece numa change com telas num projeto; registrar como não verificado no verify desta change.
