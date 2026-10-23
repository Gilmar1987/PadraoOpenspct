# Spec Delta

## ADDED Requirements

### Requirement: Aprovação presa ao conteúdo

Ao registrar uma aprovação, o fluxo SHALL gravar o item `Conteúdo: sha256:<hash>` calculado pelo comando `selo` do portão. Os portões `apply` e `archive` SHALL recalcular o selo e terminar com código 1 quando ele diferir do último `Conteúdo:` registrado. Uma aprovação sem `Conteúdo:` SHALL continuar valendo, com um aviso.

#### Scenario: Tarefa acrescentada depois da aprovação

- **WHEN** a aprovação registra um selo e, depois dela, uma tarefa nova entra no `tasks.md`
- **THEN** o portão `apply` termina com código 1 e diz que a aprovação venceu porque o conteúdo mudou

#### Scenario: Tarefa marcada no apply

- **WHEN** o apply marca uma tarefa e acrescenta a linha `Evidência:` dela
- **THEN** o selo não muda e o portão continua liberando

### Requirement: Reconfirmação depois de uma correção

Quando uma revisão que não muda o escopo alterar um artefato aprovado, o `/opsx:update` SHALL mostrar ao responsável o que mudou e pedir uma confirmação explícita. Com ela, SHALL acrescentar `Reconfirmação: <data>; Origem: "<palavras>"; Conteúdo: sha256:<novo>` à seção `## Aprovação`; sem ela, a aprovação continua vencida.

#### Scenario: Correção de redação confirmada

- **WHEN** o update corrige a redação de um cenário e o responsável confirma a correção no chat
- **THEN** a seção ganha o item `Reconfirmação` com o novo selo, e o portão volta a liberar

### Requirement: Inferência declarada bloqueia o apply

No propose, um fato atribuído ao usuário, ao negócio ou a um sistema externo que não veio do pedido, de um documento ou do código SHALL ser marcado `[INFERIDO: <base>]`. O portão `apply` SHALL terminar com código 1 enquanto algum artefato da change tiver essa marca, citando arquivo e linha.

#### Scenario: Limite de negócio inferido

- **WHEN** o design afirma que o desconto máximo é 20%, com a marca de inferência "prática comum de varejo", e ninguém confirmou
- **THEN** o portão `apply` termina com código 1 e cita o `design.md` e a linha da marca

## MODIFIED Requirements

### Requirement: Mudança de escopo zera a aprovação

Quando o `/opsx:update` revisar uma change aprovada de um jeito que muda o escopo (o "What Changes" do proposal, requisitos ou cenários das delta specs, ou tarefas acrescentadas ou retiradas), ele SHALL voltar a seção `## Aprovação` para `Pendente`, guardando a aprovação anterior numa linha "Aprovação anterior". Uma correção que não muda o escopo MUST NOT zerar a aprovação, mas pede a reconfirmação do selo.

#### Scenario: Requisito novo depois da aprovação

- **WHEN** o update acrescenta um requisito a uma change com `Responsável` preenchido
- **THEN** o proposal volta a `Responsável: Pendente`, mantém a aprovação anterior registrada, e o próximo `/opsx:apply` pede uma nova aprovação

#### Scenario: Correção de redação

- **WHEN** o update só corrige a redação de um cenário, sem mudar o que ele exige
- **THEN** a aprovação não volta a `Pendente`, e o update pede a reconfirmação do novo selo
