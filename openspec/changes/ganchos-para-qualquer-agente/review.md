# Revisão de código — ganchos-para-qualquer-agente

## 2026-11-05

- Intervalo: e7f6c52..1f0523b
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 2 (corrigidos 2, justificados 0)
- Menores: 6
- Segurança: varredura de secrets não verificada (o `project.md` a registra como "Adiado: definir na primeira change que precisar"); auditoria de dependências não se aplica (a change não acrescenta dependências)

Achados:

- [importante] O guia e o `COMECE-AQUI.md` declaravam o Copilot "Verificado" antes do roteiro da 4.2, contra o requisito "Suporte dos ganchos declarado por agente" — corrigido em f966ad8: a linha diz "Em verificação no Copilot CLI do VS Code" até o roteiro, e a do Claude Code cita a versão do roteiro 4.1
- [importante] O smoke do instalador não reproduzia o cenário "Atualização de um projeto da v1.18.0" (só uma entrada antiga com `args`) — corrigido em f966ad8: um caso novo gera o `settings.json` inteiro da v1.18.0 a partir do template (7 entradas com `args` em 4 grupos), com um hook do projeto, e confere 7 ganchos uma vez cada, sem `args`
- [menor] A frase "nunca trava o agente" prometia mais que o tratador — corrigido em f966ad8: o guia e a ADR-0012 falam de "uma exceção não tratada dentro do script", e o "Limite" da ADR lista o que escapa
- [menor] O aviso com código 0 fica discreto no Claude Code — registrado no "Limite" da ADR-0012 ("Aviso discreto") em f966ad8; aceito, porque a CI roda cada gancho com negações conhecidas
- [menor] A comparação da CI podia passar com duas respostas vazias — corrigido em f966ad8: os casos `neg` exigem `deny` ou `ask` na resposta direta, e a verificação foi vista reprovando à mão (`fail=1` com a resposta vazia, `fail=0` com a negação)
- [menor] Uma falha da chamada direta encerrava o passo sem mensagem sob `set -e` — corrigido em f966ad8 (`::error::... chamado direto falhou`)
- [menor] O teste do PowerShell não usava o caminho como o Copilot entrega — tornado sem efeito pelo roteiro de 2026-11-06, que mostrou que o Copilot não substitui o texto; a CI passou a rodar o `command` sem substituição (tarefa 1.4)
- [menor] Caminhos com `$` ou crase quebrariam no Copilot — resolvido pelo lançador `node -e` (f966ad8), que não passa o caminho pelo shell

## 2026-11-06

- Intervalo: 1f0523b..f966ad8
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 1 (corrigidos 1, justificados 0)
- Menores: 6
- Segurança: varredura de secrets não verificada (adiada no `project.md`); auditoria de dependências não se aplica (nenhuma dependência nova)

Achados:

- [importante] A CI não testava a falha interna do gancho pelo lançador, e a troca do nome para o `readPayload` ficava sem teste — corrigido em 4878807: os ganchos injetados chamam `readPayload` e rodam direto, pelo lançador no `bash` (fora da pasta, com a variável) e, no Windows, pelo `powershell`, exigindo saída 0, nada no stdout e `[<gancho>] erro interno` no stderr; visto reprovando à mão (sem a linha `currentHook = hookName`, o aviso sai `[gancho]`)
- [menor] Uma exceção antes do `readPayload` cita `[gancho]` — justificado: nos 7 ganchos, o código antes do `readPayload` são só definições; o limite foi registrado no "Fora do tratador" da ADR-0012 em 4878807
- [menor] O caso "powershell com a variável" rodava na pasta do projeto e não provava a leitura da variável — corrigido em 4878807: ele roda a partir da pasta temporária, fora do projeto
- [menor] A linha do Claude Code diz "Verificados" antes do `verification.md` — justificado: o roteiro real está na evidência das tarefas 4.1 e 4.4, e o `verification.md` desta change, escrito no `/opsx:verify` antes do archive, registra os dois roteiros; a release só sai depois do archive
- [menor] O guia afirmava que o Copilot executa o lançador antes do roteiro — corrigido em 4878807 ("para que outros agentes... também o executem", com remissão à tabela)
- [menor] Quebra de linha no meio da frase no `CHANGELOG.md` — corrigido em 4878807
- [menor] Gancho não achado (sem a variável e fora da pasta) ainda nega tudo no Copilot — justificado: um `.catch` no lançador liberaria em silêncio também quando o script do gancho fosse apagado; o limite está no "Fora do tratador" da ADR-0012, e o roteiro 4.2 confere a pasta em que o Copilot roda o gancho
