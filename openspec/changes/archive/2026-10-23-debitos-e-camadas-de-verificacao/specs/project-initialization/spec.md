# Spec Delta

## MODIFIED Requirements

### Requirement: Documento de arquitetura gerado pelo init

O `/opsx:init` SHALL gerar `<root>/openspec/arquitetura.md` a partir das respostas confirmadas, com: visão geral, estilo e organização, componentes e responsabilidades, comunicação, um diagrama Mermaid dos componentes, dados, infraestrutura e deploy, observabilidade e segurança, decisões com links para as ADRs geradas e pontos adiados. A seção "Architecture" do `project.md` gerado SHALL resumir e apontar para esse documento.

#### Scenario: Init concluído

- **WHEN** o responsável confirma a entrevista
- **THEN** o store tem `openspec/arquitetura.md` com o diagrama Mermaid e os links para as ADRs, e a seção "Architecture" do `project.md` aponta para ele

#### Scenario: Componente não escolhido

- **WHEN** o projeto não tem jobs, e-mail nem armazenamento de arquivos
- **THEN** o `arquitetura.md` não inventa esses componentes nem os desenha no diagrama

### Requirement: Init commita os artefatos no store

Depois de gerar os artefatos, o `/opsx:init` SHALL commitar só a pasta `openspec/` da raiz OpenSpec, quando ela estiver num repositório Git, com uma mensagem Conventional Commits, e MUST NOT fazer push. Fora de um repositório Git, SHALL dizer que não commitou e seguir.

#### Scenario: Store num repositório Git

- **WHEN** o responsável confirma a entrevista num projeto cujo store é um repositório Git
- **THEN** o store tem um commit novo com `project-setup.md`, `project.md`, `config.yaml`, `arquitetura.md`, `estado-atual.md` e as ADRs, e nada mais do que estava preparado no índice entra nele

#### Scenario: Sem Git

- **WHEN** a raiz OpenSpec não está num repositório Git
- **THEN** o init gera os arquivos, informa que não houve commit e termina sem erro

## ADDED Requirements

### Requirement: Arquitetura normativa ligada ao estado atual

O `arquitetura.md` gerado pelo init SHALL se declarar normativo (a arquitetura-alvo), e a seção de pontos adiados SHALL apontar para a lista "Fora do ciclo atual" do `estado-atual.md` em vez de repetir os itens.

#### Scenario: Pontos adiados sem duplicação

- **WHEN** a entrevista tem respostas "Adiado"
- **THEN** a seção de pontos adiados do `arquitetura.md` traz só o link para "Fora do ciclo atual" do `estado-atual.md`, onde os itens estão listados

### Requirement: Estado atual gerado pelo init

O `/opsx:init` SHALL gerar `<root>/openspec/estado-atual.md`, um documento descritivo do estado do projeto, com a seção "Fora do ciclo atual": uma tabela de débitos com item, motivo, data de abertura, origem e condição de saída. A lista inicial SHALL conter cada resposta "Adiado" da entrevista e cada combinação mantida na checagem de coerência, com a pergunta de origem. Sem itens, a seção MUST dizer "Nenhum".

#### Scenario: Respostas adiadas viram débitos

- **WHEN** o responsável adia o comando de migrações e o campo de observabilidade
- **THEN** o `estado-atual.md` lista os dois em "Fora do ciclo atual", com a data do init e a pergunta de origem

#### Scenario: Nada adiado

- **WHEN** nenhuma resposta foi adiada e nenhuma combinação foi mantida
- **THEN** o `estado-atual.md` existe e a seção "Fora do ciclo atual" diz "Nenhum"

### Requirement: Camadas de verificação geradas pelo init

O `/opsx:init` SHALL preencher a seção "Camadas de verificação" do `project.md` com uma linha por camada (unitário, contrato, arquitetura, E2E, roteiro manual, produção), dizendo o que ela cobre, o comando ou procedimento e onde roda, usando só as respostas da entrevista. Uma camada que nenhuma resposta define MUST ficar "Adiado" ou "Não aplicável", com o motivo, e o init MUST NOT fazer pergunta nova para preenchê-la.

#### Scenario: Projeto com testes unitários e E2E

- **WHEN** a 5.4 é Vitest, a 5.5 é Playwright, a 5.3 inclui testes no CI e o bloco 7 registra os comandos
- **THEN** a matriz lista o unitário e o E2E com os comandos do bloco 7 e "local e CI" em onde roda

#### Scenario: Projeto sem E2E

- **WHEN** a 5.5 é "Não aplicável" e o projeto tem front-end
- **THEN** a matriz marca E2E como "Não aplicável" e lista o roteiro manual em navegador como a camada que cobre a interface
