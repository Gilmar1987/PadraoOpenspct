## ADDED Requirements

### Requirement: Guarda do clone do store em qualquer agente

Cada comando `.claude/commands/opsx/*.md` e cada skill `openspec-*` SHALL ter uma guarda para qualquer agente, inclusive o Claude Code com o comando expandido: se a pasta do `.claude/` do arquivo (ou a da sessão) tiver `padrao-openspec/.openspec-store/store.yaml` ou `.openspec-store/store.yaml`, o agente MUST parar antes de qualquer passo, sem gravar nada, e SHALL pedir a pasta do código com `store: <id>`, o `<id>` do `store.yaml`.

#### Scenario: Copilot no clone do store

- **WHEN** o Copilot é aberto em `C:\teste\socker-openspec`, que tem `padrao-openspec/.openspec-store/store.yaml` com `id: socker`, e segue `.claude/commands/opsx/init.md` a pedido do dev
- **THEN** o agente para antes da entrevista, não grava nenhum arquivo, diz que a pasta é o clone do store `socker` e pede para abrir a pasta do código que tem `store: socker` no `openspec/config.yaml`

#### Scenario: Claude Code no clone do store

- **WHEN** o Claude Code é aberto na pasta do clone do store, o dev digita `/opsx:propose` e o comando é expandido normalmente
- **THEN** o agente para antes de criar a change e pede para abrir a pasta do código

#### Scenario: Pasta padrao-openspec do clone

- **WHEN** o agente é aberto em `C:\teste\socker-openspec\padrao-openspec`, que tem `.claude/commands/opsx/` e `.openspec-store/store.yaml` com `id: socker`, e segue um comando `/opsx`
- **THEN** o agente para sem gravar nada e pede para abrir a pasta do código que tem `store: socker`

#### Scenario: Pasta do código

- **WHEN** o agente está na pasta do código, que tem `.openspec-padrao.json` e não tem `padrao-openspec/.openspec-store/` nem `.openspec-store/`
- **THEN** a guarda do clone do store não interfere

#### Scenario: Repositório do padrão

- **WHEN** o agente está no repositório do PadraoOpenspct, que tem `padrao-openspec/` sem `.openspec-store/` e não tem `.openspec-store/` na raiz
- **THEN** a guarda do clone do store não interfere

### Requirement: Regras param no clone do store

As regras do padrão e o bloco de agentes SHALL dizer que, em qualquer agente, na pasta do clone de um store (com `padrao-openspec/.openspec-store/store.yaml`) ou na pasta `padrao-openspec/` dele (com `.openspec-store/store.yaml`), o agente MUST NOT seguir os fluxos `/opsx` nem gravar nada em `openspec/`, e SHALL pedir para abrir a pasta do código que declara o store.

#### Scenario: Agente que lê só as regras

- **WHEN** um agente aberto no clone do store lê as regras e o dev pede "inicialize o projeto"
- **THEN** o agente não grava nada e pede para abrir a pasta do código
