# Lacunas declaradas

Registro do que o projeto **ainda não cumpre** de uma fonte de referência: uma spec principal, uma ADR
`Accepted` ou um documento de referência (modelo de dados, contrato, documento do cliente). Uma lacuna
declarada é um atraso conhecido, com motivo e data; uma divergência fora daqui é regressão
([ADR-0007](https://github.com/Gilmar1987/PadraoOpenspct/blob/main/openspec/adrs/0007-lacunas-declaradas-e-precedencia-entre-documentos.md)).

Como manter:

- **Uma linha por lacuna.** `Motivo` e `Desde` (AAAA-MM-DD) são obrigatórios.
- **`Fonte`** é um caminho relativo a esta pasta do store (por exemplo,
  `openspec/specs/pedidos/spec.md`) ou `codigo:<caminho>` para um arquivo do repositório de código.
- **`SHA-256 da fonte`** é o hash do conteúdo da fonte, com o fim de linha normalizado. Para obtê-lo,
  rode a conferência abaixo: quando o hash falta ou diverge, ela mostra o valor atual.
- **Fonte alterada:** se a conferência disser que a fonte mudou, releia a declaração inteira contra a
  versão nova. Atualizar só o hash não basta: a lacuna pode ter fechado, mudado ou deixado de fazer
  sentido.
- **Lacuna fechada:** quando uma change cumpre o item, ela tira a linha daqui no mesmo commit.

Conferência (o `/opsx:verify` roda sozinho):

```sh
node padrao-openspec/scripts/lacunas.mjs                      # fontes do store
node padrao-openspec/scripts/lacunas.mjs --codigo ../meu-app  # também as fontes codigo:
```

| ID | Fonte | SHA-256 da fonte | Item não cumprido | Motivo | Desde | Encaminhamento |
|---|---|---|---|---|---|---|

<!-- Exemplo de linha (apague este comentário ao registrar a primeira lacuna):
| L-001 | openspec/specs/folha/spec.md | <64 caracteres hexadecimais> | Cálculo do horista | Depende do calendário de dias trabalhados | 2026-10-22 | change `calendario-de-trabalho` |
-->
