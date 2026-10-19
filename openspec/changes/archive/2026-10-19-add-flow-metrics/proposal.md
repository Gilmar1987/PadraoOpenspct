# Proposal

## Why

A liderança quer saber se o fluxo spec-driven está ajudando: se as entregas ficaram mais rápidas, se há menos retrabalho e se a qualidade melhorou. O documento "TELEMETRIA DE ROI" propunha responder isso com métricas preenchidas pelo próprio agente e um script que apaga os artefatos. Foi rejeitado: os dados seriam declarados por quem está sendo avaliado, as contagens seriam fáceis de inflar, o script estava quebrado e o relatório expunha o nome de cada desenvolvedor.

O padrão já guarda quase tudo o que essas perguntas exigem: a data de criação de cada change, a data de aprovação (seção `## Aprovação`), a data do archive, as specs e tarefas, e o histórico do Git. Faltam duas peças:

- **ligar os commits de código à change** que os originou;
- **gravar o resultado do `/opsx:verify`**, que hoje só existe na conversa.

O teste de ponta a ponta confirmou esta segunda lacuna: o relatório de verify completo só ficou registrado porque um briefing mandou.

Esta é a primeira de duas changes. A segunda, `add-ai-usage-metrics`, mede o consumo de IA a partir dos dados locais do Claude Code.

## What Changes

- **Novo script `padrao-openspec/scripts/flow-metrics.mjs`.**
  - Em Node, sem dependências, e **somente leitura**.
  - Roda a partir do clone do store; `--code <repo>` pode ser repetido.
  - Lê o store e os repositórios de código e gera um `metrics.csv`, com uma linha por change, e um `resumo.md` agregado.
- **Tempo de entrega e vazão:**
  - **criação:** `.openspec.yaml` (`created`) e primeiro commit da pasta da change;
  - **aprovação:** data da seção `## Aprovação`;
  - **archive:** prefixo `AAAA-MM-DD` da pasta e commit do archive;
  - **derivados:** lead time e changes arquivadas por semana e por mês.
- **Retrabalho:**
  - nova convenção: todo commit de código ligado a uma change leva o trailer git `OpenSpec-Change: <nome>`, e o comando e a skill de apply passam a pedir isso;
  - retrabalho é todo commit `fix:` que cita uma change já arquivada, feito depois da data do archive.
- **Qualidade:**
  - o comando e a skill de verify passam a gravar um `verification.md` curto na pasta da change: data, contagem de críticos, warnings e sugestões, e as checagens não verificadas;
  - o archive preserva o arquivo junto com a change;
  - com `--ci`, o script também consulta via `gh` as execuções da CI que falharam antes de ficar verde.
- **Privacidade:** nenhum nome de pessoa no CSV nem no resumo. O script não lê autor de commit.
- **CI:** os trechos novos nas skills de apply e verify entram no passo "Trechos customizados das skills", e o script ganha um smoke test com um store e um repositório de código de exemplo.

### Fora do escopo

- Custo e consumo de IA: ficam para a change `add-ai-usage-metrics`.
- Valores monetários e qualquer conversão de tokens em dinheiro.
- Ranking ou comparação individual entre pessoas.
- Painel, gráfico ou envio automático para ferramentas de BI: o CSV é o ponto de integração.
- Resolução de horas para início, aprovação e archive: esses marcos guardam só a data, e isso fica declarado como limite.
- Reescrever commits antigos para incluir o trailer: o retrabalho só é medido a partir da adoção da convenção.

## Capabilities

### New Capabilities

- `flow-metrics`: o que o script mede, de onde vêm os dados, o que ele gera e as garantias de leitura e privacidade.
- `verification-record`: o registro que o `/opsx:verify` grava na change e o seu conteúdo mínimo.
- `change-traceability`: a convenção de trailer que liga commits de código a uma change.

### Modified Capabilities

Nenhuma.

## Impact

- **Código:** novo `padrao-openspec/scripts/flow-metrics.mjs`.
- **Skills e comandos** (fonte em `padrao-openspec/`, espelhados pelo sync):
  - `commands/opsx/apply.md` e `skills/openspec-apply-change/SKILL.md` (trailer);
  - `commands/opsx/verify.md` e `skills/openspec-verify-change/SKILL.md` (`verification.md`).
- **CI:** `.github/workflows/validate.yml` (trechos customizados e smoke test do script).
- **Documentação:** `README.md` e `padrao-openspec/README.md`.
- **Dependência:** parte do PR #4 (`add-approval-and-safety-gates`), que cria a seção `## Aprovação` usada como marco.
- **Riscos:**
  - **Dados pessoais:** os relatórios não trazem nomes. O histórico do Git continua tendo autores, mas o script não os lê.
  - Autenticação: não se aplica.
  - **Dados:** o script só lê; nada é alterado nem apagado.
  - **Configuração:** `--ci` exige o `gh` autenticado; sem ele, a métrica de CI fica como "não coletada" e o resto continua.
  - **Compatibilidade:** stores e repositórios antigos não têm trailer nem `verification.md`, e o script reporta essas colunas como vazias em vez de zero.

## Aprovação

- Responsável: gilmar.campelo
- Data: 2026-10-17
- Escopo: apply
- Condições: —
- Origem: mensagem do usuário no chat, "página para você compartilhar e realizar plano de correção. rodar /opsx:apply"
