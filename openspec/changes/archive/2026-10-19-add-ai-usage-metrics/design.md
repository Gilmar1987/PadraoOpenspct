# Design

## Context

- O Claude Code grava cada sessão em `~/.claude/projects/<pasta-do-projeto>/<sessão>.jsonl`, um objeto JSON por linha.
- O nome da pasta é o caminho da pasta de trabalho com todo caractere fora de `[A-Za-z0-9]` trocado por `-`. A letra do drive aparece minúscula ou maiúscula conforme a sessão foi aberta (`c--ProjetoOpenspct`, `C--ProjetoTeste`).
- As linhas de resposta têm `type: "assistant"`, `message.id`, `message.model`, `message.usage` (`input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`), `timestamp` (ISO, UTC), `cwd` e `gitBranch`.
- Uma mesma resposta aparece em várias linhas, uma por bloco de conteúdo, com o mesmo `message.id` e o mesmo `usage`. Na sessão do teste de ponta a ponta, foram 412 linhas para 169 respostas.
- O `flow-metrics.mjs` já lê as changes do store, com criação, archive e estado, e escreve só no `--out`.

## Architecture Decisions

Não há ADR nova: é uma opção nova do script de métricas, sem decisão transversal. Segue a [ADR-0001](../../../adrs/0001-padrao-openspec-fonte-unica.md). A atribuição por branch aproveita a convenção de nomes de branch já usada no repositório e não cria regra nova.

## Goals / Non-Goals

**Goals:**

- Números de consumo que batem com a cobrança real em quantidade de tokens, sem dupla contagem.
- Nenhum conteúdo de conversa sai do arquivo de sessão.

**Non-Goals:**

- Precisão absoluta de atribuição: o que não dá para atribuir com segurança fica fora, contado à parte.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/scripts/flow-metrics.mjs` | opções `--usage` e `--usage-dir`, leitura, atribuição, `uso-ia.csv` e seção do resumo | smoke test das métricas de fluxo, que precisa continuar passando |
| `.github/workflows/validate.yml` | novo "Smoke test do consumo de IA" | job `store` |
| `padrao-openspec/README.md` | documentação da opção | nenhum |

## Decisions

### D1. Localização das sessões

Para cada `--usage <caminho>`:

1. calcular `path.resolve(caminho).replace(/[^A-Za-z0-9]/g, '-')`;
2. procurar na pasta de sessões uma subpasta com esse nome, ignorando maiúsculas e minúsculas;
3. ler todos os `*.jsonl` dela.

Linhas que não são JSON válido são ignoradas e contadas no aviso do resumo.

### D2. Campos lidos e deduplicação

De cada linha, o script lê só `type`, `message.id`, `message.model`, `message.usage`, `timestamp` e `gitBranch`; `cwd` não é necessário para a atribuição. Ele considera só `type === "assistant"` com `usage`, e mantém um conjunto de `message.id` já contados, globalmente entre arquivos. Uma linha sem `message.id` usa `requestId` como chave; sem nenhum dos dois, conta a linha.

### D3. Atribuição

1. **Branch:** separar `gitBranch` por `/`. Se exatamente uma change tiver o nome igual a um segmento, ou se o último segmento terminar com `-<nome>` ou for igual ao nome, atribuir a ela.
2. **Janela:** data `AAAA-MM-DD` do `timestamp` (UTC). Candidatas são as changes com `criada <= data <= (arquivada ?? hoje)`. Com exatamente uma candidata, atribuir a ela; com mais de uma, o registro é ambíguo; sem nenhuma, é não atribuído.

### D4. Saída

**`uso-ia.csv`**, com o mesmo estilo do `metrics.csv` (BOM UTF-8, valores ausentes vazios):

`change, respostas, tokens_entrada, tokens_saida, tokens_cache_leitura, tokens_cache_escrita`

- Com pelo menos uma pasta de sessões encontrada, cada change tem números (zero quando nada foi atribuído).
- Sem nenhuma pasta encontrada, as colunas de consumo ficam vazias.

**`resumo.md`**, seção "Consumo de IA":

- total de respostas;
- totais por modelo (saída e leitura de cache);
- registros ambíguos e não atribuídos;
- avisos: pasta sem sessões, linhas inválidas;
- a frase "Só metadados de consumo são lidos; o conteúdo das conversas não é lido nem gravado."

### D5. Smoke test

O passo novo, "Smoke test do consumo de IA", reaproveita o store de exemplo do smoke das métricas: `add-catalogo` (01 a 08/10), `add-busca` (15 a 20/10) e `ativa-x` (de 05/10 até hoje). Ele cria uma pasta de sessões temporária com:

- uma resposta repetida em duas linhas na branch `feat/add-catalogo`;
- uma resposta em `main` no dia 03/10, que cai só na janela de `add-catalogo`;
- uma resposta na branch `feat/cliente-acme-add-busca`, com uma mensagem de usuário contendo `segredo-xyz`;
- uma resposta em `main` no dia 06/10, ambígua entre `add-catalogo` e `ativa-x`;
- uma resposta em `main` no dia 01/09, não atribuída.

Depois, confere as linhas exatas do `uso-ia.csv`, as contagens de ambíguos e não atribuídos no resumo, a ausência de `segredo-xyz` e `cliente-acme` na saída, e que sem `--usage` o arquivo não é criado.

## Risks / Trade-offs

- **[O formato das sessões pode mudar entre versões do Claude Code]** → campos ausentes são tolerados e a execução não quebra; o smoke test documenta o formato esperado.
- **[Branches com nomes genéricos não casam com nenhuma change]** → caem na janela de datas; sobreposições ficam como ambíguas, e o resumo mostra quanto ficou de fora.
- **[O consumo de quem não rodou o script fica de fora]** → cada pessoa roda o script na própria máquina; a soma entre máquinas fica fora do escopo e é declarada no README.
