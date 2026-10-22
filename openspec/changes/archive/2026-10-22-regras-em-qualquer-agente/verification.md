# Verificações — regras-em-qualquer-agente

## 2026-10-22

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: leitura das regras por um segundo agente (Copilot, Cursor etc.), que fica como verificação manual depois da release; symlink de arquivo de instrução no Windows (o Git Bash não cria symlinks por padrão)
- Cobertura fora da suíte: "AGENTS.md com conteúdo de outro gerador" também conferido numa cópia real do código do Lava Jato (`scratchpad/lj-copia`, pelo agente); BOM, finais de linha misturados e limpeza de temporários (pasta temporária, pelo agente)
- Avaliação: Nenhum crítico nas checagens que rodaram. Não verificados: um segundo agente lendo as regras e o symlink no Windows.

Itens: nenhum

Comandos:

- `openspec instructions apply --change regras-em-qualquer-agente --json` → `all_done`, 7/7 (exit 0)
- Passos do `validate.yml` (comandos de verificação do `openspec/project.md`) → 16 `[PASS]` no `store` e 4 no `root` antes das correções; depois delas, `[PASS]` em todos os passos que usam o instalador ou o setup, nos de lint, versão e trechos customizados e nos 4 do `root` (exit 0)
- `openspec validate --all --strict` → 17 passed; `sync-root --check` → em dia (exit 0)
- `install-skills.mjs --in-place` na cópia do Lava Jato → bloco do Next.js intacto, cinco arquivos com um bloco cada, `docs/openspec-regras.md` igual à fonte
- `review.md` → efd88c4..9091bca, subagente requesting-code-review; correções em d68b3e1
