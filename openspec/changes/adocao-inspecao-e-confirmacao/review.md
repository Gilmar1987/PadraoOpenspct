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
