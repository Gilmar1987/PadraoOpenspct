# Proposal

## Why

O `openspec/project.md` da raiz deste repositório ainda não tem a seção "Comandos de verificação". Por isso, o verify de cada change registra "comandos de verificação do projeto: não verificado" e usa os passos do `validate.yml` sem uma referência registrada. Também faltam no histórico as conferências de download das releases `v1.3.0` e `v1.3.1`, feitas depois do archive das changes que as entregaram.

## What Changes

- **`openspec/project.md` da raiz:** nova seção "Comandos de verificação", com os comandos que a CI deste repositório já roda:
  - `sync-root.mjs --check`;
  - `openspec validate --all --strict`;
  - `markdownlint-cli2`;
  - `node --check` dos scripts;
  - os smoke tests do `validate.yml`.

  A varredura de secrets fica registrada como "Adiado", com o gitleaks como candidato para uma change própria.
- **Registros de download:** uma entrada nova no `verification.md` das changes arquivadas `guia-de-entrada-do-dev` (`v1.3.0`) e `corrige-caminho-e-prompt-no-windows` (`v1.3.1`), com o resultado do `curl` e a comparação de SHA-256 feitos na publicação.

### Fora do escopo

- Adotar uma ferramenta de varredura de secrets ou mudar a CI.
- Preencher as outras seções do `project.md` da raiz (visão, arquitetura etc.).
- Mudar o `project.md` neutro entregue aos projetos.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

Nenhuma: a change registra a configuração deste repositório e não muda requisito (`skip_specs: true`).

## Impact

- **Documentação do repositório:** `openspec/project.md` e dois `verification.md` em `openspec/changes/archive/`.
- **Projetos:** nenhum efeito; nada é entregue a eles, e não há release.
- **Riscos:** nenhum além de um comando registrado divergir da CI; a tarefa confere cada um rodando-o.

## Aprovação

- Responsável: gilmar campelo
- Data: 2026-10-21
- Escopo: archive
- Condições: CI passar; em seguida, PR (sem release)
- Origem: "sim para o passo 1 como foi proposto", em resposta a "Proponho começar pelo passo 1 registrando a varredura como 'Adiado' [...] Se concordar, me diga se posso propor o passo 1 assim, e se aprova já o archive e o PR, com a condição de a CI passar."
