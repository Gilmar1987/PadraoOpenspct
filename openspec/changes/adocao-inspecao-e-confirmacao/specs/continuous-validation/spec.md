## ADDED Requirements

### Requirement: Inspeção do código conferida contra fixtures

O job `store` da CI SHALL rodar o teste da inspeção, que copia cada fixture para uma pasta temporária com `git init`, roda o script e compara a saída com o esperado do fixture. O teste SHALL falhar quando uma resposta, um nível ou um conflito mudar, quando um valor de secret ou um trecho de arquivo de dados aparecer na saída, e quando o script importar algo além de `node:fs`, `node:path` e `node:child_process` ou chamar outro programa que não o `git`.

#### Scenario: Dependência trocada no fixture

- **WHEN** o fixture Node troca `vitest` por `mocha` sem atualizar o esperado
- **THEN** o passo do teste da inspeção falha e cita a 5.4

#### Scenario: Script que passa a rodar outro programa

- **WHEN** o script passa a chamar `npm` pelo `child_process`
- **THEN** o passo do teste da inspeção falha
