# Verificações — entrega-no-codigo

## 2026-10-23

- Críticos: 0
- Warnings: 1
- Sugestões: 1
- Não verificado: cenários "Banco no compose de desenvolvimento", "Pergunta com duas alternativas" e "Resposta ambígua" (comportamento do agente ao seguir a skill `docker` e o explore; os arquivos são prompts e não há execução automatizada); varredura de secrets (o `openspec/project.md` registra "Adiado")
- Camadas: — (sem matriz no project.md)
- Cobertura fora da suíte: —
- Avaliação: Nenhum crítico nas checagens que rodaram; 1 warning e 1 sugestão. Não verificado: o comportamento do agente na skill docker e no explore, e a varredura de secrets.

Itens:

- [warning] Design decision not followed: o D1 diz que o `.claude/settings.json` entra no commit inicial "quando o manifesto registra entradas do padrão (`managedSettings` não vazio)", mas o código (`padrao-openspec/scripts/comecar.mjs:265-268`) o inclui quando é arquivo regular e não está ignorado pelo projeto, como a segunda revisão pediu, porque `managedSettings` nunca é vazio de forma confiável; atualizar o D1 com `/opsx:update`
- [sugestão] O caso de CI da pasta de gerador (`.github/workflows/validate.yml:954`) não cita o requisito "Commit inicial em pasta de código com histórico" nem o cenário "Pasta de gerador com um commit"; citar os dois no comentário

Comandos:

- `openspec instructions apply --change entrega-no-codigo --json` → `all_done`, 8/8 (exit 0)
- `review.md` → 136898a..47baecf (subagente requesting-code-review) e 208a92e..62b8782 (acompanhamento); correções em 62b8782 e 72b71cd, sem commit de código depois delas
- `node padrao-openspec/scripts/sync-root.mjs --check` → em dia (exit 0)
- `openspec validate --all --strict` → 23 passed (exit 0); `openspec validate entrega-no-codigo --strict` → válida (exit 0)
- Suíte local completa dos jobs `store` e `root`, depois do rebase → 30 `[PASS]` (exit 0; reused from apply, tarefa 4.2); os passos que dependem dos arquivos mudados em 72b71cd ("Smoke test do instalador", "Smoke test do script de entrada", setups, "Sintaxe dos scripts", "Trechos customizados", lint nos dois lugares, "Raiz em dia" e "Guia") rodaram de novo depois dele → PASS (exit 0; reused from apply)
- Requisitos × implementação:
  - Quebra de linha no repositório de código → `ensureConsumerGitattributes` e `hasManagedGitattributes` (`install-skills.mjs:505`, `:557`, chamada em `:1019`, pathspec do `--update` em `:1104`); cenários "Repositório sem o arquivo", "Arquivo do projeto preservado" e "Segunda instalação" no "Smoke test do instalador" (`validate.yml:520`, com a citação), mais bloco desatualizado com CRLF, marcadores desbalanceados, arquivo vazio e arquivo ignorado com `--update`;
  - Portas de desenvolvimento só no host local → skill `docker` (5 linhas com `127.0.0.1`) e guia (4); marcadores na CI (`validate.yml:288`);
  - Alternativas numeradas no explore → "Number the alternatives" no `explore.md:56` e na skill; marcador na CI (`validate.yml:285`);
  - Commit inicial em pasta de código com histórico → `standardPaths` e `ignoredByProject` (`comecar.mjs:255-276`); cenário no "Smoke test do script de entrada" (`validate.yml:954`), mais o caso do `.claude/settings.json` ignorado (`:967`)
- Dependências no Impact → nenhuma nova
- Lacunas declaradas, contratos de interface e ADRs com `verificacao` → não se aplicam (sem `openspec/lacunas.md`, sem contrato registrado, nenhuma ADR com `verificacao` tocada)
