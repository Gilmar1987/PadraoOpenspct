# Verificações — imposicao-e-catraca

## 2026-10-23

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: comportamento do agente ao seguir a severidade pela imposição, a prova "seen failing", o Impacto medido, a catraca "Falhas aceitas" e as "Exit conditions" numa sessão real (os arquivos são prompts; não há execução automatizada); varredura de secrets (o `openspec/project.md` registra "Adiado")
- Camadas: — (sem matriz no project.md do próprio padrão)
- Cobertura fora da suíte: —
- Avaliação: Nenhum crítico nas checagens que rodaram. Não verificado: o comportamento do agente com os trechos novos e a varredura de secrets.

Itens: nenhum

Comandos:

- `openspec instructions apply --change imposicao-e-catraca --json` → `all_done`, 12/12 (exit 0)
- `git log --oneline HEAD..origin/main` → vazio (a branch está sobre 362d8ab, o merge do PR #43); a change acrescenta itens à seção `## 1.14.0` aberta pela `principios-de-engenharia`, sem mexer no `VERSION`
- `node padrao-openspec/scripts/sync-root.mjs --check` → em dia (exit 0)
- `openspec validate --all --strict` → 22 passed (exit 0)
- Suíte local completa dos jobs `store` e `root` → 30 `[PASS]`, nenhum `ci-*` no registro (tarefa 5.2, antes das correções da revisão)
- Depois das correções (e0fa9d1): "Trechos customizados das skills", "Lint de Markdown", "Config base carrega sem avisos", "Smoke test das métricas de fluxo" (store), "Raiz em dia" e "Lint de Markdown da raiz" (root) → `[PASS]` (exit 0)
- Marcadores da CI vistos reprovando: antes da implementação, o passo "Trechos customizados" → FAIL (exit 1) só nos pontos esperados (tarefa 1.2); o marcador corrigido do `adrs/README.md` → exit 1 com o trecho retirado de uma cópia e exit 0 no arquivo limpo
- `diff` entre comando e skill: "ADR verification", "ADR check seen failing", "Exit conditions" e "Accepted failures" (verify), "Accepted failures", "Impacto medido" e "seen failing" (propose) e "Update the open debts" (archive) → iguais
- Requisitos × implementação:
  - ADR com verificação declarada e Forma de imposição da ADR → `adrs/template.md` (`imposicao`, `## Limite`) e `adrs/README.md`;
  - Verificação de ADR cobrada pelo verify, Severidade pela forma de imposição e Verificação sem nada a varrer → item "ADR verification" do verify;
  - Verificação de ADR vista reprovando → passos 5 e 6 do propose, regra de tasks do `config.yaml` e "ADR check seen failing" no verify;
  - Impacto medido de decisão de arquitetura → passo 6 do propose e regra de design do `config.yaml`;
  - Catraca de falhas aceitas no verify → "Accepted failures" em "Project validation commands" e no item de ADR;
  - Falhas aceitas no ciclo das changes → "Accepted failures" no propose e "Update the open debts" no archive;
  - Condição de saída conferível → "Exit conditions" no verify e "sai quando" conferível no propose;
  - Falhas aceitas e condição conferível no estado atual → Arquivo 6 do `init.md` (3 marcadores)
- ADR-0008 → `status: Accepted` (3465032), por declaração do responsável citada no commit
- `review.md` → 0829a4a..e4c405c, subagente requesting-code-review; correções em e0fa9d1
