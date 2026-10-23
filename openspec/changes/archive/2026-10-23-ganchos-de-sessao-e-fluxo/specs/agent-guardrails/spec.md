# Spec Delta

## ADDED Requirements

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
