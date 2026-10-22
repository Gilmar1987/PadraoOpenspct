# Revisão de código — subagentes-e-ganchos

## 2026-10-22

- Intervalo: 1dcbe3b..d9994e4
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 5 (corrigidos 4, corrigido em parte e justificado 1)
- Menores: 8 (corrigidos 7, justificado 1)
- Segurança: auditoria de dependências não aplicável (o `project.md` registra "Não aplicável"; a change não acrescenta dependências); varredura de secrets não verificada (o `project.md` registra "Adiado"), diff conferido à mão sem secrets

Achados:

- [importante] `cobra-evidencia.mjs` ignorava changes com todas as tarefas marcadas (`status: complete`) — corrigido em 189d41a; smoke cobre o caso
- [importante] `cobra-evidencia.mjs` custava uma chamada do CLI por change em todo fim de turno, sem timeout, e bloqueava conversas por changes alheias, mandando desmarcar tarefas — corrigido em 189d41a: uma chamada com timeout, leitura direta do `tasks.md`, só arquivos alterados desde o início da conversa (pelo `transcript_path`), e a mensagem manda só avisar quando a tarefa não é da conversa
- [importante] Um subagente retirado entre versões travava as instalações seguintes como "agente alheio" — corrigido em 189d41a: arquivos da camada que saem do padrão são removidos na atualização (exige modo); smoke cobre o caso
- [importante] Heurística do `somente-leitura.mjs` deixava passar `cp`, `touch`, `git pull`, `sed --in-place` e afins, e negava `python -m pytest -p`, `node -r`, `git stash list`, `git tag -l` e `> /dev/stderr` — corrigido em 189d41a: separação de palavras com aspas, flags inline só antes do script ou módulo, regras por subcomando do Git; smoke cobre os casos
- [importante] Windows sem Git Bash: subagentes sem a ferramenta `PowerShell` e permissões só para `Bash(...)` — `PowerShell` acrescentado às `tools` em 189d41a; justificado para as permissões: a sintaxe de regra para a ferramenta PowerShell não foi confirmada na documentação, então o limite ficou documentado na seção "Camada do Claude Code" em vez de uma regra que poderia não valer
- [menor] `archiveCall` ignorava `--store=`, nome entre aspas, opções globais antes de `archive` e um segundo `openspec archive` na linha — corrigido em 189d41a
- [menor] A mesclagem reformatava o `settings.json` com 2 espaços e perdia o BOM — corrigido em 189d41a: indentação, fim de linha e BOM mantidos; smoke cobre o caso
- [menor] `hooks`/`permissions` fora do formato eram descartados em silêncio — corrigido em 189d41a: o instalador para com erro, como no JSON inválido
- [menor] Apagar uma ou todas as entradas do padrão se comportava de formas diferentes — corrigido em 189d41a: com `managedSettings` registrado, repor sempre exige modo; documentação ajustada
- [menor] A documentação citava `sh -c` como escape, mas ele é negado — corrigido em 189d41a
- [menor] O plano de rollback do design dizia que o instalador anterior removeria as entradas — corrigido em 189d41a: remoção à mão
- [menor] A documentação dizia "negados" para todo push forçado — corrigido em 189d41a: `--force-with-lease` e afins caem na confirmação do `git push`
- [menor] Lacunas de cobertura na CI — corrigidas em 189d41a, exceto `--update` com `settings.json`: justificado, o revisor reproduziu o caminho e o commit trouxe só o `settings.json` e o manifesto; o `--update` em geral já é coberto pelo smoke do instalador
