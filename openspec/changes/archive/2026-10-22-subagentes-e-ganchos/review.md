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

## 2026-10-22 (trecho final)

- Intervalo: 2b4cc3b..e962c52
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 1 (corrigidos 1, justificados 0)
- Menores: 6 (corrigidos 5, informativo 1)
- Segurança: auditoria de dependências não aplicável (sem dependências novas); varredura de secrets não verificada (o `project.md` registra "Adiado"), diff conferido à mão sem secrets

Achados:

- [importante] O CHANGELOG dizia "entram dois hooks"; o template acrescenta quatro — corrigido em e478a05
- [menor] Sessão aberta com `--agent openspec-<papel>` recebe `agent_type` e passa a ter os limites do papel, o que o texto "agente principal não é afetado" não dizia — corrigido em e478a05 no design e no guia; a spec não muda, porque essa sessão assume o papel e não é o agente principal de que o requisito trata
- [menor] Sem `agent_type` (versão ou host sem o campo), os hooks de papel liberam em silêncio — corrigido em e478a05: o guia cita a versão validada (2.1.243) e manda repetir o passo 1 do roteiro no ambiente do time
- [menor] ADR-0006 e design com trechos do desenho anterior (hooks no frontmatter, ADR Proposed, JSON do D3 sem os hooks de papel) — corrigido em e478a05
- [menor] A CI não conferia o par matcher↔script nem a atualização de um grupo misto — corrigido em e478a05
- [menor] O separador de palavras deixava passar `for … do rm`, `then rm`, `f() { rm x; }`, `! rm`, `xargs rm`, `$(rm x)` e `ForEach-Object { Remove-Item }`, e negava `git tag --contains HEAD@{1}` — corrigido em e478a05: parênteses e chaves abrem comando (`${VAR}` e `ref@{n}` continuam palavras), prefixos novos e filtros de listagem do `git tag`; smoke cobre os casos
- [menor] Custo de um `node` a mais por chamada de Edit/Write e dois por chamada de shell na sessão principal — informativo, aceito: o hook de papel sai antes de qualquer trabalho quando o `agent_type` não é do papel

## 2026-10-22 (correção do Windows)

- Intervalo: e478a05..2f4515c
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 1 (corrigidos 1, justificados 0)
- Menores: 2 (corrigidos 2)
- Segurança: auditoria de dependências não aplicável; varredura de secrets não verificada (o `project.md` registra "Adiado"), diff conferido à mão sem secrets

Achados:

- [importante] Ao comparar só pela forma canônica, uma pasta gerenciada que é link para outra pasta do repositório (`.claude -> cfg`) deixava de ser reconhecida, e a escrita era liberada — corrigido em c5dbae9: o destino real decide "fora do repositório", e as áreas gerenciadas são conferidas pelo destino real e pelo caminho escrito; testado com junction e com nome curto 8.3
- [menor] Link quebrado dentro do repositório apontando para fora não era seguido — corrigido em c5dbae9 com `lstat` e `readlink`
- [menor] Qualquer erro do `realpath` era tratado como "não existe" — corrigido em c5dbae9: só ENOENT e ENOTDIR sobem para o pai
