# Spec Delta

## ADDED Requirements

### Requirement: Combinações de infraestrutura e testes na checagem de coerência

A checagem de coerência do `/opsx:init` SHALL avaliar também: banco local (3.3 SQLite ou 3.4 "Local apenas") com deploy serverless (4.1 Vercel/Netlify ou 2.1 Serverless); 4.4 "Apenas .env" com 6.6 criptografia de campos na aplicação; cobertura mínima na 5.6 com um comando de testes da 7.1 que não mede cobertura; e contrato registrado na 2.6 com o "Teste de contrato" da 7.1 em "Não aplicável".

#### Scenario: SQLite na Vercel

- **WHEN** a 3.3 é SQLite e a 4.1 é Vercel/Netlify
- **THEN** o init aponta que o sistema de arquivos do deploy é efêmero e propõe banco gerenciado ou um deploy com disco persistente

#### Scenario: Chave de criptografia só no .env

- **WHEN** a 4.4 é "Apenas .env" e a 6.6 é criptografia de campos sensíveis na aplicação
- **THEN** o init aponta que a chave fica sem cofre em produção e propõe cofre ou variáveis da plataforma

#### Scenario: Cobertura exigida sem medição

- **WHEN** a 5.6 exige 80% de cobertura e o comando de testes da 7.1 é `pytest`, sem medição de cobertura
- **THEN** o init aponta a combinação e propõe um comando que meça cobertura (por exemplo, `pytest --cov`) ou mudar a 5.6 para "Sem cobertura mínima definida"

#### Scenario: Contrato sem teste de contrato

- **WHEN** a 2.6 registra uma API em OpenAPI e o "Teste de contrato" da 7.1 é "Não aplicável"
- **THEN** o init aponta que o contrato não será conferido contra o código e propõe registrar o comando, adiar ou justificar em "Observações"

### Requirement: Nenhuma proteção exclui as demais

Na pergunta 6.4 do `/opsx:init`, a opção "0) Nenhuma no MVP" SHALL excluir as demais. Uma resposta com o 0 e outra opção MUST ser recusada com a explicação, e a pergunta é feita de novo.

#### Scenario: Zero com rate limiting

- **WHEN** o dev responde `0,1` na 6.4
- **THEN** o init explica que "Nenhuma no MVP" exclui as outras opções e pergunta de novo

### Requirement: Auditoria de produção sugerida

Na 7.1, a sugestão para a auditoria de dependências SHALL ser a variante que audita só as dependências de produção, quando o ecossistema a oferece. A auditoria completa SHALL ser registrada como informativa na coluna "Observações" da mesma linha.

#### Scenario: Projeto Node.js

- **WHEN** a stack é TypeScript + Node.js e o dev aceita a sugestão de auditoria
- **THEN** o `project.md` registra `npm audit --omit=dev --audit-level=high` como comando e cita `npm audit` (completa, informativa) nas Observações

### Requirement: Ferramentas conferidas no fim do init

Depois de gerar e commitar os artefatos, o `/opsx:init` SHALL conferir, para cada comando de verificação registrado (que não seja "Não aplicável" nem "Adiado"), se a ferramenta que ele chama responde na máquina, e SHALL listar as que faltam com uma sugestão de instalação. O init MUST NOT instalar nada.

#### Scenario: Gitleaks ausente

- **WHEN** a "Varredura de secrets" registrada é `gitleaks git --staged` e `gitleaks version` falha na máquina
- **THEN** o init lista o gitleaks como ausente, com uma sugestão de instalação para o sistema, e não instala nada

#### Scenario: Todas presentes

- **WHEN** todas as ferramentas dos comandos registrados respondem
- **THEN** o init diz que as ferramentas estão disponíveis e segue para os próximos passos
