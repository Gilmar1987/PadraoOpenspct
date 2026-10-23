# Spec Delta

## ADDED Requirements

### Requirement: ADR com verificação declarada

O modelo de ADR SHALL ter o campo opcional `verificacao`, com o teste ou comando que confere a decisão no código (um teste de arquitetura, por exemplo). Ao criar uma ADR cuja regra pode ser conferida por código, o `/opsx:propose` SHALL preencher o campo e criar a tarefa que escreve esse teste. Acrescentar `verificacao` a uma ADR `Accepted` SHALL ser permitido sem nova ADR, porque não muda a decisão.

#### Scenario: ADR de camadas criada no propose

- **WHEN** o propose cria uma ADR que proíbe a camada de domínio de importar a de infraestrutura
- **THEN** a ADR traz em `verificacao` o teste de dependência entre camadas, e o `tasks.md` tem a tarefa de escrevê-lo

#### Scenario: Decisão que não se confere por código

- **WHEN** a ADR registra a escolha de um provedor de hospedagem
- **THEN** o campo `verificacao` fica vazio, sem tarefa de teste

### Requirement: Verificação de ADR cobrada pelo verify

Para cada ADR `Accepted` com `verificacao` que a change toca (citada no `design.md` ou ligada às capabilities afetadas), o `/opsx:verify` SHALL rodar a verificação, ou reaproveitar a evidência conforme a heurística de reaproveitamento, e SHALL registrar como crítico um teste ausente ou falhando. O resultado SHALL constar em `Comandos:` do registro de verificação.

#### Scenario: Teste de arquitetura falhando

- **WHEN** a change faz o domínio importar um cliente HTTP e a ADR de camadas tem o teste em `verificacao`
- **THEN** o verify roda o teste, registra o crítico com a ADR e o teste, e não declara a change pronta para arquivar

#### Scenario: Teste citado que não existe

- **WHEN** o campo `verificacao` cita um teste que não está no repositório
- **THEN** o verify registra um crítico "verificação de ADR ausente" com o caminho citado
