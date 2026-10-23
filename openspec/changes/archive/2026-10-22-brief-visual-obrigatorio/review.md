# Revisão de código — brief-visual-obrigatorio

## 2026-10-22

- Intervalo: f721366..69d2802
- Revisor: subagente requesting-code-review (leitura estática)
- Críticos: 0
- Importantes: 2 (corrigidos 2)
- Menores: 4 (corrigidos 4)
- Segurança: não aplicável (só textos de fluxo, marcadores da CI e documentação; sem dependências)

Achados:

- [importante] O verify listava "interface" entre as palavras de tela, fora do plano e com muito falso positivo ("interface da API", a própria skill `interface-quality`) — corrigido em 20d2f76: lista igual à da spec, com "interface de usuário" e o sentido de "algo que o usuário vê".
- [importante] Não dizia como registrar o "não" do responsável nem o que fazer sem resposta — corrigido: linha `[warning] Screens without visual brief: o responsável disse que não há tela (<trigger>)` em `Itens:`, e sem resposta o warning fica e o archive não segue, também com `Escopo: archive`; o warning cita as palavras ou arquivos que o dispararam.
- [menor] O D1 dizia "logo depois" do Architectural Decision Check, e o bloco ficou antes — design alinhado ao que foi feito (antes é o ponto certo).
- [menor] O caso "change sem `design.md`" estava só implícito — explícito no verify, no D2 e na spec.
- [menor] A skill dizia "com a sua confirmação" (o leitor é o agente) — trocado por "com a confirmação do responsável".
- [menor] D2 e a delta spec diferiam do texto publicado — os três alinhados; `openspec validate --strict` passa.
