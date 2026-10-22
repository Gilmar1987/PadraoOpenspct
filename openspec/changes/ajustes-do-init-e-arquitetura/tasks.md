# Tasks

## 1. Proteção na CI

- [ ] 1.1 Acrescentar ao passo "Trechos customizados das skills" as checagens do D5. Verificar rodando o passo no Git Bash: deve falhar.

## 2. Entrevista

- [ ] 2.1 Aplicar o D1 (E2E acrescentado) e o D3 (opções da 3.8 e linha da checagem de coerência) no `init.md`. Verificar com `grep` mostrando o texto novo e nenhum "troque no `operations.apply.guidance`" nem "pg-boss / BullMQ (Node.js)".
- [ ] 2.2 Aplicar o D2 (pergunta 7.3, 7.2 cobrindo Development Conventions e o registro no "Arquivo 2"). Verificar com `grep` mostrando a 7.3 e a menção a Development Conventions na 7.2.

## 3. Documento de arquitetura

- [ ] 3.1 Aplicar o D4 no `init.md` ("Arquivo 5", "Arquivo 2" e "Próximos passos") e no `project.md` neutro (seção "Architecture"). Verificar com o passo da 1.1 passando, os smoke tests do setup passando (o setup compara o `project.md` com o neutro) e o lint em `padrao-openspec/` sem issues.
- [ ] 3.2 Rodar o "Arquivo 5" à mão sobre o `project-setup.md` do Lava Jato (`C:\TesteOpenSpct\lava-jato-openspec\padrao-openspec\openspec\project-setup.md`), gerando o documento numa pasta temporária (sem tocar no store do Lava Jato). Verificar que o modelo produz um `arquitetura.md` com todas as seções, um diagrama Mermaid só com componentes escolhidos e links válidos para as ADRs do Lava Jato, e que o lint não acusa nada.

## 4. Versão e integração

- [ ] 4.1 Regenerar a raiz com `sync-root.mjs` e aplicar o D6 em `VERSION` e `CHANGELOG.md` com a versão aprovada. Verificar com `sync-root.mjs --check` e o passo "Versão e changelog" passando.
- [ ] 4.2 Rodar os comandos de verificação do `openspec/project.md` da raiz (todos os passos dos jobs `store` e `root`). Verificar que todos saem com código 0.

## Workflow follow-up

- Depois do archive: PR, merge e release com o `comecar.mjs` anexado, conforme a aprovação.
