# Revisão de código — guardas-mecanicas

## 2026-10-22

- Intervalo: 9732533..e10e926 (correções em 46b5a72)
- Revisor: subagente requesting-code-review
- Críticos: 1 (corrigido 1)
- Importantes: 5 (corrigidos 5, justificados 0)
- Menores: 8 (corrigidos 7, aceito 1)
- Segurança: varredura de secrets adiada no `openspec/project.md` deste repositório; auditoria de dependências não aplicável. O achado crítico era de segurança do fluxo (aprovação burlada) e foi corrigido.

Achados:

- [crítico] `Responsável: Pendente (aguardando gilmar)` liberava o apply, porque só o valor exato "Pendente" contava como pendente. Corrigido em 46b5a72: qualquer valor que comece com "Pendente", "N/A" ou só traços não é preenchido; caso novo na CI.
- [importante] O hook recusava commits documentados: o `fix:` de retrabalho que cita change arquivada e os commits de planejamento num projeto sem store separado. Corrigido em 46b5a72: só o bloqueio real (1) recusa; change não encontrada, commit que só toca `openspec/` e falta de portão, `node` ou trailer deixam passar; casos novos na CI.
- [importante] A detecção de commits de código casava prefixos (`abc` pegava `abc-def`), deixava passar fora do Git e contava commits de planejamento. Corrigido em 46b5a72: trailers lidos por `%(trailers:key=OpenSpec-Change,valueonly)` e comparados por igualdade; só commits que tocam algo fora de `openspec/`; fora de um repositório Git, saída 2; caso novo na CI.
- [importante] Com `Escopo: apply`, o archive parava no 3a e nunca chegava ao 4a, que pede a confirmação. Corrigido em 46b5a72: quando o escopo é o único motivo, o agente faz a confirmação do 4a e roda o portão de novo; a confirmação do passo 3 não passa por cima do portão.
- [importante] Valores entre crases (``archive``) e chaves em negrito não eram lidos. Corrigido em 46b5a72: crases, `*` e `_` são removidos; `archive` vale em qualquer posição do escopo; caso novo na CI.
- [importante] O JSON de erro tinha outro formato. Corrigido em 46b5a72: sempre `{ok, acao, change, motivos, erro?}`, também no `--help` com `--json`; a outra sessão foi avisada antes do PR.
- [menor] Nome de change e de store não validados (risco de `%VAR%` no shell do Windows e de regex no git). Corrigido em 46b5a72: `^[a-z0-9][a-z0-9-]*$`, saída 2.
- [menor] O hook bloqueava qualquer commit se o portão ou o `node` faltassem. Corrigido em 46b5a72: o shell sai com 0 nesses casos e sem trailer.
- [menor] O trailer era o primeiro da mensagem, inclusive em comentários. Corrigido em 46b5a72: vale o último, ignorando linhas `#`.
- [menor] A seção "Aprovação" não era encontrada em arquivos NFD. Corrigido em 46b5a72 (`normalize('NFC')`).
- [menor] Corrida no upload do workflow de release. Corrigido em 46b5a72 (`--clobber`, o arquivo é o da própria tag).
- [menor] Faltavam casos na CI (store não resolvido, regressões). Corrigido em 46b5a72.
- [menor] Design e bloco desatualizados (passo 3a; "erro de uso ou de ambiente"). Corrigido em 46b5a72.
- [menor] `JSON.parse` falha se o CLI imprimir um aviso antes do JSON. Aceito: falha fechada (saída 2), o que é seguro.
