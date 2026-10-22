# Design

## Context

- **Propose:**
  - o propose (comando e skill) tem passos numerados 1 a 8 e trechos próprios do padrão, conferidos pelo passo "Trechos customizados das skills" da CI;
  - o `openspec list --json` lista as changes ativas da raiz; cada change tem as delta specs em `specs/<capability>/spec.md`.
- **Regras:** o `rules.md` (fonte em `padrao-openspec/openspec/rules.md`) tem 8 seções, e os projetos o recebem como `docs/openspec-regras.md`.
- **Ids de teste no `validate.yml`:** são fixos.
  - Registram store: `ci-store` (declaração do store), `ci-entrada` e `ci-semcommit`, `ci-semident`, `ci-falta` (script de entrada), `ci-drive` (drive minúsculo, só no Windows) e `ci-portao` (portão).
  - `ci-change` e `ci-change-extra` são nomes de change, não de store, e `ci-config-probe` é uma pasta; esses ficam como estão.
- **Instalação do CLI:** nos jobs `store` e `root`, o passo "Instalar OpenSpec CLI" roda `npm install --global @fission-ai/openspec@1.14.2` sempre.
- **Changes concorrentes:** a outra sessão aplica a `subagentes-e-ganchos` (v1.10.0) numa worktree própria; ela não aparece no `openspec list` desta árvore, e por isso entra no Impact à mão.

## Architecture Decisions

Não há ADR nova: são regras de processo e ajustes de CI.

## Goals / Non-Goals

**Goals:**

- Uma sobreposição entre changes aparece no propose, antes da aprovação.
- Duas execuções da suíte na mesma máquina não interferem uma na outra.

**Non-Goals:**

- Detectar changes concorrentes que estão em outras worktrees ou branches não mergeadas (o `openspec list` só vê a árvore atual); a regra de trabalho em paralelo cobre isso pela comunicação.

## Decisions

### D1. "Check concurrent changes" no propose

Trecho novo, depois do passo 6 (criação dos artefatos) e antes do 7 (status final), nos dois arquivos do propose:

> **Check concurrent changes**: run `openspec list --json` (with the selected store flag) and, for every other active change, list the capability folders under its `specs/`. Compare them with the capabilities of the delta specs you just wrote. Add one line to the proposal's Impact, `Changes concorrentes: <change> (<capabilities>); ...` or `Changes concorrentes: nenhuma`, and show each overlap to the user with a suggested order before asking for approval. Changes in other worktrees or unmerged branches are not listed by the CLI: when the user or `rules.md` mentions parallel work, ask about them.

### D2. Regras de trabalho em paralelo

Seção nova no `rules.md`, entre a 7 e a 8:

```markdown
## 8. Trabalho em paralelo

Com mais de uma sessão ou agente no mesmo repositório:

- Cada change fica numa worktree e numa branch próprias (`git worktree add ../<repo>-<change> -b <branch>`), com uma sessão por worktree. Duas sessões na mesma pasta disputam o índice e as mensagens.
- A versão do padrão (ou do produto) e o número de uma ADR nova são combinados antes do apply, e não no merge.
- Quem for rodar algo que usa recursos compartilhados da máquina (registro de stores do OpenSpec, ferramentas instaladas globalmente) avisa antes e espera a resposta.
```

A antiga seção 8 ("Quando em dúvida") passa a ser a 9.

### D3. Ids de teste únicos

Em cada passo que registra store, o primeiro comando define o sufixo:

```bash
sfx="${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-0}-$$-$RANDOM"
```

Os ids viram `ci-store-$sfx`, `ci-entrada-$sfx` e assim por diante, nas chamadas e nas conferências. Exemplos:

- `grep -qx "store: ci-store-$sfx"`;
- as pastas `ci-entrada-$sfx-openspec`, que o `comecar.mjs` deriva do id;
- as URLs dos repositórios bare.

Cada passo ganha (ou mantém) um `trap` que desregistra todos os seus ids. O passo "Smoke test da declaração do store" ganha o `trap` que não tinha.

### D4. Instalação do CLI sem reinstalar

Nos dois jobs:

```bash
if [ "$(openspec --version 2>/dev/null)" = "1.14.2" ]; then
  echo "OpenSpec CLI 1.14.2 já instalado"
else
  npm install --global @fission-ai/openspec@1.14.2
fi
```

### D5. Checagem dos ids

Passo novo no job `root`, "Ids de teste com sufixo": falha se o `validate.yml` tiver `--register-id ci-`, `--id ci-` ou `store unregister ci-` sem o sufixo, com um `grep -nE` sobre o próprio arquivo:

```bash
if grep -nE -- '(--register-id|--id|store unregister) "?ci-[a-z-]+"?( |$)' .github/workflows/validate.yml | grep -v 'sfx'; then exit 1; fi
```

### D6. Documentação

- **`openspec/project.md`, nota em "Comandos de verificação":** "Execução local: rode os passos sem o de instalação do CLI se ele já estiver na versão certa, e avise outras sessões antes, conforme a seção 'Trabalho em paralelo' das regras."
- **README:** a linha "Check concurrent changes" na tabela de trechos.
- **CHANGELOG:** em "Ações no projeto", "Nenhuma obrigatória; as regras de trabalho em paralelo chegam em `docs/openspec-regras.md`".

### D7. Versão

A próxima livre depois da `subagentes-e-ganchos` (v1.10.0), combinada com a outra sessão e aprovada pelo responsável antes do apply.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `commands/opsx/propose.md`, `skills/openspec-propose/SKILL.md` | D1 | cópias da raiz, trechos customizados |
| `padrao-openspec/openspec/rules.md` | D2 | cópia da raiz, `docs/openspec-regras.md`, smoke test dos blocos |
| `.github/workflows/validate.yml` | D3, D4, D5 | todos os passos com store |
| `openspec/project.md`, `README.md`, `CHANGELOG.md`, `padrao-openspec/VERSION` | D6, D7 | lint, "Versão e changelog" |

## Risks / Trade-offs

- [Pastas derivadas do id mudam de nome nos testes] → os testes usam a variável em todas as conferências; a CI dos três jobs confirma.
- [O `$RANDOM` não existe em `sh`] → os passos rodam em Bash (`shell: bash` no job `store`; o padrão do GitHub também é Bash).

## Migration Plan

Nenhuma migração. Rollback: reverter os commits.

## Open Questions

Nenhuma; a versão é combinada antes do apply.
