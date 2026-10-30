## ADDED Requirements

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
