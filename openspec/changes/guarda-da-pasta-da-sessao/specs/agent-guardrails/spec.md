## ADDED Requirements

### Requirement: Guarda da pasta da sessão nos fluxos

Cada arquivo de comando `.claude/commands/opsx/*.md` e cada skill `openspec-*` do padrão SHALL começar com uma guarda: quando o agente é o Claude Code e a pasta onde a sessão foi aberta não é a pasta que contém esse `.claude/`, ele MUST parar antes de qualquer passo do fluxo, MUST NOT seguir o arquivo à mão e SHALL pedir para abrir a pasta que contém o `.claude/` numa janela nova, mostrando o caminho. Na pasta certa, ou num agente sem suporte a comandos, a guarda MUST NOT mudar o fluxo.

#### Scenario: Arquivo de comando lido à mão da subpasta

- **WHEN** a sessão do Claude Code está em `C:\projetos\clinica` e o agente abre `C:\projetos\clinica\clinica-app\.claude\commands\opsx\propose.md`
- **THEN** o agente para na guarda, não cria change nem artefato e pede para abrir `C:\projetos\clinica\clinica-app` numa janela nova

#### Scenario: Sessão na pasta do código

- **WHEN** a sessão do Claude Code está na pasta que contém o `.claude/` e o dev digita `/opsx:propose`
- **THEN** a guarda não interfere e o propose segue normalmente

#### Scenario: Agente sem comandos

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

### Requirement: Etapa sem os hooks só por decisão do responsável

Depois da parada por falta do contexto do hook de início, o agente MUST seguir a etapa só se o responsável decidir, nessa conversa, continuar sem os hooks. Ele SHALL registrar essa decisão, citada, na evidência da etapa: na primeira tarefa marcada do apply, no `verification.md` do verify ou no item `Archive:` do archive.

#### Scenario: Responsável decide seguir sem os hooks

- **WHEN** o agente parou por falta do contexto e o responsável escreve "siga sem os hooks nesta etapa"
- **THEN** o agente segue a etapa e registra a frase do responsável na evidência

#### Scenario: Responsável não decide

- **WHEN** o agente parou por falta do contexto e o responsável só repete `/opsx:apply`
- **THEN** o agente continua parado e mostra de novo como reabrir a sessão ou como decidir seguir sem os hooks
