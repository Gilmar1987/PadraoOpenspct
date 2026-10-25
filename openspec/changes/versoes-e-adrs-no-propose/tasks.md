# Tasks

## 1. Proteção na CI

- [x] 1.1 Acrescentar ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml` os marcadores do D3 para o comando e a skill do propose. Verificar rodando esse passo localmente: ele deve falhar só nos marcadores novos.
  - Evidência: laço com o comando e a skill do propose e os dois marcadores do D3 no passo "Trechos customizados das skills"; `run-ci-steps.py validate.yml store . "Trechos customizados"` → FAIL (exit 1) só nos 4 erros novos (2 marcadores × 2 arquivos); branch em dia com `origin/main` 3917464

## 2. Propose

- [x] 2.1 Aplicar o D1 e o D2 em `padrao-openspec/.claude/commands/opsx/propose.md` e `padrao-openspec/.claude/skills/openspec-propose/SKILL.md`, com o mesmo texto nos dois. Verificar com o passo "Trechos customizados das skills" passando e com `diff` das linhas novas entre comando e skill.
  - Evidência: "Consulted dependency versions" depois de "Interface contract first" e o passo 8 com "the ADRs this workflow created" (cada ADR pelo próprio caminho) no comando e na skill; `diff` das linhas novas → iguais; `sync-root.mjs` → 2 caminhos; "Trechos customizados" e "Lint de Markdown" → PASS (exit 0)

## 3. Documentação e suíte

- [x] 3.1 Acrescentar a linha do README e o item da 1.15.0 do CHANGELOG. Verificar com os passos "Versão e changelog" e "Lint de Markdown da raiz" passando.
  - Evidência: linha "Consulted dependency versions" e "the ADRs this workflow created" na tabela de trechos customizados do README; item "Versões e ADRs no propose" na 1.15.0 do CHANGELOG; "Versão e changelog" e "Lint de Markdown da raiz" → PASS (exit 0)
- [ ] 3.2 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` e todos os passos dos jobs `store` e `root` localmente, com tempo limite por passo, depois de avisar a outra sessão. Verificar que todos saem com código 0.

## 4. Verificação de comportamento

- [ ] 4.1 Roteiro numa cópia temporária do store, fora do repositório: um subagente segue o propose de uma change que acrescenta o Prisma e cria uma ADR. A transcrição registra:
  - (a) a consulta real ao registro (`npm view prisma dist-tags`), com a escolha da estável mais recente e, se a `latest` for pré-release, o motivo da recusa;
  - (b) a tabela "Dependency versions" no design;
  - (c) a tarefa que instala a versão exata;
  - (d) o commit do planejamento com a pasta da change e a ADR, e nada mais.

  Verificar que os quatro itens se comportam como os cenários da spec.

## Workflow follow-up

- `/opsx:verify` e `/opsx:archive` depois do apply; push, PR e merge só quando o responsável pedir.
