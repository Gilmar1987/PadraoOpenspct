# Proposal

## Why

A aprovação de uma change fica registrada no `## Aprovação` do `proposal.md`, e o portão (`docs/openspec-portao.mjs`) confere se ela está preenchida. Mas nada a liga ao que foi aprovado. Depois da aprovação, o plano pode mudar (um requisito novo, uma tarefa a mais, um design diferente) e o portão continua liberando. A regra "um update que muda o escopo zera a aprovação" existe só em texto: depende de o agente classificar a própria mudança. Também não há como saber se a mudança foi pequena ou grande sem comparar arquivos à mão.

O kit-esquadro (projeto Marelli, analisado em 2026-10-22) resolve isso com a aprovação "assinada pelo conteúdo": o hash do que foi aprovado vence quando o artefato muda. O mesmo kit marca com `[INFERIDO: base]` tudo o que o agente preencheu sem confirmação, e bloqueia o avanço enquanto a marca existir. Nos nossos testes (Lava Jato, Livraria), o agente preencheu valores e regras de negócio plausíveis, mas que ninguém tinha dito, e eles só apareceram na revisão.

## What Changes

- **Selo do conteúdo aprovado:**
  - comando novo no portão: `node docs/openspec-portao.mjs selo <change> [--json] [--store <id>]`, que calcula o `sha256` dos artefatos de planejamento da change: proposal sem a seção `## Aprovação`, design, delta specs e tarefas sem o estado das caixas e sem as linhas `Evidência:`;
  - quem registra a aprovação grava o resultado no item `- Conteúdo: sha256:<hash>`;
  - os portões `apply` e `archive` recalculam o selo e bloqueiam quando ele difere do registrado ("aprovação vencida"), listando os arquivos de planejamento da change;
  - uma aprovação sem `Conteúdo:` (registrada antes desta versão) continua valendo, com um aviso.
- **Reconfirmação depois de uma correção:**
  - uma correção que não muda o escopo, feita depois da aprovação, também muda o selo. O `/opsx:update` mostra ao responsável o que mudou e pede uma confirmação explícita;
  - com ela, acrescenta `- Reconfirmação: <data>; Origem: "<palavras>"; Conteúdo: sha256:<novo>`;
  - o portão usa o último `Conteúdo:` da seção;
  - a mudança de escopo continua zerando a aprovação, como hoje.
- **Inferência declarada:**
  - no propose, um fato atribuído ao usuário, ao negócio ou a um sistema externo (valor, regra, limite, formato, nome) que não veio do pedido, de um documento ou do código fica marcado `[INFERIDO: <base>]`;
  - no init, a mesma marca vale para o que os arquivos gerados afirmam sem vir de uma resposta;
  - as propostas técnicas do próprio agente não são marcadas: elas já esperam a aprovação;
  - o portão `apply` bloqueia enquanto um artefato da change tiver `[INFERIDO`, citando arquivo e linha;
  - o init lista as marcas no resumo final e pede a confirmação de cada uma.
- **Fluxos:** propose, apply, update e archive gravam o selo e respeitam o portão; trecho novo **"Approval content seal"** nos pares desses comandos.
- **Versão:** item da versão aberta no CHANGELOG (hoje a 1.12.0), sem subir o VERSION; a release sai quando o responsável pedir.

### Fora do escopo

- Assinatura só por terminal interativo (a trava por TTY do kit): fica fora porque o agente e a pessoa usam o mesmo terminal no Claude Code e no Windows, e o registro com as palavras do responsável já é o padrão.
- Proteger o selo contra um agente que o recalcule e grave sozinho: o selo só torna a mudança visível e exige um registro novo com as palavras do responsável, que o humano confere no PR.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `change-approval`: a aprovação passa a ser presa ao conteúdo; uma correção depois da aprovação pede reconfirmação; inferências marcadas bloqueiam o apply.
- `project-initialization`: o init marca e lista as inferências dos arquivos gerados.

## Impact

- **Portão:** `padrao-openspec/scripts/portao.mjs` (comando `selo`, checagem do selo e das marcas; campo opcional `avisos` no JSON, que mantém `{ok, acao, change, motivos, erro?}`).
- **Comandos e skills:** propose, apply, update, archive e init, com as cópias da raiz; `openspec/rules.md` (seção de aprovação).
- **CI, documentação e versão:** `validate.yml` ("Smoke test do portão" e "Trechos customizados"), `README.md`, guia do projeto, `CHANGELOG.md`, `VERSION`.
- **Changes concorrentes:**
  - a `subagentes-e-ganchos` (PR #30): o hook `portao-do-archive.mjs` lê só `motivos` e não muda;
  - a `ganchos-de-sessao-e-fluxo` (esta sessão, a propor) usa o estado das aprovações deste portão;
  - as changes de SDD da outra sessão mexem no propose, no verify e no `rules.md` em seções diferentes. A outra sessão foi avisada em 2026-10-22 e não vê conflito.
- **Riscos:**
  - **Atrito:** toda correção depois da aprovação pede um "sim" do responsável. Mitigação: o update mostra o que mudou num resumo curto, e o selo ignora caixas e evidências.
  - **Falso bloqueio:** um arquivo salvo com CRLF ou outra normalização Unicode mudaria o hash. Mitigação: o selo normaliza fim de linha e NFC antes de calcular.

## Aprovação

- Responsável: gilmar.campelo
- Data: 2026-10-22
- Escopo: archive
- Condições: versão 1.16.0; push, PR, merge e release autorizados; o apply começa depois do merge da `subagentes-e-ganchos` (PR #30), e a release segue a ordem de versões aprovada (depois das changes de SDD 1.13.0–1.15.0).
- Origem: pergunta "1. Aprovação de cada change: só apply ou até archive, e com quais condições. 2. As versões 1.16.0 e 1.17.0: confirma? 3. Push, PR, merge e release: se quer incluí-los nas condições."; resposta "1 - até archive , 2, e 3  aprovados".
- Versão revista: 2026-10-22; a versão 1.16.0 deixa de valer: a change entra como item da versão aberta no CHANGELOG (a 1.12.0, enquanto o responsável não publicar), sem subir o VERSION, e a release sai só quando o responsável pedir; Origem: "sim", em resposta a "Se isso vale, troco a aprovacao-por-conteudo e a ganchos-de-sessao-e-fluxo (aprovadas como 1.16.0 e 1.17.0) para itens da versão aberta. Confirma?"
