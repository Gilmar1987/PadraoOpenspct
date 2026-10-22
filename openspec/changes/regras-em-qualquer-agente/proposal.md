# Proposal

## Why

O padrão funciona com qualquer stack, mas com agentes só em parte. Ao olhar o repositório de código do Lava Jato (2026-10-22), apareceram duas lacunas:

- **As regras globais não chegam ao código.** O `openspec/rules.md` (aprovação explícita, ciclo obrigatório, push só com pedido, segurança, disciplina de contexto) só é carregado automaticamente neste repositório. O instalador não entrega ao projeto nenhum `CLAUDE.md`, bloco no `AGENTS.md` ou stub que aponte para ele. Os comandos `/opsx:*` repetem as regras principais, mas uma conversa fora desses comandos não as recebe.
- **Cursor, Windsurf, Amazon Q, Copilot e Gemini não recebem nada no projeto.** Os stubs existem só aqui, e cada agente lê um arquivo de instrução diferente.

## What Changes

- **Fonte única das regras:**
  - o `openspec/rules.md` passa a ter a fonte em `padrao-openspec/openspec/rules.md`, com texto que serve a este repositório e aos projetos;
  - a cópia da raiz passa a ser gerada pelo `sync-root.mjs`;
  - o instalador entrega as regras ao código como `docs/openspec-regras.md`, um arquivo gerenciado.
- **Blocos gerenciados nos arquivos de instrução** ([ADR-0005](../../adrs/0005-regras-entregues-por-blocos-gerenciados.md), `Proposed`):
  - o instalador mantém, entre `<!-- BEGIN:openspec-padrao -->` e `<!-- END:openspec-padrao -->`, um bloco curto que manda ler `docs/openspec-regras.md` e explica como seguir os comandos `/opsx:*` em agentes que não os têm;
  - os arquivos cobertos são `AGENTS.md` (ponto de entrada comum), `CLAUDE.md` (com `@AGENTS.md`), `GEMINI.md`, `.github/copilot-instructions.md` e as regras de projeto de Windsurf e Amazon Q;
  - fora dos marcadores, nada é alterado: o bloco do Next.js no `AGENTS.md` do Lava Jato, por exemplo, fica intacto.
- **Guias:** o COMECE-AQUI e o `docs/openspec-padrao.md` ganham uma seção "Usar com outros agentes", com o que cada agente lê e como rodar o fluxo sem os comandos `/opsx:*`.
- **CI:** smoke tests dos blocos (criação, preservação do conteúdo fora dos marcadores, atualização sem duplicar) e o `sync-root --check` cobrindo o `rules.md`.
- **Versão:** `1.5.0`.

### Fora do escopo

- Testar o fluxo com outro agente dentro da CI. O teste com um segundo agente (por exemplo, o Copilot) fica como verificação manual depois da release.
- Converter os comandos `/opsx:*` para o formato de comandos de outros agentes.
- Mudar o conteúdo das regras além do necessário para servir aos dois contextos.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `skill-installation`: o instalador entrega as regras e mantém blocos gerenciados nos arquivos de instrução dos agentes.
- `source-sync`: o espelhamento passa a incluir o `openspec/rules.md`.

## Impact

- **Código:** `padrao-openspec/scripts/install-skills.mjs` e `padrao-openspec/scripts/sync-root.mjs`.
- **Fonte das regras:** `padrao-openspec/openspec/rules.md` (novo) e a cópia gerada `openspec/rules.md`.
- **Templates:** bloco gerenciado em `padrao-openspec/templates/` e seção nova no `openspec-padrao.md`.
- **Documentação:** `COMECE-AQUI.md`, `README.md`.
- **CI:** `.github/workflows/validate.yml`.
- **ADR:** `openspec/adrs/0005-regras-entregues-por-blocos-gerenciados.md` (`Proposed`), a promover a `Accepted` antes do archive.
- **Riscos:**
  - **Escrita em arquivos do projeto:** o instalador passa a editar `AGENTS.md`, `CLAUDE.md` e afins. Mitigação: só entre marcadores, com escrita atômica e smoke tests que conferem o conteúdo de fora.
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - **Compatibilidade:** projetos existentes recebem os arquivos e blocos novos pelo PR de atualização; nada do que já existe é removido.

## Aprovação

- Responsável: gilmar campelo
- Data: 2026-10-22
- Escopo: archive
- Condições: versão 1.5.0; ADR-0005 aprovada (promover a `Accepted`); CI passar; em seguida, PR, merge e release `v1.5.0` com o `comecar.mjs` anexado
- Origem: "Aprovo a change regras-em-qualquer-agente e a ADR-0005 para archive, versão 1.5.0, com PR, merge e release, se a CI passar"
