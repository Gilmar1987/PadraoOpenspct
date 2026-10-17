# Spec Delta

## Purpose

Controla quem da equipe acessa o painel, o que cada papel pode fazer e o isolamento de dados entre negócios.

## ADDED Requirements

### Requirement: Login da equipe
O sistema SHALL autenticar os membros da equipe por e-mail e senha, e SHALL
bloquear o login por 15 minutos após 5 tentativas falhas seguidas.

#### Scenario: Login válido
- **WHEN** um membro da equipe informa credenciais corretas
- **THEN** ele acessa o painel do seu negócio

#### Scenario: Excesso de tentativas
- **WHEN** ocorrem 5 tentativas falhas seguidas para o mesmo e-mail
- **THEN** novas tentativas são recusadas por 15 minutos

### Requirement: Papéis e permissões
O sistema SHALL suportar os papéis `owner` (acesso total ao negócio) e `staff`
(acesso apenas à própria agenda), e MUST isolar os dados entre negócios.

#### Scenario: Staff tenta editar o catálogo
- **WHEN** um usuário `staff` tenta criar um serviço
- **THEN** o sistema retorna "acesso negado"

#### Scenario: Isolamento entre negócios
- **WHEN** um usuário do negócio A requisita um agendamento do negócio B
- **THEN** o sistema responde como recurso inexistente (404)
