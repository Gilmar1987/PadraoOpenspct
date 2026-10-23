# Revisão de código — aprovacao-por-conteudo

## 2026-10-22

- Intervalo: 16a810d..a881770
- Revisor: subagente requesting-code-review (leitura estática e o portão contra raízes descartáveis, sem store)
- Críticos: 1 (corrigidos 1)
- Importantes: 3 (corrigidos 3)
- Menores: 6 (corrigidos 5, justificados 1)
- Segurança: não aplicável (sem dependências novas; o portão só lê arquivos da change e calcula `sha256` com `node:crypto`)

Achados:

- [crítico] A regra "último `Conteúdo:` vale" pegava o selo antigo da linha "Aprovação anterior", e toda change reaprovada depois de uma mudança de escopo ficava bloqueada — corrigido em cce145f: o selo só vem dos itens `Conteúdo`, `Reconfirmação` e `Archive`; caso na CI com a linha "Aprovação anterior" depois da nova aprovação.
- [importante] `.inputs/` (originais do ingest, fora do git) entrava no selo e na busca de inferências — corrigido em cce145f: entradas ocultas ficam fora; caso na CI.
- [importante] Confirmar uma inferência (apagar a marca) depois de selar vencia a aprovação — corrigido em cce145f: a marca `[INFERIDO: ...]` sai da normalização do selo, e o propose resolve as marcas antes de selar; caso na CI.
- [importante] `Conteúdo:` malformado era tratado como "sem selo" e liberava — corrigido em cce145f: bloqueia com "selo ilegível"; caso na CI.
- [menor] Fechamento de bloco de código e código em linha com crases duplas na busca de inferências — corrigido em cce145f (o bloco fecha só com o mesmo caractere e tamanho; o código em linha casa o mesmo número de crases).
- [menor] Evidência quebrada em várias linhas mudaria o selo — corrigido em cce145f: o apply pede a evidência numa linha só.
- [menor] `--store` não citado no `selo` de propose, update e archive — corrigido em cce145f.
- [menor] Archive diferente do D4 — corrigido em cce145f: D4 alinhado ao que foi feito (o `Conteúdo` vai no item `Archive:` só quando a confirmação do responsável cobre as mudanças).
- [menor] O motivo "venceu" não listava os arquivos — corrigido em cce145f: lista os arquivos selados.
- [menor] O D5 pede a regra da marca "na geração dos arquivos" e ela entrou só nas Regras da entrevista — justificado: a regra fala "nos arquivos gerados" e vale para toda a geração, e a etapa "Inferências" confere todos os arquivos antes do commit.

Depois das correções: suíte local completa no Git Bash → `store` 22/22 e `root` 5/5 PASS, inclusive o "Smoke test do portão" com os casos novos; selo igual com CRLF e LF no PowerShell.
