# Design

## Context

- O `validate.yml` tem dois jobs em `ubuntu-latest`: `store` (16 passos, em `padrao-openspec/`) e `root` (4 passos). Os passos são scripts Bash e usam `mktemp`, `cmp`, `perl`, `git`, `node`, `npx`, `openspec` e, num caso, `python3` (checagem de YAML do template do workflow de atualização).
- Toda a suíte do `store` já roda localmente no Git Bash do Windows (registrado nas verificações das changes desde a `guia-de-entrada-do-dev`). Ali, o `python3` existe porque a máquina tem o Python instalado; no runner `windows-latest`, o nome garantido é `python`.
- O defeito do drive minúsculo foi reproduzido no Windows com `--pasta "c:\..."` (change `corrige-caminho-e-prompt-no-windows`); no runner, o workspace fica em `D:\a\...`, então o caso é `d:\...`.
- O repositório é público: os runners do GitHub Actions não têm custo.

## Architecture Decisions

Não há ADR nova: é uma decisão local de CI e de processo deste repositório.

## Goals / Non-Goals

**Goals:**

- Um defeito que só aparece no Windows ou só no Linux reprova o PR.

**Non-Goals:**

- Reproduzir na CI o redesenho do console do Windows.

## Decisions

### D1. Matriz no job `store`

```yaml
  store:
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    defaults:
      run:
        working-directory: padrao-openspec
        shell: bash
```

- Escolhi a matriz, e não um job `store-windows` separado, para não duplicar os 16 passos.
- O `fail-fast: false` deixa os dois resultados visíveis quando só um sistema falha.
- O nome do job no PR passa a ser `store (ubuntu-latest)` e `store (windows-latest)`. Uma regra de proteção de branch que exija o nome `store`, se existir, precisa ser atualizada.

### D2. Passos portáveis

- Checagem de YAML: `py="$(command -v python3 || command -v python)"` e `"$py" -c ...`.
- Os demais passos já rodam no Git Bash, conforme as verificações anteriores. O apply roda a matriz no PR, e cada passo que falhar só no Windows é ajustado para ficar portável. Um passo só é limitado ao Linux (`if: runner.os == 'Linux'`) com o motivo num comentário, e só se depender de algo que o Windows não tem.

### D3. Drive minúsculo no Windows

Passo "Smoke test do drive minúsculo", com `if: runner.os == 'Windows'`:

- monta um padrão local com tag, como o "Smoke test do script de entrada";
- converte a pasta temporária para Windows com `cygpath -w` e põe a letra do drive em minúscula;
- roda o `comecar.mjs --modo novo --pasta "<d:\...>\a" ... --yes`;
- commita e cria os bare;
- desregistra o id e roda o `--modo existente --pasta "<d:\...>\b"`.

Ele confere que os dois modos saem com código 0 e que o `openspec context --json` no código resolve a pasta `padrao-openspec` do store. Ao final, desregistra o id de teste.

### D4. Teste em console real

No `openspec/project.md` da raiz:

- **"Git & Process":** "Change que altera um script interativo (`comecar.mjs`, `setup-project.mjs` ou outro que pergunte no terminal) SHALL ter, antes da release, um teste do responsável num console real do Windows (PowerShell), com as respostas digitadas, registrado no `verification.md` como cobertura fora da suíte; sem ele, o verify registra o item como não verificado e a release espera."
- **"Testes" em "Comandos de verificação":** a observação passa a dizer "o job `store` roda em Ubuntu e em Windows".

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `.github/workflows/validate.yml` | D1–D3 | proteção de branch, se exigir o nome `store` |
| `openspec/project.md` | D4 | verify e apply deste repositório |

## Risks / Trade-offs

- [O Windows ser mais lento e alongar o PR] → os dois sistemas rodam em paralelo; o tempo total é o do mais lento.
- [Falha intermitente só no runner Windows (antivírus, travas de arquivo)] → registrar e ajustar o passo, sem desligar o Windows da matriz.

## Migration Plan

Nenhuma migração. Rollback: reverter o commit da CI.

## Open Questions

Nenhuma.
