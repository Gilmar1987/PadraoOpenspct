# Revisão de código — versoes-e-adrs-no-propose

## 2026-10-25

- Intervalo: af76b61..6281ea1 (depois do rebase sobre 60cddba: f7f96f0..fe28d3f)
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 2 (corrigidos 1, justificados 1)
- Menores: 3
- Segurança: não verificado (varredura de secrets adiada no `project.md`; a change não adiciona dependências nem credenciais)

Achados:

- [importante] A marca de versão inferida podia ficar dentro de crases na tabela, onde o portão de apply não a vê — corrigido em 2e28ec4 (marca em texto puro na célula, fora de crases, e a tarefa de instalação aponta para a linha da tabela)
- [importante] O D1 do design e o requisito "Versões consultadas" não acompanham o ajuste de fe28d3f (dependências de par, estável pela lista completa) — justificado: planejamento, alinhado pelo `/opsx:update` com a reconfirmação do responsável, como nas changes anteriores; registrado para o verify
- [menor] ADR existente alterada pelo propose ficaria fora do commit — corrigido em 2e28ec4 ("created or changed")
- [menor] Sem rede, a regra não dizia de onde sai a versão — corrigido em 2e28ec4 ("the version you expect")
- [menor] A tabela sem título fixo — corrigido em 2e28ec4 (`## Dependency versions`)
- Rebase sobre a main com o #50 (aprovação e comando por etapa): só o CHANGELOG conflitou; os trechos do #50 no propose ficaram intactos e os marcadores negativos da CI passam

## 2026-10-25 (1.16.0)

- Intervalo: 2825f56..HEAD
- Revisor: pessoa: não aplicável
- Revisão: não aplicável (o commit só move o item da change no CHANGELOG para a seção 1.16.0 e sobe o `VERSION`, sem lógica nova; o rebase sobre a release v1.15.0 em 4710c02 passou sem conflitos)
