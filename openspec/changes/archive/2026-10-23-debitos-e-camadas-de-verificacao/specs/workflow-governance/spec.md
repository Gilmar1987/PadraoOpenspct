# Spec Delta

## ADDED Requirements

### Requirement: Débitos relacionados no explore e no propose

Quando o store tem `openspec/estado-atual.md`, o explore e o propose SHALL ler a lista "Fora do ciclo atual" e citar no proposal os débitos que a change fecha e os que ela abre por adiar algo explicitamente. Sem o arquivo, SHALL dizer que ele não existe e seguir.

#### Scenario: Change que fecha um débito

- **WHEN** o projeto tem "Autenticação" em "Fora do ciclo atual" e a change implementa o login
- **THEN** o proposal cita esse débito como fechado pela change

#### Scenario: Store antigo

- **WHEN** o store não tem `estado-atual.md`
- **THEN** o propose informa que o arquivo não existe e cria a change normalmente

### Requirement: Débitos atualizados no archive

Ao arquivar uma change, o archive SHALL atualizar a lista "Fora do ciclo atual" do `estado-atual.md`, quando ela existir: SHALL remover os débitos que o proposal cita como fechados, registrando a change e a data no commit do archive, e SHALL acrescentar os que o proposal cita como abertos. Um débito MUST NOT sair da lista por outro motivo que não ser feito ou uma ADR Accepted dizer que não será feito.

#### Scenario: Débito fechado

- **WHEN** a change arquivada fechou o débito "Autenticação"
- **THEN** o débito sai da lista no mesmo commit do archive

#### Scenario: Débito ainda aberto

- **WHEN** uma change não cita o débito "Observabilidade" como fechado
- **THEN** o débito continua na lista depois do archive, mesmo que não esteja planejado
