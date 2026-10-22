# Tasks

## 1. CI em Windows

- [x] 1.1 Aplicar o D1, o D2 e o D3 no `validate.yml`. Verificar com a checagem de YAML do arquivo e com o passo do D3 rodado localmente no Git Bash do Windows (exit 0). Antes da correção da `corrige-caminho-e-prompt-no-windows`, o mesmo cenário falhava com "not this store", como registra o `verification.md` daquela change.
  - Evidência: matriz `ubuntu-latest` + `windows-latest` no job `store` (`fail-fast: false`, `shell: bash`), checagem de YAML com `python3` ou `python` e instalação do PyYAML se faltar, e passo "Smoke test do drive minúsculo" só no Windows; `yaml.safe_load` do `validate.yml` → ok; no Git Bash do Windows, `[PASS] Sintaxe dos scripts` e `[PASS] Smoke test do drive minúsculo` (exit 0, id `ci-drive` desregistrado no fim). O mesmo passo rodado contra a v1.3.0 (git worktree) → exit 1 com "resolves C:\... not this store (c:\...)", o defeito do Lava Jato.
- [x] 1.2 Abrir o PR e conferir no GitHub as execuções `store (ubuntu-latest)`, `store (windows-latest)` e `root`. Ajustar os passos que falharem só no Windows, conforme o D2. Verificar com as três execuções passando.
  - Evidência: PR #24, run 39781038915 → `store (ubuntu-latest)` pass (18 s), `store (windows-latest)` pass (2 min 16 s), `root` pass, sem ajuste de passo. No log do Windows, "Smoke test do drive minúsculo" rodou com `c:\Users\RUNNER~1\...` (drive minúsculo e nome curto 8.3) e os dois modos concluíram ("✔ Setup concluído", "Unregistered store: ci-drive"); no Ubuntu o passo não aparece (pulado pelo `if`).

## 2. Processo

- [x] 2.1 Aplicar o D4 no `openspec/project.md` da raiz. Verificar com o lint da raiz sem issues e o texto novo presente em "Git & Process" e na linha "Testes".
  - Evidência: `openspec/project.md` da raiz com a regra do teste em console real em "Git & Process" e "o job `store` roda em Ubuntu e em Windows" na linha "Testes"; lint da raiz → 0 issues.

## Workflow follow-up

- Proteção da `main`: conferido em 2026-10-22 que não há regra de proteção nem ruleset; nada a atualizar.
