# Proposal

## Why

No teste de 2026-11-05 (projeto `socker`, padrão v1.18.0), o Copilot CLI travou na pasta do código, e o dev abriu a pasta do store, `socker-openspec`. Essa pasta é um clone do PadraoOpenspct. A raiz dela tem `.claude/commands/opsx/` e um `openspec/` próprios, que são do desenvolvimento do padrão, e o store real fica em `padrao-openspec/`. O Copilot seguiu o `init.md` dessa raiz, o `openspec context` resolveu a raiz do clone, e o init gravou o projeto inteiro em `openspec/` do padrão: `project.md`, `config.yaml` e as ADRs 0010 a 0020.

A guarda da pasta da sessão, entregue na v1.18.0, não pegou o caso por dois motivos:

- ela vale só para o Claude Code;
- ela compara a pasta da sessão com a pasta que tem o `.claude/`, e no clone as duas são a mesma.

O mesmo engano acontece com o Claude Code aberto no clone: os comandos `/opsx:*` do clone carregam normalmente.

## What Changes

- **Guarda do clone do store, para qualquer agente:** os 10 comandos `.claude/commands/opsx/*.md` e as 7 skills `openspec-*` ganham, antes da guarda da pasta da sessão, um parágrafo que vale para qualquer agente, inclusive o Claude Code com o comando expandido.
  - **Quando dispara:** a pasta que contém o `.claude/` do arquivo (ou, sem esse caminho, a pasta da sessão) tem `padrao-openspec/.openspec-store/store.yaml`, na raiz do clone, ou `.openspec-store/store.yaml`, na pasta `padrao-openspec/` do clone, que também tem `.claude/commands/opsx/`. Esse arquivo marca o clone de um store registrado.
  - **O que o agente faz:** para antes de qualquer passo, sem gravar nada em lugar nenhum, e diz que a pasta é do clone do store `<id>`, lido do `store.yaml`. Depois pede para abrir a pasta do código, a que tem `openspec/config.yaml` com `store: <id>`. Num projeto criado pelo `comecar.mjs`, ela fica ao lado, com o nome sem o sufixo `-openspec`.
  - **Quando não dispara:** na pasta do código, no repositório do próprio padrão, que não tem `.openspec-store`, e na leitura ou edição do arquivo como arquivo.
- **Regras e bloco de agentes:** o `padrao-openspec/openspec/rules.md`, com a cópia da raiz pelo `sync-root.mjs`, e o bloco de agentes (`templates/agents-block.md`) passam a dizer a mesma coisa, com a proibição de gravar qualquer coisa em `openspec/`, e não só specs, changes e ADRs, porque o init do `socker` gravou também `project.md` e `config.yaml`. Assim, um agente que leia só as regras também para no clone.
- **CI:** o passo "Trechos customizados das skills" passa a exigir o parágrafo nos 17 arquivos, antes da guarda da pasta da sessão, e a frase nas regras e no bloco de agentes, com "em qualquer agente". O job `root` falha se o repositório do padrão tiver `padrao-openspec/.openspec-store/`.
- **Documentação:** o parágrafo "Outros agentes" do `COMECE-AQUI.md` diz que os fluxos param no clone do store em qualquer agente, com a ressalva de que clones criados antes desta versão não têm a guarda na raiz.
- **Verificação real:**
  - um roteiro com `claude -p` num clone de teste, com `store.yaml`, confere que o Claude Code para;
  - o responsável roda o mesmo pedido no Copilot do VS Code.
- **Versão do padrão:** item na seção 1.19.0, que já está aberta, sem mexer no `VERSION`.

### Fora do escopo

- Mudar o `comecar.mjs` para o clone do store não ter `.claude/commands` nem `openspec/` na raiz: essa é a frente B, mais estrutural, depois da change 2 da adoção, que mexe no `comecar.mjs`. Esta change só faz os fluxos pararem quando a pasta é o clone.
- Mudar o `openspec context` ou o CLI do OpenSpec: o padrão não controla o CLI.
- Recuperar projetos já gravados na raiz de um clone, como o `socker-openspec`, que era descartável.
- Atualizar a raiz de clones do store criados antes desta versão: a `main` do clone não tem upstream, e o `git pull` não funciona. Fica com a frente B.
- Um gancho ou script que confira a pasta por mecanismo: a guarda é texto lido pelo agente, como a da v1.18.0, porque a raiz do clone não tem `.claude/settings.json` e nenhum gancho do padrão roda nela.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `agent-guardrails`: os fluxos `/opsx` param no clone do store, em qualquer agente.
- `continuous-validation`: a CI protege o texto da guarda do clone do store.

## Impact

- **Comandos e skills:** os 10 arquivos de `padrao-openspec/.claude/commands/opsx/` e as 7 skills `padrao-openspec/.claude/skills/openspec-*/SKILL.md`, só no parágrafo novo perto do topo, com as cópias da raiz em `.claude/` pelo `sync-root.mjs`. A change 2 da adoção, da outra sessão, mexe na seção "Modo adoção" do `init.md`, que é outro trecho.
- **Regras:** `padrao-openspec/openspec/rules.md`, com a cópia `openspec/rules.md` pelo `sync-root.mjs`, e `padrao-openspec/templates/agents-block.md`.
- **CI:** `.github/workflows/validate.yml`, passo "Trechos customizados das skills": um bloco novo logo depois do bloco da guarda da pasta da sessão. A change 2 mexe no bloco "# Modo adoção" do mesmo passo.
- **Documentação:** `COMECE-AQUI.md` (parágrafo "Outros agentes") e `CHANGELOG.md` (item na 1.19.0).
- **Dependências:** nenhuma.
- **Riscos:**
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - Falso alarme: a guarda depende de `padrao-openspec/.openspec-store/store.yaml`. Esse arquivo só existe no clone de um store registrado: o repositório do padrão e a pasta do código não o têm.
  - Guarda que o agente ignora: é texto, como a guarda da v1.18.0. O roteiro com o Copilot confere que ele a segue.
- **Interface com outros sistemas:** não se aplica.
- **Débitos:** o repositório não tem `openspec/estado-atual.md`.
- **Falhas aceitas:** o repositório não tem `openspec/estado-atual.md`, então a seção não existe.
- **Changes concorrentes:** `adocao-inspecao-e-confirmacao`, da outra sessão, no worktree `ProjetoOpenspct-adocao-inspecao-e-confirmacao`. O CLI não lista essa change daqui.
  - Arquivos em comum: `init.md` (ela mexe em "Modo adoção" e esta no parágrafo do topo), o passo "Trechos customizados das skills" (em blocos diferentes), o `COMECE-AQUI.md` (em seções diferentes) e o `CHANGELOG.md` (os dois acrescentam itens na 1.19.0).
  - Ordem sugerida: quem entrar por último na `main` rebaseia, como combinado com a outra sessão.

## Aprovação

- Responsável: Gilmar Campelo
- Data: 2026-11-06
- Escopo: apply
- Condições: —
- Conteúdo: sha256:55a47df6b91dd882f9e67544c0dcfb7e94af3345e30c06f019b856bcc6d52623
- Origem: "Eu aprovo fazer a implementação das correções da guarda do clone do store", seguida do comando `/opsx:apply`
- Aprovação anterior: Gilmar Campelo, 2026-11-06, apply; Condições: —; Origem: "Eu aprovo fazer a implementação da guarda da pasta da sessão para qualquer agente", seguida do comando `/opsx:apply`; Conteúdo: sha256:e0843e29b7fb286d1955140d115899f24279d6a7fbd345612dcf5f7d6d197a65
- Archive: 2026-11-06; Origem: "Eu aprovo fazer o archive da guarda da pasta da sessão para qualquer agente, com PR; o merge fica comigo", seguida do comando `/opsx:archive`
