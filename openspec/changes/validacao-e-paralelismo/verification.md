# Verificações — validacao-e-paralelismo

## 2026-10-22

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: duas suítes completas rodando ao mesmo tempo na mesma máquina (coberto pelo desenho do sufixo `$$`/`$RANDOM` por execução e pela execução da outra sessão em paralelo só com passos sem store); o passo 6a do propose em outro agente (é texto de prompt; a CI confere o trecho)
- Cobertura fora da suíte: ramo "CLI já instalado" e trap numa falha no meio, conferidos à mão no Git Bash (abaixo)
- Avaliação: Nenhum crítico nas checagens que rodaram. Não verificados: a corrida real de duas suítes completas e a reação de outro agente ao passo 6a.

Itens: nenhum

Comandos:

- `openspec instructions apply --change validacao-e-paralelismo --json` → 5/5 (`progress` do CLI, exit 0)
- Suíte local (Git Bash, Windows) → job `store` 21/21 e `root` 5/5 PASS; nenhum id `ci-*` no `openspec store list --json` depois
- PR #32 → run 39867070894 (f6ad0ed) e run 39868122612 (27c743b): store (ubuntu-latest), store (windows-latest) e root = success
- "Ids de teste com sufixo" → 4 linhas com id fixo pegas (`--id ci-novo2`, `--register-id 'ci-a'`, `--id=ci-b;`, `store unregister ci-c)`) e 2 com `-$sfx` liberadas
- Ramo do CLI instalado → `OpenSpec CLI 1.14.2 já instalado`, sem `npm install`
- Trap com `set -eo pipefail` e `false` no meio → o trap rodou com o id do sufixo e o passo saiu com 1
- Changes concorrentes no propose → usado nas propostas de `aprovacao-por-conteudo` e `ganchos-de-sessao-e-fluxo` (linha de changes concorrentes no Impact)
- `review.md` → c47be6a..64f060c, subagente requesting-code-review; correções em d35221b
