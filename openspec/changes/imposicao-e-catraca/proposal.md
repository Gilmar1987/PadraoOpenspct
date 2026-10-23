# Proposal

## Why

Uma ADR do padrão diz o que foi decidido. Ela não diz o quanto a decisão é imposta, nem o que fica de fora da conferência. O campo `verificacao` lista um teste, mas nada exige que esse teste já tenha reprovado alguma vez. Um teste que nunca falhou pode estar conferindo vocabulário, e não o efeito. A decisão parece mais forte do que é, e ninguém confere.

O kit-esquadro (analisado pela outra sessão, a pedido do responsável) resolve isso com quatro práticas:

- cada decisão declara a forma de imposição e o limite: o que o mecanismo garante e o que fica sob palavra;
- uma verificação só conta quando foi vista reprovando: falha com a violação injetada e passa no caso limpo;
- o custo de uma mudança de arquitetura é medido por comando, não estimado;
- uma "catraca" de falhas aceitas só encolhe: falha nova é regressão, e falha que sumiu sai da lista.

A pendência também melhora. Ela é escrita como "Pendente até <condição conferível>", e quem verifica cobra a retirada quando a condição se cumpre.

Do lado do padrão:

- o `estado-atual.md` já tem a lista "Fora do ciclo atual", com a coluna "Sai quando", mas nada confere se a condição já se cumpriu;
- uma falha conhecida e aceita de um comando de verificação vira crítico a cada verify, ou some do registro.

Esta change preserva a qualidade que o padrão promete às decisões e às verificações: o que o registro diz que está garantido precisa estar garantido.

## What Changes

- **Forma de imposição da ADR:**
  - o modelo de ADR ganha o campo `imposicao`, com quatro valores:
    - `controle`: a verificação roda e uma falha bloqueia;
    - `consultivo`: a verificação roda e uma falha é registrada, sem bloquear;
    - `externo`: a regra está na configuração de uma ferramenta do projeto, por exemplo `<config>#<regra>`;
    - `norma`: sob palavra, sem verificação automática.
  - O modelo ganha também a seção "Limite", que separa o que o mecanismo garante do que fica sob palavra.
  - O verify passa a usar a imposição para dar a severidade:
    - uma falha de `controle` é crítico; uma falha de `consultivo` é warning;
    - `controle` ou `consultivo` sem `verificacao` é crítico ("verificador ausente");
    - `norma` não roda nada.
  - Sem o campo, vale o comportamento de hoje: com `verificacao`, a ADR conta como `controle`; sem ela, como `norma`.
- **Visto reprovando:**
  - quando uma change acrescenta ou muda uma `verificacao`, ou promove uma ADR de `consultivo` para `controle`, uma tarefa roda a verificação duas vezes:
    - uma com a violação injetada, que tem de falhar;
    - uma no caso limpo, que tem de passar.
  - A evidência da tarefa traz os dois códigos de saída.
  - O verify aponta como warning a verificação nova sem essa evidência. A promoção a `controle` sem essa evidência é crítico.
  - Uma verificação que rodou sem nada a varrer (a pasta ou os arquivos da superfície ainda não existem) vai para "Não verificado", e não conta como aprovada.
- **Impacto medido:**
  - quando o propose cria uma ADR com `verificacao`, ou acrescenta ou endurece a verificação de uma ADR `Accepted`, o `design.md` ganha a seção "Impacto medido";
  - a seção traz o comando, o código de saída e as violações que o código tem hoje;
  - cada violação recebe um destino: uma tarefa da change, uma linha em `lacunas.md` ou uma falha aceita;
  - se o teste ainda não existe, a tarefa que o escreve mede o impacto antes de corrigir qualquer violação.
- **Catraca de falhas aceitas:**
  - o `estado-atual.md` ganha a seção "Falhas aceitas", com verificação, falha (o identificador exato), motivo, desde e "Sai quando";
  - no verify:
    - uma falha que não está na lista é regressão e continua crítico;
    - uma falha da lista é registrada como aceita;
    - uma linha cuja falha não acontece mais é warning: a lista envelheceu, e a linha precisa sair.
  - Uma linha só entra pelo proposal, com a linha `Falhas aceitas:` no Impact, que precisa de aprovação. O archive aplica essa linha, como já faz com `Débitos:`.
- **"Sai quando" conferível:**
  - nas tabelas "Fora do ciclo atual" e "Falhas aceitas", o "Sai quando" é um fato que se confere no repositório ou no store:
    - um caminho que passa a existir;
    - uma change arquivada;
    - uma ADR aceita;
    - uma linha do `project.md`.
  - Uma data sozinha não é condição.
  - O verify confere as condições que consegue checar. Uma condição já cumprida com a linha ainda na tabela é warning: feche numa change ou renove o motivo. Uma condição que não se confere vira sugestão de reescrita.
- **Versão:** pelo modelo de versão acumulada, esta change acrescenta itens à seção `## 1.14.0`, aberta pela `principios-de-engenharia`. Se esta change entrar antes, ela mesma abre a 1.14.0. A release sai só quando o responsável pedir.
- **CI:** marcadores dos trechos novos.

### Fora do escopo

- Um script que compare a saída dos comandos com a catraca. Cada ferramenta (pytest, Jest, xUnit, linters) escreve as falhas num formato diferente. Um parser por ferramenta embutiria stack no padrão ([ADR-0003](../../adrs/0003-padrao-sem-stack-embutida.md)). Por isso, a comparação é do verify, que lê a saída. A CI do projeto continua sendo decisão do projeto.
- Os guards de arquitetura, como os testes de camadas: o padrão já manda escrevê-los na `verificacao` da ADR. Esta change só cobra a forma de imposição e a prova de reprovação.
- Preencher `imposicao` e "Limite" nas ADRs 0001 a 0007 do próprio padrão. O campo é opcional, e as ADRs sem ele seguem o comportamento de hoje.
- Migrar automaticamente os stores existentes. O CHANGELOG traz a ação manual.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `workflow-governance`:
  - a ADR declara a imposição e o limite, e o verify gradua a severidade pela imposição;
  - a verificação de ADR tem de ser vista reprovando;
  - o impacto de uma decisão de arquitetura é medido no design;
  - a catraca de falhas aceitas é conferida no verify e mantida no propose e no archive;
  - o "Sai quando" é conferível e cobrado.
- `project-initialization`: o `estado-atual.md` gerado pelo init traz a seção "Falhas aceitas", e o "Sai quando" é uma condição conferível.

## Impact

- **Comandos e skills, com as cópias da raiz espelhadas pelo `sync-root.mjs`:**
  - `padrao-openspec/.claude/commands/opsx/verify.md` e `skills/openspec-verify-change/SKILL.md`;
  - `propose.md` e `skills/openspec-propose/SKILL.md`;
  - `archive.md` e `skills/openspec-archive-change/SKILL.md`;
  - `init.md` (Arquivo 6).
- **Modelos:** `padrao-openspec/openspec/adrs/template.md` e `adrs/README.md`; o modelo do `estado-atual.md`, dentro do `init.md`.
- **Config:** `padrao-openspec/openspec/config.yaml`, na regra do design para o impacto medido e na das tasks para o visto reprovando.
- **Versão e CI:** `padrao-openspec/VERSION`, `CHANGELOG.md`, `.github/workflows/validate.yml`, `README.md`.
- **Métricas:** o `flow-metrics.mjs` lê as linhas `Críticos`, `Warnings`, `Sugestões` e `Não verificado`. Esta change não cria linha nova no cabeçalho do registro.
- **Riscos:**
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - Compatibilidade:
    - ADR sem `imposicao` mantém o comportamento de hoje;
    - store sem a seção "Falhas aceitas" segue como hoje, e toda falha é crítico;
    - "Sai quando" antigo que não se confere vira só sugestão.
  - Catraca usada para esconder falha: uma linha só entra com a aprovação do proposal e com uma condição de saída; uma linha cuja falha sumiu é cobrada.
- Changes concorrentes: nenhuma ativa nesta branch. A `principios-de-engenharia` (PR #43, aberta) também mexe no `verify.md`, na skill do verify, no `config.yaml` e no CHANGELOG, em trechos diferentes. Ordem sugerida: depois do merge do #43, com rebase antes do apply. Não consegui falar com a outra sessão (projetoopenspct-04) para confirmar se ela tem trabalho nesses arquivos. Confirmo antes do apply.
- Contrato de interface: não se aplica. A change não toca interface com outros sistemas.
- Débitos: o repositório do padrão não tem `openspec/estado-atual.md`; nenhum.

## Aprovação

- Responsável: Pendente
- Data: —
- Escopo: —
- Condições: —
- Origem: —
