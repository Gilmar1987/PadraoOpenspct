# Design

## Context

- O modelo de ADR do padrão (`padrao-openspec/openspec/adrs/template.md`) tem `verificacao: []` no frontmatter e as seções Contexto, Decisão, Alternativas e Consequências. O `adrs/README.md` explica o campo.
- O verify, em "ADR verification", roda a `verificacao` de cada ADR `Accepted` que a change toca. Um teste ausente ou falhando é sempre crítico.
- O propose, em "Architectural Decision Check", manda preencher `verificacao` e criar a tarefa que escreve o teste. Ele não pede a prova de que o teste reprova nem a medida do que o código já viola.
- O init gera o `estado-atual.md` (Arquivo 6) com a tabela "Fora do ciclo atual" (Item, Motivo, Desde, Origem, Sai quando). O archive a atualiza pela linha `Débitos:` do proposal ("Update the open debts"). O exemplo de "Sai quando" já é um fato ("primeira change com banco"), mas nada pede que seja assim, e o verify não lê a tabela.
- O verify roda os comandos de "Comandos de verificação" do `project.md` ("Project validation commands"). Qualquer falha é crítico, sem distinguir a falha conhecida.
- O kit-esquadro implementa essas práticas com verificadores Python. O padrão não embute stack ([ADR-0003](../../adrs/0003-padrao-sem-stack-embutida.md)), então as regras daqui são do fluxo: o propose pede, o apply registra e o verify confere.

## Architecture Decisions

- [ADR-0008](../../adrs/0008-imposicao-declarada-e-catraca-de-falhas.md) (Proposed), criada por esta change: imposição declarada das decisões, critério "visto reprovando", impacto medido, catraca de falhas aceitas e "Sai quando" conferível. Ela estende a [ADR-0007](../../adrs/0007-lacunas-declaradas-e-precedencia-entre-documentos.md), sem contrariá-la, e segue a [ADR-0003](../../adrs/0003-padrao-sem-stack-embutida.md): toda regra aponta para o comando que o projeto registrou.
- Seguem a [ADR-0005](../../adrs/0005-regras-entregues-por-blocos-gerenciados.md): as regras chegam aos projetos pelos comandos, pelas skills e pelos modelos.
- A ADR-0008 é promovida a `Accepted` na revisão do PR, antes do archive.

## Goals / Non-Goals

**Goals:**

- O registro do verify separa o que está garantido do que está afirmado: cada ADR diz a sua imposição, e a severidade segue essa imposição.
- Nenhuma verificação de ADR nova conta sem a prova de que reprova.
- Uma falha conhecida tem lugar, com motivo e saída, sem esconder a regressão.
- Uma pendência com a condição de saída já cumprida aparece no verify.
- Stores e ADRs antigos funcionam sem migração.

**Non-Goals:**

- Script que compara a saída das ferramentas com a catraca. Ver a ADR-0008, Alternativas.
- Fazer a CI do projeto aplicar a catraca.
- Preencher `imposicao` nas ADRs 0001 a 0007 do padrão.
- Escrever guards de arquitetura para os projetos.

## Decisions

### D1. Modelo e README de ADR

- **`template.md`:**
  - acrescenta `imposicao:` ao frontmatter, depois de `verificacao`, com um comentário listando os quatro valores;
  - acrescenta a seção `## Limite` depois de Consequências, com dois itens: "**Garante:**" (o que o mecanismo confere, em termos exatos) e "**Fica sob palavra:**" (o campo ou o comportamento que nenhum mecanismo confere).
- **`README.md`:** item novo em Convenções, que explica:
  - os quatro valores e o padrão sem o campo (com `verificacao`, `controle`; sem ela, `norma`);
  - que uma verificação nova costuma nascer `consultivo` e só é promovida a `controle` depois de vista reprovando e sem falso positivo no registro;
  - que, numa ADR `externo`, a `verificacao` cita `<arquivo de configuração>#<regra>`;
  - que mudar `imposicao` ou "Limite" numa ADR `Accepted` não muda a decisão e não pede ADR nova, como já acontece com `verificacao`.
- **Linha do Limite:** "Garante" nomeia o que o mecanismo confere ("importações declaradas entre as pastas da tabela"), e não a área ("a arquitetura"). Uma frase como "tem limitações" não serve.

### D2. Verify: severidade pela imposição

O item "ADR verification" do verify (comando e skill, com o mesmo texto) passa a dizer:

- ler `imposicao`; sem o campo, `controle` se a ADR tiver `verificacao` e `norma` se não tiver;
- `controle`: falha ou teste ausente é CRITICAL, como hoje;
- `consultivo`: teste ausente é CRITICAL; falha é WARNING, com a saída;
- `externo`: conferir que o arquivo de configuração existe, que a regra citada está nele e que não está desligada (por exemplo, `off`, `0` ou `ignore` na regra, ou a regra num bloco de exclusão); regra ausente ou desligada é CRITICAL; se o `project.md` registrar o comando da ferramenta, rodá-lo também;
- `norma`: não roda nada, e a ADR não entra em "Não verificado";
- `controle` ou `consultivo` com `verificacao` vazia é CRITICAL ("verificador ausente").

### D3. Visto reprovando

- **Propose:** a tarefa que escreve ou muda uma `verificacao` termina com "rodar a verificação com a violação injetada (deve falhar) e no caso limpo (deve passar), e registrar os dois códigos de saída". A violação injetada é temporária e não entra no commit.
- **Config base:** regra nova em `tasks`: "A tarefa que cria ou muda a verificação de uma ADR registra a execução com a violação injetada (falha) e no caso limpo (passa)".
- **Verify:** heurística nova "**ADR check seen failing**": para cada `verificacao` acrescentada ou mudada pela change (comparar com a base da branch), procurar no `tasks.md` a evidência com as duas execuções. Sem ela, WARNING. Para a ADR que a change promove a `controle`, CRITICAL.
- **Nada a varrer:** uma verificação que roda sem arquivos na superfície (a pasta não existe, ou a saída diz que nada foi conferido) vai para "Não verificado", com `<ADR> (nada a varrer)`, e não conta como aprovada.

### D4. Impacto medido

- **Propose**, em "Architectural Decision Check", item novo: ao criar uma ADR com `verificacao`, ao acrescentá-la a uma ADR `Accepted` ou ao endurecê-la (por exemplo, de `consultivo` para `controle`, ou com uma regra mais estrita), o `design.md` ganha a seção `## Impacto medido`:
  - o comando, o código de saída e a contagem de violações;
  - a lista das violações, ou as primeiras 20 mais o total;
  - o destino de cada violação: tarefa da change, linha em `lacunas.md` ou falha aceita (linha `Falhas aceitas:` do proposal).
- **Teste que ainda não existe:** a seção diz "medido no apply". A tarefa que escreve o teste mede as violações antes de corrigir qualquer uma e as registra na evidência.
- **Config base:** regra nova em `design`: "Ao criar ou endurecer a verificação de uma ADR, o design traz o Impacto medido por comando, com o destino de cada violação".

### D5. Catraca de falhas aceitas

- **Modelo** (`init.md`, Arquivo 6): seção nova `## Falhas aceitas`, depois de "Fora do ciclo atual", com o texto:
  > Falhas conhecidas de comandos de verificação, aceitas por um proposal aprovado. A lista só encolhe: falha fora dela é regressão; linha cuja falha não acontece mais sai.

  A tabela tem as colunas `| Verificação | Falha | Motivo | Desde | Origem | Sai quando |`:
  - **Verificação:** o comando do `project.md` ou a `verificacao` da ADR;
  - **Falha:** o identificador exato da falha (nome do teste, ou regra mais arquivo do linter);
  - **Origem:** a change.

  O init cria a seção com a linha "Nenhuma".
- **Propose:** item novo depois de "Related debts". Quando o `estado-atual.md` tem a seção "Falhas aceitas", o Impact do proposal ganha a linha `Falhas aceitas: aceita <verificação>: <falha> (motivo: <...>; sai quando: <...>); retira <falha>`, ou `Falhas aceitas: nenhuma`. "Aceita" só entra para uma falha que a change não vai corrigir e que tem motivo.
- **Archive:** "Update the open debts" também aplica a linha `Falhas aceitas:`. "Aceita" acrescenta uma linha, com a data e a change; "retira" remove a linha. Uma retirada sem linha correspondente é reportada.
- **Verify:** "Project validation commands" ganha o parágrafo "**Accepted failures**":
  - quando a seção existe, comparar cada falha dos comandos que rodaram com a coluna Falha;
  - a falha listada é registrada em `Comandos:` como `aceita (catraca: <falha>)`, sem crítico;
  - a falha fora da lista é CRITICAL, como hoje;
  - a linha cuja verificação rodou e cuja falha não apareceu é WARNING ("catraca envelhecida: retire a linha").
  - A comparação é pelo identificador da falha, e não pelo texto da mensagem.

### D6. "Sai quando" conferível

- **Modelo** (`init.md`, Arquivo 6): os textos das duas tabelas dizem que o "Sai quando" é um fato conferível no repositório ou no store, e que uma data sozinha não serve. Exemplos:
  - "existe `apps/web/`";
  - "change `x` arquivada";
  - "ADR-00NN Accepted";
  - "linha Migrações preenchida no `project.md`".

  O init escreve as condições dos débitos que gera nesse formato.
- **Propose:** o "sai quando" das linhas `Débitos:` e `Falhas aceitas:` segue o mesmo formato.
- **Verify:** heurística nova "**Exit conditions**": quando o `estado-atual.md` existe, ler o "Sai quando" das duas tabelas e conferir as condições que dá para checar (caminho, change arquivada, status de ADR, linha do `project.md`):
  - condição já cumprida com a linha de pé: WARNING, com a linha e o fato;
  - condição que não se confere: SUGGESTION de reescrita;
  - condição que se confere mas não se cumpriu: nada a registrar.

### D7. CI, README e versão

- **Passo "Trechos customizados das skills":** marcadores novos:
  - "ADR check seen failing" e "Exit conditions" no laço do verify;
  - "Accepted failures" no verify;
  - "Impacto medido" no propose;
  - "Falhas aceitas" no archive e no `init.md`;
  - `imposicao` e `## Limite` no `template.md`.
- **README:** os trechos novos na tabela de trechos customizados.
- **CHANGELOG:**
  - itens na seção `## 1.14.0` (ou a abre, se esta change entrar antes da `principios-de-engenharia`);
  - ações recomendadas no projeto: acrescentar a seção "Falhas aceitas" ao `estado-atual.md`, revisar os "Sai quando" e, se quiser, declarar `imposicao` e "Limite" nas ADRs existentes.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/openspec/adrs/template.md`, `adrs/README.md` | D1 | ADRs novas dos projetos; ADRs fundacionais geradas pelo init (o init copia o modelo) |
| `padrao-openspec/.claude/commands/opsx/verify.md`, `skills/openspec-verify-change/SKILL.md` | D2, D3, D5, D6 | espelhos; `flow-metrics.mjs` (só lê as linhas de contagem, que não mudam) |
| `padrao-openspec/.claude/commands/opsx/propose.md`, `skills/openspec-propose/SKILL.md` | D3, D4, D5, D6 | espelhos |
| `padrao-openspec/.claude/commands/opsx/archive.md`, `skills/openspec-archive-change/SKILL.md` | D5 | espelhos |
| `padrao-openspec/.claude/commands/opsx/init.md` | D5, D6 | estado-atual dos projetos novos |
| `padrao-openspec/openspec/config.yaml` | D3, D4 | passo "Config base carrega sem avisos"; stores novos |
| `.github/workflows/validate.yml`, `README.md`, `VERSION`, `CHANGELOG.md` | D7 | nenhum |

## Risks / Trade-offs

- **[A catraca vira lugar de esconder falha]** → uma linha só entra por proposal aprovado, com motivo e condição conferível; o verify cobra a linha envelhecida e a condição cumprida.
- **[O agente compara mal a saída da ferramenta com a catraca]** → a comparação é pelo identificador exato da falha (nome do teste, regra mais arquivo), e o registro cita a linha da catraca usada; o revisor confere. O Limite da ADR-0008 diz que essa conferência fica sob palavra.
- **[Prova de reprovação deixada no código]** → a tarefa diz que a violação injetada é temporária, e a revisão de código procura resto de injeção no diff.
- **[Heurística de regra externa desligada falha em formatos de configuração desconhecidos]** → o verify registra "não verificado" com o motivo quando não sabe ler o formato, em vez de aprovar.
- **[Conflito com a `principios-de-engenharia` no verify, na skill, no config e no CHANGELOG]** → apply só depois do merge do PR #43, com rebase; os trechos novos ficam em itens próprios.
- **[Requisitos longos depois do archive]** → os requisitos da spec delta ficam abaixo de 500 caracteres, e os comportamentos novos ficam em requisitos ADDED separados.

## Migration Plan

- Projetos existentes recebem os comandos e as skills pelo PR de atualização do padrão.
- O CHANGELOG pede, como recomendação:
  - acrescentar "Falhas aceitas" ao `estado-atual.md`, com a linha "Nenhuma";
  - reescrever os "Sai quando" que não se conferem;
  - declarar `imposicao` e "Limite" nas ADRs com `verificacao`.
- Sem essas ações, tudo segue como hoje.
- Rollback: reverter os commits e voltar o `VERSION`.

## Open Questions

Nenhuma.
