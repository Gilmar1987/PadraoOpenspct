# Spec Delta

## ADDED Requirements

### Requirement: Perguntas de documentos e descoberta antes da entrevista

Antes do Bloco 1, o `/opsx:init` SHALL perguntar, uma de cada vez e com resposta sim ou não, se o dev tem documentos para analisar e se quer explorar a ideia do produto antes das perguntas de arquitetura. A segunda pergunta SHALL avisar que, sem explorar, a entrevista vem em seguida sem recomendação baseada na ideia.

#### Scenario: Dev sem documentos e sem descoberta

- **WHEN** o dev responde "não" às duas perguntas
- **THEN** o init segue para o Bloco 1 e conduz a entrevista como antes desta change, sem recomendações

#### Scenario: Aviso na pergunta de descoberta

- **WHEN** o init faz a segunda pergunta
- **THEN** o texto diz que, sem explorar, as perguntas de arquitetura vêm em seguida sem recomendação baseada na ideia

### Requirement: Ingest chamado pelo init

Com "sim" na pergunta de documentos, o `/opsx:init` SHALL pedir as evidências (conteúdo colado, arquivo ou pasta) e conduzir a análise do `/opsx:ingest` até o brief, sem a pergunta de contexto do ingest, que é sempre "projeto novo", e sem o "Próximo passo" dele. O brief SHALL ficar disponível para a descoberta e para a entrevista.

#### Scenario: Documentos informados por pasta

- **WHEN** o dev responde "sim" e informa uma pasta com duas atas
- **THEN** o init mostra o brief do ingest das duas atas e segue para a pergunta de descoberta, sem perguntar se é projeto novo ou change existente

### Requirement: Descoberta chamada pelo init

Com "sim" na pergunta de descoberta, o `/opsx:init` SHALL conduzir o `/opsx:discover` e só começar o Bloco 1 depois que o brief da ideia estiver gravado ou o dev encerrar a descoberta. Quando `<root>/openspec/descoberta.md` já existir com o status "Concluída", o init SHALL usá-lo, dizer isso ao dev e não fazer a pergunta de descoberta.

#### Scenario: Descoberta feita antes do init

- **WHEN** o dev rodou `/opsx:discover` antes e o `descoberta.md` está "Concluída"
- **THEN** o init diz que vai usar a descoberta existente, não pergunta se o dev quer explorar e usa o brief nas recomendações

#### Scenario: Descoberta conduzida pelo init

- **WHEN** o dev responde "sim" à pergunta de descoberta
- **THEN** a conversa da descoberta acontece antes da pergunta 1.1, e o Bloco 1 começa depois da confirmação do brief da ideia

### Requirement: Recomendação a partir do brief na entrevista

Quando houver brief do ingest ou da descoberta, cada pergunta da entrevista SHALL mostrar, antes da resposta do dev, uma recomendação com a opção sugerida, a justificativa e a parte do brief que a sustenta. Quando o brief não sustentar a pergunta, o init SHALL dizer isso numa linha e não recomendar. A recomendação MUST NOT escolher pelo dev, e as perguntas e opções MUST continuar as mesmas.

#### Scenario: Brief sustenta a pergunta

- **WHEN** o brief da descoberta diz que o MVP atende uma clínica com até 50 usuários
- **THEN** a pergunta 1.4 mostra a recomendação "Pequeno", citando esse trecho do brief, e espera a resposta do dev

#### Scenario: Brief não cobre a pergunta

- **WHEN** nenhum brief fala de armazenamento de arquivos
- **THEN** a pergunta 3.10 diz numa linha que o brief não cobre o assunto, não recomenda nenhuma opção e mostra as mesmas opções de sempre

#### Scenario: Sem brief

- **WHEN** o dev respondeu "não" às duas perguntas
- **THEN** nenhuma pergunta da entrevista mostra recomendação nem a linha de brief ausente

### Requirement: Origem das recomendações no registro do init

Quando a entrevista usar um brief, o `project-setup.md` gerado SHALL registrar quais briefs serviram de base: os documentos analisados no ingest, por alias, e o caminho do `descoberta.md`.

#### Scenario: Init com ingest e descoberta

- **WHEN** a entrevista usou o brief de dois documentos e a descoberta
- **THEN** o `project-setup.md` lista os dois documentos por alias e aponta para `openspec/descoberta.md`

### Requirement: Arquivo de respostas sem as perguntas prévias

Com um arquivo de respostas, o `/opsx:init` MUST NOT fazer as perguntas de documentos e de descoberta, e SHALL gerar os mesmos artefatos que gerava antes desta change.

#### Scenario: Teste E2E do padrão

- **WHEN** o init recebe um arquivo com todas as respostas, `Confirmação final: sim` e o responsável
- **THEN** o init não pergunta sobre documentos nem descoberta e gera os artefatos sem fazer perguntas
