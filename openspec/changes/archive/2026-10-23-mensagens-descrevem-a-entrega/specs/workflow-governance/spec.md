# Spec Delta

## ADDED Requirements

### Requirement: Mensagem descreve a entrega

Ao citar uma change para o usuário (anúncio do fluxo, resumo de propose, apply, verify, archive, update ou sync, e próximo passo), o agente SHALL descrever em uma linha o que ela entrega. O nome da change MUST NOT ser usado como rótulo da mensagem, e SHALL aparecer só quando for indispensável, como para escolher entre duas changes ativas.

#### Scenario: Resumo do apply

- **WHEN** o apply de uma change que acrescenta `.gitattributes` e prende as portas do Docker a 127.0.0.1 termina
- **THEN** o resumo diz em uma linha o que foi entregue e não usa o nome kebab-case da change como título

#### Scenario: Duas changes ativas

- **WHEN** há duas changes ativas e o usuário roda `/opsx:verify` sem argumento
- **THEN** o agente lista as duas com a descrição de cada uma e o nome, para o usuário escolher

### Requirement: Próximo passo pelo comando sem o nome

Quando indicar o próximo passo do ciclo, o agente SHALL mostrar só o comando, sem o nome da change como argumento (por exemplo, `/opsx:verify`), já que o comando descobre a change pelo contexto ou pergunta qual é.

#### Scenario: Fim do propose

- **WHEN** o propose termina e a change é a única ativa
- **THEN** a mensagem indica `/opsx:apply`, sem o nome da change
