# Revisão de código — adocao-inspecao-e-confirmacao

## 2026-11-06

- Intervalo: c5ef13f..a4f3182
- Revisor: subagente requesting-code-review (general-purpose, só leitura; rodou o teste e o script em cópias temporárias)
- Críticos: 1 (corrigido 1)
- Importantes: 7 (corrigidos 6, corrigido em parte e justificado 1)
- Menores: 9 (corrigidos 7, justificados 2)
- Segurança: varredura de secrets "Adiado" no `project.md` (não verificado); auditoria de dependências "Não aplicável" (sem dependências novas); a revisão conferiu a privacidade da saída do script, que é o ponto de segurança desta change

Achados:

- [crítico] C1: `comando` e `origem` da 7.1 saíam sem máscara, e uma credencial num script do `package.json` ou num passo de CI chegava à saída (reproduzido com `postgres://admin:…@`) — corrigido em c674d44: `maskText` sem corte nos comandos e na `origem`; fixture node-next com credencial no `scripts.migrate` e num passo de CI; o teste falha se `VALOR_FALSO` aparecer, e falhou com a máscara desligada (exit 1)
- [importante] I1: Next.js full-stack virava só front-end e Express com Vite no mesmo pacote virava só back-end, com 2.2 e 3.1/3.2 errados em `alta` — corrigido em c674d44: um manifesto pode ser back-end e front-end; Route Handlers e `pages/api/` do Next contam como back-end e dão 3.1 = 1; fixtures `existente-next-fullstack` e `existente-express-vite`
- [importante] I2: 3.2 = 0 num Django com templates, contra o D4 — corrigido em c674d44: templates do Django, `*.cshtml` e templates do Thymeleaf dão 3.2 = 3, e o 0 só sai sem eles; fixture django com `templates/base.html`
- [importante] I3: passos `run: |` de várias linhas eram ignorados — corrigido em c674d44: cada linha do bloco é um comando; fixture node-next com lint, typecheck e testes num `run: |`
- [importante] I4: dump com `COPY … FROM stdin` não contava como arquivo de dados, e o trecho levava e-mail e CPF — corrigido em c674d44: `COPY … FROM stdin`, pastas `seeds/` e `dumps/` e `*dump*.sql`/`*backup*.sql` contam como dados; fixture dados com `db/backup.sql` e `migrations/002_dados.sql`
- [importante] I5: o teste passava com a máscara desligada e com a regra do `INSERT` desligada — corrigido em c674d44: segredos fictícios em linhas que viram evidência (string de conexão do .NET, script e passo de CI), dados fictícios em migração com `INSERT` e em dump; o teste confere pela saída do script, e não por uma cópia da regra; as duas mutações agora falham (exit 1) e o teste passa limpo (exit 0)
- [importante] I6: `package.json` com BOM era ignorado sem aviso — corrigido em c674d44: o BOM é tirado na leitura, e um manifesto que não dá para ler vira aviso `achado`; conferido com um `package.json` gravado com BOM
- [importante] I7: partes do D4, D5 e D8 ficaram de fora sem registro, e o `init.md` citava capacidades que o script não tinha — corrigido em parte em c674d44: implementados 3.1 = 6 em `baixa` (Ruby, PHP, Elixir, Rust), 1.7 = 4, 3.3 e 3.4 pelo `.env.example`, 3.10 = 4, 4.1 = 2, 3, 4 e 5, 4.3, 5.1 = 2, 5.2 = 5, 5.6 = 4, Makefile, justfile, tox, pre-commit e gitleaks, "Executar localmente", o aviso `sem-pergunta` (feature flags), `arquivosLidos` e `submodulos` na saída; o `init.md` passou a montar o `--escopo` para excluir pastas, a inspecionar submódulos à parte e a usar `arquivosLidos`. Justificado: a finalidade "Teste de contrato" da 7.1 não é detectada, porque o comando depende da ferramenta escolhida para o contrato e o init já pergunta por ele quando a 2.6 registra um contrato
- [menor] M1: máscara com limite de 32 caracteres e lookahead quadrático — corrigido em c674d44 (24 ou mais com dígito, linha limitada a 2.000 caracteres antes da máscara; uma linha de 300 mil caracteres leva cerca de 1,5 s no total)
- [menor] M2: `password: "duas palavras"` mascarava só a primeira palavra — corrigido em c674d44 (valor entre aspas inteiro)
- [menor] M3: `pgcrypto` dava falso positivo na 6.6 — corrigido em c674d44 (exige `pgp_sym_encrypt`, `pgp_pub_encrypt`, Always Encrypted ou `EncryptedType`)
- [menor] M4: 2.2 = 3 em `alta` ignorava o multi-repo — corrigido em c674d44 (2.2 = 3 e 2.2 = 4 em `media`)
- [menor] M5: `localeCompare` dependia do locale — corrigido em c674d44 (comparação por código)
- [menor] M6: symlinks rastreados eram seguidos — corrigido em c674d44 (`lstatSync`, pulados)
- [menor] M7: `--raiz` numa subpasta e mensagem enganosa sem o Git — corrigido em c674d44 (`rev-parse --show-toplevel` e "Git não encontrado")
- [menor] M8: com `--escopo`, a 5.2 do CircleCI sumia; no teste, `commit.gpgsign` e hooks globais e a pasta temporária que vazava — corrigidos em c674d44
- [menor] M9: a conferência estática não pega `execFileSync as x`, e a 5.9 conta duas vezes a mesma pessoa com dois e-mails — justificado: a conferência é uma guarda, não uma prova, e a 5.9 é `media` com `S/n`

## 2026-11-06 (correções do init depois do teste)

- Intervalo: 6d4cb82..7900094 (antes do rebase sobre 2ea1542: 6868bf4..94813a7)
- Revisor: subagente requesting-code-review (general-purpose, só leitura; rodou o `sync-root.mjs --check`)
- Críticos: 0
- Importantes: 3 (corrigidos 3)
- Menores: 5 (corrigidos 4, justificado 1)
- Segurança: varredura de secrets "Adiado" no `project.md` (não verificado); auditoria de dependências "Não aplicável" (sem dependências novas)

Achados:

- [importante] I1: a regra da branch de adoção pulava a pergunta com a lista do `git diff` vazia ou com a principal à frente da branch, e a inspeção podia refletir um código mais velho que o da principal — corrigido em 07f17c3 (antes do rebase: 125ad9a): a pergunta só é pulada quando `git rev-list --count HEAD..<principal>` dá 0, os dois comandos funcionam, a lista não está vazia e só tem arquivos do padrão; em qualquer outro caso, é feita
- [importante] I2: o modelo do Arquivo 1 mandava trocar a tabela "Escopo da inspeção" por "Inspeção sem perguntas de escopo" sem a linha da branch de adoção, contra o cenário "Branch de adoção" — corrigido em 07f17c3: o comentário do modelo diz que a linha da branch entra mesmo sem pergunta feita
- [importante] I3: a Ativação descontava menos arquivos do padrão que a regra da branch (sem `.gitignore`, `.gitattributes` e `.claude/settings.json`), e um projeto novo sem a marca podia receber "Encontrei código existente" — corrigido em 07f17c3: a lista dos arquivos do padrão fica definida uma vez, na Ativação (a mesma do `standardPaths` do `comecar.mjs`, com o `.gitattributes` só com o bloco do padrão), e a regra da branch cita essa definição
- [menor] M4: arquivos inteiros (`.gitignore`, `AGENTS.md` e outros de bloco) entram na lista, e edições do projeto neles também pulam a pergunta — justificado: o script não tira desses arquivos nenhuma resposta de stack, então a inspeção da branch atual dá o mesmo resultado que a da principal
- [menor] M5: a regra 9 não dizia se mostra a evidência nem qual origem registrar — corrigido em 07f17c3: mostra a evidência, sem linha de recomendação para a opção oculta, e registra `escolhida`
- [menor] M6: "até as respostas de escopo" era ambíguo sem pergunta de escopo — corrigido em 07f17c3 ("até terminar as perguntas de escopo, ou concluir que não há nenhuma")
- [menor] M7: a regra 6 e a reutilização da pré-inspeção sem conferência na CI — corrigido em 07f17c3: 5 conferências novas no "Trechos customizados das skills"; passo → PASS (exit 0) e, sem a condição nova da branch, FAIL (exit 1, "Trecho customizado ausente: Pule a pergunta só quando os dois comandos funcionarem, a contagem for 0")
- [menor] M8: a reutilização da pré-inspeção não cobria os submódulos inspecionados à parte nem a escolha do back-end principal — corrigido em 07f17c3
