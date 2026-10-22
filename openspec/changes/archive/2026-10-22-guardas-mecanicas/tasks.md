# Tasks

## 1. Testes na CI

- [x] 1.1 Aplicar o D6 no `validate.yml` (sintaxe, "Smoke test do portão" e "Run the gate" nos trechos customizados). Verificar rodando os passos no Git Bash: devem falhar.
  - Evidência: no Git Bash, `[FAIL (1)] Sintaxe dos scripts` (sem `portao.mjs` e `release.yml`), `[FAIL (1)] Trechos customizados das skills` ("Run the gate" ausente) e `[FAIL (2)] Smoke test do portão` (exit diferente de 0, esperado); nenhum id `ci-portao` ficou registrado.

## 2. Portão

- [x] 2.1 Criar `padrao-openspec/scripts/portao.mjs` conforme o D1 e entregá-lo pelo instalador. Verificar com o "Smoke test do portão" e os smoke tests do instalador passando no Git Bash.
  - Evidência: `portao.mjs` (apply, archive, `--json`, `--store`, `instalar-hook`, `commit-msg`) entregue como `docs/openspec-portao.mjs` por `templateFiles`. No Git Bash, `[PASS] Smoke test do portão`: pendente → bloqueia (texto e `"ok":false`); aprovação de apply → libera o apply e bloqueia o archive; escopo archive com tarefa pendente e sem `verification.md` → bloqueia citando as duas; commit `OpenSpec-Change:` sem `review.md` → bloqueia; com ele → "✔ liberado"; change inexistente → código 2; hook recusa o commit da change pendente e aceita o sem trailer. `[PASS]` nos smoke tests do instalador, do setup (três), da declaração do store, do script de entrada e dos blocos de agentes. O `ci-store` deixado pelo teste da declaração do store (anterior a esta change, sem `trap`) foi removido à mão.

## 3. Fluxos, bloco e regras

- [x] 3.1 Aplicar o D2 nos 4 arquivos do apply e do archive e o D3 no `agents-block.md` e no `rules.md`, e regenerar a raiz com `sync-root.mjs`. Verificar com "Trechos customizados das skills", "Smoke test dos blocos de agentes" e `sync-root --check` passando.
  - Evidência: "Run the gate" no passo 4a do apply (antes da checagem em texto) e num passo 3a do archive, antes da sincronização das specs (a primeira inserção caiu no fim do passo 4, depois do sync, e foi movida); bloco `openspec-padrao` e `rules.md` (seção 3) com os `/opsx:*` como fluxos do agente, a proibição do `openspec archive` direto, o portão e o `--store`; `sync-root.mjs` → "Synced 5 paths.", `--check` → em dia; `[PASS]` em "Trechos customizados das skills", "Smoke test dos blocos de agentes" e "Lint de Markdown".

## 4. Release, guias e versão

- [x] 4.1 Criar o `.github/workflows/release.yml` conforme o D4 e aplicar o D5 e o D7. Verificar com `yaml.safe_load` do workflow, o lint nos dois lugares sem issues e os passos "Guia de primeiros passos" e "Versão e changelog" passando.
  - Evidência: `.github/workflows/release.yml` (dispara em `release: published`, anexa o `comecar.mjs` da tag se faltar e confere); `yaml.safe_load` → ok, e a checagem de sintaxe da CI passou a carregar o arquivo; COMECE-AQUI com as linhas `no_root_with_registered_stores` e "o agente rodou `openspec verify` ou `openspec archive`"; seção "Portão" no guia do projeto; README com o workflow e a linha "Run the gate"; `VERSION` → 1.9.0 e seção `## 1.9.0` no CHANGELOG. `[PASS]` em "Sintaxe dos scripts", "Versão e changelog", "Lint de Markdown" e nos 4 passos do `root` (exit 0).
- [x] 4.2 Rodar os comandos de verificação do `openspec/project.md` localmente, depois de combinar com a outra sessão que ela não roda a suíte ao mesmo tempo, e conferir no PR os três jobs. Verificar que todos passam.
  - Evidência: combinado com a outra sessão antes de rodar; localmente, 18 `[PASS]` no `store` e 4 no `root` (exit 0), sem ids de teste registrados no fim; depois das correções da revisão, `[PASS]` no "Smoke test do portão" com os casos novos e nos demais passos afetados; no PR #28 (run 39836966024), `store (ubuntu-latest)`, `store (windows-latest)` e `root` → pass.

## Workflow follow-up

- Depois do merge e da release `v1.9.0`, conferir que o workflow de release rodou e que o anexo está lá (o primeiro teste real do D4).
- Avisar a outra sessão da interface final do portão, se ela mudar em relação à combinada.
