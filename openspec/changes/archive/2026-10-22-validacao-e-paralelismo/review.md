# Revisão de código — validacao-e-paralelismo

## 2026-10-22

- Intervalo: c47be6ac0029e207482d0cc25ef5711eb21f1507..64f060c039eefd44c0751ab93dde5e2ba1f0bc5f
- Revisor: subagente requesting-code-review
- Críticos: 0
- Importantes: 1 (corrigidos 1)
- Menores: 5 (corrigidos 5)
- Segurança: não aplicável (a change não acrescenta dependências e o repositório não tem varredura de secrets definida, conforme o `openspec/project.md`)

Achados:

- [importante] O passo 6a do propose perguntava sobre outras worktrees "quando o `rules.md` menciona trabalho em paralelo", condição sempre verdadeira depois da seção 8 — corrigido em d35221b: pergunta quando o usuário menciona trabalho em paralelo ou `git worktree list` mostra mais de uma worktree.
- [menor] O passo "Ids de teste com sufixo" deixava passar ids com dígitos, `--id=`, aspas simples e `;`/`)` depois do id, e passava em silêncio sem o arquivo — corrigido em d35221b: regex `ci-[a-z0-9-]+` com aspas e separadores, filtro exato `-$sfx` e `test -f`; casos conferidos no Git Bash (4 ids fixos pegos, 2 com sufixo liberados).
- [menor] O trap do "Smoke test do script de entrada" não incluía `ci-falta-$sfx` — corrigido em d35221b.
- [menor] O CHANGELOG citava só o `openspec/rules.md` do store, e não a cópia `docs/openspec-regras.md` que o código lê — corrigido em d35221b.
- [menor] O proposal falava em "seis passos" com ids e trap, mas são quatro — corrigido em d35221b.
- [menor] O setup do "Smoke test do setup de projeto" registrava o id `store` sem sufixo numa execução local com terminal — corrigido em d35221b com `--no-register`.

Depois das correções: passos "Ids de teste com sufixo", "Trechos customizados das skills", "Raiz em dia com padrao-openspec", lint e validate (nos dois jobs), "Smoke test do setup de projeto" e "Smoke test do script de entrada" → PASS no Git Bash.
