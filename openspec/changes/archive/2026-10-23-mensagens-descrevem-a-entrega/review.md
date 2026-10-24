# Revisão de código — mensagens-descrevem-a-entrega

## 2026-10-23

- Intervalo: e818682..2d78356
- Revisor: subagente requesting-code-review
- Críticos: 1 (corrigidos 1, justificados 0)
- Importantes: 3 (corrigidos 3, justificados 0)
- Menores: 4
- Segurança: não verificado (varredura de secrets adiada no `project.md`; a change não adiciona dependências nem credenciais)

Achados:

- [crítico] Espelho do `rules.md` na raiz fora dos commits, o que deixaria "Raiz em dia" vermelho no PR — corrigido em 997ae2b
- [importante] Títulos `## Implementing: <change-name>`, `## Verification Report: <change-name>` e `## Specs Synced: <change-name>` ainda usavam o nome como rótulo — corrigido em 997ae2b (títulos sem o nome e linha `**Entrega:**` abaixo, com marcador na CI)
- [importante] Cenário "Duas changes ativas" sem instrução de listar a entrega e o nome — corrigido em 997ae2b (frase no trecho e "One-line delivery" na lista do update)
- [importante] "roda o comando de novo e escolhe" não funciona com seleção automática — corrigido em 997ae2b ("names it or passes its name to the command")
- [menor] Trecho genérico no propose ("announce the selected change") — corrigido em 997ae2b (trecho próprio, próximo passo `/opsx:apply`)
- [menor] Exemplo com o rótulo "Change:" — corrigido em 997ae2b ("Entrega:")
- [menor] Laço da CI numa linha só — corrigido em 997ae2b
- [menor] "for change '<name>'" no sync inline do archive — mantido: é instrução interna, não mensagem ao usuário
- Observação: o texto do D2 no `design.md` ficou diferente da implementação (trecho com as frases novas, títulos e marcador do Entrega); alinhar com `/opsx:update`, com a reconfirmação do responsável
