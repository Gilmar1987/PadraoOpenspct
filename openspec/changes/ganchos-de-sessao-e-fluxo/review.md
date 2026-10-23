# Revisão de código — ganchos-de-sessao-e-fluxo

## 2026-10-23

- Intervalo: 3140d99..706c0ef
- Revisor: subagente requesting-code-review (hooks com JSON na entrada, portão em pasta descartável e git 2.52 real com um commit-msg que falha)
- Críticos: 0
- Importantes: 6 (corrigidos 6)
- Menores: 7 (corrigidos 5, justificados 2)
- Segurança: não aplicável (sem dependências novas; os hooks só leem a entrada do Claude Code e rodam o portão do próprio repositório)

Achados:

- [importante] Escritas de `core.hooksPath` que passavam (`git config set|unset`, `-f`/`--file`, `--type`) — corrigido em 96e0cbe: subcomandos do `git config` e opções com valor reconhecidos; casos na CI.
- [importante] `--config-env core.hooksPath=V` separado e `--no-verif` (prefixo aceito pelo git) passavam — corrigido em 96e0cbe.
- [importante] `git config core.hooksPath` sem valor (leitura) era negado, contra a spec — corrigido em 96e0cbe: só nega com valor ou opção de escrita.
- [importante] `git commit -uno` e `-S` eram negados, e `-m -n` também — corrigido em 96e0cbe: letras que levam valor encerram o grupo, e o valor separado de `-m`, `-F`, `-c`, `-C` e `-t` é pulado.
- [importante] Prefixos `VAR=`, `env`, `sudo`, `command` e as variáveis `GIT_CONFIG_*` passavam — corrigido em 96e0cbe (o hook pula os prefixos e nega `GIT_CONFIG_*` com `core.hooksPath`).
- [importante] O guia e o CHANGELOG prometiam "qualquer escrita de core.hooksPath" sem cobrir esses casos — resolvido pelas correções acima; o limite heurístico segue declarado no guia.
- [menor] Change listada sem pasta aparecia como "aprovação pendente" — corrigido em 96e0cbe (próximo passo próprio).
- [menor] O próximo passo ignorava o `review.md` antes do archive — corrigido em 96e0cbe (`/opsx:archive (com review.md, se a change alterou código)`).
- [menor] Duas versões do texto da linha de estado (portão e hook) e "valido" sem acento — corrigido em 96e0cbe: mesmo texto nos dois, "válido" na saída de texto, valores do JSON documentados no uso.
- [menor] Links, junções e nomes 8.3 faziam um arquivo do repositório parecer fora dele — corrigido em 96e0cbe com `realpathSync.native` do ancestral existente.
- [menor] Casos de borda sem teste na CI — corrigido em 96e0cbe (formas novas de deny e allow; `estado` com selo vencido, inferência e confirmação do archive).
- [menor] Isenção de `openspec/` literal na raiz Git — justificado: no layout do padrão a raiz OpenSpec é a raiz Git (repositório único) ou fica no store, fora do repositório de código.
- [menor] Ramo `notebook_path` sem o `NotebookEdit` no matcher — justificado: o grupo `Edit|Write` é compartilhado com o `escopo-de-escrita.mjs` da `subagentes-e-ganchos`, que tem o mesmo ramo; mudar o matcher é decisão dessa camada, fora desta change.

Depois das correções: 36 comandos conferidos no hook (22 negados, 14 liberados); "Smoke test dos hooks do Claude Code", "Smoke test do portão" e "Smoke test da camada do Claude Code no instalador" → PASS no Git Bash.
