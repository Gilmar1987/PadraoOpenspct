# Tasks

## 1. CI em Windows

- [ ] 1.1 Aplicar o D1, o D2 e o D3 no `validate.yml`. Verificar com a checagem de YAML do arquivo e com o passo do D3 rodado localmente no Git Bash do Windows (exit 0). Antes da correção da `corrige-caminho-e-prompt-no-windows`, o mesmo cenário falhava com "not this store", como registra o `verification.md` daquela change.
- [ ] 1.2 Abrir o PR e conferir no GitHub as execuções `store (ubuntu-latest)`, `store (windows-latest)` e `root`. Ajustar os passos que falharem só no Windows, conforme o D2. Verificar com as três execuções passando.

## 2. Processo

- [ ] 2.1 Aplicar o D4 no `openspec/project.md` da raiz. Verificar com o lint da raiz sem issues e o texto novo presente em "Git & Process" e na linha "Testes".

## Workflow follow-up

- Depois do merge, conferir se alguma regra de proteção da `main` exige o nome antigo `store` e atualizá-la para os dois nomes novos.
