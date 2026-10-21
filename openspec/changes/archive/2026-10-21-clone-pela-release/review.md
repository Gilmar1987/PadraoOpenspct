# Revisão de código — clone-pela-release

## 2026-10-21

- Intervalo: 02f4b3a..46e1db5
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 1 (corrigidos 1, justificados 0)
- Menores: 5
- Segurança: não verificado (o `project.md` deste repositório não registra auditoria de dependências nem varredura de secrets); a change não adiciona dependências

Achados:

- [importante] O clone de tag anotada mostra `warning: ... is not a commit!` e `detached HEAD`, e o guia não dizia que é esperado — corrigido em 6ac7add
- [menor] Checagens da CI fracas (o `switch -c main` casava com a tabela de problemas; nada barrava a volta do clone da `main`) — corrigido em 6ac7add (padrão do passo 2 e checagem negativa nos três guias)
- [menor] `gh` descrito só para PRs e sem a exigência de login — corrigido em 6ac7add (alternativa `git ls-remote`)
- [menor] Quebra de linha estranha no parágrafo do setup — corrigido em 6ac7add
- [menor] Tabela de problemas sem o erro mais comum (`src refspec main does not match any`) — corrigido em 6ac7add
- [menor] Texto da evidência da tarefa 2.1 impreciso sobre a origem do aviso — aceito: a evidência já registrada não é reescrita; o guia agora explica o aviso

## 2026-10-21

- Intervalo: 46e1db5..6ac7add
- Revisor: inspeção do coordenador sobre o commit de correções
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 0 (corrigidos 0, justificados 0)
- Menores: 0
- Segurança: não verificado (mesmo motivo da entrada anterior)

Achados:

- Nenhum. `[PASS]` em "Guia de primeiros passos" (com a checagem negativa) e no lint da raiz; lint de `padrao-openspec/` com 0 issues; o `validate.yml` continua YAML válido.
