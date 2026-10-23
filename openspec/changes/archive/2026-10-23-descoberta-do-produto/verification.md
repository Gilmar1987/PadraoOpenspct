# Verificações — descoberta-do-produto

## 2026-10-23

- Críticos: 0
- Warnings: 2
- Sugestões: 1
- Não verificado: Varredura de secrets (Adiado: definir na primeira change que precisar, no `project.md`)
- Camadas: — (sem matriz no project.md)
- Cobertura fora da suíte: abertura sem brief, postura crítica (escopo grande demais), uma pergunta por vez, brief "Em andamento" com confirmação, retomada, init sem brief, init com descoberta concluída, recomendação com fonte e "o brief não cobre" (roteiro da tarefa 5.1 numa cópia temporária do store no scratchpad; subagentes seguindo os comandos, o agente da change no papel do dev)
- Avaliação: nenhum crítico nos checks que rodaram; varredura de secrets não verificada (adiada no project.md); 2 warnings e 1 sugestão

Itens:

- [warning] D3 do design diverge da implementação: chamado pelo init, o discover commita o brief "Em andamento" (correção da revisão, para o trabalho não ficar fora do Git quando o init para); o design diz que o discover chamado pelo init não commita (`padrao-openspec/.claude/commands/opsx/discover.md`, Encerramento, passo 4)
- [warning] Cenários cobertos só por inspeção do texto, sem execução: abertura com brief do ingest, contradição com o brief do ingest, pedido de código na descoberta, descoberta avulsa num projeto inicializado, documentos informados por pasta no init, origem das recomendações no `project-setup.md` e arquivo de respostas sem as perguntas prévias
- [sugestão] Requisito de `store-setup` cita só init e ingest resolvendo a raiz; incluir o discover numa próxima change que toque essa spec

Comandos:

- `review.md` → 685f13c..a094935 (cc3fe28..101e5e5 depois do rebase), subagente requesting-code-review; 1 importante e 8 menores corrigidos, 1 menor justificado; entrada do rebase e da 1.15.0 sem revisão (não aplicável)
- `node padrao-openspec/scripts/portao.mjs apply descoberta-do-produto` → liberado, com a reconfirmação e o selo novo (exit 0)
- `node padrao-openspec/scripts/sync-root.mjs --check` → em dia (exit 0; reused from apply, depois do rebase)
- `openspec validate --all --strict` → 22 passed (exit 0; reused from apply, depois do rebase)
- `run-ci-steps.py validate.yml store .` e `root .` → 30 PASS, nenhum `ci-*` no registro (exit 0; reused from apply, depois do rebase; depois disso só mudaram `VERSION`, CHANGELOG e registros da change)
- `run-ci-steps.py` "Versão e changelog", "Smoke test do changelog-range", "Lint de Markdown" e "Lint de Markdown da raiz" → PASS depois da 1.15.0 (exit 0)
- Mapeamento requisito → seção: 9 requisitos de `product-discovery` no `discover.md` (tarefa 2.2); 6 de `project-initialization` no `init.md` ("Antes da entrevista", "Recomendação a partir do brief", "Respostas pré-preenchidas", Arquivo 1) e no `ingest.md` ("Quando o /opsx:init conduz"); `skill-installation` pelo `diff -r` e pelo `test -f` do `discover.md` instalado no smoke do instalador
