# Proposal

## Why

A change `add-flow-metrics` mede tempo, vazão, retrabalho e qualidade, mas deixou de fora o custo de IA, a quarta pergunta da liderança. O agente não sabe quantos tokens gastou e não pode declarar esse número. Mas o Claude Code grava localmente, em `~/.claude/projects/<projeto>/*.jsonl`, o consumo de cada resposta, com horário, modelo, pasta (`cwd`) e branch (`gitBranch`).

Ao preparar esta change, encontramos uma armadilha que justifica um leitor próprio e testado: **cada resposta aparece em várias linhas do arquivo**, uma por bloco de conteúdo, com o mesmo `message.id` e o mesmo consumo repetido. Somar linha a linha triplicou os números da sessão de teste (421 mil tokens de saída em vez de 134 mil), e a página do teste chegou a ser publicada com o número errado.

## What Changes

- Nova opção `--usage <pasta>` (repetível) no `padrao-openspec/scripts/flow-metrics.mjs`. Ela lê as sessões locais do Claude Code das pastas indicadas (repositório de código ou store) e grava `uso-ia.csv` no diretório de saída, com uma linha por change: respostas, tokens de entrada, saída, leitura de cache e escrita de cache.
- **Deduplicação:** cada resposta é contada uma vez, por `message.id`.
- **Atribuição a uma change:**
  1. a branch do registro contém o nome de exatamente uma change;
  2. senão, a data do registro cai na janela (criação até archive, ou até hoje) de exatamente uma change;
  3. senão, o registro fica como ambíguo ou não atribuído, e só aparece nas contagens do resumo.
- O `resumo.md` ganha a seção "Consumo de IA", com totais por modelo e as contagens de registros ambíguos e não atribuídos.
- **Privacidade:** só são lidos `message.id`, `timestamp`, `gitBranch`, `cwd`, `message.model` e `message.usage`. O conteúdo das conversas nunca é lido nem gravado, e a saída não traz nomes de branch nem de pastas.
- `--usage-dir <dir>` troca a pasta de sessões; o padrão é `~/.claude/projects`, e a opção existe para testes.
- O smoke test monta sessões de exemplo e confere deduplicação, atribuição e privacidade.

### Fora do escopo

- Converter tokens em dinheiro: preços mudam e dependem de contrato.
- Outras ferramentas (Copilot, Cursor) e a telemetria OpenTelemetry do Claude Code, que é configurada pela organização.
- Consolidar o consumo de várias máquinas: cada pessoa roda na própria máquina e compartilha só o CSV.
- Mudar o `metrics.csv`: o consumo fica em arquivo separado, e só existe quando `--usage` é usado.

## Capabilities

### New Capabilities

- `ai-usage-metrics`: leitura do consumo local de IA por change, com deduplicação, regras de atribuição, saída e garantias de privacidade.

### Modified Capabilities

Nenhuma.

## Impact

- **Código:** `padrao-openspec/scripts/flow-metrics.mjs`.
- **CI:** um smoke test novo em `.github/workflows/validate.yml`.
- **Documentação:** a seção "Métricas de fluxo" do `padrao-openspec/README.md`.
- **Riscos:**
  - **Dados pessoais e sensíveis:** os arquivos de sessão contêm o conteúdo das conversas. O script lê só os campos de metadado listados e nunca grava conteúdo, nome de branch ou caminho; o smoke test confere isso.
  - Autenticação: não se aplica.
  - **Dados:** somente leitura.
  - **Configuração:** nenhuma; a pasta padrão é a do Claude Code.
  - **Compatibilidade:** o formato dos arquivos de sessão do Claude Code não é um contrato público e pode mudar. Campos ausentes viram contagens vazias, com aviso no resumo, sem quebrar a execução.

## Aprovação

- Responsável: gilmar.campelo
- Data: 2026-10-19
- Escopo: archive
- Condições: `openspec validate --strict` passa; o verify termina sem críticos; a CI fica verde
- Origem: resposta do usuário no chat, "Até o archive, com condições (Recomendado)", ao pedido "faça na sequencia 1, 2, 3 e 4"
