# Revisão de código — debitos-e-camadas-de-verificacao

## 2026-10-23

- Intervalo: b4fe159~1..a08220f
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 4 (corrigidos 4, justificados 0)
- Menores: 7 (corrigidos 7)
- Segurança: auditoria de dependências não aplicável (sem dependências novas); varredura de secrets não verificada (o `project.md` registra "Adiado"), diff conferido à mão sem secrets

Achados:

- [importante] O cenário "Nada adiado" nunca acontecia, porque Arquitetura era sempre "Adiado" e toda camada "Adiado" virava débito — corrigido em aa5d1b2: só respostas "Adiado" e combinações mantidas viram débito, como a spec diz; Arquitetura passa a "Não aplicável até uma ADR pedir teste de arquitetura"; o D5 do design foi alinhado
- [importante] A camada E2E dependia de um "comando de E2E" que a entrevista não pergunta, e o "Onde roda" do E2E não tinha fonte — corrigido em aa5d1b2: comando de testes se cobrir o E2E, senão "Adiado: definir o comando de E2E"; CI quando a 5.3 inclui testes E2E; o config deixou de citar um comando inexistente
- [importante] A 5.5 "Testcontainers" caía na camada E2E e não ligava o roteiro manual — corrigido em aa5d1b2
- [importante] O archive precisava inventar motivo e condição do débito aberto, e um "fecha" sem linha falhava em silêncio — corrigido em aa5d1b2: a linha do proposal traz motivo e condição, "fecha" usa o texto exato e o archive avisa quando não encontra
- [menor] Débito duplicado para camada e resposta adiadas — corrigido em aa5d1b2: uma linha só
- [menor] Camadas adiadas inflam a métrica de não verificados — corrigido em aa5d1b2: marcadas como `(Adiado na matriz)` e o efeito está no CHANGELOG
- [menor] Débito que é divergência de fonte não estava ligado ao `lacunas.md` — corrigido em aa5d1b2
- [menor] O design ainda citava a 2.4 — corrigido em aa5d1b2
- [menor] Marcadores da CI pouco específicos — corrigido em aa5d1b2
- [menor] README sem o `estado-atual.md` — corrigido em aa5d1b2
- [menor] Ordem implícita entre "Update the open debts" e o commit do archive — corrigido em aa5d1b2
