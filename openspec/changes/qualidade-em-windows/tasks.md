# Tasks

## 1. CI em Windows

- [x] 1.1 Aplicar o D1, o D2 e o D3 no `validate.yml`. Verificar com a checagem de YAML do arquivo e com o passo do D3 rodado localmente no Git Bash do Windows (exit 0). Antes da correção da `corrige-caminho-e-prompt-no-windows`, o mesmo cenário falhava com "not this store", como registra o `verification.md` daquela change.
  - Evidência: matriz `ubuntu-latest` + `windows-latest` no job `store` (`fail-fast: false`, `shell: bash`), checagem de YAML com `python3` ou `python` e instalação do PyYAML se faltar, e passo "Smoke test do drive minúsculo" só no Windows; `yaml.safe_load` do `validate.yml` → ok; no Git Bash do Windows, `[PASS] Sintaxe dos scripts` e `[PASS] Smoke test do drive minúsculo` (exit 0, id `ci-drive` desregistrado no fim). O mesmo passo rodado contra a v1.3.0 (git worktree) → exit 1 com "resolves C:\... not this store (c:\...)", o defeito do Lava Jato.
- [ ] 1.2 Abrir o PR e conferir no GitHub as execuções `store (ubuntu-latest)`, `store (windows-latest)` e `root`. Ajustar os passos que falharem só no Windows, conforme o D2. Verificar com as três execuções passando.

## 2. Processo

- [x] 2.1 Aplicar o D4 no `openspec/project.md` da raiz. Verificar com o lint da raiz sem issues e o texto novo presente em "Git & Process" e na linha "Testes".
  - Evidência: `openspec/project.md` da raiz com a regra do teste em console real em "Git & Process" e "o job `store` roda em Ubuntu e em Windows" na linha "Testes"; lint da raiz → 0 issues.

## Workflow follow-up

- Depois do merge, conferir se alguma regra de proteção da `main` exige o nome antigo `store` e atualizá-la para os dois nomes novos.
