# Revisão de código — guia-de-primeiros-passos

## 2026-10-21

- Intervalo: 23d3750..3147cef
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 2 (corrigidos 2, justificados 0)
- Menores: 8
- Segurança: não verificado (o `project.md` deste repositório não registra auditoria de dependências nem varredura de secrets); a change não adiciona dependências

Achados:

- [importante] `git push -u origin main` falharia num Git para Windows sem `init.defaultBranch` (branch criada como `master`) — corrigido em eb2416b (`git init -b main` no guia e no README)
- [importante] O guia dizia que o GitHub Copilot roda os comandos `/opsx:*`, mas o padrão só os instala para o Claude Code — corrigido em eb2416b (pré-requisito passa a ser o Claude Code, com nota para outros agentes)
- [menor] Aviso do gerador de projeto depois do bloco do setup — corrigido em eb2416b
- [menor] Linha do `--update` sem o comando (o setup não aceita a opção) — corrigido em eb2416b
- [menor] Remoto do store sem push — corrigido em eb2416b
- [menor] `&&` no exemplo do README, inválido no PowerShell 5.1 — corrigido em eb2416b
- [menor] Guia do projeto listava pastas fixas, inexistentes com `--target` diferente — corrigido em eb2416b (cita `managedFiles`)
- [menor] Se a 1.2.0 for publicada antes, a change `coerencia-de-seguranca-e-triagem` não poderá usar a 1.1.0 — aceito: registrado aqui e a ser tratado no rebase daquela change, que hoje está em outra branch
- [menor] `MD024.siblings_only` vale para todo o Markdown, não só o CHANGELOG — aceito: só afrouxa a regra para títulos iguais sob seções diferentes, como os de várias versões; nada passa a falhar
- [menor] A CI confere que o README linka o guia, não que o link vem antes da primeira seção — aceito: a spec pede que a CI pegue a ausência do link; a posição é revisada no PR

## 2026-10-21

- Intervalo: 3147cef..eb2416b
- Revisor: inspeção do coordenador sobre o commit de correções
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 0 (corrigidos 0, justificados 0)
- Menores: 0
- Segurança: não verificado (mesmo motivo da entrada anterior)

Achados:

- Nenhum. `git init -b main` nos três blocos, Claude Code como agente dos comandos, lint da raiz e de `padrao-openspec/` com 0 issues e `[PASS] Guia de primeiros passos`.
