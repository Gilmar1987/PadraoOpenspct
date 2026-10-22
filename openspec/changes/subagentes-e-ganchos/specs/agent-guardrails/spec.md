# Spec Delta

## Purpose

Define os papéis de agente do Claude Code distribuídos pelo padrão, com as ferramentas e o modelo de cada um, os hooks que cobram as regras do fluxo e as permissões gerenciadas.

## ADDED Requirements

### Requirement: Subagentes por papel com ferramentas restritas

O padrão SHALL distribuir um subagente do Claude Code para cada papel do fluxo em `.claude/agents/openspec-<papel>.md`, cada um com `tools` e `model` declarados. Os papéis de análise e de veredito (arquiteto de spec, planejador de tarefas, guardião de consistência, ingestor de requisitos, validador de QA, revisor de etapa e revisor de código) MUST NOT ter `Edit` nem `Write`, e devolvem veredito com evidência, sem corrigir.

#### Scenario: Revisor de código sem escrita

- **WHEN** o apply despacha o `openspec-code-reviewer` para revisar o intervalo de commits da change
- **THEN** o subagente lê o diff e devolve os achados, e não tem ferramenta para editar arquivos

#### Scenario: Paridade com os agentes do Copilot

- **WHEN** o padrão tem um agente do Copilot em `.github/agents/<papel>.agent.md`
- **THEN** existe o subagente correspondente em `.claude/agents/`, e a CI falha se faltar um deles

### Requirement: Revisor de etapa que reporta só as falhas

O subagente `openspec-stage-reviewer` SHALL rodar os comandos da seção "Comandos de verificação" do `project.md` que se aplicam à change e devolver, para cada um, o comando, o código de saída e só as linhas da falha, ou "passou". Um comando registrado como ausente ou adiado MUST ser devolvido como não verificado, com o motivo.

#### Scenario: Suíte com uma falha

- **WHEN** o revisor de etapa roda os testes e o lint, e um teste falha
- **THEN** ele devolve o lint como "passou" e, para os testes, o comando, o código de saída e as linhas do teste que falhou, sem a saída inteira

### Requirement: Hooks de papel durante o subagente

Os subagentes de veredito que têm `Bash` SHALL declarar no frontmatter um hook `PreToolUse` que nega comandos de escrita: redirecionamento para arquivo, `tee`, edição in-place, interpretador inline, `git commit`, `git push`, `git reset`, `rm` e `mv`. O implementador SHALL declarar um hook que nega a escrita fora do repositório e nos arquivos gerenciados pelo padrão. A documentação MUST dizer que esses hooks são heurísticas, e não uma fronteira de segurança.

#### Scenario: Validador tenta gravar arquivo

- **WHEN** o `openspec-qa-validator` tenta rodar `echo ok > resultado.txt`
- **THEN** o hook nega o comando e explica que o papel é somente leitura

#### Scenario: Implementador tenta editar arquivo gerenciado

- **WHEN** o `openspec-code-implementer` tenta editar `.claude/settings.json` ou `docs/openspec-regras.md`
- **THEN** o hook nega a escrita, citando que o arquivo pertence ao padrão

#### Scenario: Comando de leitura liberado

- **WHEN** um subagente de veredito roda `git diff` ou o comando de testes do `project.md`
- **THEN** o hook não interfere

### Requirement: Tarefa marcada exige evidência antes do fim do turno

Um hook de `Stop` SHALL recusar o fim do turno uma vez quando uma change ativa tiver tarefa marcada sem a linha `Evidência:` logo abaixo, listando as tarefas. Com `stop_hook_active` verdadeiro, o hook MUST liberar. Uma falha de ambiente (CLI ausente, store não resolvido) MUST liberar com um aviso, sem bloquear.

#### Scenario: Tarefa sem evidência

- **WHEN** o agente marca a tarefa 2.1 e tenta encerrar o turno sem a linha `Evidência:`
- **THEN** o turno não encerra, e o agente recebe "add-login: 2.1" como motivo

#### Scenario: Segunda tentativa

- **WHEN** o hook já bloqueou e o agente tenta encerrar de novo (`stop_hook_active` verdadeiro)
- **THEN** o turno encerra

### Requirement: Archive pelo portão

Um hook `PreToolUse` de `Bash|PowerShell` SHALL interceptar `openspec archive <change>`. Quando o portão neutro `docs/openspec-portao.mjs` existir, o hook MUST rodá-lo com `archive <change>` e negar o comando se o portão não liberar, mostrando os motivos. Sem o portão, o hook MUST pedir confirmação ao usuário. Outros comandos MUST passar sem interferência.

#### Scenario: Archive sem verificação

- **WHEN** o agente roda `openspec archive add-login` e o portão sai com 1, citando "verification.md ausente"
- **THEN** o comando é negado com esse motivo

#### Scenario: Projeto sem portão

- **WHEN** o código não tem `docs/openspec-portao.mjs` e o agente roda `openspec archive add-login`
- **THEN** o Claude Code pede a confirmação do usuário antes de rodar

### Requirement: Permissões gerenciadas de publicação

O padrão SHALL configurar `ask` para `git push`, `gh pr create`, `gh release` e `openspec archive`, e `deny` para `git push --force`, `git push -f` e `git reset --hard`, sem acrescentar nada em `allow`.

#### Scenario: Push pedido pelo agente

- **WHEN** o agente tenta `git push origin feat/x`
- **THEN** o Claude Code pede a confirmação do usuário

#### Scenario: Push forçado

- **WHEN** o agente tenta `git push --force origin main`
- **THEN** o comando é negado
