# Revisão de código — principios-de-engenharia

## 2026-10-23

- Intervalo: f024a09~1..6d4a8cd
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 4 (corrigidos 4, justificados 0)
- Menores: 7 (corrigidos 6, aceito 1)
- Segurança: auditoria de dependências não aplicável (sem dependências novas); varredura de secrets não verificada (o `project.md` registra "Adiado"), diff conferido à mão sem secrets

Achados:

- [importante] A 7.4 deixava marcar qualquer dos três itens como "Não aplicável", mas o `rules.md` e o verify só aceitam a exceção no log de três estados — corrigido em ca7238b: a 7.4 pergunta só pelo log de três estados, a validação e o erro sem detalhe interno valem sempre, e o `rules.md`, a proposal e o D5 do design dizem o mesmo
- [importante] A heurística CRITICAL do verify não trazia a ressalva de falso positivo do design — corrigido em ca7238b: mensagens de campo para o cliente e os dados do próprio chamador não são vazamento; o CRITICAL vale para texto de exception, driver ou stack e para dados de terceiros
- [importante] O cenário "Teste com a citação" não tinha implementação no verify — corrigido em ca7238b: o Scenario Coverage mapeia os testes pela citação primeiro, com o mesmo texto no comando e na skill
- [importante] A 7.4 não dizia como responder pelo arquivo de respostas — corrigido em ca7238b: "a 7.3 e a 7.4 vão pelo número", e a célula é `0` ou `1 (<justificativa>)`
- [menor] O gatilho da 7.2 perguntaria "Princípios de engenharia" antes da 7.4 — corrigido em ca7238b: "nem a 7.3 ou a 7.4"
- [menor] "Ferramenta de log" era vaga, porque a 6.1 escolhe o destino dos logs — corrigido em ca7238b: "logger do projeto (que envia ao destino da 6.1)"
- [menor] O verify não dizia o que fazer sem a linha "Princípios de engenharia" ou com a validação adiada — corrigido em ca7238b: sem a linha, os três itens valem; validação adiada vira WARNING citando a decisão adiada
- [menor] A revisão não indicava a severidade de cada princípio — corrigido em ca7238b: vazamento é crítico, falta de validação ou de log é importante, teste sem citação é menor
- [menor] O requisito "Change ligada ao objetivo do produto" só é cobrado no planejamento — aceito: coerente com o design, que cobra o Why pela regra do `config.yaml`; revisão e verify conferem código
- [menor] O D5 do design citava uma tabela do bloco 7 no `project-setup.md` que não existe — corrigido em ca7238b: o D5 diz que a 7.4 entra pelo resumo do bloco
- [menor] A proposal prometia exemplos de vários ecossistemas, e o texto não trazia nenhum — corrigido em ca7238b: a heurística cita Zod, Pydantic, Bean Validation e FluentValidation, sempre a que o `project.md` registra
