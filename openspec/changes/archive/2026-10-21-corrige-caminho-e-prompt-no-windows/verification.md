# Verificações — corrige-caminho-e-prompt-no-windows

## 2026-10-21

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: "Perguntas visíveis no console" (o redesenho só acontece num console interativo real; é a condição da aprovação, a cargo do responsável antes da release); comandos de verificação do projeto (o `openspec/project.md` não tem a seção "Comandos de verificação"; usada a CI do `validate.yml`)
- Cobertura fora da suíte: "Pasta base digitada em minúscula" e "Drive em minúscula no Windows" (`drivetest.sh` no scratchpad, Git Bash no Windows, rodado pelo agente; a CI roda em Ubuntu, onde não há letra de drive); linha `code "<pasta>"` com o VS Code instalado (mesma execução)
- Avaliação: Nenhum crítico nas checagens que rodaram. Não verificados: perguntas visíveis no console real (teste do responsável) e comandos de verificação do projeto (não registrados).

Itens: nenhum

Comandos:

- `openspec instructions apply --change corrige-caminho-e-prompt-no-windows --json` → `all_done`, 5/5 (exit 0)
- `python runstep.py . store` e `python runstep.py . root` → 19 `[PASS]` (exit 0; reaproveitado da 3.2; depois dele só mudou o `comecar.mjs` em 8a40403, coberto pelos passos abaixo)
- `python runstep.py . store "Sintaxe" "script de entrada" "Lint de Markdown"` depois de 8a40403 → 3 `[PASS]` (exit 0)
- `bash drivetest.sh` com `--pasta "c:\..."` depois de 8a40403 → `novo exit=0`, `existente exit=0`; antes da correção, exit 1 nos dois com "not this store"
- `node padrao-openspec/scripts/sync-root.mjs --check` → "Root is in sync with padrao-openspec/." (exit 0)
- `review.md` → 3db93f5..fcd3c03, subagente requesting-code-review; ajustes em 8a40403, sem commits de código depois

## 2026-10-21 (depois da publicação da v1.3.1)

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: —
- Cobertura fora da suíte: "Dev digita a pasta base" e "Pasta base digitada em minúscula" (teste do responsável num PowerShell real, com `c:\TesteOpenSpct2` e a tag local de teste `v9.9.9`); download da release (agente, logo depois da publicação)
- Avaliação: A condição da aprovação foi cumprida: no console real, a pergunta da pasta apareceu, o setup terminou sem o falso erro com o drive em minúscula e a mensagem final mandou abrir a pasta como workspace. A release `v1.3.1` foi publicada com o anexo.

Itens: nenhum

Comandos:

- `node C:\ProjetoOpenspct\padrao-openspec\scripts\comecar.mjs --origem C:\ProjetoOpenspct --tag v9.9.9` (responsável, PowerShell, pasta `c:\TesteOpenSpct2`) → "Pasta onde os repositórios vão ficar [c:\TesteOpenSpct2]:" visível, "✔ Setup concluído", mensagem com `code "c:\TesteOpenSpct2\estoque"` (exit 0)
- `gh release view v1.3.1 --json tagName,isDraft,isPrerelease,assets` → `v1.3.1`, não é rascunho nem pre-release, anexo `comecar.mjs` (exit 0)
- `gh api repos/Gilmar1987/PadraoOpenspct/releases/latest -q .tag_name` → `v1.3.1` (exit 0)
- `curl.exe -sSLO https://github.com/Gilmar1987/PadraoOpenspct/releases/latest/download/comecar.mjs` e `sha256sum` → igual ao do repositório, `4926c37e…10b44`; o arquivo traz a mensagem "pasta do workspace" (exit 0)
