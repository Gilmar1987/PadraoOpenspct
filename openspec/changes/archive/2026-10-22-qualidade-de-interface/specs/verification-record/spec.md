# Spec Delta

## ADDED Requirements

### Requirement: Nota mínima de interface no verify

Numa change cujo `design.md` tem a seção "Brief visual", o verify SHALL exigir o `interface-report.md` com a nota final do validador de interface igual a "médio" ou superior. Sem o relatório, ou com nota "fraco", o verify SHALL registrar um crítico e indicar as correções do relatório.

#### Scenario: Nota fraca

- **WHEN** o relatório de interface da change tem nota final "fraco"
- **THEN** o verify registra um crítico que cita a nota e as correções, e a change não fica pronta para o archive

#### Scenario: Change sem telas

- **WHEN** o `design.md` da change não tem "Brief visual"
- **THEN** o verify não exige o relatório de interface
