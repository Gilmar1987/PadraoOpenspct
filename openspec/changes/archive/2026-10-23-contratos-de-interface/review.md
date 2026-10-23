# Revisão de código — contratos-de-interface

## 2026-10-23

- Intervalo: c3ffe52~1..de94847
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 3 (corrigidos 3, justificados 0)
- Menores: 8 (corrigidos 6, justificados 2)
- Segurança: auditoria de dependências não aplicável (sem dependências novas); varredura de secrets não verificada (o `project.md` registra "Adiado"), diff conferido à mão sem secrets

Achados:

- [importante] A 2.6 não perguntava a direção (opções 3 e 4), o formato (5 e 6) nem aceitava mais de um contrato por opção — corrigido em 0d5a038
- [importante] O SHA-256 das cópias de terceiros não dizia sobre quais bytes é calculado, o que daria crítico falso com CRLF/LF — corrigido em 0d5a038: forma mínima do `ORIGEM.md` (Origem, Data, Versão, SHA-256) e hash com o fim de linha normalizado, com o comando no template
- [importante] O aviso "sem contrato" do propose não tinha condição e apareceria em toda proposta — corrigido em 0d5a038: só quando a change mexe numa interface com outros sistemas
- [menor] Arquivo de respostas sem forma para os dados de cada contrato — corrigido em 0d5a038
- [menor] 7.1 aceita "Não aplicável" para o teste de contrato com contrato registrado — justificado: linhas novas na tabela de coerência do init são da change `init-coerencia-e-ferramentas`, da outra sessão; o caso foi passado a ela
- [menor] "0" junto com outras opções na 2.6 — corrigido em 0d5a038: a opção 0 exclui as demais
- [menor] Template do `project.md` e item do `rules.md` sem marcador na CI — corrigido em 0d5a038
- [menor] O CHANGELOG não citava a regra do `rules.md` — corrigido em 0d5a038
- [menor] O Arquivo 5 (`arquitetura.md`) não citava a 2.6 — corrigido em 0d5a038
- [menor] "Interface" também nomeia tela no padrão — corrigido em 0d5a038: o propose diz "interface to other systems"
- [menor] A tarefa 4.3 estava aberta durante a revisão — justificado: era o esperado naquela fase; ela fechou com a suíte completa verde
