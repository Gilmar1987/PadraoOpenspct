# Spec Delta

## MODIFIED Requirements

### Requirement: Precedência da decisão de testes

A decisão de E2E registrada pelo projeto SHALL prevalecer sobre a orientação padrão do config base. Quando o projeto decidir não ter E2E, o `config.yaml` gerado pelo init MUST orientar a cobrir cenários de interface com um roteiro de verificação em navegador versionado, com o script versionado quando a execução for automatizada, o registro de quem executou e a limpeza dos dados criados.

#### Scenario: Projeto Next.js sem E2E

- **WHEN** o responsável responde "Não aplicável" à pergunta de E2E num projeto Next.js, ou de qualquer outra stack
- **THEN** o `operations.apply.guidance` do `config.yaml` gerado não exige E2E e orienta a verificação em navegador versionada para cenários de interface

#### Scenario: Roteiro automatizado pelo agente

- **WHEN** o agente automatiza o roteiro de navegador num projeto sem E2E
- **THEN** a orientação gerada exige que o script fique versionado junto do roteiro, que o registro diga que o agente executou e que os dados criados sejam marcados e removidos ao final
