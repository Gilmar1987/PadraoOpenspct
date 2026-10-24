# Tasks

## 1. Proteção na CI

- [x] 1.1 Acrescentar ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml` os marcadores do D6. Verificar rodando esse passo localmente: ele deve falhar só nos marcadores novos.
  - Evidência: quatro marcadores do D6 no passo "Trechos customizados das skills"; `run-ci-steps.py validate.yml store . "Trechos customizados"` → FAIL (exit 1) só nos quatro marcadores novos; branch em dia com `origin/main` a508919

## 2. Init

- [x] 2.1 Aplicar o D1 e o D2 na tabela "Checagem de coerência" de `padrao-openspec/.claude/commands/opsx/init.md`. Verificar com `grep -n` das quatro linhas novas e das duas reescritas.
  - Evidência: linhas novas na tabela de coerência (banco local × serverless, `.env` × criptografia, cobertura × comando, contrato × teste de contrato) nas linhas 853-856; linhas reescritas do "sem produção" (848) e do Redis (852); `grep -n` → presentes
- [x] 2.2 Aplicar o D3 (6.4) e o D4 (7.1). Verificar com `grep -n "A opção 0 exclui as demais: uma resposta com o 0\|--omit=dev"`.
  - Evidência: regra do 0 exclusivo depois das opções da 6.4 (linha 750); sugestão de auditoria de produção com a completa nas Observações (linha 799); `grep -n` → linhas 750 e 799
- [x] 2.3 Aplicar o D5: seção "Ferramentas da máquina" depois de "Commit the init". Verificar com `grep -n "## Ferramentas da máquina"` e com o lint de uma cópia do arquivo, sem achados novos em relação à `main`.
  - Evidência: seção "## Ferramentas da máquina" depois de "Commit the init" (linha 1166), com identificação da ferramenta, `--version` sem rodar o comando, tabela das ausentes e aviso do Windows; `markdownlint-cli2@0.23.2` numa cópia → 52 achados, os mesmos 52 da `main` (arquivo na lista de exclusão do lint)

## 3. Documentação e suíte

- [x] 3.1 Acrescentar o aviso do Windows ao `COMECE-AQUI.md`, a linha do README e o item da 1.15.0 do CHANGELOG. Verificar com os passos "Versão e changelog", "Lint de Markdown da raiz" e "Guia de primeiros passos" passando.
  - Evidência: linha do `winget` na tabela "Problemas comuns" do COMECE-AQUI; linha na tabela de trechos customizados do README; item "Coerência e ferramentas no init" na 1.15.0 do CHANGELOG; `sync-root.mjs` → 1 caminho; "Trechos customizados", "Versão e changelog", "Lint de Markdown", "Raiz em dia", "Lint de Markdown da raiz" e "Guia de primeiros passos" → PASS (exit 0)
- [ ] 3.2 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` e todos os passos dos jobs `store` e `root` localmente, depois de avisar a outra sessão. Verificar que todos saem com código 0.

## 4. Verificação de comportamento

- [x] 4.1 Roteiro numa cópia temporária do store, fora do repositório: um subagente segue o `init.md` com um arquivo de respostas montado para disparar as quatro combinações novas e com a 6.4 = `0,1`. A transcrição registra:
  - (a) as quatro combinações apontadas na checagem final;
  - (b) a 6.4 recusada com a explicação;
  - (c) a auditoria registrada com `--omit=dev` e a completa nas Observações;
  - (d) a seção "Ferramentas da máquina" listando uma ferramenta ausente de propósito (por exemplo, `gitleaks-inexistente`) com a sugestão de instalação.

  Verificar que os quatro itens se comportam como os cenários da spec.
  - Evidência: roteiro numa cópia temporária do store (scratchpad), com um subagente seguindo o `init.md` e um arquivo de respostas (Python, SQLite local, Vercel, `.env`, criptografia de campos, cobertura de 80% com `pytest`, contrato OpenAPI sem teste de contrato, 6.4 = `0,1`, varredura `gitleaks-inexistente`); nada gravado. (a) as quatro combinações novas apontadas na checagem, com consequência e proposta; (b) a 6.4 `0,1` recusada com a explicação e perguntada no chat; (c) auditoria registrada como `pip-audit -r requirements.txt`, com a completa em Observações; (d) "Ferramentas da máquina" rodou `--version` de verdade e listou pytest, ruff, mypy, pip-audit e gitleaks-inexistente como ausentes, com sugestões (`pipx`, `winget`) e o aviso do Windows. Ambiguidades corrigidas no texto: a recusa da 6.4 vale com arquivo de respostas; a conferência vale também quando não houve commit; as linhas acrescentadas pelo init (como "Validação de interface") entram na conferência. As ambiguidades anteriores a esta change (combinações além da tabela, "aceitar a sugestão" no arquivo) ficaram fora do escopo

## Workflow follow-up

- `/opsx:verify` e `/opsx:archive` depois do apply; push, PR e merge só quando o responsável pedir.
