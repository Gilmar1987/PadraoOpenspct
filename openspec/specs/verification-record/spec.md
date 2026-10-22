# verification-record Specification

## Purpose

Garante que o resultado de cada execução do `/opsx:verify` fique registrado na própria change, de forma curta e legível por máquina, para auditoria e para as métricas de qualidade.

## Requirements

### Requirement: Gravação do registro de verificação

Ao terminar o relatório, o `/opsx:verify` SHALL gravar ou atualizar o arquivo `verification.md` na pasta da change. O registro SHALL conter a data, as contagens de críticos, warnings e sugestões, a lista de checagens não verificadas com o motivo, a cobertura fora da suíte, a avaliação final em uma linha, uma linha curta por item apontado e cada comando executado ou reaproveitado com o resultado. O registro MUST NOT copiar o relatório completo.

#### Scenario: Verify sem problemas

- **WHEN** o `/opsx:verify` termina sem críticos, warnings ou sugestões
- **THEN** a pasta da change tem `verification.md` com a data do dia, críticos 0, warnings 0 e sugestões 0

#### Scenario: Verify com checagem não verificada

- **WHEN** o `/opsx:verify` termina com uma checagem marcada como não verificada
- **THEN** o `verification.md` lista essa checagem com o motivo

#### Scenario: Verify com sugestões

- **WHEN** o `/opsx:verify` termina com 3 sugestões
- **THEN** a entrada do `verification.md` traz "Sugestões: 3" e três linhas `- [sugestão]`, cada uma com o resumo e a referência de arquivo quando houver

#### Scenario: Comandos registrados

- **WHEN** o `/opsx:verify` roda `pytest -q` e reaproveita o resultado do lint registrado no apply
- **THEN** a lista "Comandos:" da entrada traz os dois comandos com o resultado e o código de saída, e marca o lint como reaproveitado do apply

#### Scenario: Roteiro executado fora da suíte

- **WHEN** um cenário de interface só tem evidência num roteiro de navegador executado por um script que não está no repositório
- **THEN** a linha "Cobertura fora da suíte" cita o cenário, onde está a evidência e quem executou, em vez de registrar `—`

### Requirement: Histórico de verificações

Cada nova execução do `/opsx:verify` na mesma change SHALL acrescentar uma entrada ao `verification.md` sem apagar as anteriores. A entrada mais recente MUST vir por último.

#### Scenario: Segunda verificação

- **WHEN** o `/opsx:verify` roda pela segunda vez numa change que já tem `verification.md`
- **THEN** o arquivo passa a ter duas entradas, e a segunda reflete a execução mais recente

### Requirement: Preservação no archive

O `verification.md` SHALL permanecer na pasta da change quando ela é arquivada.

#### Scenario: Change arquivada

- **WHEN** uma change com `verification.md` é arquivada
- **THEN** o arquivo existe em `changes/archive/AAAA-MM-DD-<nome>/verification.md`

### Requirement: Revisão de código antes do verify

Numa change que alterou código, o `/opsx:verify` SHALL conferir, antes de qualquer outra checagem, se existe `review.md`. Sem ele, o verify MUST parar sem gravar `verification.md`, dizer que a revisão de código é pré-requisito e oferecer rodá-la.

#### Scenario: Verify chamado antes da revisão

- **WHEN** o usuário roda `/opsx:verify` numa change com commits de código e sem `review.md`
- **THEN** o verify não gera relatório nem `verification.md`, explica que falta a revisão e oferece rodá-la

#### Scenario: Change só de documentação

- **WHEN** a change não alterou código
- **THEN** o verify segue sem exigir revisão além do registro `não aplicável` previsto no apply

### Requirement: Dependências do Impact conferidas

O verify SHALL cruzar as dependências citadas no Impact do proposal com as tarefas da change e com o manifesto de dependências do projeto, e registrar como warning cada dependência sem tarefa ou ausente do manifesto.

#### Scenario: Dependência citada e nunca instalada

- **WHEN** o Impact cita uma biblioteca de validação que nenhuma tarefa instala e que não está no manifesto de dependências
- **THEN** o verify registra um warning que cita a dependência

### Requirement: Roteiro de navegador executado por agente

Quando um roteiro de verificação em navegador tiver sido executado por um agente sem interação real (por exemplo, por requisições HTTP, sem cliques), o verify SHALL registrar o cenário como coberto só em parte e pedir uma execução humana antes do archive.

#### Scenario: Roteiro rodado por HTTP

- **WHEN** a evidência do roteiro diz que o agente conferiu as páginas por HTTP, sem clicar
- **THEN** o `verification.md` registra a cobertura parcial em "Não verificado" e pede a execução humana
