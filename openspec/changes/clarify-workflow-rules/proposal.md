# Proposal

## Why

O teste de ponta a ponta (lote 3 do plano de correção) mostrou regras de fluxo ambíguas, que o agente teve de interpretar sozinho:

- **Explore obrigatório?** O `rules.md` (seção 3) diz que o ciclo começa no `/opsx:explore` e que não se pode pular etapas, mas o `/opsx:propose` começa sem explore, e todas as changes deste repositório também (atrito 7).
- **Aprovação de ADR sem PR.** O README das ADRs diz que a aprovação é a revisão do pull request. Em projetos "só `main`, sem PR", não há onde aprovar, e o `/opsx:init` grava `Accepted` direto (atrito 12).
- **Papéis sem subagentes.** A seção 4 lista limites por subagente do VS Code. No Claude Code esses subagentes não existem, e não está claro quem corrige um artefato depois do verify (atrito 13).
- **Evidência no verify.** O verify não diz quando pode reaproveitar a evidência do apply nem se uma verificação manual fora do repositório conta como cobertura (atrito 14).
- **Archive:** não está claro quando usar `/opsx:archive` ou `openspec archive` (atrito 18), e o archive não lembra de atualizar a tabela de capabilities do `project.md` (atrito 19).

## What Changes

- **`rules.md`, seção 3:** o `/opsx:explore` passa a ser opcional e recomendado quando o problema, o escopo ou a abordagem ainda não estão claros. As demais etapas continuam obrigatórias.
- **`rules.md`, seção 4:** passa a ser organizada por papel (planejar, implementar, verificar, revisar consistência, ingerir material), valendo com ou sem subagentes. A seção também diz que ajustar um artefato de change depois do verify passa pelo `/opsx:update`.
- **README das ADRs:** em projetos sem pull request, a aprovação é a declaração explícita do responsável, citada na mensagem do commit que muda o status para `Accepted`. As ADRs fundacionais do `/opsx:init` contam como aprovadas pelas respostas confirmadas na entrevista.
- **Verify:** uma nova heurística "Evidence reuse" no comando e na skill:
  - a evidência do apply pode ser reaproveitada quando foi gravada com comando e código de saída e o código não mudou depois dela; senão, o verify roda de novo;
  - uma verificação fora do repositório não conta como cobertura automatizada.
- **Archive:** um novo fechamento "Update the project overview" no comando e na skill, que lembra de atualizar a tabela de capabilities do `project.md` com as capabilities criadas ou alteradas. O README explica a diferença entre `/opsx:archive` (agente, com avaliação de sincronização) e `openspec archive` (CLI, mecânico).
- **CI:** o passo "Trechos customizados das skills" cobre os dois trechos novos.

### Fora do escopo

- Tornar o explore obrigatório ou criar um artefato próprio para ele.
- Converter os agentes VS Code em subagentes do Claude Code.
- Alinhar a entrevista do init com os presets: fica para o lote 4.
- Automatizar a atualização do `project.md` no archive: o agente faz a edição, não um script.

## Capabilities

### New Capabilities

- `workflow-governance`: regras do ciclo OpenSpec que valem para qualquer agente: etapas obrigatórias e opcionais, papéis, aprovação de ADR, reaproveitamento de evidência no verify e atualização do `project.md` no archive.

### Modified Capabilities

Nenhuma.

## Impact

- **Regras:** `openspec/rules.md`, seções 3 e 4.
- **ADRs:** `padrao-openspec/openspec/adrs/README.md` e o espelho em `openspec/adrs/README.md`.
- **Comandos e skills** (fonte em `padrao-openspec/`, espelhados pelo sync): `verify` e `archive`.
- **CI:** marcadores novos no passo de trechos customizados.
- **Documentação:** `README.md` da raiz e lista de trechos customizados.
- **Riscos:**
  - Dados pessoais, autenticação e dados: não se aplicam.
  - **Compatibilidade:** o explore deixa de ser obrigatório. Quem já o usa continua, e nenhuma change existente precisa mudar.

## Aprovação

- Responsável: gilmar.campelo
- Data: 2026-10-19
- Escopo: archive
- Condições: `openspec validate --strict` passa; o verify termina sem críticos; a CI fica verde
- Origem: resposta do usuário no chat, "Até o archive, com condições (Recomendado)", à pergunta sobre os lotes 3, 4 e 5, depois de "pode continuar"
