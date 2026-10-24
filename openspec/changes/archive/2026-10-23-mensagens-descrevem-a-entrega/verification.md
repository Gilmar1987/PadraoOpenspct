# Verificações — mensagens-descrevem-a-entrega

## 2026-10-23

- Críticos: 0
- Warnings: 2
- Sugestões: 0
- Não verificado: Varredura de secrets (Adiado: definir na primeira change que precisar, no `project.md`); suíte completa depois de 997ae2b (os passos afetados rodaram de novo)
- Camadas: — (sem matriz no project.md)
- Cobertura fora da suíte: —
- Avaliação: nenhum crítico nos checks que rodaram; varredura de secrets não verificada (adiada no project.md) e suíte completa não repetida depois das correções da revisão; 2 warnings

Itens:

- [warning] O D2 do design diverge da implementação: o trecho "Describe the delivery" ganhou as frases de listar entrega e nome ao escolher e de trocar de change pelo nome, o propose tem trecho próprio, o exemplo usa "Entrega:" e os títulos de apply, verify e sync perderam o nome; recomendação: alinhar o design com `/opsx:update`, com a reconfirmação do responsável
- [warning] Cenários cobertos só por inspeção do texto dos fluxos, sem execução: "Resumo do apply", "Duas changes ativas" e "Fim do propose"

Comandos:

- `review.md` → e818682..2d78356, subagente requesting-code-review; 1 crítico, 3 importantes e 3 menores corrigidos em 997ae2b, 1 menor mantido com justificativa; revisão em dia (depois dela só 997ae2b, listado, e o próprio `review.md`)
- `openspec validate mensagens-descrevem-a-entrega --strict` → válida (exit 0)
- `run-ci-steps.py` dos jobs `store` e `root` → 30 PASS (exit 0; reused from apply, antes de 997ae2b)
- `run-ci-steps.py` "Trechos customizados", "Lint de Markdown", "Raiz em dia" e "Lint de Markdown da raiz" → PASS depois de 997ae2b (exit 0)
- `sync-root.mjs --check` → em dia (exit 0); `git status --short` → limpo
- Mapeamento requisito → texto: "Mensagem descreve a entrega" → item da seção 3 do `rules.md` (linha 117), "Describe the delivery" no passo 1 de apply, verify, archive, update e sync (comando e skill) e `**Entrega:**` nos modelos de saída (apply 177, 193 e 211; archive 212, 225, 238 e 256; verify 178; sync 262); "Próximo passo pelo comando sem o nome" → última frase do trecho nos cinco fluxos e "The next step is `/opsx:apply`" no propose (linha 177)
- Princípios de engenharia: não se aplicam (a change muda só texto de regras e de fluxos de agente)
