# Proposal

## Why

O `/opsx:init` do projeto Lava Jato (2026-10-21) deixou três atritos e uma lacuna:

- **(b) E2E no `config.yaml`:** quando a 5.5 é "Não aplicável", o init manda **trocar** em `operations.apply.guidance` "a exigência de teste E2E". Mas o `config.yaml` neutro não tem essa linha desde que os presets de stack saíram (ADR-0003). O agente precisou acrescentá-la, e quem tem E2E não recebe nenhuma orientação.
- **(c) Idioma do código:** o `project.md` tem "Idioma do código" em Development Conventions, mas nenhuma pergunta cobre esse campo. A 1.7 trata dos idiomas do produto, e a 7.2 só dos campos da Stack Summary. O campo acaba ficando "Adiado".
- **(d) Fila e banco:** a 3.8 oferece "pg-boss / BullMQ (Node.js)" sem considerar o banco da 3.3. No Lava Jato, isso gerou incoerência primeiro com SQLite e depois com SQL Server, e a checagem de coerência não tem essa combinação.
- **Documento de arquitetura:** a arquitetura decidida na entrevista fica espalhada entre a seção "Architecture" do `project.md`, o `project-setup.md` e as ADRs. Não existe um documento único que mostre componentes, comunicação, dados e deploy, com um diagrama, para quem chega ao projeto.

## What Changes

- **(b)** O init passa a **acrescentar** a orientação de E2E ao `operations.apply.guidance`:
  - com a 5.5 em "Não aplicável", o roteiro de verificação em navegador, como hoje;
  - com um framework na 5.5, "cobrir os cenários de interface com testes E2E no framework escolhido".
- **(c)** O bloco 7 ganha a pergunta **7.3 — Idioma do código**, com opções. A 7.2 passa a cobrir também os campos de Development Conventions que nenhuma resposta preencheu.
- **(d)** As opções da 3.8 passam a ser por tipo de fila, com exemplos por banco e linguagem. Uma nota pede exemplos compatíveis com a 3.1 e a 3.3. A checagem de coerência ganha a linha "biblioteca de fila presa a um banco diferente do da 3.3".
- **Documento de arquitetura:** o init passa a gerar `<root>/openspec/arquitetura.md`, montado a partir dos blocos 1 a 6. A seção "Architecture" do `project.md` gerado resume e aponta para ele. Os próximos passos do init pedem para revisá-lo e mantê-lo em dia quando uma ADR mudar a arquitetura.
- **Cópia da raiz** regenerada pelo `sync-root.mjs`; **CI** confere a presença do trecho do `arquitetura.md` e da 7.3 no `init.md`.
- **Versão:** `1.4.0`. Pelo semver da ADR-0004, um artefato novo gerado pelo init é uma funcionalidade.

### Fora do escopo

- Atualizar o `arquitetura.md` automaticamente no archive das changes.
- Gerar o `arquitetura.md` em projetos já inicializados. O CHANGELOG traz a orientação para pedir ao agente que o gere a partir do `project-setup.md`.
- Revisar as demais perguntas da entrevista.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `project-initialization`: orientação de E2E acrescentada ao config, pergunta do idioma do código, opções de fila compatíveis com o banco e geração do documento de arquitetura.

## Impact

- **Comandos:** `padrao-openspec/.claude/commands/opsx/init.md` e a cópia gerada da raiz. Os projetos recebem o arquivo pelo PR de atualização.
- **Template:** `padrao-openspec/openspec/project.md` (a seção "Architecture" aponta para o `arquitetura.md`).
- **CI:** `.github/workflows/validate.yml` (checagens do `init.md`).
- **Versão:** `padrao-openspec/VERSION` e `CHANGELOG.md`.
- **Riscos:**
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - **Compatibilidade:** sem quebra. Arquivos de respostas pré-preenchidas com a 3.8 antiga continuam válidos como "Outro"; a numeração das opções muda, o que o CHANGELOG registra.

## Aprovação

- Responsável: gilmar campelo
- Data: 2026-10-22
- Escopo: archive
- Condições: versão 1.4.0; CI passar; em seguida, PR, merge e release `v1.4.0` com o `comecar.mjs` anexado
- Origem: "Aprovo a change ajustes-do-init-e-arquitetura para archive, versão 1.4.0, com PR, merge e release, se a CI passar"
