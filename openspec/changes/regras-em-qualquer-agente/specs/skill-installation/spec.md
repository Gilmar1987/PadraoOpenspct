# Spec Delta

## ADDED Requirements

### Requirement: Regras do padrão entregues ao código

O instalador SHALL entregar ao repositório de código as regras globais do padrão como o arquivo gerenciado `docs/openspec-regras.md`, idêntico a `padrao-openspec/openspec/rules.md` da versão instalada, e listá-lo em `managedFiles` do manifesto.

#### Scenario: Primeira instalação

- **WHEN** o setup instala o padrão num repositório de código novo
- **THEN** o código tem `docs/openspec-regras.md` igual ao `rules.md` do padrão, e o manifesto o lista

### Requirement: Blocos gerenciados nos arquivos de instrução dos agentes

O instalador SHALL manter, em `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md` e `.amazonq/rules/openspec-padrao.md`, um bloco delimitado por `<!-- BEGIN:openspec-padrao -->` e `<!-- END:openspec-padrao -->` que manda ler `docs/openspec-regras.md` e explica como seguir os comandos `/opsx:*`. Fora dos marcadores, o instalador MUST NOT alterar esses arquivos.

#### Scenario: AGENTS.md com conteúdo de outro gerador

- **WHEN** o código já tem um `AGENTS.md` com o bloco `nextjs-agent-rules` e o instalador roda
- **THEN** o `AGENTS.md` mantém o bloco do Next.js byte a byte e ganha, no fim, o bloco `openspec-padrao`

#### Scenario: Arquivo de instrução ausente

- **WHEN** o código não tem `CLAUDE.md`
- **THEN** o instalador cria o `CLAUDE.md` só com o bloco `openspec-padrao`, que importa o `AGENTS.md`

#### Scenario: Atualização do padrão

- **WHEN** o instalador roda com `--update` sobre um código que já tem o bloco de uma versão anterior
- **THEN** só o conteúdo entre os marcadores muda, sem duplicar o bloco, e a mudança entra no commit da atualização

#### Scenario: Reinstalação sem mudanças

- **WHEN** o instalador roda duas vezes seguidas da mesma versão
- **THEN** os arquivos de instrução não mudam na segunda execução
