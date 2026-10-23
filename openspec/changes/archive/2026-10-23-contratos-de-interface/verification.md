# Verificações — contratos-de-interface

## 2026-10-23

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: comportamento do agente ao seguir a 2.6 do init e os trechos "Interface contract first", "Contract and code in the same commit" e "Interface contract check" numa sessão real (os arquivos são prompts; não há execução automatizada); varredura de secrets (o `openspec/project.md` registra "Adiado")
- Cobertura fora da suíte: —
- Avaliação: Nenhum crítico nas checagens que rodaram. Não verificado: o comportamento do agente com o init e os trechos novos, e a varredura de secrets.

Itens: nenhum

Comandos:

- `openspec instructions apply --change contratos-de-interface --json` → `all_done`, 9/9 (exit 0)
- `node padrao-openspec/scripts/sync-root.mjs --check` → em dia (exit 0)
- `openspec validate --all --strict` → 20 passed (exit 0)
- Suíte local completa dos jobs `store` e `root` → 29 `[PASS]`, nenhum `ci-*` no registro (tarefa 4.3, antes das correções da revisão)
- Depois das correções: `run-ci-steps.py` com "Trechos customizados das skills", "Lint de Markdown", "Versão e changelog" e "Smoke test das métricas de fluxo" (store) e "Raiz em dia", "Lint de Markdown da raiz" e "Guia de primeiros passos" (root) → 7 `[PASS]` (exit 0)
- `grep` dos seis requisitos ADDED → implementação em: init (2.6, linha "Contratos de interface" do `project-setup.md`, finalidade "teste de contrato" da 7.1), modelo de `project.md` (tabela, nota do `ORIGEM.md` com o comando do SHA-256 normalizado, recomendação do hash exposto e linha "Teste de contrato"), propose, apply e verify (trechos iguais no comando e na skill, conferidos com `diff`) e `rules.md` seção 3
- `review.md` → c3ffe52~1..de94847, subagente requesting-code-review; correções em 0d5a038
