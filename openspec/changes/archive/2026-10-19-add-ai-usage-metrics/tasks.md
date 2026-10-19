# Tasks

## 1. Consumo de IA: testes

- [x] 1.1 Acrescentar o passo "Smoke test do consumo de IA" (D5) em `.github/workflows/validate.yml`. Verificar rodando localmente antes da 2.1: ele deve falhar porque a opção `--usage` não existe.

## 2. Consumo de IA: implementação

- [x] 2.1 Implementar em `padrao-openspec/scripts/flow-metrics.mjs` as opções `--usage` e `--usage-dir`, a localização das sessões (D1), a leitura com deduplicação (D2) e a atribuição (D3). Verificar com `node --check` e com as asserções de contagem do smoke da 1.1.
- [x] 2.2 Gravar `uso-ia.csv` e a seção "Consumo de IA" do resumo (D4). Verificar com o smoke da 1.1 passando inteiro e com o "Smoke test das métricas de fluxo" ainda passando.
- [x] 2.3 Rodar o script com `--usage C:\teste-e2e\livraria` sobre o store do teste de ponta a ponta. Verificar que a change `add-catalogo-livros` recebe 169 respostas e 134.237 tokens de saída, os números deduplicados calculados à mão.

## 3. Documentação e integração

- [x] 3.1 Documentar `--usage` e `--usage-dir` na seção "Métricas de fluxo" do `padrao-openspec/README.md`, incluindo o que é lido, a privacidade e o limite de uma máquina por execução. Verificar com o lint de `padrao-openspec/` sem issues.
- [x] 3.2 Rodar `openspec validate --all --strict`, o lint e os smoke tests das métricas de fluxo e do consumo de IA. Verificar que todos saem com código 0.
