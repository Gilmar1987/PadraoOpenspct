# Verificações — atualiza-cli-openspec-1-15

## 2026-11-04

- Críticos: 0
- Warnings: 1
- Sugestões: 0
- Não verificado: Smoke test da validação de interface (só roda no Linux; esta máquina é Windows; o passo não foi tocado pela change e roda na CI do PR); varredura de secrets (adiada no `project.md`, "Varredura de secrets")
- Camadas: — (sem matriz no project.md)
- Cobertura fora da suíte: teste do `comecar.mjs` num PowerShell real com o CLI 1.14.2, linha `OpenSpec CLI . 1.14.2    ok (o padrão usa 1.15.0)` (tarefa 4.2; Gilmar Campelo); "CLI ausente" (requisito "Conferência do ambiente pelo script"), oferta recusada e instalação aceita num prefixo npm temporário, com `OpenSpec CLI . 1.15.0    ok` e o script seguindo para as perguntas (neste verify; agente); "Skill gerada por outra versão", "Passo de instalação esquecido" e "Documento com o comando antigo" (requisito "Versão do OpenSpec CLI coerente"), passo rodado com a violação injetada e limpo (evidência da 1.2 e do `review.md`; agente)
- Avaliação: No critical issues found in the checks that ran. Smoke test da validação de interface e varredura de secrets not verified: só Linux; adiada no project.md. 1 warning.

Itens:

- [warning] O proposal ("What Changes") e o design (Context, item 1.14.3) dizem que o update recebeu a checagem do caminho por glob, mas no upstream o `update` só mudou o `generatedBy` (`diff` da saída pura do 1.14.2 e do 1.15.0); o `CHANGELOG.md` já foi corrigido em fc0ea58 — ajustar o texto pelo `/opsx:update`, ou aceitar e seguir

Comandos:

- `openspec instructions apply --change atualiza-cli-openspec-1-15 --json` → `all_done`, 9/9 tarefas (exit 0)
- `openspec validate atualiza-cli-openspec-1-15 --strict` → valid (exit 0)
- `review.md` → 4e02504..a5650c8, subagente requesting-code-review; 0 críticos, 0 importantes, 5 menores (4 corrigidos em fc0ea58, 1 sem ação); depois do intervalo, só fc0ea58 (correção listada) e commits de documentação da change
- suíte local completa dos jobs `store` e `root` no HEAD 883977b, com o CLI 1.15.0 de uma pasta temporária à frente no `PATH`, cada passo de arquivo e 15 min de limite → 30 PASS, 2 SKIP, 0 falhas (exit 0); rodada de novo porque fc0ea58 mudou o `validate.yml` depois da suíte da 4.1; nenhum `ci-*` no registro depois
- `PATH` sem o CLI, `printf 'n\n' | node padrao-openspec/scripts/comecar.mjs` → "OpenSpec CLI . — não encontrado" e a oferta "Instalar o OpenSpec CLI 1.15.0 agora (npm install -g @fission-ai/openspec@1.15.0)?", sem criar nada na pasta (exit 1)
- `PATH` sem o CLI, `npm_config_prefix` numa pasta temporária, `node padrao-openspec/scripts/comecar.mjs --yes` → instalou o 1.15.0 no prefixo temporário, mostrou `OpenSpec CLI . 1.15.0    ok` e seguiu até "Falta --modo" (a primeira pergunta do projeto) (exit 1, esperado); CLI global conferido em 1.14.2 depois
- `diff` de `openspec-update-change/SKILL.md` e `commands/opsx/update.md` entre a saída pura do 1.14.2 e a do 1.15.0 → só a linha `generatedBy`; `update.md` igual
- `grep -rn "1\.14\.2"` fora do `CHANGELOG.md`, do arquivo e da change → só `openspec/specs/continuous-validation/spec.md:117` e `openspec/specs/project-onboarding/spec.md:81,86`, que o archive atualiza pelos deltas
- ADR-0004 e ADR-0009 → `norma` (sem `verificacao` a rodar); sem `openspec/lacunas.md` e sem `openspec/estado-atual.md`
