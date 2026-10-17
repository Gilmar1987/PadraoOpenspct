# Spec Delta

## Purpose

Define os serviços que o negócio oferece e quais profissionais estão habilitados a executar cada um.

## ADDED Requirements

### Requirement: Cadastro de serviços
O sistema SHALL permitir que o owner cadastre serviços com nome, duração em minutos
(múltiplo de 15) e preço de exibição, e os ative ou desative.

#### Scenario: Serviço criado com sucesso
- **WHEN** o owner cadastra "Corte" com duração de 30 min e preço de R$ 50,00
- **THEN** o serviço fica ativo e aparece na página pública

#### Scenario: Duração inválida
- **WHEN** o owner informa uma duração de 20 min
- **THEN** o sistema rejeita o cadastro informando que a duração deve ser múltipla de 15

#### Scenario: Serviço desativado
- **WHEN** o owner desativa um serviço
- **THEN** o serviço deixa de aparecer na página pública
- **AND** os agendamentos futuros desse serviço são mantidos

### Requirement: Profissionais habilitados por serviço
O sistema SHALL permitir vincular cada profissional aos serviços que ele executa,
e SHALL oferecer um serviço apenas com profissionais vinculados.

#### Scenario: Profissional sem o serviço
- **WHEN** um cliente escolhe o serviço "Coloração"
- **THEN** apenas os profissionais vinculados a "Coloração" são listados
