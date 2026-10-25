# Verificações — init-coerencia-e-ferramentas

## 2026-10-24

- Críticos: 0
- Warnings: 2
- Sugestões: 0
- Não verificado: Varredura de secrets (Adiado: definir na primeira change que precisar, no `project.md`); "Smoke test do portão" na suíte completa (estourou 15 min na suíte; rodado sozinho, passou)
- Camadas: — (sem matriz no project.md)
- Cobertura fora da suíte: as quatro combinações novas, a recusa da 6.4 com arquivo de respostas, a auditoria de produção (Python) e a conferência de ferramentas com ausentes (roteiro da tarefa 4.1 numa cópia temporária do store no scratchpad; subagente seguindo o `init.md` com arquivo de respostas montado pelo agente da change; rodado antes das correções da revisão em 65f7ac9)
- Avaliação: nenhum crítico nos checks que rodaram; varredura de secrets e o passo do portão na suíte não verificados; 2 warnings

Itens:

- [warning] O design diverge da implementação depois das correções da revisão (65f7ac9): D1 (condição do SQLite gerenciado, `.env` × criptografia só com produção e cofres 1, 3 e 4, cobertura com "Outro" e "Adiado"), D2 (Redis mantendo a escolha anterior), D4 (exemplos de auditoria) e D5 (conferência com `command -v`/`Get-Command`, sem executar caminhos nem `-v`, tempo limite e `docker`/`uv` como ferramenta); recomendação: alinhar o design com `/opsx:update`, com a reconfirmação do responsável
- [warning] O roteiro da 4.1 rodou antes das correções da revisão, e os cenários "Projeto Node.js" e "Todas presentes" foram conferidos só pela leitura do texto; recomendação: aceitar a cobertura por inspeção ou repetir o roteiro sobre o texto atual

Comandos:

- `review.md` → 335d63b..396a320, subagente requesting-code-review; 4 importantes e 6 menores corrigidos em 65f7ac9, 1 menor justificado; revisão em dia (depois dela só 65f7ac9, listado, e registros da change)
- `openspec validate init-coerencia-e-ferramentas --strict` → válida (exit 0)
- `run-ci-steps-t.py` (tempo limite de 15 min por passo) dos jobs `store` e `root`, depois de 65f7ac9 → root todos PASS; store 28 PASS e "Smoke test do portão" TIMEOUT (exit 1; reused from apply); o passo do portão rodado sozinho → exit 0
- `sync-root.mjs --check` → em dia; `openspec validate --all --strict` → 23 passed (exit 0; reused from apply)
- Mapeamento requisito → texto do `init.md`: "Combinações de infraestrutura e testes" → linhas 853-856 da tabela de coerência; "Nenhuma proteção exclui as demais" → linha 750; "Auditoria de produção sugerida" → linha 799 e linha "Não aplicável" da auditoria (857); "Ferramentas conferidas no fim do init" → seção "## Ferramentas da máquina"
- Princípios de engenharia: não se aplicam (a change muda só o texto de um comando de agente)
