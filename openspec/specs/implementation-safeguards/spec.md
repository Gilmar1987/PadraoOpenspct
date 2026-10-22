# implementation-safeguards Specification

## Purpose

Reduz quebras colaterais e retrabalho durante o planejamento e a implementação de uma change: mapeia o que pode ser afetado, garante testes antes do comportamento e impõe limites que devolvem o controle ao humano quando a implementação sai do plano.

## Requirements

### Requirement: Raio de impacto no planejamento

O `design.md` de cada change SHALL listar os arquivos-alvo (que serão alterados) e os dependentes afetados (arquivos, rotas ou componentes que usam os alvos e podem quebrar). As tarefas MUST citar os arquivos que tocam.

#### Scenario: Change que altera um módulo compartilhado

- **WHEN** uma change altera um módulo importado por três rotas
- **THEN** o design lista o módulo como alvo e as três rotas como dependentes afetados

### Requirement: Testes antes da implementação

Em cada grupo do `tasks.md`, a tarefa que cria ou atualiza os testes dos cenários do grupo SHALL vir antes da tarefa que implementa o comportamento correspondente.

#### Scenario: Grupo com regra de negócio

- **WHEN** um grupo de tarefas implementa uma regra de validação
- **THEN** a primeira tarefa do grupo cria os testes dos cenários dessa regra e a implementação vem depois

### Requirement: Limite de tentativas

Durante a implementação, depois de 3 tentativas consecutivas que falham no mesmo erro ou no mesmo teste, o agente MUST parar, mostrar o erro, resumir as 3 tentativas com a hipótese da falha e pedir orientação ao usuário antes de uma quarta tentativa.

#### Scenario: Teste que continua falhando

- **WHEN** o mesmo teste falha depois de três correções diferentes
- **THEN** o agente não faz uma quarta tentativa e pede orientação ao usuário, listando as três tentativas

### Requirement: Limite de arquivos fora do plano

Se a implementação exigir alterar mais de 5 arquivos que não estão entre os arquivos-alvo nem entre os dependentes do raio de impacto, o agente MUST parar e pedir confirmação ao usuário antes de alterá-los.

#### Scenario: Implementação que se espalha

- **WHEN** a correção de uma tarefa exigiria alterar seis arquivos fora do raio de impacto
- **THEN** o agente para antes de alterá-los e pede confirmação, listando os arquivos

### Requirement: Checagem de decisão arquitetural no propose

A checagem de decisão arquitetural (ADRs `Accepted` e `project-setup.md`) SHALL existir tanto no comando `/opsx:propose` quanto na skill `openspec-propose`, com o mesmo conteúdo.

#### Scenario: Propose disparado pela skill

- **WHEN** o fluxo de propose é disparado pela skill `openspec-propose`, sem o comando
- **THEN** o agente lê as ADRs `Accepted` e o `project-setup.md` antes de escrever o `design.md`

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

### Requirement: Correção não pedida é escopo novo

Durante o apply, uma mudança de comportamento que nenhuma tarefa ou requisito da change pede SHALL ser tratada como escopo novo, mesmo quando corrige um defeito: o agente MUST parar, expor a mudança e perguntar ao usuário antes de fazê-la.

#### Scenario: Ajuste de comportamento fora da spec

- **WHEN** o agente, implementando uma tarefa, percebe que poderia mudar um comportamento que a spec não cita (por exemplo, fazer a página de erro seguir o idioma da rota)
- **THEN** ele não faz a mudança, descreve-a ao usuário e pergunta se ela entra na change, por `/opsx:update`, ou fica para outra

### Requirement: API da biblioteca conferida antes de um adaptador

Antes de escrever um adaptador, parser ou wrapper para uma biblioteca, o agente SHALL conferir a API pública dela (tipos, assinaturas ou documentação instalada) e registrar na evidência da tarefa o que foi consultado e por que a biblioteca não resolve o caso sozinha.

#### Scenario: Biblioteca já aceita o formato

- **WHEN** a assinatura pública da biblioteca aceita a string de configuração que o agente pretendia converter
- **THEN** o agente usa a forma nativa e não escreve o adaptador

### Requirement: Requisitos revistos depois de trocar uma versão

Quando um desvio do plano troca a versão de uma dependência, o agente SHALL rever os requisitos de runtime e de compatibilidade do projeto e das demais dependências e registrar o resultado na evidência.

#### Scenario: Dependência nova exige runtime mais recente

- **WHEN** o agente troca uma dependência por uma versão que exige uma versão de runtime maior que a declarada no projeto
- **THEN** a evidência da tarefa registra a diferença, e o requisito de runtime do projeto é ajustado ou a troca é revista

### Requirement: Geradores rodam fora do repositório

Comandos de ferramentas que geram arquivos (por exemplo, `init`, `create` ou scaffolds) SHALL rodar numa pasta temporária, e só o necessário SHALL ser copiado para o repositório de código, depois de conferir se o gerador escreveu instruções ou skills de agente, segredos ou configuração de ambiente.

#### Scenario: Gerador que instala skills de agente

- **WHEN** o comando de inicialização de uma ferramenta cria skills em `.claude/` ou `.agents/` e um `.env`
- **THEN** esses arquivos ficam na pasta temporária, e só os arquivos que a tarefa pede chegam ao repositório

### Requirement: CI simulado numa cópia limpa

Uma change que cria ou altera um workflow de CI SHALL rodar os passos do workflow numa cópia que tenha só os arquivos versionados, sem arquivos de ambiente locais e sem dependências já instaladas, antes de marcar a tarefa como concluída.

#### Scenario: Workflow que depende de variável local

- **WHEN** um passo do workflow só funciona com uma variável que existe no `.env` local
- **THEN** a simulação na cópia limpa falha, e a tarefa não é marcada até o workflow funcionar sem ela

### Requirement: Verificação em modo de produção

Uma mudança no comportamento do servidor ou das rotas SHALL ser verificada também no modo de produção do projeto, com os comandos de build e de execução registrados nos Comandos de verificação do `project.md`, e não só no modo de desenvolvimento.

#### Scenario: Comportamento diferente entre os modos

- **WHEN** uma rota funciona no modo de desenvolvimento e falha no modo de produção
- **THEN** a tarefa não é marcada, e a evidência registra a execução nos dois modos
