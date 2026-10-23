# Verificações — questionario-adaptativo

## 2026-10-23

- Críticos: 0
- Warnings: 2
- Sugestões: 0
- Não verificado: Varredura de secrets (Adiado: definir na primeira change que precisar, no `project.md`); suíte completa depois de a92bcdf (outra sessão usando o registro de stores; os passos afetados rodaram de novo)
- Camadas: — (sem matriz no project.md)
- Cobertura fora da suíte: perguntas puladas (3.2, 3.8, 6.5, 6.6), pulada respondida a pedido, filtros da 3.5, 3.7, 4.5, 5.4 e 5.5, `todas`, coerência na hora (2.1 × 1.4, 3.8 × 2.5, 3.8 × Bloco 4) e a 2.2 antes da 2.1 (roteiro da tarefa 4.1 numa cópia temporária do store no scratchpad; subagente seguindo o `init.md`, respostas do dev roteirizadas pelo agente da change)
- Avaliação: nenhum crítico nos checks que rodaram; varredura de secrets não verificada (adiada no project.md) e suíte completa não repetida depois da última correção; 2 warnings

Itens:

- [warning] Design diverge da implementação em dois pontos: o D3 diz que uma pergunta pulada não filtra nada e que a 3.7 e a 5.4 dependem só da 3.1 (o comando filtra pelo valor registrado pela regra e mantém a opção de JS/TS com a 3.2 em 1 ou 2), e o D5 descreve a combinação de microsserviços numa linha (o comando tem duas); recomendação: alinhar o design com `/opsx:update`, com a reconfirmação do responsável (`padrao-openspec/.claude/commands/opsx/init.md:70-90` e `:844-845`)
- [warning] Cenários cobertos só por inspeção do texto, sem execução: "Projeto só de front-end" (2.2 = 4), "Combinação já decidida" na checagem final, "Aprovação de PR com uma pessoa só, apontada na hora" e os dois cenários do arquivo de respostas

Comandos:

- `review.md` → e77c917..9748c95, subagente requesting-code-review; 2 importantes e 4 menores corrigidos em a92bcdf, 1 menor justificado (o D3, levado a este verify); revisão em dia (depois dela só a92bcdf, listado, e o próprio `review.md`)
- `node padrao-openspec/scripts/portao.mjs apply questionario-adaptativo` → liberado (exit 0)
- `openspec validate questionario-adaptativo --strict` → válida (exit 0)
- `openspec validate --all --strict` → 23 passed (exit 0; reused from apply, depois de ca611ec; a92bcdf não mexe em `openspec/`)
- `run-ci-steps.py validate.yml store .` e `root .` → todos PASS, com o lint da raiz corrigido e repetido (exit 0; reused from apply, antes de ca611ec e a92bcdf)
- `run-ci-steps.py` "Trechos customizados", "Lint de Markdown", "Versão e changelog", "Raiz em dia" e "Lint de Markdown da raiz" → PASS depois de a92bcdf (exit 0)
- `sync-root.mjs --check` → em dia (exit 0)
- Mapeamento requisito → seção do `init.md`: "Perguntas puladas" → "## Regras de salto" (linha 52); "Organização dos repositórios antes do estilo do back-end" → Bloco 2, frase de ordem (linha 259) e salto da 2.2 = 4; "Opções filtradas" → "## Filtros de opções" (linha 70); "Coerência avaliada na hora" → "**Na hora:**" (linha 834); "Microsserviços num projeto pequeno" → linhas 844-845; "Arquivo de respostas com salto e filtro" → "Respostas pré-preenchidas" (linhas 102-103)
- Princípios de engenharia: não se aplicam (a change muda só o texto de um comando de agente; não há entrada externa, mutação nem resposta de erro em código)
