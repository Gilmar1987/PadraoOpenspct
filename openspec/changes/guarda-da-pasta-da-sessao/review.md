# Revisão de código — guarda-da-pasta-da-sessao

## 2026-10-30

- Intervalo: d0045d7..a0916b3
- Revisor: subagente requesting-code-review (general-purpose, só leitura)
- Críticos: 0
- Importantes: 5 (corrigidos 3, pendentes 2 de `/opsx:update`)
- Menores: 6 (corrigidos 3, para o `/opsx:update` 2, adiado 1)
- Segurança: varredura de secrets "Adiado" no `project.md` (não verificado); auditoria de dependências "Não aplicável" (sem dependências novas)

Achados:

- [importante] I1: a guarda comparava caminhos ("pasta onde a sessão foi aberta" × "primary working directory"), o que dava falso alarme numa sessão certa (worktree do Claude Code, maiúsculas e barras no Windows, comando expandido sem caminho de arquivo) — corrigido em 1600a30: a guarda decide pela origem do texto (lido à mão porque o comando ou a skill não carregou × expandido pelo Claude Code) e não dispara num subagente nem na edição do arquivo. O texto-base do D1 no design fica para o `/opsx:update`
- [importante] I2: a regra trata todo `/opsx:*` em texto puro como pasta errada, mas o Claude Code só expande o comando no início da mensagem; um comando na linha de baixo da aprovação chega como texto na pasta certa — pendente: muda o texto do requisito "Etapa pedida pelo nome fora do Claude Code" (`change-approval`), vai para o `/opsx:update`
- [importante] I3: a conferência das proteções para os subagentes do apply e do verify, que não recebem o contexto do hook de início — pendente: muda o requisito "Proteções conferidas antes do apply, do verify e do archive" (`agent-guardrails`), vai para o `/opsx:update`
- [importante] I4: um Ctrl+C ou fim da entrada na pergunta final virava erro e mandava apagar as pastas de um setup bem-sucedido — corrigido em 1600a30: a pergunta fica num `try/catch` e o erro conta como "não"
- [importante] I5: a conferência do `--yes` no smoke test não podia falhar (sem TTY, o script sai antes da pergunta) — corrigido em 1600a30: um `code` falso no `PATH` grava os argumentos, e o passo confere que ele só recebeu `--version`; vista falhando com a violação injetada (o script ignorando `--yes` e `rl`: o `code` recebeu a pasta e o passo saiu com 1) e passando limpa (exit 0)
- [menor] M1: a CI não protegia o parêntese novo do "Approval and command" — corrigido em 1600a30 (`check` do texto novo e marcador negativo do antigo nos 10 arquivos)
- [menor] M2: "agente sem suporte a comandos" é impreciso, porque Copilot, Cursor, Codex e Gemini têm comandos próprios — vai para o `/opsx:update`, junto do I2 (a frase está nos requisitos)
- [menor] M3: se o hook falhar (o `estado --json` estoura os 20 s), a conferência culpa os hooks e manda reabrir a sessão à toa — vai para o `/opsx:update`, junto do I3
- [menor] M4: a guarda em inglês nos três comandos em português (`discover`, `init`, `ingest`) — adiado: funciona, e um texto único facilita a conferência da CI
- [menor] M5: o aviso de falha ao abrir o VS Code descartava o erro — corrigido em 1600a30 (primeira linha do erro no aviso)
- [menor] M6: editar os arquivos de comando no repositório do padrão disparava a guarda — corrigido em 1600a30 ("reading or editing this file as a file" não dispara)
