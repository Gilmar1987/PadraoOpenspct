# Proposal

## Why

Hoje uma aprovação com `Escopo: archive` autoriza o agente a seguir por apply, verify e archive sem nova confirmação. O propose também tem uma "exceção de autorização prévia", que deixa o agente começar o apply no mesmo turno. Com isso, o agente pode encadear as etapas sozinho e até implementar sem carregar o fluxo do comando.

Em 2026-10-23, nesta sessão, o agente começou o apply de três changes só com a aprovação escrita, sem o `/opsx:apply`, e seguiu os passos de memória. Ficaram de fora a checagem de versão e a confirmação do progresso por grupo. O responsável decidiu que cada etapa só começa com duas ações dele:

1. a aprovação escrita, no formato `Eu aprovo fazer <o que o agente descreveu>`;
2. o comando `/opsx:<etapa>` digitado por ele.

Ele quer o mesmo comportamento para todo dev que usa o padrão. A change preserva o controle do responsável sobre cada etapa e garante que o fluxo completo de cada comando seja carregado.

## What Changes

- **Regra global (`rules.md`, seções 2 e 3):**
  - cada etapa com comando (`/opsx:propose`, `/opsx:apply`, `/opsx:verify`, `/opsx:archive` e `/opsx:update`) só começa quando o responsável escreve a aprovação daquela etapa e digita o comando;
  - antes, o agente descreve em uma linha o que a etapa vai fazer e propõe o texto da aprovação;
  - ao fim de cada etapa, o agente para e mostra a aprovação sugerida e o comando da próxima;
  - o `Escopo` da aprovação passa a ser o limite do que a change pode alcançar (`apply` ou `archive`), e não uma autorização para encadear etapas;
  - ações sem comando (push, PR, merge, release) continuam exigindo pedido explícito ou uma condição registrada na aprovação.
- **Propose:**
  - sai a "exceção de autorização prévia": o propose nunca começa o apply no mesmo turno;
  - uma autorização até o archive dada no pedido continua registrada em `## Aprovação`, como limite;
  - o resumo final mostra a aprovação sugerida e o comando da próxima etapa.
- **Apply, verify, archive e update:**
  - o trecho do apply que deixa o verify e o archive rodarem "sem nova confirmação" com `Escopo: archive` passa a dizer que cada etapa espera a aprovação e o comando;
  - cada fluxo termina mostrando a aprovação sugerida e o comando da próxima etapa.
- **Bloco gerenciado dos agentes (`templates/agents-block.md`):** o fluxo passa a mostrar a aprovação antes de cada comando.
- **Hook de contexto da sessão:** lembra que cada etapa começa com a aprovação escrita e o comando.
- **ADR:** a [ADR-0009](../../adrs/0009-cada-etapa-disparada-pelo-responsavel.md) (Proposed) registra a decisão.
- **Versão:** pelo modelo de versão acumulada, acrescenta itens à seção `## 1.15.0` aberta, sem mexer no `VERSION`. A release sai só quando o responsável pedir.
- **CI:** o marcador "Prior authorization exception" é trocado pelos marcadores dos trechos novos.

### Fora do escopo

- Uma trava mecânica que confira se o comando foi digitado pelo dev. O padrão não tem como distinguir isso de forma portável entre agentes; a regra é cumprida sob palavra, e a ADR-0009 declara esse limite.
- Mudar o portão de apply e de archive. Ele continua conferindo a aprovação, o selo, as tarefas e a verificação.
- As escolhas dentro de uma etapa, como "sincronizar agora" no archive. Elas seguem como perguntas do próprio fluxo.
- Os fluxos `/opsx:explore`, `/opsx:init`, `/opsx:ingest` e `/opsx:discover`. Eles não mexem em código de uma change e já terminam sugerindo o próximo comando.
- Publicar a release.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `change-approval`:
  - o escopo `archive` deixa de autorizar o encadeamento de etapas;
  - cada etapa começa com a aprovação escrita e o comando;
  - cada etapa termina parada, mostrando a aprovação sugerida e o comando da próxima.

## Impact

- **Regras:** `padrao-openspec/openspec/rules.md`, espelhado na raiz e entregue pelos blocos gerenciados ([ADR-0005](../../adrs/0005-regras-entregues-por-blocos-gerenciados.md)); `padrao-openspec/templates/agents-block.md`.
- **Comandos e skills, espelhados pelo `sync-root.mjs`:**
  - `commands/opsx/{propose,apply,verify,archive,update}.md`;
  - `skills/openspec-{propose,apply-change,verify-change,archive-change,update-change}/SKILL.md`.
- **Hook:** `padrao-openspec/.claude/hooks/openspec-padrao/contexto-de-sessao.mjs`.
- **ADR:** `openspec/adrs/0009-cada-etapa-disparada-pelo-responsavel.md`.
- **CI e documentação:** `.github/workflows/validate.yml`, `README.md` e `CHANGELOG.md`.
- **Dependências:** nenhuma nova.
- **Riscos:**
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - Compatibilidade: aprovações já registradas com `Escopo: archive` continuam válidas. Elas passam a valer como limite, e cada etapa espera a aprovação e o comando.
  - Mais interação: cada etapa pede duas ações do dev. É o comportamento que o responsável pediu.
- **Interface com outros sistemas:** não se aplica.
- **Débitos:** o repositório não tem `openspec/estado-atual.md`.
- **Falhas aceitas:** o repositório não tem `openspec/estado-atual.md`, então a seção não existe.
- **Changes concorrentes:** nenhuma ativa nesta branch. A `mensagens-descrevem-a-entrega`, da outra sessão (branch local `feat/mensagens-descrevem-a-entrega`, aprovada para apply), mexe nos mesmos trechos: a seção 3 do `rules.md`, o fim dos fluxos e o próximo passo. Ela indica o próximo passo pelo comando sem o nome da change, e esta change acrescenta a aprovação antes do comando. Ordem sugerida: ela entra primeiro, e esta change rebaseia antes do apply.

## Aprovação

- Responsável: Gilmar Campelo
- Data: 2026-10-23
- Escopo: archive
- Condições: verify sem críticos; o fluxo vai até o PR, e o merge fica com o responsável; o apply começa depois do merge da `mensagens-descrevem-a-entrega`, com rebase; cada etapa só começa com a aprovação escrita e o comando `/opsx:<etapa>` digitado pelo responsável
- Conteúdo: sha256:29898a85743d1ddc6d03d13304ea4f693a5dae71e4ad936ce95446f1f098bf22
- Origem: "Eu aprovo fazer o apply da aprovacao-e-comando-por-etapa, até o archive, com PR; o merge fica comigo"
