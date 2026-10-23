# Tasks

## 1. Correção e processo

- [x] 1.1 Aplicar o D1 no `CHANGELOG.md` e o D2 no README. Verificar com o lint e os passos "Versão e changelog" e "Smoke test do changelog-range" passando.
  - Evidência: `CHANGELOG.md` com "## 1.12.0 — 2026-10-23"; README "Como publicar uma release" com o passo 2 novo (acertar a data no dia da publicação, num PR curto) e a tag no commit do merge (passo 3). Git Bash: "Versão e changelog", "Smoke test do changelog-range", "Lint de Markdown da raiz" e "Guia de primeiros passos" → PASS.
- [x] 1.2 Depois do merge, regerar as notas da Release v1.12.0 e aplicá-las com `gh release edit`. Verificar com `gh release view v1.12.0` mostrando "## 1.12.0 — 2026-10-23" e o anexo `comecar.mjs` intacto.
  - Evidência: notas regeradas com `changelog-range.mjs --from 1.11.0 --to 1.12.0` a partir do CHANGELOG desta branch e aplicadas com `gh release edit v1.12.0 --notes-file` → `gh release view v1.12.0`: primeira linha "## 1.12.0 — 2026-10-23", anexo `comecar.mjs` intacto, tag v1.12.0 inalterada. Feito antes do merge, e não depois como diz o critério, porque o archive entra no mesmo PR e exige as tarefas marcadas; o texto aplicado é o mesmo que vai para a `main`.
