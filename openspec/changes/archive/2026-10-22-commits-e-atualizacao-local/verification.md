# Verificações — commits-e-atualizacao-local

## 2026-10-22

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: comportamento do agente com a oferta de atualização num projeto sem remoto (o texto é um prompt; não há execução automatizada); falha de commit em só um dos dois repositórios no Windows; teste do responsável num console real (condição da release, conforme o `openspec/project.md`)
- Cobertura fora da suíte: commit inicial com `--codigo` numa pasta com histórico, edição pendente e `.env.local` (pasta temporária, pelo agente); falha de commit sem identidade nos dois repositórios (pasta temporária, pelo agente)
- Avaliação: Nenhum crítico nas checagens que rodaram. Não verificados: a oferta de atualização numa sessão real, a falha parcial no Windows e o teste do responsável no console, que segura a release.

Itens: nenhum

Comandos:

- `openspec instructions apply --change commits-e-atualizacao-local --json` → `all_done`, 6/6 depois da 4.2, fechada pela CI do PR #25 nos três jobs
- Passos do `validate.yml` no Git Bash → 17 `[PASS]` no `store` e 4 no `root` antes das correções; depois delas, `[PASS]` em "Sintaxe dos scripts", "Trechos customizados das skills", "Smoke test do script de entrada" (com o caso sem identidade), "Smoke test do drive minúsculo", "Lint de Markdown" e nos 4 do `root` (exit 0)
- `sync-root.mjs` → "Synced 9 paths."; `--check` → em dia
- `comecar.mjs --codigo app` (pasta com histórico, edição e `.env.local`) → "✔ Commit inicial do código (só os arquivos do padrão)", commit sem `app.txt` nem `.env.local`, que continuam " M" e "??" (exit 0)
- `review.md` → ff963fd..8727f75, subagente requesting-code-review; correções no commit seguinte

## 2026-10-22 (depois da publicação da v1.6.0)

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: oferta de atualização numa sessão real de agente; falha de commit em só um dos dois repositórios no Windows
- Cobertura fora da suíte: "Projeto novo com commit" no console real (teste do responsável no PowerShell, `c:\TesteOpenSpct3`, com a tag local de teste `v9.9.9`); download da release (agente, logo depois da publicação)
- Avaliação: A condição da release foi cumprida: no console real, a pergunta do commit apareceu, os dois commits foram feitos e a mensagem final disse que os repositórios já têm o commit inicial. A `v1.6.0` foi publicada com o anexo.

Itens: nenhum

Comandos:

- `node C:\ProjetoOpenspct\padrao-openspec\scripts\comecar.mjs --origem C:\ProjetoOpenspct --tag v9.9.9` (responsável, PowerShell) → "Fazer o commit inicial do código e do store? [S/n]: s", "✔ Commit inicial do código", "✔ Commit inicial do store" (exit 0)
- `git --no-pager log --oneline` no código e no store (agente) → "chore: instala o padrão OpenSpec v1.6.0" e "chore: configura o store do projeto teste-commit"; o único arquivo pendente no código foi criado pelo paginador do `git log` (tecla `s` do `less`), sem relação com o script
- `gh release view v1.6.0` → não é rascunho nem pre-release, anexo `comecar.mjs`; `releases/latest` → `v1.6.0`
- `curl.exe -sSLO .../releases/latest/download/comecar.mjs` e `sha256sum` → igual ao do repositório, `b4517934…74e5b2` (exit 0)
