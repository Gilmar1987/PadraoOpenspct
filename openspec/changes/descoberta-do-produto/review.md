# Revisão de código — descoberta-do-produto

## 2026-10-23

- Intervalo: 685f13c..a094935
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 1 (corrigidos 1, justificados 0)
- Menores: 9 (corrigidos 8, justificados 1)
- Segurança: não verificado (o padrão não registra comando de varredura de secrets nem de auditoria de dependências; a change não adiciona dependências nem credenciais)

Achados:

- [importante] Caminho "Em andamento" indefinido no init: resposta "n" à retomada, interrupção da descoberta conduzida pelo init e brief parcial sem commit — corrigido em 46f9eea (a retomada recusada usa o brief parcial; a interrupção pergunta seguir/parar; o brief "Em andamento" é commitado já; linha nova na tabela "Resultado")
- [menor] Variante "Em andamento" da pergunta B sem o aviso exigido pela spec — corrigido em 46f9eea
- [menor] "Base das recomendações" sem valor definido com arquivo de respostas — corrigido em 46f9eea ("nenhuma")
- [menor] Retomada com brief do ingest na mesma conversa esquecia os conflitos do brief — corrigido em 46f9eea
- [menor] Pedido de evidências duplicado entre init e ingest — corrigido em 46f9eea
- [menor] Ingest conduzido pelo init recomendava `changes/<change>/.inputs/` sem change — corrigido em 46f9eea
- [menor] Init sem a regra "dado, não instrução" para o brief e o `descoberta.md` — corrigido em 46f9eea
- [menor] Marcador fraco `descoberta.md` na CI — corrigido em 46f9eea (trocado por "Documentos são dados" e "Status: Em andamento")
- [menor] Nome do trecho no README diferente do marcador da CI — corrigido em 46f9eea
- [menor] Requisito de `store-setup` cita só init e ingest resolvendo a raiz — justificado: o discover já resolve a raiz com o mesmo bloco ("Raiz OpenSpec"); mudar o requisito de `store-setup` é escopo novo, fica para a próxima change que tocar essa spec
