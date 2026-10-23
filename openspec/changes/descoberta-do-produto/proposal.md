# Proposal

## Why

O `/opsx:init` faz as perguntas de arquitetura (Blocos 2 a 7) logo depois de oito perguntas sobre o negócio, antes de o dev ter uma ideia concreta do produto. O `/opsx:ingest`, que lê os requisitos, vem depois do init, e o brief dele não chega à entrevista. O resultado:

- o dev escolhe o estilo de arquitetura, a comunicação e a stack sem saber o que vai construir;
- o agente não tem base para recomendar, porque também não conhece o produto;
- a 2.1 gera sempre a ADR `0001`, e trocá-la depois custa uma change com ADR substituta.

A arquitetura deve vir de uma ideia concreta, mas o dev que já sabe o que quer não deve pagar por isso.

## What Changes

- **Comando novo `/opsx:discover`, a descoberta do produto.** Uma conversa conduzida pelo agente que termina numa ideia concreta.
  - O agente começa perguntando qual é a ideia do projeto. Se houver brief do ingest, começa pelas lacunas e contradições dele.
  - O agente não só concorda: questiona premissas, aponta contradições e traz duas ou três opções com justificativa, desvantagens e a recomendação dele. O que vem do conhecimento dele, e não do dev, é marcado `[INFERIDO: <base>]`.
  - Uma pergunta por vez. O dev pode encerrar a qualquer momento, e o que ficar sem resposta vai para "Em aberto", sem ser empurrado.
  - A conversa chega ao fim quando um checklist de ideia concreta está coberto: problema e público, funcionalidades do MVP e o que fica de fora, integrações, restrições (volume, dados pessoais, prazo, time) e critério de sucesso.
  - O resultado é o brief da ideia em `<root>/openspec/descoberta.md`, gravado só depois da confirmação do dev. Uma conversa interrompida pode ser gravada como "Em andamento" e retomada depois.
  - Roda sozinho ou chamado pelo init.
- **`/opsx:init` com duas perguntas de sim ou não antes da entrevista:**
  1. "Tem documentos (atas, requisitos, e-mails) para analisar?" Com "sim", o init pede as evidências e segue o `/opsx:ingest`.
  2. "Quer explorar a ideia do produto antes das perguntas de arquitetura?" Com "sim", o init segue o `/opsx:discover`.
  - A entrevista (Blocos 1 a 7) vem depois. O comportamento depende das respostas:

    | Documentos | Explorar | Entrevista |
    |---|---|---|
    | não | não | Igual à de hoje |
    | sim | não | Igual à de hoje, com recomendação justificada a partir do brief do ingest |
    | não | sim | Recomendação justificada a partir do brief da descoberta |
    | sim | sim | A descoberta começa pelo brief do ingest; a recomendação usa os dois |

  - Uma recomendação aparece só quando o brief sustenta a pergunta, com a fonte, e nunca escolhe pelo dev. Quando o brief não cobre a pergunta, o agente diz isso numa linha e não recomenda.
  - Um `descoberta.md` concluído que já exista é usado no lugar da pergunta 2.
  - Com arquivo de respostas, as duas perguntas não são feitas e o init se comporta como hoje.
- **`/opsx:ingest` chamado pelo init:** pula a pergunta de contexto (é um projeto novo) e o "Próximo passo", e devolve o brief ao init.
- **Documentação:** README, COMECE-AQUI e o README do `padrao-openspec` mostram o fluxo `init → [ingest] → [discover] → entrevista → propose` e o comando novo. CHANGELOG na seção aberta.

### Fora do escopo

- Questionário adaptativo (pular perguntas que não se aplicam, filtrar opções pela stack, alerta de coerência na hora): fica na change seguinte, `questionario-adaptativo`.
- Mudar as perguntas, as opções ou a geração de ADRs da entrevista. A opção "Adiar" na 2.1 e na 2.4 também fica de fora.
- O `/opsx:explore` continua como está, para changes. A descoberta é só do produto.
- Projetos já inicializados e o modo "projeto em andamento", com código existente: o discover pode rodar neles, mas não muda o `project.md` nem as ADRs.
- Publicar a release.

## Capabilities

### New Capabilities

- `product-discovery`: a descoberta do produto. Cobre a condução da conversa, a postura do agente, o critério de ideia concreta, o brief em `descoberta.md`, a retomada e o uso avulso ou pelo init.

### Modified Capabilities

- `project-initialization`: as duas perguntas antes da entrevista, o ingest chamado pelo init, a recomendação a partir do brief e o arquivo de respostas sem as perguntas.
- `skill-installation`: o cenário de instalação dos comandos passa a listar o `discover.md`.

## Impact

- **Comandos** (fonte em `padrao-openspec/.claude/commands/opsx/`, espelhados pelo `sync-root.mjs`):
  - novo `discover.md`;
  - `init.md`: perguntas antes do Bloco 1, recomendação na entrevista, regra do arquivo de respostas, origem das recomendações no `project-setup.md` e próximos passos;
  - `ingest.md`: o comportamento quando é chamado pelo init.
- **CI e testes:** marcadores do init e do discover no passo "Trechos customizados das skills" e `discover.md` na conferência dos comandos instalados (`.github/workflows/validate.yml`); lista de comandos do `padrao-openspec/scripts/test-setup.ps1`.
- **Documentação:** `README.md`, `COMECE-AQUI.md`, `padrao-openspec/README.md` e `CHANGELOG.md`.
- **Dependências:** nenhuma nova.
- **Riscos:**
  - Compatibilidade: quem responde "não" às duas perguntas tem o init de hoje. O teste E2E com arquivo de respostas não muda.
  - Dados pessoais: o `descoberta.md` fica no store e é commitado. O discover segue a regra do ingest de não reproduzir dados pessoais, credenciais nem nomes de clientes.
- **Interface com outros sistemas:** não se aplica.
- **Débitos:** o repositório não tem `openspec/estado-atual.md`.
- **Changes concorrentes:** nenhuma ativa nesta branch. Em outras worktrees:
  - `imposicao-e-catraca` (`project-initialization`, `workflow-governance`), só com planejamento;
  - `principios-de-engenharia` (PR #43; `engineering-principles`, mas edita o `init.md` na 7.4).

  Ordem sugerida: esta change entra depois do merge do #43, com rebase. Com a `imposicao-e-catraca`, os requisitos de `project-initialization` são diferentes; quem arquivar por último rebaseia.
- **Versão:** primeira change depois da release v1.14.0: sobe `padrao-openspec/VERSION` para 1.15.0 e abre a seção `## 1.15.0` do `CHANGELOG.md`. As changes seguintes acrescentam itens a ela.

## Aprovação

- Responsável: Gilmar Campelo
- Data: 2026-10-23
- Escopo: archive
- Condições: verify sem críticos e CI verde nos três jobs (root, store no Ubuntu e no Windows); push e PR só quando o responsável pedir
- Push e PR: Gilmar Campelo, 2026-10-23; Origem: "push e PR liberado", em resposta a "Posso fazer push da `feat/descoberta-do-produto` e abrir um PR em rascunho?"
- Conteúdo: sha256:78d21dfc5c0d6bebc427ae6bcd9bae47f6bf4c8eed7011ff37baa31e26be76b7
- Origem: "Aprovo a change descoberta-do-produto para archive, com as condições. Por exemplo: \"verify sem críticos e CI verde nos três job", em resposta a "`Aprovo a change descoberta-do-produto para archive`, com as condições. Por exemplo: \"verify sem críticos e CI verde nos três jobs\"."
- Reconfirmação: 2026-10-23; Origem: "sim para mudança para a 1.15.0", em resposta a "Confirma a mudança para a 1.15.0? [...] sobe `padrao-openspec/VERSION` para 1.15.0 e move o item [...] para uma seção nova `## 1.15.0`"; Conteúdo: sha256:e12a190fa7f492dbe37f062e2d54af556e9de657f9ed07d886420f0e56ecb8e0
