# Spec Delta

## ADDED Requirements

### Requirement: Orientação de E2E acrescentada ao config

O `/opsx:init` SHALL acrescentar ao `operations.apply.guidance` do `config.yaml` gerado uma linha sobre E2E de acordo com a 5.5, sem depender de uma linha preexistente no config base: com um framework de E2E, a orientação de cobrir os cenários de interface com esse framework; com "Não aplicável", a orientação do roteiro de verificação em navegador.

#### Scenario: Projeto com Playwright

- **WHEN** o responsável escolhe Playwright na 5.5
- **THEN** o `operations.apply.guidance` gerado tem uma linha que manda cobrir os cenários de interface com testes E2E em Playwright, e as linhas do config base continuam lá

#### Scenario: Projeto sem E2E sobre o config neutro

- **WHEN** o responsável responde "Não aplicável" na 5.5 e o `config.yaml` do store é o neutro
- **THEN** o init acrescenta a orientação do roteiro de verificação em navegador, sem procurar uma linha para substituir

### Requirement: Idioma do código perguntado

O bloco 7 do `/opsx:init` SHALL perguntar o idioma do código (identificadores, comentários e mensagens de commit) e registrar a resposta em "Idioma do código" nas Development Conventions do `project.md`. Os demais campos de Development Conventions que nenhuma resposta cobriu SHALL ser perguntados como os campos sem decisão da Stack Summary.

#### Scenario: Código em inglês

- **WHEN** o responsável escolhe inglês para o código
- **THEN** o `project.md` gerado registra o idioma em "Idioma do código", e não "Adiado"

### Requirement: Opções de fila compatíveis com o banco

A pergunta 3.8 do `/opsx:init` SHALL oferecer tipos de fila (no próprio banco, em Redis, em broker dedicado, por agendamento simples e por serviço gerenciado) com exemplos compatíveis com a linguagem da 3.1 e o banco da 3.3. A checagem de coerência SHALL apontar uma biblioteca de fila presa a um banco diferente do escolhido na 3.3.

#### Scenario: Fila no SQL Server

- **WHEN** o responsável escolheu SQL Server na 3.3 e precisa de jobs
- **THEN** a 3.8 oferece uma opção de fila no próprio banco sem citar só bibliotecas de PostgreSQL

#### Scenario: pg-boss com outro banco

- **WHEN** o responsável escolhe pg-boss na 3.8 e SQLite na 3.3
- **THEN** a checagem de coerência aponta que o pg-boss exige PostgreSQL e propõe fila no banco escolhido ou registrar o banco extra

### Requirement: Documento de arquitetura gerado pelo init

O `/opsx:init` SHALL gerar `<root>/openspec/arquitetura.md` a partir das respostas confirmadas, com: visão geral, estilo e organização, componentes e responsabilidades, comunicação, um diagrama Mermaid dos componentes, dados, infraestrutura e deploy, observabilidade e segurança, decisões com links para as ADRs geradas e pontos adiados. A seção "Architecture" do `project.md` gerado SHALL resumir e apontar para esse documento.

#### Scenario: Init concluído

- **WHEN** o responsável confirma a entrevista
- **THEN** o store tem `openspec/arquitetura.md` com o diagrama Mermaid e os links para as ADRs, e a seção "Architecture" do `project.md` aponta para ele

#### Scenario: Componente não escolhido

- **WHEN** o projeto não tem jobs, e-mail nem armazenamento de arquivos
- **THEN** o `arquitetura.md` não inventa esses componentes nem os desenha no diagrama
