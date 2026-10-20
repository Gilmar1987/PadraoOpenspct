# Spec Delta

## ADDED Requirements

### Requirement: Varredura de secrets antes do commit

Quando o `project.md` registra um comando de varredura de secrets, o apply SHALL rodá-lo antes de cada commit de código. Se a varredura encontrar um secret, o agente MUST NOT commitar e MUST parar e mostrar ao usuário o arquivo e a linha, sem repetir o valor encontrado.

#### Scenario: Secret num arquivo novo

- **WHEN** a varredura encontra uma chave de API em `config/settings.py` antes de um commit
- **THEN** o agente não commita, informa o arquivo e a linha sem mostrar a chave e pede orientação

#### Scenario: Varredura limpa

- **WHEN** a varredura não encontra nada
- **THEN** o agente commita e registra o comando e o resultado na evidência da tarefa

### Requirement: Auditoria de dependências na change

Quando a change adiciona ou atualiza dependências e o `project.md` registra um comando de auditoria de dependências, o apply SHALL rodá-lo antes da revisão de código. Cada vulnerabilidade de severidade alta ou crítica MUST ser corrigida ou justificada no `review.md`.

#### Scenario: Dependência nova vulnerável

- **WHEN** a auditoria aponta uma vulnerabilidade crítica numa dependência adicionada pela change
- **THEN** o agente sobe para uma versão corrigida ou registra no `review.md` a justificativa de manter a versão

#### Scenario: Comando de auditoria ausente

- **WHEN** a change adiciona uma dependência e o `project.md` não registra comando de auditoria
- **THEN** o agente registra a auditoria como não verificada, com esse motivo, e não inventa um comando
