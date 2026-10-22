# Spec Delta

## ADDED Requirements

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
