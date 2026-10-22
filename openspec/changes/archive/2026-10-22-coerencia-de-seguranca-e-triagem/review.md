# Revisão de código — coerencia-de-seguranca-e-triagem

## 2026-10-22

- Intervalo: 94a1e27..45029c6
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 2 (corrigidos 2, justificados 0)
- Menores: 6 (corrigidos 6)
- Segurança: auditoria de dependências não aplicável (o `project.md` registra "Não aplicável": a change não mexe em dependências); varredura de secrets não verificada (o `project.md` registra "Adiado"), diff conferido à mão sem secrets

Achados:

- [importante] O formato de `Triagem:` não tinha a classe "não verificado" nem dizia que o achado vai para `Não verificado:` — corrigido em 0c5f21d
- [importante] Nenhum marcador de CI protegia o texto novo do init — corrigido em 0c5f21d (cinco `check` no bloco da entrevista do init)
- [menor] A restrição levada ao `project.md` podia contrariar a justificativa do responsável — corrigido em 0c5f21d
- [menor] "Sem autenticação" por "Outro" ficava fora da combinação — corrigido em 0c5f21d ("ou um 'Outro' equivalente", como na 5.5)
- [menor] A 1.5 escrita de outro jeito que na linha de LGPD — corrigido em 0c5f21d
- [menor] Lugar da justificativa nas linhas da 7.1 e ação do CHANGELOG — corrigido em 0c5f21d (coluna "Observações")
- [menor] Severidade da ferramenta sem correspondência com as do verify — corrigido em 0c5f21d
- [menor] "Sem autenticação" podia virar componente no `arquitetura.md` — corrigido em 0c5f21d

As correções refinam o texto do D2 e do D3 do `design.md` (justificativa em "Observações", "Outro" equivalente, classe "não verificado" e mapeamento de severidade) sem mudar a intenção. O `design.md` não foi reescrito.
