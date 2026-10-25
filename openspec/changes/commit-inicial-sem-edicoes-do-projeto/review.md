# Revisão de código — commit-inicial-sem-edicoes-do-projeto

## 2026-10-25

- Intervalo: aa48fd0..527fddc
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 2 (corrigidos 2, justificados 0)
- Menores: 4
- Segurança: auditoria de dependências não aplicável (sem dependências novas); varredura de secrets não verificada (o `project.md` registra "Adiado"), diff conferido à mão sem secrets

Achados:

- [importante] O `git status --untracked-files=all` estourava o buffer padrão de 1 MiB numa pasta com muitos arquivos não versionados (por exemplo, um `node_modules` fora do `.gitignore`); o caso caía em "não sei", todo arquivo do padrão ficava de fora, e o aviso dizia que eles tinham edições do dev — corrigido em b2b3c2a: `--untracked-files=normal` (uma pasta não versionada vem como `dir/` e casa com os arquivos do padrão dentro dela), buffer grande e erro do `spawnSync` tratado; conferido à mão com 15 mil arquivos não versionados: commit inicial feito, `AGENTS.md` dentro, nenhum aviso falso
- [importante] A lista do que ficou de fora só aparecia quando o commit do código acontecia, e o aviso do commit pulado dava o motivo errado quando o `git status` falhava — corrigido em b2b3c2a: a lista sai sempre que algo ficou de fora (com `--sem-commit`, com "não" na pergunta, com o commit falhando ou pulado), com o motivo certo, e diz quando os comandos do commit inicial não incluem esses arquivos; conferido à mão com `--sem-commit`
- [menor] A linha do plano citava qualquer arquivo sujo do projeto como se fosse do padrão — corrigido em b2b3c2a: cita só os caminhos conhecidos do padrão já editados, ou a falha do `git status`
- [menor] No commit pulado, o comando manual usava a mensagem "instala o padrão" sobre arquivos com edições do dev — corrigido em b2b3c2a: usa a mensagem de revisão
- [menor] Caminhos sem aspas nos comandos mostrados — corrigido em b2b3c2a; o cenário da CI passou a procurar `add -- "CLAUDE.md"`
- [menor] No Windows com `core.ignorecase`, `claude.md` versionado e `CLAUDE.md` do padrão não casavam — corrigido em b2b3c2a: comparação sem caixa quando o repositório ignora a caixa
