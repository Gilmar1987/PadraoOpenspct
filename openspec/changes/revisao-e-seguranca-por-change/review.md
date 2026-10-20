# Revisão de código — revisao-e-seguranca-por-change

## 2026-10-20

- Intervalo: ef1e100..c732312
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 5 (corrigidos 5, justificados 0)
- Menores: 7
- Segurança: não verificado (o `project.md` deste repositório não registra comandos de auditoria de dependências nem de varredura de secrets; a change não adiciona dependências)

Achados:

- [importante] As varreduras sugeridas (`gitleaks detect`, `trufflehog git`) examinam o histórico, não o conteúdo a commitar — corrigido em 1f2f0a4 (varredura sobre o conteúdo preparado, sugestões `gitleaks git --staged`, `trufflehog filesystem .`, `git secrets --scan`)
- [importante] A revisão podia cobrir um intervalo vazio, porque commitar era opcional — corrigido em 1f2f0a4 (código commitado antes da revisão; intervalo achado pelo trailer `OpenSpec-Change`)
- [importante] "Alterou código" não estava definido, e o verify não tinha como contestar um "não aplicável" — corrigido em 1f2f0a4 (definição no passo 6a; o verify decide pelos commits ou pelo diff)
- [importante] O verify permitia registrar uma revisão limpa em `Itens:`, contra o cenário "Revisão completa" — corrigido em 1f2f0a4 (intervalo e revisor só em `Comandos:`)
- [importante] O cenário "Varredura limpa" exige registrar a varredura na evidência da tarefa, sem instrução correspondente — corrigido em 1f2f0a4 (cláusula no "Security checks")
- [menor] Auditoria podia exigir corrigir vulnerabilidades preexistentes — corrigido em 1f2f0a4 (só dependências da change; antigas listadas como preexistentes)
- [menor] O verify aceitava revisão desatualizada — corrigido em 1f2f0a4 (WARNING "Code review is stale")
- [menor] O passo 7 do apply ainda tratava a revisão como opcional — corrigido em 1f2f0a4
- [menor] A varredura não cobria os commits de correção da revisão — corrigido em 1f2f0a4 ("review fixes included")
- [menor] O verify não confere os achados de segurança do `review.md` — aceito: fora do que as specs pedem; candidato à próxima change
- [menor] A CI só confere a presença dos marcadores, não a igualdade entre skill e comando — aceito: limitação conhecida do passo de trechos customizados
- [menor] A tarefa 4.1 não tem linha `Evidência:` própria — aceito: a evidência da 4.2 declara que cobre a 4.1 (lint da raiz)

## 2026-10-20

- Intervalo: c732312..1f2f0a4
- Revisor: inspeção do coordenador sobre os commits de correção
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 0 (corrigidos 0, justificados 0)
- Menores: 0
- Segurança: não verificado (mesmo motivo da entrada anterior)

Achados:

- Nenhum. Os textos corrigidos são iguais na skill e no comando de apply e de verify, o `design.md` foi alinhado (D1 a D4 e D7), o sync está em dia e os passos "Trechos customizados das skills" e "Lint de Markdown" passam.
