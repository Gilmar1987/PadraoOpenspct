# Revisão de código — entrega-no-codigo

## 2026-10-23

- Intervalo: 136898a..47baecf (antes do rebase; hoje d850cbc..aeb0657)
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 2 (corrigidos 2, justificados 0)
- Menores: 6
- Segurança: auditoria de dependências não aplicável (sem dependências novas); varredura de secrets não verificada (o `project.md` registra "Adiado"), diff conferido à mão sem secrets

Achados:

- [importante] No commit inicial do `comecar.mjs` numa pasta de gerador com histórico, o `.gitattributes` ficava fora do commit, e o próximo `--update` falhava com a árvore suja — corrigido em 62b8782: o `standardPaths` inclui o `.gitattributes` com o bloco; o teste novo revelou que o `.claude/settings.json` também ficava fora (defeito anterior), incluído pela `/opsx:update` aprovada (requisito "Commit inicial em pasta de código com histórico", tarefa 2.2)
- [importante] Um `.gitattributes` não versionado e ignorado pelo projeto fazia o `--update` falhar e ficava alterado depois do rollback — corrigido em 62b8782: o instalador pula o arquivo ignorado mesmo quando ele existe, e o commit do `--update` só leva o `.gitattributes` com o bloco que o Git pode encenar
- [menor] Marcadores localizados por trecho de texto e contados por linha — corrigido em 62b8782: índices e reconstrução por linha inteira
- [menor] `.gitattributes` vazio tratado como do projeto — corrigido em 62b8782: recebe o bloco
- [menor] Justificativa do `<troque>` no guia docker não conferia — corrigido em 62b8782
- [menor] README e `templates/openspec-padrao.md` sem o `.gitattributes` — corrigido em 62b8782
- [menor] Faltavam casos de CI (bloco desatualizado com CRLF, marcadores desbalanceados, arquivo ignorado) — corrigido em 62b8782, mais o arquivo vazio e a pasta de gerador com histórico
- [menor] Tarefa 4.2 aberta — fechada nesta change, depois das correções

## 2026-10-23

- Intervalo: 208a92e..62b8782
- Revisor: subagente requesting-code-review (revisão de acompanhamento do commit de correções)
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 1 (corrigidos 1, justificados 0)
- Menores: 5
- Segurança: auditoria de dependências não aplicável; varredura de secrets não verificada (o `project.md` registra "Adiado"), diff conferido à mão sem secrets

Achados:

- [importante] A condição `managedSettings !== undefined` era sempre verdadeira, e um `.claude/settings.json` (ou um `.gitattributes` com o bloco) ignorado pelo projeto fazia o `git add` do commit inicial falhar — corrigido em 72b71cd: o `standardPaths` deixa de fora o caminho ignorado e não versionado, e o `settings.json` entra só quando é arquivo regular; caso de CI com o `settings.json` ignorado numa pasta de gerador
- [menor] Um arquivo do padrão versionado e com edições não commitadas do projeto (`.claude/settings.json`, `.gitignore`, `.gitattributes`, `CLAUDE.md`, `AGENTS.md`) vai inteiro para o commit inicial — justificado: defeito anterior a esta change, que vale para todos os arquivos do padrão e não só para os desta change; fica como candidato a uma change própria
- [menor] O caso do `.gitattributes` ignorado não exercitava o `--update` — corrigido em 72b71cd
- [menor] O caso da pasta de gerador não conferia o `.claude/settings.json` versionado — corrigido em 72b71cd
- [menor] O guia do padrão não citava o `.claude/settings.json` entre os arquivos a commitar sem o script — corrigido em 72b71cd
- [menor] O README não dizia o que acontece com o `.gitattributes` vazio ou com o bloco — corrigido em 72b71cd
