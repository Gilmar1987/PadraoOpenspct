# Revisão de código — adocao-entrada-no-comecar

## 2026-11-05

- Intervalo: 3af2eca..5db4d9f
- Revisor: subagente requesting-code-review (general-purpose, só leitura)
- Críticos: 0
- Importantes: 3 (corrigidos 2, pendente 1 de decisão do responsável)
- Menores: 9 (corrigidos 6, justificados 3)
- Segurança: varredura de secrets "Adiado" no `project.md` (não verificado); auditoria de dependências "Não aplicável" (sem dependências novas)

Achados:

- [importante] I1: a conferência do aviso de não rastreados (`grep -qF 'tmp/'`) passava à toa, porque o caminho do `mktemp -d` (`/tmp/tmp.XXXX`) aparece em toda linha do resumo — corrigido em 67c8b7d: busca o texto inteiro "Arquivos não rastreados, que ficam fora do commit: tmp/"; vista falhando com o aviso removido do `adoptProject` (exit 1) e passando limpa (exit 0)
- [importante] I2: o store pode ser clonado dentro do repositório de código quando a pasta base é a do código (o padrão da pergunta é a pasta atual, e o COMECE-AQUI manda abrir o terminal na pasta), o que deixa um repositório aninhado não rastreado e faz o `install-skills --update` recusar a árvore — pendente: a correção é uma recusa nova, fora da tabela do D3 e do requisito "Recusas antes da adoção", e entra só pelo `/opsx:update`, por decisão do responsável
- [importante] I3: o D4 pede que um erro depois da branch de adoção mostre como voltar com `switch` e `branch -D`, mas o passo só citava o `switch`, que levaria as alterações do setup para a branch original — corrigido em 67c8b7d: se o clone do store ou o setup falha, o erro mostra `reset --hard`, `switch <original>`, `branch -D <branch>` e os arquivos novos que o setup criou
- [menor] M1: a recusa do OpenSpec sem o padrão não dizia o que fazer, e o requisito pede o motivo e o que fazer — corrigido em 67c8b7d (falar com o tech lead sobre levar as specs para um store; a tabela do COMECE-AQUI também)
- [menor] M2: o aviso da árvore suja e a lista de não rastreados liam o porcelain sem `-z`, e nomes com acento saíam com escape (`"rel\303\263rio.md"`) — corrigido em 67c8b7d (`statusEntries` com `-z`); conferido com `relatório.txt`
- [menor] M3: o resumo não avisava os arquivos do padrão que já existiam sem commit e ficariam fora do commit (por exemplo, um `.claude/` não rastreado) — corrigido em 67c8b7d (`editedStandardBefore` no resumo)
- [menor] M4: a mensagem final não lembrava de ligar a permissão de Actions para os PRs de atualização — corrigido em 67c8b7d (mesmo lembrete do modo 1)
- [menor] M5: `--branch` fora da adoção era ignorado em silêncio — corrigido em 67c8b7d (aviso, como o do `--sem-commit` no modo 2)
- [menor] M6: lacunas de teste (operação em andamento, pasta que não é repositório, `grep -qF 'PR'` fraco, ausência da branch conferida em poucas recusas) — corrigido em 67c8b7d (recusas de pasta sem Git e de merge em andamento, a mensagem inteira do PR e a ausência da branch também no HEAD destacado e no merge), vistas falhando com a recusa removida (exit 1) e passando limpas (exit 0); subpasta, nome de branch inválido e recusa depois do clone por URL ficam sem caso na CI, porque são conferências diretas do Git sem lógica própria
- [menor] M7: o `gitIn` descarta o stderr, e um repositório com "dubious ownership" aparece como "não é um repositório Git" — justificado: a recusa continua segura e não escreve nada; o diagnóstico fino fica para quando aparecer um caso real
- [menor] M8: depois do clone por URL, uma recusa de conteúdo manda apagar o clone e, no caso "sem commits", também mostra os comandos do primeiro commit — justificado: o D2 aceita essa escrita, e o clone de um repositório vazio é raro; a mensagem de "apague" vem do mecanismo comum de erros do script
- [menor] M9: uma branch de adoção que já existe só no remoto não é detectada, e um hook de pre-commit que falha gera o aviso genérico de identidade — justificado: as duas situações aparecem no PR ou no aviso com o comando manual, e o comportamento do commit é o mesmo do modo 1
