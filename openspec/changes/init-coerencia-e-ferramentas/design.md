# Design

## Context

- A tabela "Checagem de coerência" do `init.md` tem 13 linhas e é avaliada na hora, assim que a última resposta envolvida existe, e de novo antes da confirmação final. Com arquivo de respostas, é avaliada só no fim.
- A 7.1 pergunta um comando por finalidade da seção "Comandos de verificação" do `project.md`, com até 3 sugestões coerentes com a stack. A auditoria de dependências tem um parágrafo próprio de sugestões.
- A 6.4 é de múltipla escolha e não diz que "0) Nenhuma no MVP" é exclusiva. A 2.6 diz isso da opção dela.
- O init termina com "Commit the init" e depois "Próximos passos". Nada confere se os comandos registrados rodam na máquina.

## Architecture Decisions

Não há ADR nova: são regras da entrevista. A change segue a [ADR-0003](../../adrs/0003-padrao-sem-stack-embutida.md): os exemplos de ferramentas e de instalação vêm de vários ecossistemas e sistemas.

## Goals / Non-Goals

**Goals:**

- Incoerências comuns apontadas pela tabela, sem depender do julgamento do agente.
- O dev sabe, ao fim do init, quais ferramentas faltam na máquina.

**Non-Goals:**

- Instalar ferramentas ou mudar o modelo de `project.md`.

## Decisions

### D1. Linhas novas na tabela de coerência

| Combinação | Consequência | Proposta |
|---|---|---|
| 3.3 é SQLite ou 3.4 é "Local apenas", e 4.1 é Vercel/Netlify ou 2.1 é Serverless | O sistema de arquivos do deploy é efêmero: os dados se perdem a cada deploy ou instância | Banco gerenciado (3.4 = 1), ou um deploy com disco persistente na 4.1 |
| 4.4 é "Apenas .env" e 6.6 é criptografia de campos na aplicação | A chave de criptografia fica num arquivo, sem cofre nem rotação em produção | Cofre ou variáveis da plataforma (4.4 = 1 ou 2) |
| 5.6 exige cobertura mínima (1, 2, 3 ou 5) e o comando de "Testes" da 7.1 não mede cobertura | A meta de cobertura não é conferida por nenhuma etapa | Um comando que meça cobertura (por exemplo, `vitest run --coverage`, `pytest --cov`, `dotnet test --collect:"XPlat Code Coverage"`), ou a 5.6 em "Sem cobertura mínima definida" |
| 2.6 registra um contrato e o "Teste de contrato" da 7.1 é "Não aplicável" | O contrato e o código podem divergir sem que nada aponte | Registrar o comando, "Adiar" ou justificar em "Observações" |

A linha da cobertura é avaliada quando a 7.1 "Testes" é respondida, e a do contrato quando a 7.1 "Teste de contrato" é respondida, pela regra "Na hora".

### D2. Linhas existentes reescritas

- **"3.8 é Redis ou broker dedicado e o bloco 4 não prevê esse serviço":** a proposta passa a ser "Registrar o serviço por 'Outro' na 4.2 (contêiner no desenvolvimento e na produção) ou na 4.1 (serviço gerenciado), ou trocar por fila no banco da 3.3".
- **"4.4 usa variáveis ou cofre da plataforma e 4.1/4.3 não têm produção":** passa a ser "4.4 usa variáveis ou cofre da plataforma (1 a 4) e a 4.1 é 'Outro' sem produção (por exemplo, 'Sem deploy no MVP')". A consequência e a proposta não mudam.

### D3. "0" exclusivo na 6.4

Linha depois das opções, como na 2.6: "A opção 0 exclui as demais: uma resposta com o 0 e outra opção é recusada, com essa explicação, e a pergunta é feita de novo."

### D4. Auditoria de produção na 7.1

O parágrafo "Para a auditoria de dependências" passa a sugerir primeiro a variante de produção:

- `npm audit --omit=dev --audit-level=high`;
- `pip-audit -r requirements.txt`, sem as dependências de desenvolvimento;
- `dotnet list package --vulnerable`, que já considera só os pacotes do projeto;
- `osv-scanner` com o lockfile de produção.

O comando completo vai em "Observações" como informativo, por exemplo "Completa (informativa): `npm audit`". O apply e o verify continuam rodando o comando registrado e não mudam.

### D5. Seção "Ferramentas da máquina"

Seção nova depois de "Commit the init":

- Para cada linha de "Comandos de verificação" com comando, identifique a ferramenta. É a primeira palavra, depois de prefixos como `npx`, `npx --yes`, `docker compose run --rm <serviço>` ou `uv run`. Com `npx`, a ferramenta é o próprio `npx`.
- Rode `<ferramenta> --version`, ou `version`, `-v` ou `--help` quando ela não aceita `--version`. Não rode o comando inteiro.
- Liste as ausentes numa tabela "Ferramenta | Comando que a usa | Sugestão de instalação". As sugestões trazem exemplos de `winget`, `brew`, `apt`, `npm i -g` ou `pipx`, conforme o sistema da máquina.
- Não instale nada. Se tudo responder, diga "Ferramentas dos comandos de verificação disponíveis".
- No Windows, acrescente: "Depois de instalar por `winget`, abra um terminal novo: os terminais abertos antes não enxergam a ferramenta."

O mesmo aviso do Windows entra no COMECE-AQUI, no trecho de problemas comuns.

Alternativa descartada: conferir as ferramentas no setup. O setup roda antes de os comandos existirem, porque eles vêm da 7.1.

### D6. CI e documentação

- **Marcadores no init:** `## Ferramentas da máquina`, `A opção 0 exclui as demais: uma resposta com o 0`, `--omit=dev` e `O sistema de arquivos do deploy é efêmero`.
- **README:** uma linha na tabela de trechos customizados.
- **CHANGELOG:** um item na 1.15.0, sem ação obrigatória.

## Risks / Trade-offs

- [O `--version` de uma ferramenta pode exigir rede ou demorar] → Rodar só a ferramenta, sem o comando, e aceitar `--help` como alternativa. Uma falha vira "ausente ou sem resposta", e não erro do init.
- [A identificação da ferramenta erra em comandos compostos] → Os prefixos comuns estão listados. Em caso de dúvida, o agente mostra o comando e pergunta, sem adivinhar.
- [Conflito textual com a change de aprovação por etapa] → Ela não toca o `init.md`. No `validate.yml`, no README e no CHANGELOG, quem entrar por último faz o rebase.

## Migration Plan

Nenhuma migração. Projetos já inicializados não rodam o init de novo.
