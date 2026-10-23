# Design

## Context

- O `init.md` começa a entrevista direto no Bloco 1. As regras dela ("Regras da entrevista") fixam uma pergunta por vez, cinco opções e "Outro", e não preveem recomendação.
- O `ingest.md` é somente leitura: o brief fica na conversa e não é gravado. O Passo 2 pergunta o contexto (projeto novo, change existente), e o Passo 5 indica `/opsx:explore` ou `/opsx:propose`.
- O `/opsx:explore` é uma postura sem roteiro, por change, e guarda as decisões só na conversa. A descoberta do produto precisa de um ponto de chegada e de um registro, por isso vira um comando próprio. O dev escolheu o comando separado, "dividir para conquistar", em vez de crescer o `init.md`.
- Os comandos `/opsx:*` ficam em `padrao-openspec/.claude/commands/opsx/` (fonte) e são espelhados na raiz pelo `sync-root.mjs`. O instalador copia a pasta inteira, então um arquivo novo chega ao consumidor sem mudar o instalador.
- A CI confere marcadores dos comandos customizados ("Trechos customizados das skills") e a cópia dos comandos instalados (`diff -r`).
- O teste E2E do padrão roda o init com arquivo de respostas.

## Architecture Decisions

Não há ADR nova: é um comando novo e uma etapa opcional no init, dentro do modelo de distribuição atual. A change segue:

- a [ADR-0003](../../adrs/0003-padrao-sem-stack-embutida.md): a recomendação vem do brief do projeto, nunca de uma stack preferida do padrão;
- a [ADR-0004](../../adrs/0004-distribuicao-versionada-do-padrao.md): versão e CHANGELOG;
- a [ADR-0007](../../adrs/0007-lacunas-declaradas-e-precedencia-entre-documentos.md): o `descoberta.md` é um registro de entrada, como o `project-setup.md`, e fica fora da ordem de precedência. Depois do init valem o `project.md`, o `arquitetura.md` e as ADRs.

## Goals / Non-Goals

**Goals:**

- A entrevista de arquitetura só acontece com base numa ideia concreta, quando o dev escolhe explorar.
- O dev que já sabe o que quer, ou que automatiza o init, não nota diferença.
- O agente da descoberta tem regras escritas que impedem que ele só concorde.

**Non-Goals:**

- Gravar o brief do ingest em arquivo. Ele continua na conversa, e o init registra só a origem.
- Mudar as perguntas e as opções da entrevista. Isso é da `questionario-adaptativo`.

## Decisions

### D1. Nome do comando: `/opsx:discover`

Os comandos do padrão são verbos em inglês (`init`, `ingest`, `explore`, `propose`). `discover` segue o padrão e não se confunde com `explore`. O arquivo de saída fica em português, `descoberta.md`, como `arquitetura.md` e `estado-atual.md`.

Alternativa descartada: `/opsx:descoberta`. Seria o único comando em português.

### D2. Estrutura do `discover.md`

Mesmo cabeçalho dos outros comandos (frontmatter, Store selection, Project check e Raiz OpenSpec, copiados do `ingest.md`), mais estas seções:

1. **Como usar:** avulso ou chamado pelo init.
2. **Estado inicial:**
   - se o `descoberta.md` está "Em andamento", resume o que já foi decidido e pergunta pelo primeiro item em falta;
   - se está "Concluída", pergunta "revisar ou manter?";
   - se há brief do ingest na conversa, começa pelos conflitos (C..), pelas perguntas em aberto (P..) e pelos itens "Indefinido";
   - nos outros casos, a primeira mensagem é "Qual é a sua ideia de projeto?".
3. **Postura do agente.** São as regras que a spec exige, escritas como instruções:
   - uma pergunta por vez, com o motivo;
   - dependências primeiro, na ordem do checklist;
   - questionar premissas e apontar contradições;
   - em decisões abertas, 2 ou 3 opções com justificativa, desvantagem e a recomendação;
   - marcar `[INFERIDO: <base>]`;
   - silêncio ou "ok" genérico não contam como resposta.
4. **Checklist de ideia concreta:**
   - problema e público;
   - funcionalidades do MVP (sugestão de 3 a 7);
   - o que fica fora do MVP;
   - integrações;
   - restrições: volume, dados pessoais, prazo e tamanho do time;
   - critério de sucesso.

   O agente mostra o checklist com ✔ e "em aberto" quando propõe encerrar.
5. **Template do `descoberta.md`.**
6. **Encerramento:** mostra o brief, pede "Confirma? [s/n/editar]" e grava com o status.
   - Interrompido: oferece gravar como "Em andamento".
   - Avulso: indica o próximo passo (init ou propose).
   - Chamado pelo init: devolve o controle a ele.
7. **Guardrails:** não escrever código; não criar change; não gravar outro arquivo; não reproduzir dados sensíveis; não escolher pelo dev.

Template do `descoberta.md`:

```markdown
# Descoberta do produto — {{nome provisório}}

**Status:** Concluída | Em andamento
**Responsável:** {{nome do dev}}
**Data:** {{data}}
**Base:** conversa{{, brief do ingest: Documento A, Documento B}}

## Problema e público
## Funcionalidades do MVP
## Fora do MVP
## Integrações
## Restrições
| Restrição | Valor |
|---|---|
| Volume | |
| Dados pessoais | |
| Prazo | |
| Time | |
## Critério de sucesso
## Decisões
| Decisão | Alternativas consideradas | Motivo |
|---|---|---|
## Em aberto
```

### D3. Commit do `descoberta.md`

- **Chamado pelo init:** o discover não commita. O arquivo entra no commit do init, que já commita a pasta `openspec/`.
- **Avulso:** commita só o arquivo, com pathspec (`docs: registra a descoberta do produto`), quando a raiz é um repositório Git, como o init e o propose fazem. Nunca faz push.

Alternativa descartada: nunca commitar. Uma descoberta avulsa ficaria só na máquina do dev, e uma retomada em outra máquina perderia o trabalho.

### D4. Perguntas antes do Bloco 1 no `init.md`

Seção nova "Antes da entrevista", entre "Respostas pré-preenchidas" e "Bloco 1":

```text
1. Você tem documentos (atas, requisitos, e-mails) para eu analisar antes da entrevista? [s/n]
2. Quer explorar a ideia do produto antes das perguntas de arquitetura? [s/n]
   Sem explorar, as perguntas vêm em seguida, sem recomendação baseada na sua ideia{{, só no brief dos documentos}}.
```

- **Antes da pergunta 2:** se o `descoberta.md` está "Concluída", o init informa que vai usá-lo e pula a pergunta. Se está "Em andamento", pergunta se quer retomar, e "sim" equivale a explorar.
- **Pergunta 1 = sim:** seguir o `ingest.md` do Passo 1 ao Passo 4, com o Passo 2 respondido "Projeto novo" e sem o Passo 5.
- **Pergunta 2 = sim:** seguir o `discover.md` e voltar ao Bloco 1 quando ele terminar.
- **Com arquivo de respostas:** pular esta seção inteira (vai também em "Respostas pré-preenchidas").

Alternativa descartada: perguntar depois do Bloco 1. A descoberta cobre o que o Bloco 1 pergunta (público, volume, dados pessoais), e essas perguntas também ganham com a recomendação.

### D5. Recomendação nas perguntas da entrevista

Regra nova em "Regras da entrevista", válida só quando há brief:

```text
Recomendação: 2) Médio — o brief da descoberta prevê 3 clínicas com até 300 pacientes (Restrições > Volume).
```

ou

```text
Recomendação: o brief não cobre esta pergunta.
```

- A linha vem antes das opções, e as opções não mudam.
- A recomendação só cita o que o brief diz. Se o raciocínio do agente vai além do brief, isso é dito na justificativa.
- Na 7.1, as sugestões de comando continuam como hoje. A recomendação, quando houver, escolhe uma das sugestões.
- Sem brief, nenhuma linha aparece.

### D6. `ingest.md` chamado pelo init

Parágrafo novo depois do "IMPORTANTE": quando o `/opsx:init` conduz o ingest, o Passo 2 é respondido "Projeto novo" sem pergunta, o Passo 5 não é exibido e o brief volta ao init. O restante, inclusive os guardrails, não muda.

### D7. Registro no `project-setup.md` e próximos passos

- **Arquivo 1 do init:** ganha, depois de "Comando", a linha `**Base das recomendações:** {{documentos do ingest por alias; openspec/descoberta.md; ou "nenhuma"}}`.
- **Próximos passos:** o item 4 passa a citar o `descoberta.md` como ponto de partida do primeiro `/opsx:explore` ou `/opsx:propose`, quando ele existe.

### D8. CI, testes e documentação

- **`validate.yml`, passo "Trechos customizados das skills":**
  - no init, os marcadores `Antes da entrevista` e `Recomendação:`;
  - bloco novo para o `discover.md`, com os marcadores `Checklist de ideia concreta`, `Postura do agente` e `descoberta.md`.
- **`validate.yml`, conferência dos comandos instalados:** `test -f .../discover.md`.
- **`test-setup.ps1`:** `discover` na lista `$cmds`.
- **README, nas tabelas de comandos e de trechos customizados:**
  - linha `/opsx:discover`;
  - fluxo completo `init → [ingest] → [discover] → entrevista → propose`.
- **COMECE-AQUI e README do `padrao-openspec`:** as duas perguntas do init e o comando novo.
- **CHANGELOG:** item na seção aberta. Em "Ações no projeto", nenhuma ação obrigatória: o comando chega na próxima atualização do padrão.

## Risks / Trade-offs

- [O agente volta a só concordar, porque as regras são texto e não código] → Regras escritas como instruções diretas com exemplos no `discover.md`, e um cenário do roteiro de verificação manual (tarefa 5.1) que testa uma afirmação contraditória.
- [A descoberta vira interrogatório sem fim] → Checklist fechado, proposta de encerrar quando ele estiver coberto e o dev livre para encerrar a qualquer momento.
- [Recomendação inventada, sem base no brief] → A linha cita a parte do brief, e "o brief não cobre" é a saída obrigatória quando não há base.
- [Conflito textual com a `imposicao-e-catraca` e a `principios-de-engenharia` no `init.md`, no CHANGELOG, no README e no `validate.yml`] → Seções diferentes do `init.md` (a outra sessão mexe só no Arquivo 6), rebase depois do merge do #43, e quem arquivar por último rebaseia.
- [O brief do ingest se perde se a sessão do init cair] → Aceito. A descoberta grava "Em andamento", e o ingest pode ser refeito com os mesmos documentos.

## Migration Plan

Nenhuma migração. Projetos existentes recebem o `discover.md` na próxima atualização do padrão. O init de um projeto já inicializado não roda de novo.
