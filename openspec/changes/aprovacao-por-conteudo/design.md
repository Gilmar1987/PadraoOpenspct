# Design

## Context

- O portão (`padrao-openspec/scripts/portao.mjs`, entregue como `docs/openspec-portao.mjs`) lê o `## Aprovação` com `readApproval` e decide com `approvalReasons`. A saída JSON é `{ok, acao, change, motivos, erro?}`, e o hook `portao-do-archive.mjs` da `subagentes-e-ganchos` lê só `motivos`.
- O `/opsx:update` já zera a aprovação numa mudança de escopo (`commands/opsx/update.md:81`). Uma correção de redação mantém a aprovação sem registro nenhum.
- O apply mexe no `tasks.md` (marca `- [x]` e acrescenta uma linha indentada `- Evidência: ...`). O verify grava `verification.md` e a revisão grava `review.md`, que não são planejamento aprovado.
- Origem das ideias: kit-esquadro (`gates/ratificacao.md`, "Assinatura do conteúdo"; `padroes/inferencia-declarada.md`).

## Architecture Decisions

Não há ADR nova. A change reforça o registro de aprovação já decidido (rules.md, seção de aprovação) e o portão da `guardas-mecanicas`, sem mudar a distribuição (ADR-0004) nem a camada do Claude Code (ADR-0006).

## Goals / Non-Goals

**Goals:**

- Qualquer mudança no planejamento aprovado fica visível ao portão e só segue com um registro novo do responsável.
- Fato não confirmado não chega ao apply sem que alguém o confirme.

**Non-Goals:**

- Impedir um agente que recalcula e grava o selo sozinho: o registro exige as palavras do responsável e fica no histórico para o PR.
- Assinatura por TTY.

## Decisions

### D1. Selo do conteúdo

- **Comando:** `portao.mjs selo <change> [--json] [--store <id>]`. A saída em texto é `sha256:<hex>`. A saída JSON é `{ok: true, acao: "selo", change, conteudo: "sha256:<hex>", arquivos: [...]}`. Exit 2 em erro de ambiente, como os outros.
- **Arquivos:** todo `.md` sob `changeRoot`, exceto `review.md`, `verification.md` e `interface-report.md`, as pastas `interface/` e `archive/`, e qualquer `.md` cujo nome comece por `relatorio`. Isso cobre o proposal, o design, as delta specs, as tarefas e os artefatos de schemas próprios.
- **Normalização, antes do hash:**
  - texto em NFC, `\r\n` → `\n`, sem espaços no fim das linhas;
  - no `proposal.md`, a seção `## Aprovação` inteira sai, até o próximo título de nível 2 ou o fim;
  - em qualquer arquivo, `- [x]`/`- [X]` vira `- [ ]`, e saem as linhas que casam com `^\s+- Evidência:`.
- **Hash:** `sha256` de `caminho-relativo-com-barras\0conteúdo-normalizado\0` de cada arquivo, em ordem alfabética do caminho.

### D2. Checagem no portão

- `readApproval` passa a guardar, além do primeiro valor de cada chave, o **último** `Conteúdo:` encontrado na seção: o item próprio ou o `Conteúdo:` dentro de um `Reconfirmação:`.
- **Com `Conteúdo:`:** se o selo atual for diferente do registrado, o portão acrescenta o motivo:

  > A aprovação venceu: o planejamento mudou depois dela (selo registrado X, atual Y). Mostre ao responsável o que mudou e registre a reconfirmação com o /opsx:update, ou peça uma nova aprovação se o escopo mudou.

- **Sem `Conteúdo:`:** o portão acrescenta ao JSON o campo opcional `avisos`, com "Aprovação sem selo de conteúdo (registrada antes desta versão)", e mostra o aviso no texto. O código de saída não muda.
- O campo `avisos` é aditivo: o formato `{ok, acao, change, motivos, erro?}` continua valendo para quem só lê `motivos`.

### D3. Marcas de inferência

- **Regex:** `\[INFERIDO:` fora de código, ou seja, depois de retirar os blocos cercados por crases triplas e os trechos entre crases simples (a documentação que cita a marca não conta).
- **No `apply`:** cada ocorrência vira um motivo `Inferência não confirmada em <arquivo>:<linha>: <trecho>`. No `archive`, o motivo é o mesmo.
- **Quais artefatos:** os mesmos arquivos do selo.

### D4. Fluxos

Trecho novo **"Approval content seal"** em propose, apply, update e archive (comando e skill):

- **Apply 4a, propose (autorização prévia) e archive 4a**, ao registrar uma aprovação ou o item `Archive:`: quando o portão existe, rodar `selo` e gravar `- Conteúdo: sha256:...` antes de `Origem`.
- **Update:** depois de uma revisão confirmada que não muda o escopo de uma change aprovada:
  1. rodar `selo`;
  2. se o selo mudou, mostrar o resumo do que mudou e perguntar ao responsável;
  3. com a confirmação explícita, acrescentar `- Reconfirmação: <YYYY-MM-DD>; Origem: "<palavras>"; Conteúdo: sha256:<novo>`;
  4. sem ela, avisar que o apply vai parar.

  Na mudança de escopo, a linha "Aprovação anterior" leva também o `Conteúdo` antigo.
- **Propose:** a regra "Declared inference" vai para as Artifact Creation Guidelines, com o critério da proposta (fato do usuário, do negócio ou de sistema externo, sem fonte); as propostas técnicas não são marcadas. O resumo final lista as marcas e pede confirmação; a confirmação tira a marca.

### D5. Init

- Regra nova nas Regras da entrevista e na geração dos arquivos: o que os arquivos 1 a 5 afirmam sem uma resposta leva `[INFERIDO: <base>]`.
- Antes de "Commit the init", uma etapa "Inferências" lista as marcas e pergunta uma a uma: "Mantém? [s/n/editar]". "s" tira a marca, "n" tira a linha e "editar" troca pelo texto do responsável.
- O commit do init só acontece sem marcas.

### D6. Regras

Em `openspec/rules.md`, na seção de aprovação, duas frases:

- a aprovação vale para o conteúdo selado, e uma correção depois dela pede a reconfirmação;
- um fato inferido sem fonte fica marcado até alguém o confirmar.

### D7. CI

- **"Smoke test do portão" ganha casos:**
  - `selo` estável depois de marcar tarefa e acrescentar evidência;
  - selo diferente depois de uma tarefa nova, com exit 1 e "venceu";
  - `Reconfirmação` com o selo novo, com exit 0;
  - aprovação sem `Conteúdo`, com exit 0 e `avisos` no JSON;
  - `[INFERIDO: x]` no design, com exit 1 citando a linha;
  - a mesma marca entre crases, com exit 0;
  - arquivo com CRLF, com o mesmo selo do LF.
- **"Trechos customizados":** "Approval content seal" nos pares de propose, apply, update e archive.

### D8. Versão

Item da versão aberta no CHANGELOG, sem subir o VERSION (decisão do responsável em 2026-10-22). "Ações no projeto":

- "Nenhuma obrigatória. Aprovações registradas antes desta versão seguem valendo, com aviso; as próximas gravam o selo."

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/scripts/portao.mjs` | D1–D3 | `docs/openspec-portao.mjs` nos projetos, hook `portao-do-archive.mjs` (lê `motivos`), hook commit-msg (não muda) |
| `commands/opsx/{propose,apply,update,archive}.md` e skills | D4 | trechos customizados, cópias da raiz |
| `commands/opsx/init.md` | D5 | cópia da raiz |
| `padrao-openspec/openspec/rules.md` | D6 | blocos gerenciados (ADR-0005) |
| `.github/workflows/validate.yml`, `README.md`, guia, `CHANGELOG.md`, `VERSION` | D7, D8 | CI, versão |

## Risks / Trade-offs

- [Selo muda por algo que não é planejamento, como um relatório novo na pasta] → exclusões explícitas no D1, e o motivo cita o selo para o agente comparar; um tipo novo de relatório entra na lista de exclusão.
- [Marca citada em documentação vira bloqueio] → a regex ignora o que está entre crases.
- [A `ganchos-de-sessao-e-fluxo` depende do `estado` do portão] → aquele comando nasce lá; esta change não o cria.

## Migration Plan

Nenhuma migração: aprovações antigas continuam valendo com aviso. Rollback: reverter os commits; o item `Conteúdo:` é ignorado pela versão anterior do portão.

## Open Questions

Nenhuma.
