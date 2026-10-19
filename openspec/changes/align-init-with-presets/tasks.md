# Tasks

## 1. Entrevista do init

- [x] 1.1 Revisar as perguntas 3.1, 3.5, 5.3 e 6.4 em `padrao-openspec/.claude/commands/opsx/init.md` (D3). Verificar com `grep` das opções novas: "no próprio app Next.js", "Nenhum: acesso direto", "Nenhuma no MVP" e a nota da 5.3.
- [x] 1.2 Acrescentar o bloco 7, "Complemento da stack" (D2), entre o bloco 6 e a confirmação final. Verificar com `grep -n "Bloco 7"` e `grep -n "Adiado: decidir na primeira change que precisar"`.
- [x] 1.3 Acrescentar a seção "Respostas pré-preenchidas" (D1) e o argumento opcional no cabeçalho do comando. Verificar com `grep -n "Confirmação final: sim"`.
- [x] 1.4 Atualizar a regra de ADRs obrigatórias para respostas negativas (D5) e a seção do `config.yaml` gerado para a decisão de E2E (D4). Verificar com `grep -n "SHALL NOT usar contêiner"` e `grep -n "verificação em navegador versionada"`.

## 2. Presets

- [x] 2.1 Acrescentar o sufixo de precedência à linha de E2E de `padrao-openspec/presets/nextjs/config.yaml` e `presets/dotnet-nextjs/config.yaml` (D4). Verificar com o passo de CI "Configs base e presets carregam sem avisos" saindo com código 0.

## 3. Documentação, espelhamento e integração

- [x] 3.1 Documentar no `README.md` da raiz o `/opsx:init <arquivo-de-respostas>`. Verificar com o lint da raiz sem issues.
- [x] 3.2 Rodar `node padrao-openspec/scripts/sync-root.mjs` e verificar que `--check` sai com código 0.
- [x] 3.3 Rodar `openspec validate --all --strict` e o lint nos dois lugares. Verificar que todos saem com código 0.
