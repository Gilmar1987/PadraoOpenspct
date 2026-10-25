# Revisão de código — aprovacao-e-comando-por-etapa

## 2026-10-23

- Intervalo: 2904d77..1641e8a (antes do rebase sobre o #48; hoje b8f6c7f..70b4fa0)
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 7 (corrigidos 7, justificados 0)
- Menores: 6
- Segurança: auditoria de dependências não aplicável (sem dependências novas); varredura de secrets não verificada (o `project.md` registra "Adiado"), diff conferido à mão sem secrets

Achados:

- [importante] O `COMECE-AQUI.md` ainda ensinava "aprove `para archive` [...] sem parar" — corrigido em f885026, pela `/opsx:update` aprovada (D7)
- [importante] O `templates/openspec-padrao.md` mantinha o ciclo com uma aprovação só — corrigido em f885026
- [importante] O fim do archive e do update não seguia o D4 (próximo passo do PR; passo 6 do update) — corrigido em f885026
- [importante] Aprovação pedida duas vezes (archive com Escopo `apply`, apply Pendente, verify fora do escopo) — corrigido em f885026, com o requisito novo "Aprovação da etapa como confirmação"
- [importante] O marcador "Stop and show the next step" não era único no propose e no apply — corrigido em f885026: marcadores que só existem nos parágrafos novos
- [importante] Sem saída para agentes sem os comandos `/opsx:*` — corrigido em f885026, com o requisito "Etapa pedida pelo nome fora do Claude Code"
- [importante] "Typed this command" vago nas skills ativadas pelo modelo — corrigido em f885026: cada fluxo cita o seu comando, e a ativação da skill pelo modelo não vale
- [menor] Restos de "do not continue to archive" no verify — corrigido em f885026
- [menor] "A new user request" no propose — corrigido em f885026
- [menor] O apply não dizia o que acontece depois de um update no meio — corrigido em f885026
- [menor] Sem marcadores negativos na CI — corrigido em f885026
- [menor] O README mostrava o ciclo sem aprovações — corrigido em f885026
- [menor] Os subagentes do Copilot recomendam o `/opsx:archive` sem a aprovação sugerida — justificado: eles só recomendam, não executam, e estão fora do Impact

## 2026-10-24

- Intervalo: f885026 (acompanhamento do commit de correções)
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 3 (corrigidos 3, justificados 0)
- Menores: 5
- Segurança: auditoria de dependências não aplicável; varredura de secrets não verificada (o `project.md` registra "Adiado")

Achados:

- [importante] A frase "a aprovação escrita vale como confirmação" era igual nos cinco fluxos e deixava o propose preencher `## Aprovação` — corrigido em 088ca27, pela segunda `/opsx:update` aprovada: frase própria de cada etapa
- [importante] Tratar a aprovação da etapa como reconfirmação do selo deixava confirmar mudanças não vistas — corrigido em 088ca27: a reconfirmação continua pedindo a confirmação depois de mostrar o que mudou (requisito revisto, cenário "Selo vencido")
- [importante] Com o portão, o apply de uma change Pendente parava antes de aceitar a aprovação escrita — corrigido em 088ca27: registra a aprovação, com o selo, e roda o portão de novo
- [menor] O design não batia com o marcador negativo e o texto do verify — corrigido no planejamento (segunda `/opsx:update`)
- [menor] Os guias não mostravam a aprovação antes do `/opsx:propose` — corrigido em 088ca27
- [menor] Linhas do ciclo sem aprovações no README e no `rules.md` — corrigido em 088ca27
- [menor] Marcadores negativos sem o `rules.md` e o `COMECE-AQUI.md` — corrigido em 088ca27
- [menor] A CI não confere a paridade entre comando e skill — justificado: já era assim antes desta change; a paridade é conferida por `diff` nas tarefas e no verify

## 2026-10-24

- Intervalo: 088ca27 (acompanhamento, depois do rebase sobre o #48)
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 0 (corrigidos 0, justificados 0)
- Menores: 5
- Segurança: auditoria de dependências não aplicável; varredura de secrets não verificada (o `project.md` registra "Adiado")

Achados:

- [menor] A frase do propose ("never fills `## Aprovação`") colidia com a "Prior authorization" — corrigido em ad4bc39: "by itself [...]; only an explicit authorization past planning does"
- [menor] Nenhum marcador protegia a correção do I1 — corrigido em ad4bc39: a frase antiga entrou nos marcadores negativos, e as frases novas do propose, do apply e do archive nos positivos
- [menor] Os exemplos do `COMECE-AQUI.md` usavam o nome da change, e não a entrega — corrigido em ad4bc39
- [menor] O marcador negativo "sem parar" vale para o `COMECE-AQUI.md` inteiro — justificado: hoje não há uso legítimo da expressão; se aparecer, o marcador passa a um trecho mais longo
- [menor] A CI não confere a paridade entre comando e skill — justificado, como na rodada anterior
- Nenhuma contradição entre os trechos desta change e os da `mensagens-descrevem-a-entrega` nos cinco fluxos
