# Tasks

## 1. Registro de verificação e trailer nas skills

- [x] 1.1 Acrescentar ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml` os marcadores "Write the verification record" (em `commands/opsx/verify.md` e `skills/openspec-verify-change/SKILL.md`) e "OpenSpec-Change:" (em `commands/opsx/apply.md` e `skills/openspec-apply-change/SKILL.md`). Verificar rodando o passo localmente: ele deve falhar, citando os quatro trechos ausentes.
- [x] 1.2 Acrescentar ao passo 8 de `padrao-openspec/.claude/commands/opsx/verify.md` e `padrao-openspec/.claude/skills/openspec-verify-change/SKILL.md` o fechamento "Write the verification record" com o formato do D1 e as regras do D2, com o mesmo texto nos dois arquivos. Verificar comparando os trechos extraídos com `diff`.
- [x] 1.3 Acrescentar ao passo 6 de `padrao-openspec/.claude/commands/opsx/apply.md` e `padrao-openspec/.claude/skills/openspec-apply-change/SKILL.md` a instrução do trailer `OpenSpec-Change: <nome>` (D3), com o mesmo texto nos dois arquivos. Verificar comparando os trechos com `diff` e rodando o passo de CI da tarefa 1.1, que deve passar.

## 2. Script de métricas: testes

- [x] 2.1 Criar o smoke test do script como passo "Smoke test das métricas de fluxo" no job `store` de `.github/workflows/validate.yml`. Ele monta, num diretório temporário:
  - um store de exemplo com uma change ativa e duas arquivadas, uma com `## Aprovação` e `verification.md` e outra sem;
  - um repositório de código com commits datados (`GIT_AUTHOR_DATE`/`GIT_COMMITTER_DATE`), com e sem trailer, incluindo um `fix:` posterior ao archive.

  Depois roda o script e confere:
  - os valores esperados do CSV para os cenários de marcos, vazão, retrabalho e qualidade;
  - que nenhum nome ou e-mail aparece na saída;
  - que o `git status` dos dois repositórios fica igual ao de antes.

  Verificar rodando o passo localmente antes do script existir: ele deve falhar porque o script não foi encontrado.

## 3. Script de métricas: implementação

- [x] 3.1 Criar `padrao-openspec/scripts/flow-metrics.mjs` com a interface do D4, a leitura dos marcos (D6), as contagens de requisitos, cenários e tarefas, e o `metrics.csv` (D5). Verificar com `node --check` e com as asserções de marcos e de somente leitura do smoke test da tarefa 2.1.
- [x] 3.2 Acrescentar ao script a leitura de retrabalho (D7) e do `verification.md` (D1). Verificar com as asserções de retrabalho, qualidade e ausência de dados pessoais do smoke test.
- [x] 3.3 Acrescentar ao script o `resumo.md` (D9), com vazão por mês e semana ISO, medianas e a seção "Limites". Verificar com a asserção de vazão do smoke test e conferindo que o resumo cita "não coletado" quando falta `--code`.
- [x] 3.4 Acrescentar ao script a opção `--ci` (D8), com aviso e colunas vazias quando o `gh` não estiver disponível. Verificar rodando o script com `--ci` e `PATH` sem `gh`: o código de saída deve ser 0, as colunas de CI vazias e o aviso deve aparecer no resumo. Verificar também com o `gh` real contra este repositório, conferindo `ci_falhas_antes_do_verde` de uma change com PR. Resultado: sem `gh` no PATH, código 0, aviso e colunas vazias, verificado; o detector também reconheceu `gh` sem autenticação. A conferência com o `gh` real não foi executada porque o token expirou (decisão do usuário: seguir sem o `gh`), e fica registrada como não verificada no `verification.md`.

## 4. Espelhamento, documentação e integração

- [x] 4.1 Rodar `node padrao-openspec/scripts/sync-root.mjs` e verificar que `--check` sai com código 0.
- [x] 4.2 Documentar no `padrao-openspec/README.md` a seção "Métricas de fluxo" (uso, colunas, limites, privacidade e convenção do trailer) e acrescentar ao `README.md` da raiz os trechos customizados novos na tabela de manutenção. Verificar com o lint da raiz e de `padrao-openspec/` sem issues.
- [x] 4.3 Rodar o script sobre o store do teste de ponta a ponta (`C:\teste-e2e\livraria-openspec\padrao-openspec` com `--code C:\teste-e2e\livraria`) e conferir que a change arquivada `add-catalogo-livros` aparece com as datas de criação e archive e as contagens de requisitos, cenários e tarefas. Verificar também que o retrabalho fica vazio, porque o teste é anterior ao trailer, e que o resumo explica o motivo.
- [x] 4.4 Rodar `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o lint nos dois e os passos de CI de trechos customizados e de smoke das métricas. Verificar que todos saem com código 0.
- [x] 4.5 Revisar a ADR-0002 e promovê-la de `Proposed` para `Accepted` no PR. Verificar que o frontmatter mostra `status: Accepted` antes do archive. Promovida em 2026-10-19 por decisão do usuário no chat ("Siga com os itens 1 a 3, com a ADR-0002 promovida"), depois do merge do PR #5.

## Workflow follow-up

- Rodar `/opsx:verify`, que já deve gravar o primeiro `verification.md` desta change, e, depois da revisão do PR, `/opsx:archive`.
