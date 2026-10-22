# Revisão de código — corrige-caminho-e-prompt-no-windows

## 2026-10-21

- Intervalo: 3db93f5..fcd3c03 (ajustes em 8a40403)
- Revisor: subagente requesting-code-review
- Críticos: 0
- Importantes: 0
- Menores: 4 (corrigidos 2, aceitos 2)
- Segurança: varredura de secrets não verificada (o `openspec/project.md` deste repositório não registra o comando); auditoria de dependências não se aplica (a change não adiciona dependências)

Achados:

- [menor] `code --version` sem timeout podia travar o script depois do "Pronto" com um `code` que bloqueia. Corrigido em 8a40403: `runTool` aceita `timeout`, e a checagem usa 5 s; estourar o tempo conta como "sem VS Code".
- [menor] A sugestão `code "<pasta>"` não era segura para colar num shell POSIX quando o caminho tem `$` ou crase. Corrigido em 8a40403: fora do Windows, a pasta vai entre aspas simples, com `'` escapado; conferido com `/home/a b/it's$x`, que volta intacto depois do `eval`.
- [menor] Com várias respostas coladas de uma vez, cada `rl.prompt()` redesenha a linha, e as perguntas anteriores somem da tela. Aceito: as respostas continuam lidas na ordem; colar várias respostas não é o uso normal do console.
- [menor] A tarefa 3.2 e o teste do responsável no console estavam pendentes. A 3.2 foi concluída depois da revisão; o teste no console é condição da aprovação, antes da release.
