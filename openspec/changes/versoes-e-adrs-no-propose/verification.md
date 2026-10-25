# Verificações — versoes-e-adrs-no-propose

## 2026-10-25

- Críticos: 0
- Warnings: 3
- Sugestões: 0
- Não verificado: Varredura de secrets (Adiado: definir na primeira change que precisar, no `project.md`)
- Camadas: — (sem matriz no project.md)
- Cobertura fora da suíte: "Latest aponta para uma RC" e "Change com ADR nova" (roteiro da tarefa 4.1 num repositório git temporário no scratchpad; subagente executando o propose com consulta real ao npm; rodado antes de 2e28ec4)
- Avaliação: nenhum crítico nos checks que rodaram; varredura de secrets não verificada (adiada no project.md); 3 warnings

Itens:

- [warning] O design diverge da implementação: o D1 não traz as dependências de par, a estável pela lista completa de versões, o título `## Dependency versions`, a versão esperada sem rede nem a marca em texto puro fora de crases; o D2 diz "created", e o comando diz "created or changed"; recomendação: alinhar o design com `/opsx:update`, com a reconfirmação do responsável
- [warning] Cenários conferidos só pela leitura do texto: "Biblioteca npm nova" (Vitest) e "Sem rede"; e o roteiro rodou antes das correções da revisão (marca em texto puro, ADR alterada no commit); recomendação: aceitar a cobertura por inspeção ou repetir o roteiro sem rede
- [warning] Versão: o proposal e o CHANGELOG põem esta change na 1.15.0, que vai ser publicada sem ela (release aprovada pelo responsável a partir de 60cddba); recomendação: depois da release, mover o item para uma seção 1.16.0 e subir o `VERSION`, com `/opsx:update` e reconfirmação

Comandos:

- `review.md` → af76b61..6281ea1 (f7f96f0..fe28d3f depois do rebase), subagente requesting-code-review; 1 importante e 3 menores corrigidos em 2e28ec4, 1 importante justificado (o design, levado a este verify); revisão em dia (depois dela só 2e28ec4, listado, e registros da change)
- `openspec validate versoes-e-adrs-no-propose --strict` → válida (exit 0)
- `node padrao-openspec/scripts/portao.mjs apply versoes-e-adrs-no-propose` → liberado (exit 0)
- `run-ci-steps-t.py` do job `store` passo a passo e do job `root` → todos PASS (exit 0; reused from apply); depois do rebase sobre 60cddba, "Trechos customizados" (com os marcadores negativos do #50), "Lint de Markdown", "Versão e changelog", "Validar specs", "Paridade de papéis", hooks, blocos de agentes e o job `root` → PASS (exit 0; reused from apply, depois de 2e28ec4)
- Mapeamento requisito → texto: "Versões consultadas no propose" e "Versão exata e estável" → "Consulted dependency versions" nas Artifact Creation Guidelines do `propose.md` (linha 185) e da skill; "ADR do propose no commit do planejamento" → passo 8 (linha 169), "the ADRs this workflow created or changed"
- Princípios de engenharia: não se aplicam (a change muda só o texto de um fluxo de agente)
