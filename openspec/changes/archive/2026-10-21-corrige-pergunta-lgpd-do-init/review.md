# Revisão de código — corrige-pergunta-lgpd-do-init

## 2026-10-21

- Intervalo: 60291a6..b66c937 (ajustes em db70ca9)
- Revisor: subagente requesting-code-review
- Críticos: 0
- Importantes: 0
- Menores: 6 (corrigidos 3, aceitos 3)
- Segurança: varredura de secrets não verificada (o `openspec/project.md` deste repositório não registra o comando); auditoria de dependências não se aplica (a change não adiciona dependências)

Achados:

- [menor] A nota da 6.5 citava o 1.5 pelo rótulo "Não", e a checagem de coerência pelo número. Corrigido em db70ca9: "só se o 1.5 não for 4 (Não)".
- [menor] Um arquivo de respostas com o 1.5 = 4 e controles na 6.5 teria os controles trocados por "Não aplicável" em silêncio. Corrigido em db70ca9: a nota manda apontar a combinação na checagem de coerência.
- [menor] A evidência da 1.1 não citava o item do CHANGELOG, que menciona "Todos os anteriores" de propósito. Corrigido em db70ca9.
- [menor] A linha da checagem não dispara quando o 1.5 é "Outro" descrevendo dados pessoais, nem quando a 6.5 é um "Outro" equivalente a nenhum. Aceito: o escopo da change é a combinação numerada; o agente ainda pode apontar casos livres.
- [menor] Linha em branco entre o título da 6.5 e a nota, enquanto outras perguntas põem a nota na linha seguinte. Aceito: o design pediu a linha em branco, e o resultado é o mesmo.
- [menor] A tarefa 2.2 estava aberta durante a revisão. Concluída depois.
