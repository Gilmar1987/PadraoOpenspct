# Design

## Context

- **Hoje, as travas são só texto:**
  - a aprovação é conferida no passo 4a do apply e no 4a do archive (comandos e skills);
  - o verify só existe como fluxo do agente;
  - o `openspec archive` do CLI não confere nada disso.
- **O CLI resolve o store a partir do código.** Rodado na pasta do código, ele respeita a declaração `store:` do `openspec/config.yaml`:
  - `openspec status --change <c> --json` devolve o `changeRoot` no store;
  - `openspec instructions apply --change <c> --json` devolve `progress` (`total`, `complete`, `remaining`);
  - conferido em 2026-10-22 numa pasta temporária.
- **Arquivos gerenciados:** o instalador entrega arquivos únicos por `templateFiles`, e o bloco `openspec-padrao` sai de `templates/agents-block.md` (ADR-0005).
- **Releases:** são publicadas à mão com `gh release create`. A `v1.7.0` saiu sem o anexo.
- **Coordenação com a outra sessão:** a interface provisória do portão foi combinada com ela, porque a change `subagentes-e-ganchos` vai chamá-lo nos hooks:
  - `apply|archive <change>`, `--json` e `--store <id>`;
  - saída 0, 1 ou 2.

## Architecture Decisions

Não há ADR nova: o portão é mais um arquivo gerenciado (ADR-0004), o bloco segue a ADR-0005, e o hook é opcional, instalado só a pedido. A numeração ADR-0007 fica reservada para esta change caso a revisão aponte uma decisão duradoura.

## Goals / Non-Goals

**Goals:**

- Uma resposta determinística, igual para qualquer agente, sobre "posso escrever código?" e "posso arquivar?".
- Toda release com o `comecar.mjs`, sem depender de lembrar.

**Non-Goals:**

- Bloquear o `openspec archive` do CLI.

## Decisions

### D1. Portão (`padrao-openspec/scripts/portao.mjs`)

Node ESM, sem dependências; textos em pt-BR, código em inglês.

```text
node docs/openspec-portao.mjs <apply|archive|instalar-hook> [<change>] [--json] [--store <id>]
```

1. **Resolução da change:**
   - roda `openspec status --change <change> --json` no diretório atual, ou com `--store <id>`;
   - CLI ausente, change inexistente ou `root: null` → saída 2, com a mensagem do CLI e a dica do `--store <id>` ou da declaração `store:`.
2. **Aprovação:**
   - lê a seção `## Aprovação` do `<changeRoot>/proposal.md` (itens `- Chave: valor`);
   - **apply:** libera se Responsável ≠ `Pendente` e Data, Escopo (`apply` ou `archive`) e Origem ≠ `—`.
3. **archive:**
   - a aprovação do apply, mais `Escopo: archive` ou um item `- Archive:`;
   - `progress.remaining` = 0, por `openspec instructions apply --change <c> --json`;
   - `verification.md` existe no `changeRoot`;
   - se o repositório Git do diretório atual tem commits com `OpenSpec-Change: <change>` (`git log --grep`), a change alterou código e exige `review.md`.
4. **Saída:**
   - texto com `✔ liberado` ou `✗ bloqueado: <motivos>`, cada motivo com o que fazer;
   - com `--json`, `{ "ok": bool, "acao": "apply|archive", "change": "...", "motivos": [...] }`;
   - códigos 0, 1 e 2.
5. **`instalar-hook`:**
   - escreve `.git/hooks/commit-msg` (recusa se já existir um hook que não seja o do padrão);
   - o hook lê o trailer `OpenSpec-Change:` da mensagem, roda `node docs/openspec-portao.mjs apply <change>` e sai com o código dele;
   - sem trailer, libera.

O instalador entrega o arquivo como `docs/openspec-portao.mjs` (`templateFiles`, origem `../scripts/portao.mjs`).

### D2. Fluxos

Trecho novo **"Run the gate"** no passo 4a do apply e no 4a do archive (comandos e skills):

> when the code repository has `docs/openspec-portao.mjs`, run `node docs/openspec-portao.mjs apply <change>` (archive: `archive <change>`) and follow its exit code: 1 stops with its reasons, 2 stops with its fix. Without the gate file, keep the checks below.

### D3. Bloco e regras

- **`templates/agents-block.md`:** três itens novos.
  - "Os comandos `/opsx:*` são fluxos do agente, não comandos do OpenSpec CLI; não existe `openspec verify`. Nunca rode `openspec archive` direto: siga `.claude/commands/opsx/archive.md`."
  - "Antes de escrever código de uma change e antes de arquivá-la, rode `node docs/openspec-portao.mjs apply <change>` ou `archive <change>` e respeite o resultado."
  - "Se o CLI não achar o store (`no_root_with_registered_stores`), rode-o na pasta do código ou passe `--store <id>`."
- **`rules.md`, seção 3:** a mesma proibição do `openspec archive` direto e a menção ao portão.

### D4. Workflow de release (`.github/workflows/release.yml`)

```yaml
on:
  release:
    types: [published]
permissions:
  contents: write
jobs:
  anexo:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { ref: ${{ github.event.release.tag_name }} }
      - run: |
          tag="${{ github.event.release.tag_name }}"
          if ! gh release view "$tag" --json assets -q '.assets[].name' | grep -qx comecar.mjs; then
            gh release upload "$tag" padrao-openspec/scripts/comecar.mjs
          fi
          gh release view "$tag" --json assets -q '.assets[].name' | grep -qx comecar.mjs
        env: { GH_TOKEN: ${{ github.token }} }
```

O README ("Como publicar uma release") diz que o workflow garante o anexo, e o comando manual continua anexando.

### D5. Guias

- **COMECE-AQUI:** linha "`no_root_with_registered_stores` ao rodar o CLI" → "rode na pasta do código, que declara o store, ou passe `--store <id>`; confira a linha `store:` do `openspec/config.yaml`".
- **`templates/openspec-padrao.md`:** seção "Portão", com os dois comandos, os códigos de saída e o `instalar-hook` opcional.

### D6. CI

- **"Sintaxe dos scripts":** `node --check scripts/portao.mjs`.
- **"Smoke test do portão"** (job `store`), com o `trap` que desregistra o id `ci-portao`:
  - código e store pelo setup;
  - uma change com `Pendente` → apply sai 1;
  - aprovação completa (`Escopo: apply`) → apply sai 0;
  - archive com `Escopo: apply` → 1;
  - com `Escopo: archive`, uma tarefa pendente e sem `verification.md` → 1, citando as duas faltas;
  - tarefas marcadas, com `verification.md` e um commit `OpenSpec-Change:` no código sem `review.md` → 1;
  - com `review.md` → 0;
  - change inexistente → 2;
  - `--json` com `"ok":false` no caso pendente;
  - `instalar-hook` e um commit com o trailer de uma change pendente → recusado.
- **"Trechos customizados das skills":** "Run the gate" no par do apply e no do archive.
- **Workflow de release:** `yaml.safe_load` do `release.yml` na checagem de sintaxe.

### D7. Versão

`1.9.0`, a combinar com a outra sessão antes do apply. "Ações no projeto":

- "Nenhuma obrigatória. O PR de atualização traz `docs/openspec-portao.mjs` e o bloco novo no `AGENTS.md`.";
- "Para recusar commits de change não aprovada, rode uma vez `node docs/openspec-portao.mjs instalar-hook`."

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/scripts/portao.mjs` (novo) | D1 | instalador, CI |
| `padrao-openspec/scripts/install-skills.mjs` | D1 (`templateFiles`) | smoke tests do instalador e dos blocos |
| `padrao-openspec/templates/agents-block.md` | D3 | blocos dos projetos |
| `commands/opsx/{apply,archive}.md`, skills do apply e do archive | D2 | cópias da raiz, trechos customizados |
| `padrao-openspec/openspec/rules.md` | D3 | cópia da raiz, `docs/openspec-regras.md` |
| `.github/workflows/release.yml` (novo), `.github/workflows/validate.yml` | D4, D6 | releases |
| `COMECE-AQUI.md`, `templates/openspec-padrao.md`, `README.md` | D4, D5 | lint, guia |
| `padrao-openspec/VERSION`, `CHANGELOG.md` | D7 | "Versão e changelog" |

## Risks / Trade-offs

- [Parser da seção de aprovação frágil] → aceita só o formato `- Chave: valor` já exigido pelas regras e mostra a linha problemática no motivo.
- [Agente que não roda o portão] → o hook opcional pega o commit; o bloco e as regras pedem o portão; a outra sessão vai chamá-lo nos hooks do Claude Code.
- [Workflow de release falhar por permissão] → `contents: write` explícito e uma verificação no fim.

## Migration Plan

Projetos recebem o portão pelo PR de atualização. Rollback: reverter os commits; o arquivo gerenciado sai na próxima atualização.

## Open Questions

Nenhuma; a versão é combinada antes do apply.
