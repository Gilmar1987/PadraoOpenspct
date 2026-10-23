# Spec Delta

## ADDED Requirements

### Requirement: Quebra de linha no repositório de código

Quando o repositório de código não tem `.gitattributes`, o instalador SHALL criá-lo com o bloco gerenciado do padrão, que normaliza os arquivos de texto para LF e mantém CRLF em `*.bat` e `*.cmd`. Um `.gitattributes` sem o bloco do padrão MUST NOT ser alterado: o instalador SHALL informar que o arquivo existe e sugerir as linhas. No arquivo com o bloco, o instalador SHALL manter o bloco atualizado, sem duplicá-lo.

#### Scenario: Repositório sem o arquivo

- **WHEN** o instalador roda num repositório de código sem `.gitattributes`
- **THEN** o repositório passa a ter `.gitattributes` com `* text=auto eol=lf` e CRLF para `*.bat` e `*.cmd`, e o `git add` de um arquivo com LF não avisa sobre CRLF

#### Scenario: Arquivo do projeto preservado

- **WHEN** o repositório de código já tem um `.gitattributes` sem o bloco do padrão
- **THEN** o instalador não altera o arquivo e mostra as linhas sugeridas

#### Scenario: Segunda instalação

- **WHEN** o instalador roda de novo no mesmo repositório
- **THEN** o `.gitattributes` continua igual, com um único bloco gerenciado

### Requirement: Portas de desenvolvimento só no host local

A skill `docker` distribuída SHALL orientar que serviços de desenvolvimento (bancos, filas, caches) publiquem portas só em `127.0.0.1` e que o `.env.example` traga marcadores em vez de senhas que funcionem. O exemplo de compose da skill SHALL seguir essa regra.

#### Scenario: Banco no compose de desenvolvimento

- **WHEN** o agente escreve um compose com um banco de dados seguindo a skill `docker`
- **THEN** a porta do banco é publicada como `127.0.0.1:<porta>:<porta>`, e não em todas as interfaces
