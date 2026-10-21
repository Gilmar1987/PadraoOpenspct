# Tasks

## 1. Proteção na CI

- [ ] 1.1 Acrescentar as três checagens do D8 ao passo "Guia de primeiros passos" de `.github/workflows/validate.yml`. Verificar rodando o passo localmente no Git Bash: deve falhar (o guia ainda não tem o caminho B nem o template a seção nova).

## 2. Caminho B validado antes de escrever

- [ ] 2.1 Numa pasta temporária, criar um projeto pelo caminho A (clone por tag `v1.2.0`, `switch -c main`, setup com `--register-id guia-b-teste`), commitar o código e o store, e cloná-los para outra pasta como faria um dev novo. Ali, seguir os passos do D3: desregistrar `guia-b-teste`, ler o id com `Select-String`, registrar o clone com `--id <id> --yes` e rodar `openspec context --json` no código clonado. Verificar que `root.path` termina em `\padrao-openspec` do store clonado. Registrar também o resultado de registrar a pasta raiz do store (linha do D5) e de rodar sem registro (mensagem `Declared in ...`). Ao fim, desregistrar e apagar a pasta temporária.

## 3. Guias

- [ ] 3.1 Reescrever o `COMECE-AQUI.md` conforme D1 a D5, com os comandos do caminho B iguais aos que passaram na 2.1 (ajustar o design pelo `/opsx:update` se algum mudar). Verificar com o lint da raiz sem issues e com as checagens do guia da 1.1 sobre o `COMECE-AQUI.md` passando.
- [ ] 3.2 Aplicar o D6 em `README.md` e `padrao-openspec/README.md`. Verificar com o lint nos dois lugares sem issues e com `grep` mostrando que o README não tem mais `<caminho-do-store>`.
- [ ] 3.3 Aplicar o D7 em `padrao-openspec/templates/openspec-padrao.md`. Verificar com o passo da 1.1 passando inteiro, os smoke tests do instalador e do setup passando (o guia instalado no código tem `## Entrar neste projeto` antes de `## Primeiros passos`) e o link com âncora resolvendo para o título do caminho B.

## 4. Versão e integração

- [ ] 4.1 Aplicar o D9 no `CHANGELOG.md`. Verificar com o passo "Versão e changelog" passando e `padrao-openspec/VERSION` ainda em `1.2.1`.
- [ ] 4.2 Rodar `sync-root.mjs --check`, `openspec validate --all --strict` na raiz, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente. Verificar que todos saem com código 0.
- [ ] 4.3 Leitura final do `COMECE-AQUI.md` como dev novo, uma vez por caminho, conferindo que nenhum passo depende de algo que o guia não mandou pedir ou instalar. Verificar registrando na evidência qualquer lacuna encontrada e a correção feita.

## Workflow follow-up

- Depois do archive e do merge, publicar a release `v1.2.1` (veja "Como publicar uma release" no README), que leva esta change e a `clone-pela-release`.
