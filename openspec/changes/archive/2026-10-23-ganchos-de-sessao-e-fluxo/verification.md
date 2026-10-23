# Verificações — ganchos-de-sessao-e-fluxo

## 2026-10-23

- Críticos: 0
- Warnings: 0
- Sugestões: 0
- Não verificado: os hooks com o Claude Code em `bypassPermissions` ou em subagentes de segundo plano (dependem do runtime; o roteiro foi feito em sessão interativa); o `exige-change` quando o OpenSpec CLI demora mais de 20 s (falha aberta, como decidido no D4)
- Cobertura fora da suíte: teste do responsável no Claude Code real em `C:\TesteOpenSpct\teste-ganchos` (tarefa 2.3), com o estado no início da sessão, a proteção do commit e a confirmação de escrita fora do fluxo
- Avaliação: Nenhum crítico. Não verificados: a camada com permissões ampliadas ou em segundo plano e o CLI lento.

Itens: nenhum

Comandos:

- `openspec instructions apply --change ganchos-de-sessao-e-fluxo --json` → 6/6 (`progress` do CLI, exit 0)
- Suíte local (Git Bash, Windows) → 28 passos PASS; 0 ids `ci-*`
- PR #40, run 39973456189 → store (ubuntu-latest), store (windows-latest) e root = success
- "Smoke test do portão" → `estado` com pendente, tarefas abertas, sem `verification.md`, completo com archive, confirmação do archive (escopo apply), selo vencido e inferência
- "Smoke test dos hooks do Claude Code" → `protege-ganchos` (22 formas negadas na conferência local, 18 na CI; leituras liberadas), `exige-change` (ask sem change aprovada, cache positivo, nada em `openspec/`, fora do repositório ou sem portão), `contexto-de-sessao` (resumo e sugestão do propose)
- "Smoke test da camada do Claude Code no instalador" → `SessionStart`, `protege-ganchos` no `Bash|PowerShell` e `exige-change` no `Edit|Write`
- Requisitos: "Estado do fluxo no início da sessão", "Ganchos do Git não podem ser desligados pelo agente", "Escrita fora do fluxo pede confirmação" (agent-guardrails) e "Estado das changes no portão" (change-approval) → código, smokes e teste do responsável
- `review.md` → c27b366^..706c0ef (SHAs antes dos rebases), subagente requesting-code-review; correções em ad3108d
