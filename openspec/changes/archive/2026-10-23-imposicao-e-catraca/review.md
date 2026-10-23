# Revisão de código — imposicao-e-catraca

## 2026-10-23

- Intervalo: 0829a4a..e4c405c
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 3 (corrigidos 3, justificados 0)
- Menores: 7 (corrigidos 7)
- Segurança: auditoria de dependências não aplicável (sem dependências novas); varredura de secrets não verificada (o `project.md` registra "Adiado"), diff conferido à mão sem secrets

Achados:

- [importante] O marcador `check openspec/adrs/README.md "`imposicao`"` nunca falhava: entre aspas duplas, o bash trata a crase como substituição de comando, e o `grep` de string vazia sempre casa — corrigido em e0fa9d1: aspas simples e o trecho `` `imposicao` (opcional) ``; visto reprovando (exit 1 com o trecho retirado de uma cópia, exit 0 no arquivo limpo)
- [importante] "Verificador ausente" e `norma` ficavam dentro do laço "for each Accepted ADR with a non-empty `verificacao`", que nunca os alcança — corrigido em e0fa9d1: o item percorre toda ADR `Accepted` que a change toca e só roda a verificação das que não são `norma`
- [importante] A catraca não alcançava as falhas da verificação de ADR, embora o Impacto medido aceite "falha aceita" como destino — corrigido em e0fa9d1: o item de ADR compara a falha com "Accepted failures" antes de graduar, e a catraca diz que cobre também a `verificacao` das ADRs
- [menor] A prova "seen failing" para uma ADR existente estava no passo 5, que só trata de ADR nova — corrigido em e0fa9d1: o passo 6 a exige para quem escreve, muda ou promove a verificação
- [menor] "The list only shrinks without an approved proposal" era ambígua — corrigido em e0fa9d1: "A row enters only through an approved proposal; a fixed failure leaves through `retira`"
- [menor] O separador `:` da linha `Falhas aceitas:` colidia com identificadores como `tests/x.py::test_y` — corrigido em e0fa9d1: falha e verificação entre crases (`` aceita `<falha>` em `<verificação>` ``), com o D5 do design alinhado
- [menor] O modelo do Arquivo 6 não definia a coluna Verificação — corrigido em e0fa9d1
- [menor] As ADRs fundacionais do init nasceriam com `imposicao` vazio e "Limite" só com comentários — corrigido em e0fa9d1: `imposicao: norma` e o Limite "Fica sob palavra: toda a decisão", salvo quando a ADR tiver `verificacao`
- [menor] `norma` com `verificacao` preenchida ficava sem regra — corrigido em e0fa9d1: `norma` não roda nada; para rodar, a ADR declara `consultivo`
- [menor] O propose não dizia o que fazer sem a seção "Falhas aceitas" — corrigido em e0fa9d1: diz que a seção não existe, e o destino "falha aceita" do Impacto medido fica indisponível
