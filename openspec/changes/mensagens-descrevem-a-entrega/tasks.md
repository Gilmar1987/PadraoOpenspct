# Tasks

## 1. Proteção na CI

- [ ] 1.1 Acrescentar ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml` o marcador `Describe the delivery` para os seis pares (comando e skill) do D3. Verificar rodando esse passo localmente: ele deve falhar só nos doze arquivos.

## 2. Regra e fluxos

- [ ] 2.1 Aplicar o D1 em `padrao-openspec/openspec/rules.md`. Verificar com `grep -n "descreva em uma linha o que ela entrega"`.
- [ ] 2.2 Aplicar o D2 nos comandos e nas skills de `propose`, `apply`, `verify`, `archive`, `update` e `sync`: anúncio, modelos de saída e próximo passo, com o mesmo texto no comando e na skill. Verificar com o passo "Trechos customizados das skills" passando e com `grep -c "Using change: <name>"` igual a 0 nos doze arquivos.

## 3. Documentação e suíte

- [ ] 3.1 Atualizar a tabela de trechos customizados do `README.md` e acrescentar o item ao `CHANGELOG.md` na seção 1.15.0. Verificar com os passos "Versão e changelog" e "Lint de Markdown da raiz" passando.
- [ ] 3.2 Rodar `sync-root.mjs` e `--check`, `openspec validate --all --strict` e todos os passos dos jobs `store` e `root` localmente, depois de avisar a outra sessão. Verificar que todos saem com código 0.

## Workflow follow-up

- `/opsx:verify` e `/opsx:archive` depois do apply; push, PR e merge só quando o responsável pedir.
