# Verificações — guia-de-entrada-do-dev

## 2026-10-21

- Críticos: 0
- Warnings: 1
- Sugestões: 3
- Não verificado: cenários "Dev baixa o script" e "Script anexado à release" (a release v1.3.0 com o anexo ainda não foi publicada); execução num console interativo real do Windows (só houve TTY simulado); comandos de verificação do projeto (o `openspec/project.md` deste repositório não tem a seção "Comandos de verificação"; a CI do `validate.yml` foi usada no lugar)
- Cobertura fora da suíte: conversas dos dois modos com TTY simulado, incluindo pasta relativa, "Criar?" e confirmação (scratchpad `tty.mjs`, rodado pelo agente); Git ausente do `PATH`, sem pastas criadas (rodado pelo agente); id inválido repetindo a pergunta com TTY (TTY simulado, rodado pelo agente); pasta com espaço dentro de `OneDrive` com aviso (rodado pelo agente); dev recusa o resumo e nada é criado (TTY simulado, rodado pelo agente); Node antigo com `process.versions.node` simulado em 16.20.2 (rodado pelo agente)
- Avaliação: Nenhum crítico nas checagens que rodaram. Não verificados: os cenários de download e anexo da release (dependem da publicação da v1.3.0), o console interativo real e os comandos de verificação do projeto (não registrados). 1 warning e 3 sugestões.

Itens:

- [warning] Cenário "CLI ausente" (instalação do OpenSpec CLI pelo script) não foi exercitado: o CLI estava instalado em todas as execuções (`padrao-openspec/scripts/comecar.mjs:163`)
- [sugestão] Conferir antes do clone do store se a pasta de `--codigo` tem `openspec/specs` ou `openspec/changes`, que o setup recusa (adiado na revisão)
- [sugestão] Modo "código já clonado" para quem lê o `docs/openspec-padrao.md` no clone do código (adiado na revisão; change própria)
- [sugestão] O smoke test "declaração do store", que é anterior a esta change, deixa o id `ci-store` registrado; desregistrar no fim do passo

Comandos:

- `openspec instructions apply --change guia-de-entrada-do-dev --json` → `all_done`, 9/9 tarefas (exit 0)
- `python runstep.py . store` (todos os passos do job `store` no Git Bash, depois de 8b16e98) → 15 `[PASS]`, incluindo validate `--strict`, lint e "Smoke test do script de entrada" (exit 0)
- `python runstep.py . root` (todos os passos do job `root`) → 4 `[PASS]`, incluindo validate da raiz, lint da raiz e "Guia de primeiros passos" (exit 0)
- `node padrao-openspec/scripts/sync-root.mjs --check` → "Root is in sync with padrao-openspec/." (exit 0)
- `node --input-type=module -e "...process.versions.node='16.20.2'...; import comecar.mjs"` → "Erro: Node.js 16.20.2 é antigo. Atualize para 18 ..." (exit 1; reaproveitado do apply, sem mudança de código depois)
- `review.md` → 19fa0d7..ffaa8d2, subagente requesting-code-review; correções em 8b16e98, sem commits de código depois
- `git log ffaa8d2..HEAD` → só 8b16e98 (correções da revisão) e ba21e2f (review.md)
- `openspec store list --json` → só `biblioteca` e `tarefas` registrados depois das execuções (exit 0)

## 2026-10-21 (depois da publicação da v1.3.0)

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: execução num console interativo real (feita depois, no teste do Lava Jato, que achou os defeitos corrigidos na `corrige-caminho-e-prompt-no-windows`); comandos de verificação do projeto (registrados depois, na `comandos-de-verificacao-do-padrao`)
- Cobertura fora da suíte: "Dev baixa o script" e "Script anexado à release" (download real pelo agente, logo depois da publicação)
- Avaliação: Os cenários de download e anexo, que estavam não verificados, passaram com a release `v1.3.0` publicada.

Itens: nenhum

Comandos:

- `gh release view v1.3.0 --json tagName,isDraft,isPrerelease,assets` → `v1.3.0`, não é rascunho nem pre-release, anexo `comecar.mjs` (exit 0)
- `gh api repos/Gilmar1987/PadraoOpenspct/releases/latest -q .tag_name` → `v1.3.0` (exit 0)
- `curl.exe -sSLO https://github.com/Gilmar1987/PadraoOpenspct/releases/latest/download/comecar.mjs` → baixado (exit 0)
- `sha256sum` do arquivo baixado e de `padrao-openspec/scripts/comecar.mjs` → iguais, `d6287dcb…cf034` (exit 0)
- `node comecar.mjs --help` no arquivo baixado → mostra o uso (exit 0)
