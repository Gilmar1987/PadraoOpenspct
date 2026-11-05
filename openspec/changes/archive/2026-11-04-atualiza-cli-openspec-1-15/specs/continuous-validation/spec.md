# Spec Delta

## MODIFIED Requirements

### Requirement: Suíte sem recursos compartilhados

Os passos da CI que registram stores SHALL usar ids com um sufixo único por execução e SHALL desregistrá-los no fim, mesmo quando falham. A instalação do OpenSpec CLI SHALL ser pulada quando a versão exigida já estiver instalada, e MUST NOT reinstalar o CLI por cima de uma instalação igual.

#### Scenario: Duas execuções ao mesmo tempo na mesma máquina

- **WHEN** duas execuções locais da suíte rodam ao mesmo tempo
- **THEN** cada uma registra e desregistra só os próprios ids, e uma não remove o registro da outra

#### Scenario: Passo que falha no meio

- **WHEN** o passo da declaração do store falha depois de registrar o id
- **THEN** o id é desregistrado no fim do passo

#### Scenario: CLI já instalado

- **WHEN** o OpenSpec CLI `1.15.0` já está instalado
- **THEN** o passo de instalação não roda o `npm install -g`

## ADDED Requirements

### Requirement: Versão do OpenSpec CLI coerente

A CI SHALL falhar quando a versão do OpenSpec CLI que o padrão fixa não for a mesma em todos os lugares que a declaram: o script de entrada, a mensagem de CLI ausente do portão, os passos de instalação do CLI na CI, o campo `generatedBy` de cada skill `openspec-*` (em `padrao-openspec/` e na raiz) e cada `@fission-ai/openspec@<versão>` citado no `README.md`, no `padrao-openspec/README.md`, no `COMECE-AQUI.md` e no `openspec/project.md`. A falha SHALL citar o arquivo e a versão divergente.

#### Scenario: Versões iguais

- **WHEN** o script de entrada, o portão, os passos de instalação e as skills declaram o CLI `1.15.0`
- **THEN** a checagem passa

#### Scenario: Skill gerada por outra versão

- **WHEN** uma skill `openspec-*` tem `generatedBy: "1.14.2"` e o script de entrada fixa `1.15.0`
- **THEN** a checagem falha citando a skill e a versão `1.14.2`

#### Scenario: Passo de instalação esquecido

- **WHEN** um dos passos "Instalar OpenSpec CLI" da CI continua instalando `@fission-ai/openspec@1.14.2` depois de o script de entrada passar a `1.15.0`
- **THEN** a checagem falha citando o `validate.yml` e a versão `1.14.2`

#### Scenario: Documento com o comando antigo

- **WHEN** o `COMECE-AQUI.md` ainda manda rodar `npm install -g @fission-ai/openspec@1.14.2`
- **THEN** a checagem falha citando o `COMECE-AQUI.md` e a versão `1.14.2`
