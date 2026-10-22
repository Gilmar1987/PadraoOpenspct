# Revisão de código — commits-e-atualizacao-local

## 2026-10-22

- Intervalo: ff963fd..8727f75 (correções em aaedd07)
- Revisor: subagente requesting-code-review
- Críticos: 0
- Importantes: 3 (corrigidos 3, justificados 0)
- Menores: 9 (corrigidos 8, aceito 1)
- Segurança: varredura de secrets adiada no `openspec/project.md` deste repositório; auditoria de dependências não aplicável. O achado importante 1 era de segurança (um `.env.local` entraria no commit) e foi corrigido.

Achados:

- [importante] Com `--codigo` apontando para um repositório com histórico ou trabalho não commitado, o `git add -A` levava ao commit "chore: instala o padrão" as edições e arquivos do dev, inclusive um `.env.local`. Corrigido em aaedd07: o estado da pasta é lido antes do setup; com trabalho, o commit usa pathspec só com os arquivos do manifesto (`managedFiles`, `managedBlocks`, `.openspec-padrao.json`, `.gitignore`, `openspec/config.yaml`), e o resumo mostra a linha "Commit inicial". Conferido: commit novo sem `app.txt` nem `.env.local`, que continuam " M" e "??".
- [importante] Depois da atualização oferecida, o agente continuaria o comando na branch `chore/padrao-vX`. Corrigido em aaedd07: o texto dos 8 arquivos manda voltar com `git switch -` antes de continuar e dizer que a branch da atualização espera revisão e merge; o guia do projeto diz o mesmo.
- [importante] Falha parcial (código commitado, store não) aparecia como falha total, com comandos já inválidos. Corrigido em aaedd07: cada repositório é commitado e registrado à parte, e a mensagem final só lista os comandos do que falta. A lógica foi conferida por leitura e pelo caso de falha dos dois; o caso de só um falhar não foi reproduzido no Windows (as variáveis de identidade valem para os dois repositórios).
- [menor] O erro do `git` dizia "git -C falhou". Corrigido em aaedd07 (nome do subcomando).
- [menor] Ctrl+Z/Ctrl+D na pergunta do commit encerrava o script como falha. Corrigido em aaedd07: vale como "não".
- [menor] `--sem-commit` era ignorado em silêncio no modo existente. Corrigido em aaedd07 (aviso).
- [menor] "Pasta temporária" ambígua na oferta de atualização. Corrigido em aaedd07: fora do repositório de código, apagada depois.
- [menor] O init refeito sem mudanças falharia no commit. Corrigido em aaedd07: confere `diff --cached --quiet -- openspec/` antes.
- [menor] A tabela de trechos customizados do README não listava os novos. Corrigido em aaedd07.
- [menor] A CI não testava o caminho sem identidade. Corrigido em aaedd07: caso com `GIT_CONFIG_GLOBAL=/dev/null` e identidade vazia (exit 0, aviso, sem commit).
- [menor] Ids de testes antigos registrados (`ci-entrada`, `ci-store`). Já removidos; os passos agora desregistram por `trap`.
- [menor] Aspas duplas nos comandos impressos não protegem `$` ou crase num shell. Aceito: o mesmo padrão do `openWorkspaceSteps` no Windows, e os caminhos vêm do próprio script.
