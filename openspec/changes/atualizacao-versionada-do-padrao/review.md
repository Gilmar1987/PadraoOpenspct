# Revisão de código — atualizacao-versionada-do-padrao

## 2026-10-20

- Intervalo: 82615c0..9a870fa
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 7 (corrigidos 7, justificados 0)
- Menores: 10
- Segurança: varredura de secrets e auditoria de dependências não verificadas (o `project.md` deste repositório não registra os comandos); a change não adiciona dependências de pacote

Achados:

- [importante] `--update` deixava a pessoa numa branch pela metade quando algo falhava depois de criá-la (reproduzido com hook de pre-commit e com "nada a commitar") — corrigido em 14e9ce1 (rollback para a branch original e remoção da branch nova; smoke com hook que falha)
- [importante] Arquivo extra numa pasta de skill fazia toda reinstalação parecer mudança — corrigido em 14e9ce1 (comparação só dos arquivos da fonte; smoke com `extra.md`)
- [importante] O `GITHUB_TOKEN` não publica mudanças em `.github/workflows/`, então uma versão que muda o próprio workflow travaria a atualização — corrigido em 14e9ce1 (segredo opcional `PADRAO_UPDATE_TOKEN`, erro explicativo no push, risco registrado na ADR-0004 e no guia)
- [importante] Uma execução que falhava depois do push bloqueava as seguintes da mesma versão — corrigido em 14e9ce1 (branch remota sem PR é reaproveitada só para abrir o PR; versão com PR fechado não é reproposta; guia corrigido)
- [importante] Origem SSH quebrava o clone no runner — corrigido em 14e9ce1 (`source` normalizado para HTTPS e clone por `https://github.com/<repo>.git`)
- [importante] `--force` virou silenciosamente sem efeito, contra o D4 — corrigido em 14e9ce1 (aviso ao usar `--force`; D4, riscos e guia alinhados ao comportamento)
- [importante] CHANGELOG 1.0.0 sem a ação para quem reinstala com `--force` — corrigido em 14e9ce1
- [menor] Tag não conferida contra `VERSION` — corrigido em 14e9ce1
- [menor] Falha na consulta da release confundida com "sem release" — corrigido em 14e9ce1
- [menor] `GH_TOKEN` exposto ao instalador — corrigido em 14e9ce1 (só nos passos com `gh`); risco de cadeia de fornecimento registrado na ADR-0004
- [menor] Manifesto regravado sem modo numa mudança só de versão — corrigido em 14e9ce1
- [menor] Validação do YAML do modelo ausente da CI — corrigido em 14e9ce1
- [menor] Smoke sem `--in-place`, sem caso de falha e sem checar arquivos intactos com pendência — corrigido em 14e9ce1
- [menor] `.openspec-padrao.json` duplicado no pathspec e árvore suja checada antes do "já está na versão" — corrigido em 14e9ce1
- [menor] Branch criada a partir da branch do disparo manual — corrigido em 14e9ce1 (checkout explícito da branch padrão)
- [menor] PR novo aberto ao lado de um PR de atualização antigo — corrigido em 14e9ce1 (o corpo cita os PRs anteriores ainda abertos)
- [menor] Casos de borda do `changelog-range.mjs` (pré-release, títulos sem versão, marcadores `*`) — aceito: o formato do CHANGELOG é controlado e a CI valida a primeira seção; documentado no design (D2)

## 2026-10-20

- Intervalo: 9a870fa..14e9ce1
- Revisor: inspeção do coordenador sobre o commit de correções
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 0 (corrigidos 0, justificados 0)
- Menores: 0
- Segurança: não verificado (mesmo motivo da entrada anterior)

Achados:

- Nenhum. Os passos do `validate.yml` passam localmente (14 do job `store`, inclusive o smoke novo com arquivo extra, hook que falha, mudança só de versão e `--in-place`, e 3 do job `root`); nenhum bloco `run:` do modelo de workflow interpola `${{ }}`; o design (D4, D10, riscos), o guia, a ADR-0004 e o CHANGELOG descrevem o comportamento implementado.
