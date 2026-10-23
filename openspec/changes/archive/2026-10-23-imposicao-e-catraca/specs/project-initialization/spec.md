# Spec Delta

## ADDED Requirements

### Requirement: Falhas aceitas e condição conferível no estado atual

O `estado-atual.md` gerado pelo `/opsx:init` SHALL ter a seção "Falhas aceitas", com verificação, falha, motivo, desde e "Sai quando", e com a linha "Nenhuma" quando não há falha aceita. O "Sai quando" das duas tabelas SHALL ser escrito como fato conferível, e uma data sozinha MUST NOT ser a condição.

#### Scenario: Projeto novo

- **WHEN** o init gera o `estado-atual.md` de um projeto sem código
- **THEN** a seção "Falhas aceitas" existe com a linha "Nenhuma"

#### Scenario: Débito do init com condição conferível

- **WHEN** o responsável adia o comando de migrações
- **THEN** o "Sai quando" do débito é um fato conferível, como "linha Migrações preenchida no `project.md`", e não uma data
