# Verificações — commit-inicial-sem-edicoes-do-projeto

## 2026-10-25

- Críticos: 0
- Warnings: 1
- Sugestões: 0
- Não verificado: varredura de secrets (o `openspec/project.md` registra "Adiado")
- Camadas: — (sem matriz no project.md)
- Cobertura fora da suíte: casos da revisão conferidos à mão (15 mil arquivos não versionados; `--sem-commit` com a lista; pasta `.claude/` não versionada), rodados pelo agente em pastas temporárias
- Avaliação: Nenhum crítico nas checagens que rodaram; 1 warning. Não verificado: a varredura de secrets.

Itens:

- [warning] Design decision not followed: o D1 diz `git status ... --untracked-files=all` e, com o `git status` falhando, "deixa de fora os arquivos do padrão que já existiam antes do setup"; o código usa `--untracked-files=normal`, casando a pasta não versionada com os arquivos do padrão dentro dela (correção da revisão, para não estourar o buffer), e deixa de fora todos os arquivos do padrão quando o `git status` falha, porque sem o Git não há como saber quais já existiam (`padrao-openspec/scripts/comecar.mjs:290-325`); atualizar o D1 com `/opsx:update`

Comandos:

- `openspec instructions apply --change commit-inicial-sem-edicoes-do-projeto --json` → `all_done`, 5/5 (exit 0)
- `review.md` → aa48fd0..527fddc, subagente requesting-code-review; correções em b2b3c2a; depois dele só há um commit de documentação (0a474a5)
- `node padrao-openspec/scripts/sync-root.mjs --check` → em dia (exit 0)
- `openspec validate --all --strict` → 23 passed (exit 0); `openspec validate commit-inicial-sem-edicoes-do-projeto --strict` → válida (exit 0)
- `git log --oneline HEAD..origin/main` → vazio (a branch está sobre 1f19fce, o merge do #52)
- Suíte local completa dos jobs `store` e `root`, com tempo limite por passo → 30 `[PASS]` (exit 0; reused from apply, tarefa 3.2), antes das correções da revisão; depois de b2b3c2a: "Smoke test do script de entrada", "Sintaxe dos scripts" e "Lint de Markdown" → PASS (exit 0; reused from apply)
- Requisitos × implementação:
  - Commit inicial em pasta de código com histórico (MODIFIED) → `standardPaths` e a divisão em dentro e fora no `initialCommit` (`comecar.mjs`); cenário "Pasta de gerador com um commit" no "Smoke test do script de entrada" (árvore limpa sem edições anteriores);
  - Edições do projeto fora do commit inicial (ADDED) → `uncommittedPaths`, `editedBefore` e a lista com o comando no `initialCommit`; cenário "CLAUDE.md com edição do dev" no "Smoke test do script de entrada" (comentário cita o requisito e o cenário; visto reprovando antes da correção, tarefa 1.2); cenário "Sem edições anteriores" coberto pelo da pasta de gerador com a árvore limpa
- Dependências no Impact → nenhuma nova
- Lacunas declaradas, contratos de interface, ADRs com `verificacao` e falhas aceitas → não se aplicam
