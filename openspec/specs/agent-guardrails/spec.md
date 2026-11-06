# agent-guardrails Specification

## Purpose

Define os papéis de agente do Claude Code distribuídos pelo padrão, com as ferramentas e o modelo de cada um, os hooks que cobram as regras do fluxo e as permissões gerenciadas.

## Requirements

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

Para as chamadas feitas pelos subagentes de veredito que têm shell, um hook `PreToolUse` SHALL negar comandos de escrita: redirecionamento para arquivo, `tee`, edição in-place, interpretador inline, `git commit`, `git push`, `git reset`, `rm` e `mv`. Para as chamadas do implementador, um hook SHALL negar a escrita fora do repositório e nos arquivos gerenciados pelo padrão. A documentação MUST dizer que esses hooks são heurísticas, e não uma fronteira de segurança.

#### Scenario: Validador tenta gravar arquivo

- **WHEN** o `openspec-qa-validator` tenta rodar `echo ok > resultado.txt`
- **THEN** o hook nega o comando e explica que o papel é somente leitura

#### Scenario: Implementador tenta editar arquivo gerenciado

- **WHEN** o `openspec-code-implementer` tenta editar `.claude/settings.json` ou `docs/openspec-regras.md`
- **THEN** o hook nega a escrita, citando que o arquivo pertence ao padrão

#### Scenario: Comando de leitura liberado

- **WHEN** um subagente de veredito roda `git diff` ou o comando de testes do `project.md`
- **THEN** o hook não interfere

### Requirement: Hooks de papel restritos ao papel

Os hooks de papel SHALL agir só nas chamadas dos subagentes do seu papel, identificados pelo campo `agent_type` da entrada do hook, e MUST NOT interferir nas chamadas do agente principal nem dos outros subagentes.

#### Scenario: Agente principal não é afetado

- **WHEN** o agente principal roda `echo ok > notas.txt` ou edita `src/app.ts`
- **THEN** os hooks de papel não interferem

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

### Requirement: Estado do fluxo no início da sessão

Quando o repositório de código tiver o portão do padrão, o hook de início de sessão SHALL entregar ao agente o estado das changes ativas (progresso, aprovação, selo, inferências pendentes e próximo passo) sem bloquear a sessão. Sem o portão, ou se o portão falhar, o hook MUST NOT interferir.

#### Scenario: Change aprovada no meio do apply

- **WHEN** a sessão começa com uma change aprovada para apply e 3 de 7 tarefas marcadas
- **THEN** o contexto inicial do agente cita a change, o progresso 3/7, a aprovação e o próximo passo `/opsx:apply`

#### Scenario: Projeto sem portão

- **WHEN** a sessão começa num repositório sem `docs/openspec-portao.mjs`
- **THEN** o hook não acrescenta nada e a sessão começa normalmente

### Requirement: Ganchos do Git não podem ser desligados pelo agente

O hook de proteção SHALL negar, para o agente principal e para os subagentes, comandos `git` com `--no-verify`, `git commit` com a opção `-n` e qualquer escrita de `core.hooksPath`. A leitura de `core.hooksPath` MUST NOT ser negada.

#### Scenario: Commit pulando o hook

- **WHEN** o agente roda `git commit --no-verify -m "fix"`
- **THEN** o hook nega o comando e explica que o hook `commit-msg` do padrão não pode ser pulado

#### Scenario: Consulta da configuração

- **WHEN** o agente roda `git config --get core.hooksPath`
- **THEN** o comando é liberado

### Requirement: Escrita fora do fluxo pede confirmação

Quando um agente for editar ou criar um arquivo do repositório fora de `openspec/` e não existir nenhuma change ativa aprovada, sem selo vencido e sem inferência pendente, o hook de escrita SHALL pedir a confirmação do usuário, explicando a regra do padrão. Com uma change nessas condições, a escrita MUST seguir sem pergunta.

#### Scenario: Correção direta sem change

- **WHEN** não há change ativa aprovada e o agente vai editar `src/app.ts`
- **THEN** o Claude Code pede a confirmação do usuário, citando que toda correção passa por uma change

#### Scenario: Planejamento sem change aprovada

- **WHEN** o agente escreve `openspec/changes/nova/proposal.md` sem nenhuma change aprovada
- **THEN** o hook não interfere

### Requirement: Guarda da pasta da sessão nos fluxos

Cada arquivo de comando `.claude/commands/opsx/*.md` e cada skill `openspec-*` do padrão SHALL começar com uma guarda: quando o Claude Code leu esse arquivo à mão porque o comando digitado no início da mensagem (com ou sem argumentos) chegou como texto, ou porque a skill não estava disponível, ele MUST parar antes de qualquer passo, MUST NOT seguir o arquivo e SHALL pedir para abrir numa janela nova a pasta que contém o `.claude/`, mostrando o caminho.

#### Scenario: Arquivo de comando lido à mão da subpasta

- **WHEN** a sessão do Claude Code está em `C:\projetos\clinica`, o `/opsx:propose` não carregou e o agente abre `C:\projetos\clinica\clinica-app\.claude\commands\opsx\propose.md`
- **THEN** o agente para na guarda, não cria change nem artefato e pede para abrir `C:\projetos\clinica\clinica-app` numa janela nova

#### Scenario: Claude Code aberto na pasta acima do código

- **WHEN** o Claude Code foi aberto em `C:\projetos\clinica`, o dev digita `/opsx:init` e o comando chega como texto, porque `.claude/commands/opsx/` só existe em `C:\projetos\clinica\clinica-app`
- **THEN** o agente não segue o `init.md` à mão, diz que a sessão está fora da pasta do código e pede para abrir `C:\projetos\clinica\clinica-app` numa janela nova

### Requirement: Guarda que não dispara fora da pasta errada

A guarda MUST NOT mudar o fluxo no texto expandido pelo Claude Code, num subagente despachado pela sessão principal, na leitura ou edição do arquivo como arquivo, nem num agente que não é o Claude Code. Com o pedido da etapa pelo nome ou pelo caminho do arquivo, ou com o comando depois de outro texto, ela MUST NOT acusar pasta errada e SHALL pedir o reenvio do comando no início de uma mensagem nova.

#### Scenario: Sessão na pasta do código

- **WHEN** a sessão do Claude Code está na pasta que contém o `.claude/` e o dev digita `/opsx:propose`
- **THEN** a guarda não interfere e o propose segue normalmente

#### Scenario: Subagente segue o fluxo

- **WHEN** a sessão principal, na pasta do código, despacha o subagente de implementação, que lê `openspec-apply-change/SKILL.md` à mão para seguir o apply
- **THEN** a guarda não interfere e o subagente segue o fluxo

#### Scenario: Agente que não é o Claude Code

- **WHEN** o Copilot, aberto na pasta do código, segue `.claude/commands/opsx/verify.md` a pedido do dev
- **THEN** a guarda não interfere

### Requirement: Proteções conferidas antes do apply, do verify e do archive

Quando o repositório de código tiver o portão (`docs/openspec-portao.mjs`), o Claude Code SHALL conferir, antes do primeiro passo do apply, do verify e do archive, se o contexto da sessão traz "Estado do fluxo OpenSpec", entregue pelo hook de início de sessão. Sem esse contexto, o agente MUST parar, SHALL dizer que os hooks do padrão não estão ativos nesta sessão e o que fica sem proteção, e SHALL mostrar como reabrir a sessão na pasta do código. Sem o portão, a conferência MUST NOT rodar.

#### Scenario: Hooks desligados no apply

- **WHEN** o dev aprova e digita `/opsx:apply` numa sessão cujo contexto não traz "Estado do fluxo OpenSpec", num código com `docs/openspec-portao.mjs`
- **THEN** o agente não roda o portão do apply nem escreve código, diz que os hooks estão desligados e mostra como abrir a pasta do código numa janela nova

#### Scenario: Sessão com o contexto do hook

- **WHEN** o contexto da sessão traz "Estado do fluxo OpenSpec" e o dev digita `/opsx:verify`
- **THEN** a conferência passa sem mensagem e o verify segue

#### Scenario: Projeto sem portão

- **WHEN** o código não tem `docs/openspec-portao.mjs` e o dev digita `/opsx:archive`
- **THEN** a conferência não roda e o archive segue como hoje

### Requirement: Conferência das proteções sem falso alarme

Um subagente que a sessão principal despachou para a etapa MUST NOT rodar a conferência das proteções: a sessão principal já a fez, e o contexto do hook de início vai só para ela. Para separar os casos, o agente SHALL rodar `node docs/openspec-portao.mjs estado --json`, o mesmo comando do hook. Se ele sair com 0, os hooks não rodaram. Se ele falhar ou passar de 20 segundos, o agente SHALL mostrar o erro e dizer que o hook não conseguiu ler o estado, sem mandar reabrir a sessão.

#### Scenario: Subagente de implementação

- **WHEN** a sessão principal passou pela conferência e despacha o subagente de implementação, que lê o `SKILL.md` do apply
- **THEN** o subagente não roda a conferência e segue as tarefas

#### Scenario: Hook sem resposta

- **WHEN** o contexto não traz "Estado do fluxo OpenSpec" e `node docs/openspec-portao.mjs estado --json` falha com erro de ambiente
- **THEN** o agente para, mostra o erro do portão e não diz que a sessão está na pasta errada

### Requirement: Etapa sem os hooks só por decisão do responsável

Depois da parada por falta do contexto do hook de início, o agente MUST seguir a etapa só se o responsável decidir, nessa conversa, continuar sem os hooks. Ele SHALL registrar essa decisão, citada, na evidência da etapa: na primeira tarefa marcada do apply, no `verification.md` do verify ou no item `Archive:` do archive.

#### Scenario: Responsável decide seguir sem os hooks

- **WHEN** o agente parou por falta do contexto e o responsável escreve "siga sem os hooks nesta etapa"
- **THEN** o agente segue a etapa e registra a frase do responsável na evidência

#### Scenario: Responsável não decide

- **WHEN** o agente parou por falta do contexto e o responsável só repete `/opsx:apply`
- **THEN** o agente continua parado e mostra de novo como reabrir a sessão ou como decidir seguir sem os hooks

### Requirement: Ganchos executáveis por qualquer agente

Cada entrada de gancho do padrão no `.claude/settings.json` SHALL ser um comando único em texto, sem o campo `args`, que rode igual no Git Bash, no PowerShell e no cmd. O `node` acha o script do gancho pela variável de ambiente `CLAUDE_PROJECT_DIR` ou, sem ela, pela pasta atual. Um agente que execute o `command` das entradas desse arquivo SHALL rodar o gancho do padrão com o payload que recebe na entrada.

#### Scenario: Gancho no Claude Code

- **WHEN** o Claude Code, aberto na pasta do código, roda `git commit --allow-empty --no-verify -m teste`
- **THEN** o gancho do padrão nega o comando, citando o hook commit-msg

#### Scenario: Comando de leitura no Copilot CLI

- **WHEN** o Copilot CLI, aberto na pasta do código com o `.claude/settings.json` do padrão, roda `openspec context --json`
- **THEN** o comando roda, sem a negação "hook errored"

#### Scenario: Negação no Copilot CLI

- **WHEN** o Copilot CLI, aberto na pasta do código, roda `git commit --allow-empty --no-verify -m teste`
- **THEN** o gancho do padrão nega o comando, citando o hook commit-msg

#### Scenario: Gancho rodado pelo Git Bash

- **WHEN** a CI roda cada entrada do template pelo `command`, sem `args`, num Git Bash com a variável `CLAUDE_PROJECT_DIR` definida e fora da pasta do projeto, com um payload simulado
- **THEN** cada gancho dá a mesma resposta que dá quando chamado com o caminho do script

#### Scenario: Gancho rodado pelo PowerShell

- **WHEN** a CI no Windows roda cada entrada do template pelo `command`, sem substituir o texto, no PowerShell, com a variável `CLAUDE_PROJECT_DIR` e também sem ela, na pasta do projeto
- **THEN** cada gancho dá, nos dois casos, a mesma resposta que dá quando chamado com o caminho do script

### Requirement: Falha interna do gancho não bloqueia o agente

Um gancho do padrão que encontra um erro interno não tratado SHALL terminar com código 0 e escrever um aviso na saída de erro com o nome do gancho. Negar ou pedir confirmação MUST acontecer só pela resposta JSON do gancho, nunca por um código de saída diferente de 0.

#### Scenario: Exceção dentro do gancho

- **WHEN** um gancho do padrão lança uma exceção não tratada ao processar a chamada
- **THEN** ele sai com código 0, a saída de erro cita o gancho, e a chamada segue sem checagem

#### Scenario: Negação continua negando

- **WHEN** o gancho de ganchos do Git recebe `git commit --no-verify -m x`
- **THEN** ele responde a negação em JSON e sai com código 0

### Requirement: Suporte dos ganchos declarado por agente

O guia do padrão e o `COMECE-AQUI.md` SHALL dizer, para cada agente da tabela "Usar com outros agentes", se os ganchos do padrão foram verificados nele. Um agente só SHALL constar como verificado depois de um roteiro real registrado no `verification.md` de uma change. Os demais constam como "regras e portão; ganchos não verificados".

#### Scenario: Agente sem roteiro

- **WHEN** o dev consulta a tabela de agentes do guia para o Cursor
- **THEN** a linha diz "regras e portão; ganchos não verificados"

#### Scenario: Agentes verificados

- **WHEN** o dev consulta a tabela de agentes do guia para o Claude Code e para o GitHub Copilot
- **THEN** as duas linhas dizem que os ganchos foram verificados, com a versão do agente usada no roteiro
