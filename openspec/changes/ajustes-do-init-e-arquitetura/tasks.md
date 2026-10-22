# Tasks

## 1. Proteção na CI

- [x] 1.1 Acrescentar ao passo "Trechos customizados das skills" as checagens do D5. Verificar rodando o passo no Git Bash: deve falhar.
  - Evidência: `[FAIL (1)] Trechos customizados das skills` com os 4 trechos novos ausentes (`openspec/arquitetura.md`, a 7.3, "Fila no próprio banco" e "acrescente ao `operations.apply.guidance`"), antes de mudar o `init.md` (exit 1, esperado).

## 2. Entrevista

- [x] 2.1 Aplicar o D1 (E2E acrescentado) e o D3 (opções da 3.8 e linha da checagem de coerência) no `init.md`. Verificar com `grep` mostrando o texto novo e nenhum "troque no `operations.apply.guidance`" nem "pg-boss / BullMQ (Node.js)".
  - Evidência: `grep -cF` no `init.md` → 0 para "troque no `operations.apply.guidance`" e para "pg-boss / BullMQ (Node.js)"; 1 para "acrescente ao `operations.apply.guidance`", "Fila no próprio banco" e "3.8 cita uma biblioteca presa".
- [x] 2.2 Aplicar o D2 (pergunta 7.3, 7.2 cobrindo Development Conventions e o registro no "Arquivo 2"). Verificar com `grep` mostrando a 7.3 e a menção a Development Conventions na 7.2.
  - Evidência: `grep -cF` → 1 para "**7.3 — Em que idioma", "ou de Development Conventions" e "Registre a 7.3".

## 3. Documento de arquitetura

- [x] 3.1 Aplicar o D4 no `init.md` ("Arquivo 5", "Arquivo 2" e "Próximos passos") e no `project.md` neutro (seção "Architecture"). Verificar com o passo da 1.1 passando, os smoke tests do setup passando (o setup compara o `project.md` com o neutro) e o lint em `padrao-openspec/` sem issues.
  - Evidência: `grep -cF` → 1 para "### Arquivo 5" e para "[Arquitetura detalhada](arquitetura.md)", 3 para "openspec/arquitetura.md"; `sync-root.mjs` → "Synced 1 paths."; `[PASS]` em "Trechos customizados das skills", "Lint de Markdown" e "Smoke test do setup de projeto" (exit 0).
- [x] 3.2 Rodar o "Arquivo 5" à mão sobre o `project-setup.md` do Lava Jato (`C:\TesteOpenSpct\lava-jato-openspec\padrao-openspec\openspec\project-setup.md`), gerando o documento numa pasta temporária (sem tocar no store do Lava Jato). Verificar que o modelo produz um `arquitetura.md` com todas as seções, um diagrama Mermaid só com componentes escolhidos e links válidos para as ADRs do Lava Jato, e que o lint não acusa nada.
  - Evidência: modelo do "Arquivo 5" aplicado à mão sobre o `project-setup.md` e as 12 ADRs do Lava Jato, gerando `scratchpad/arq-lavajato/openspec/arquitetura.md` (o store do Lava Jato não foi alterado) → as 10 seções presentes; 12 links `adrs/...` e nenhum faltando no store do Lava Jato; diagrama Mermaid só com front-end, back-end, Prisma, SQL Server e fila em tabela (sem e-mail nem arquivos, que são "Não aplicável"); `markdownlint-cli2` → 0 issues.

## 4. Versão e integração

- [x] 4.1 Regenerar a raiz com `sync-root.mjs` e aplicar o D6 em `VERSION` e `CHANGELOG.md` com a versão aprovada. Verificar com `sync-root.mjs --check` e o passo "Versão e changelog" passando.
  - Evidência: `VERSION` → 1.4.0 e seção `## 1.4.0` no topo do CHANGELOG; `sync-root.mjs --check` → "Root is in sync"; `[PASS] Versão e changelog` (exit 0); lint do CHANGELOG → 0 issues.
- [ ] 4.2 Rodar os comandos de verificação do `openspec/project.md` da raiz (todos os passos dos jobs `store` e `root`). Verificar que todos saem com código 0.

## Workflow follow-up

- Depois do archive: PR, merge e release com o `comecar.mjs` anexado, conforme a aprovação.
