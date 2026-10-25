# Revisão de código — init-coerencia-e-ferramentas

## 2026-10-24

- Intervalo: 335d63b..396a320
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 4 (corrigidos 4, justificados 0)
- Menores: 7
- Segurança: não verificado (varredura de secrets adiada no `project.md`; a change não adiciona dependências nem credenciais). A conferência de ferramentas foi revista para não executar código do projeto.

Achados:

- [importante] A conferência de ferramentas podia executar scripts (primeiro token sendo um caminho), rodar a suíte (`pytest -v`) ou travar (sem tempo limite) — corrigido em 65f7ac9 (`command -v`/`Get-Command` antes de executar, caminho só conferido como arquivo, sem `-v`, tempo limite de 10 s)
- [importante] Com `docker compose run` e `uv run`, conferia a ferramenta errada — corrigido em 65f7ac9 (a ferramenta é o `docker` ou o `uv`)
- [importante] Linha `.env` × criptografia contradizia a linha do "sem produção" — corrigido em 65f7ac9 (só vale com produção na 4.1)
- [importante] A linha "Auditoria de dependências Não aplicável" sugeria a auditoria completa — corrigido em 65f7ac9 (sugere a de produção, com a completa em Observações)
- [menor] SQLite gerenciado (Turso, D1) disparava a linha do banco local — corrigido em 65f7ac9
- [menor] Proposta da linha `.env` × criptografia sem os cofres 3 e 4 — corrigido em 65f7ac9
- [menor] Linha de cobertura ambígua (Adiado, comando que mede pela configuração, "Outro" com meta) — corrigido em 65f7ac9
- [menor] "Outro" na 4.1 ou na 4.2 apagava a escolha anterior — corrigido em 65f7ac9
- [menor] Exemplos de auditoria imprecisos (`osv-scanner` com lockfile de produção, `dotnet` sem transitivas) — corrigido em 65f7ac9
- [menor] Comandos compostos (`FOO=1 cmd`, `cross-env`, `&&`) não citados — corrigido em 65f7ac9
- [menor] A auditoria completa informativa nunca roda (apply e verify leem só o comando registrado) — justificado: decisão do design (D4), que mantém o modelo de `project.md` com uma linha só; rodar a completa fica para uma change futura, se for pedida
