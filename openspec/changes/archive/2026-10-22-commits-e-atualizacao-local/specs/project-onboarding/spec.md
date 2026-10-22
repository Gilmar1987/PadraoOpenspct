# Spec Delta

## ADDED Requirements

### Requirement: Commit inicial pelo script de entrada

No modo projeto novo, depois do setup, o script de entrada SHALL oferecer o commit inicial do repositório de código e do store, aceito por padrão e pelo `--yes`, e recusado pela opção `--sem-commit`. Se o commit não puder ser feito (por exemplo, sem identidade Git), o script MUST NOT terminar com erro por isso: SHALL avisar e mostrar os comandos para commitar depois. O script MUST NOT fazer push.

#### Scenario: Projeto novo com commit

- **WHEN** o dev cria um projeto novo e aceita o commit inicial
- **THEN** o código e o store terminam com um commit cada e a árvore limpa, e o `install-skills.mjs --update` consegue rodar no código

#### Scenario: Sem commit

- **WHEN** o dev roda o script com `--sem-commit`
- **THEN** o código continua sem commits, e a mensagem final mostra os comandos de commit

#### Scenario: Sem identidade Git

- **WHEN** o Git da máquina não tem `user.name` e o dev aceita o commit
- **THEN** o script termina com código zero, avisa que não commitou e mostra como configurar a identidade e commitar
