# Tasks

## 1. Testes na CI

- [x] 1.1 Aplicar o D6 no `validate.yml` (sintaxe, "Smoke test do portão" e "Run the gate" nos trechos customizados). Verificar rodando os passos no Git Bash: devem falhar.
  - Evidência: no Git Bash, `[FAIL (1)] Sintaxe dos scripts` (sem `portao.mjs` e `release.yml`), `[FAIL (1)] Trechos customizados das skills` ("Run the gate" ausente) e `[FAIL (2)] Smoke test do portão` (exit diferente de 0, esperado); nenhum id `ci-portao` ficou registrado.

## 2. Portão

- [x] 2.1 Criar `padrao-openspec/scripts/portao.mjs` conforme o D1 e entregá-lo pelo instalador. Verificar com o "Smoke test do portão" e os smoke tests do instalador passando no Git Bash.
  - Evidência: `portao.mjs` (apply, archive, `--json`, `--store`, `instalar-hook`, `commit-msg`) entregue como `docs/openspec-portao.mjs` por `templateFiles`. No Git Bash, `[PASS] Smoke test do portão`: pendente → bloqueia (texto e `"ok":false`); aprovação de apply → libera o apply e bloqueia o archive; escopo archive com tarefa pendente e sem `verification.md` → bloqueia citando as duas; commit `OpenSpec-Change:` sem `review.md` → bloqueia; com ele → "✔ liberado"; change inexistente → código 2; hook recusa o commit da change pendente e aceita o sem trailer. `[PASS]` nos smoke tests do instalador, do setup (três), da declaração do store, do script de entrada e dos blocos de agentes. O `ci-store` deixado pelo teste da declaração do store (anterior a esta change, sem `trap`) foi removido à mão.

## 3. Fluxos, bloco e regras

- [ ] 3.1 Aplicar o D2 nos 4 arquivos do apply e do archive e o D3 no `agents-block.md` e no `rules.md`, e regenerar a raiz com `sync-root.mjs`. Verificar com "Trechos customizados das skills", "Smoke test dos blocos de agentes" e `sync-root --check` passando.

## 4. Release, guias e versão

- [ ] 4.1 Criar o `.github/workflows/release.yml` conforme o D4 e aplicar o D5 e o D7. Verificar com `yaml.safe_load` do workflow, o lint nos dois lugares sem issues e os passos "Guia de primeiros passos" e "Versão e changelog" passando.
- [ ] 4.2 Rodar os comandos de verificação do `openspec/project.md` localmente, depois de combinar com a outra sessão que ela não roda a suíte ao mesmo tempo, e conferir no PR os três jobs. Verificar que todos passam.

## Workflow follow-up

- Depois do merge e da release `v1.9.0`, conferir que o workflow de release rodou e que o anexo está lá (o primeiro teste real do D4).
- Avisar a outra sessão da interface final do portão, se ela mudar em relação à combinada.
