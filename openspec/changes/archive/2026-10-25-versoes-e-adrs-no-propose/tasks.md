# Tasks

## 1. Proteção na CI

- [x] 1.1 Acrescentar ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml` os marcadores do D3 para o comando e a skill do propose. Verificar rodando esse passo localmente: ele deve falhar só nos marcadores novos.
  - Evidência: laço com o comando e a skill do propose e os dois marcadores do D3 no passo "Trechos customizados das skills"; `run-ci-steps.py validate.yml store . "Trechos customizados"` → FAIL (exit 1) só nos 4 erros novos (2 marcadores × 2 arquivos); branch em dia com `origin/main` 3917464

## 2. Propose

- [x] 2.1 Aplicar o D1 e o D2 em `padrao-openspec/.claude/commands/opsx/propose.md` e `padrao-openspec/.claude/skills/openspec-propose/SKILL.md`, com o mesmo texto nos dois. Verificar com o passo "Trechos customizados das skills" passando e com `diff` das linhas novas entre comando e skill.
  - Evidência: "Consulted dependency versions" depois de "Interface contract first" e o passo 8 com "the ADRs this workflow created" (cada ADR pelo próprio caminho) no comando e na skill; `diff` das linhas novas → iguais; `sync-root.mjs` → 2 caminhos; "Trechos customizados" e "Lint de Markdown" → PASS (exit 0)

## 3. Documentação e suíte

- [x] 3.1 Acrescentar a linha do README e o item desta change na seção 1.16.0 do CHANGELOG, aberta por esta change, com `padrao-openspec/VERSION` em 1.16.0. Verificar com os passos "Versão e changelog" e "Lint de Markdown da raiz" passando.
  - Evidência: linha "Consulted dependency versions" e "the ADRs this workflow created" na tabela de trechos customizados do README; item "Versões e ADRs no propose" movido da 1.15.0 (publicada sem ele em 4710c02) para a seção nova `## 1.16.0 — 2026-10-25`, com "Ações no projeto: Nenhuma"; `padrao-openspec/VERSION` → 1.16.0; "Versão e changelog", "Smoke test do changelog-range", "Lint de Markdown" e "Lint de Markdown da raiz" → PASS (exit 0)
- [x] 3.2 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` e todos os passos dos jobs `store` e `root` localmente, com tempo limite por passo, depois de avisar a outra sessão. Verificar que todos saem com código 0.
  - Evidência: outra sessão avisada; `sync-root.mjs --check` → em dia; `openspec validate --all --strict` → 23 passed (exit 0); `run-ci-steps-t.py` (tempo limite de 15 min) do job `store` → 14 PASS e 2 TIMEOUT ("camada do Claude Code no instalador" e "drive minúsculo", travamento intermitente da máquina); suíte interrompida com a concordância do responsável e cada passo restante rodado sozinho → os 2 que travaram e os 6 que faltavam (validação de interface, portão, blocos de agentes, métricas de fluxo, consumo de IA; "Cache do navegador" não tem `run:`) PASS, e o job `root` inteiro PASS (exit 0); o store de teste `ci-portao` deixado pela interrupção foi removido; 0 `ci-*` ao final; depois do rebase sobre 60cddba (#50), "Trechos customizados" (com os marcadores negativos do #50), "Lint de Markdown", "Versão e changelog", "Validar specs", "Paridade de papéis", hooks, blocos de agentes e o job `root` inteiro → PASS (exit 0)

## 4. Verificação de comportamento

- [x] 4.1 Roteiro numa cópia temporária do store, fora do repositório: um subagente segue o propose de uma change que acrescenta o Prisma e cria uma ADR. A transcrição registra:
  - (a) a consulta real ao registro (`npm view prisma dist-tags`), com a escolha da estável mais recente e, se a `latest` for pré-release, o motivo da recusa;
  - (b) a tabela "Dependency versions" no design;
  - (c) a tarefa que instala a versão exata;
  - (d) o commit do planejamento com a pasta da change e a ADR, e nada mais.

  Verificar que os quatro itens se comportam como os cenários da spec.
  - Evidência: roteiro num repositório git temporário (scratchpad), com um subagente executando o propose de verdade para "acrescentar o Prisma com PostgreSQL e uma ADR". (a) `npm view prisma dist-tags engines peerDependencies` → `latest` = `8.0.0-rc.27` (pré-release), recusada com o motivo; estável mais recente `7.10.1` achada em `npm view prisma versions`; (b) tabela "Dependency versions" no design com `prisma`, `@prisma/client`, `@prisma/adapter-pg` 7.10.1 e `typescript` 7.0.2, fonte, data e engines; (c) tarefa 1.1 com `npm install --save-exact ... prisma@7.10.1 ...`; (d) `git show --stat HEAD` → só a pasta da change e `openspec/adrs/0001-prisma-orm-postgresql.md`, `git status` limpo. Ajuste da ambiguidade apontada: a regra cobre as dependências exigidas como par e diz como achar a estável (lista completa de versões), no comando e na skill

## Workflow follow-up

- `/opsx:verify` e `/opsx:archive` depois do apply; push, PR e merge só quando o responsável pedir.
