# Revisão de código — lacunas-e-adrs-verificaveis

## 2026-10-23

- Intervalo: d0b18b0..fd7ec0f
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 4 (corrigidos 4, justificados 0)
- Menores: 10 (corrigidos 9, justificado 1)
- Segurança: auditoria de dependências não aplicável (o script não tem dependências); varredura de secrets não verificada (o `project.md` registra "Adiado"), diff conferido à mão sem secrets

Achados:

- [importante] `2026-02-30` passava como data válida — corrigido em 4a49e70: a data volta pelo `toISOString`; smoke cobre o caso
- [importante] Comentário HTML antes da tabela deslocava o número da linha — corrigido em 4a49e70: o comentário mantém as quebras de linha
- [importante] `--raiz` inexistente ou sem `openspec/` passava como "sem registro" — corrigido em 4a49e70: sai com 2 e diz qual raiz usar; smoke cobre o caso
- [importante] A heurística do verify não dizia de onde rodar o script — corrigido em 4a49e70: `node <root>/scripts/lacunas.mjs --raiz <root>` com a raiz de `openspec list --json`, também no D3 do design
- [menor] Fonte que é pasta saía com erro cru e código 2 — corrigido em 4a49e70
- [menor] Caminhos absolutos, fora da base ou com `\` — corrigido em 4a49e70: relativos, dentro da base e com `/`
- [menor] Linha com colunas faltando dava mensagem enganosa — corrigido em 4a49e70
- [menor] Outras tabelas ou blocos de código viravam lacunas — corrigido em 4a49e70: só a primeira tabela, fora de blocos de código
- [menor] "ADR verification" não pedia o caminho citado — corrigido em 4a49e70
- [menor] Comentário da CI acima do passo errado — corrigido em 4a49e70
- [menor] Smoke sem data inválida e sem `codigo:` positivo — corrigido em 4a49e70
- [menor] Orientação da linha "Conferência de lacunas" confusa — corrigido em 4a49e70
- [menor] O init não preenche a seção de precedência nem a linha de conferência — corrigido em 4a49e70 de outro jeito: o modelo de `project.md` passa a trazer valores padrão em vez de comentários, então nada sobra sem preencher; o init continua sem mudança, que fica fora do escopo da change
- [menor] "1 lacunas" e mensagens em dois idiomas — plural corrigido em 4a49e70; justificado manter o uso e o "Error:" em inglês, como nos outros scripts do padrão
