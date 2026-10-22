# Revisão de código — guia-de-entrada-do-dev

## 2026-10-21

- Intervalo: 19fa0d7..ffaa8d2 (correções em 8b16e98)
- Revisor: subagente requesting-code-review
- Críticos: 0
- Importantes: 3 (corrigidos 3, justificados 0)
- Menores: 8 (corrigidos 6, adiados 2)
- Segurança: varredura de secrets não verificada (o `openspec/project.md` deste repositório não registra o comando); auditoria de dependências não se aplica (a change não adiciona dependências)

Achados:

- [importante] O modo projeto novo não conferia se o id já estava registrado e falhava no meio do setup, deixando pastas criadas. Corrigido em 8b16e98: `refuseRegisteredId` antes do resumo, nos dois modos. A CI ganhou o caso "id já registrado" sem pastas criadas.
- [importante] No Node abaixo de 17, o import estático de `node:readline/promises` quebrava antes da mensagem de versão. Corrigido em 8b16e98: o prompter carrega o módulo por `import()` depois da checagem de versão, que agora é a primeira coisa do `main`. Conferido com `process.versions.node` simulado em 16.20.2, que mostra "Node.js 16.20.2 é antigo. Atualize para 18 ..." (exit 1).
- [importante] A saída do setup ficava escondida, o que contrariava o D5. Corrigido em 8b16e98: o D5 passou a registrar a decisão de mostrar a saída do setup só quando ele falha. O script avisa antes do passo ("Rodando o setup (pode levar alguns segundos)"), e a mensagem final traz a permissão de Actions que o setup citava.
- [menor] A detecção de pastas sincronizadas não pegava `Dropbox (Empresa)`, `My Drive`/`Meu Drive`, `Mobile Documents` e `CloudStorage`. Corrigido em 8b16e98.
- [menor] O id `store:` lido do repositório não era validado antes de ir para o shell no Windows. Corrigido em 8b16e98: agora é validado com o mesmo padrão do `--id`.
- [menor] URLs e `--origem` iam para `git clone` e `git ls-remote` sem `--`. Corrigido em 8b16e98.
- [menor] Um `--codigo` relativo era resolvido a partir da pasta atual. Corrigido em 8b16e98: é resolvido a partir da pasta base, como o D4 agora diz.
- [menor] O Git mínimo não era conferido (`git init -b` exige 2.28). Corrigido em 8b16e98.
- [menor] O exemplo do projeto novo no `COMECE-AQUI.md` não trazia a última linha do script nem a pergunta da pasta e o aviso de pasta sincronizada. Corrigido em 8b16e98.
- [menor] Recusas do setup numa pasta gerada (`--codigo` com `openspec/specs` ou `openspec/changes`) só aparecem depois do clone do store. Adiado: o caso é raro, o script lista o que fez e as pastas criadas, e a checagem duplicaria a lógica do setup.
- [menor] O guia do projeto manda quem já clonou o código rodar o script em outra pasta. Adiado: um modo "código já clonado" é escopo novo, para uma change própria.

Itens que o revisor deixou de fora, com a decisão:

- Sem TTY, `--pasta` e `--id` usam a sugestão em vez de parar. Mantido: é o significado de "sugestão" no D2, e a CI cobre a falta de `--nome`, que não tem sugestão.
- Expansão de `%` em caminhos no Windows. Mantido: é a mesma exposição do `setup-project.mjs`, fora do escopo.
- Execução interativa real no Windows. A conversa foi testada com TTY simulado (veja a evidência das tarefas 2.1 e 2.2); a execução num console real fica para o verify ou para o responsável.
- Integridade do arquivo baixado (checksum). Mantido como risco aceito na proposta.
