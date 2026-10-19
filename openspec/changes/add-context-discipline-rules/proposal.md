# Proposal

## Why

Economizar tokens é legítimo, mas, sem regra explícita, um agente pode economizar no lugar errado: resumir uma spec, ler só parte das tasks ou declarar que um teste passou sem mostrar a saída. Isso quebra o fluxo OpenSpec, que depende de leitura integral dos artefatos e de evidência de verificação. A skill externa `token-efficiency` foi avaliada e rejeitada: não tem licença, foi feita para outro domínio (bioinformática) e manda o agente aplicar economia "sempre, por padrão", em conflito com o fluxo. O padrão precisa da sua própria regra, curta, que separe o que pode ser filtrado do que nunca pode.

## What Changes

- Nova seção "Disciplina de contexto" em `openspec/rules.md`. Ela determina:
  - **leitura integral**, sem resumo nem leitura parcial, de:
    - `rules.md`, `config.yaml` e `project.md`;
    - ADRs `Accepted` relevantes;
    - artefatos da change ativa;
    - specs principais afetadas;
  - **filtro** antes de ler saídas volumosas: logs, saídas de build e de testes, JSON e CSV grandes;
  - **evidência** de verificação sempre com o comando executado e o resultado relevante;
  - **busca primeiro** em explorações amplas, antes de abrir muitos arquivos;
  - **proibição** de usar economia para justificar pular leitura de artefato, marcar tarefa sem verificação ou declarar "passou" sem saída;
  - **escolha de modelo** como decisão do usuário.
- Parágrafo equivalente no `context` de `padrao-openspec/openspec/config.yaml` e dos presets `dotnet`, `nextjs` e `dotnet-nextjs`. Esse texto é injetado nas instruções de cada artefato, o que leva a regra aos stores dos projetos consumidores, já que o `rules.md` não é instalado neles.

### Fora do escopo

- Instalar o `rules.md` nos projetos consumidores: depende da change de layout de store único.
- Adotar ou recomendar skills externas de economia de tokens.
- Limites numéricos (tamanho de arquivo, número de linhas) para decidir quando filtrar: a regra é por tipo de conteúdo, não por tamanho.
- Mudar skills ou comandos `/opsx:*`: eles já exigem leitura dos artefatos; a regra só torna isso explícito e transversal.

## Capabilities

### New Capabilities

- `agent-context-discipline`: como os agentes que operam no padrão e nos stores consumidores leem artefatos, tratam saídas volumosas e registram evidência de verificação.

### Modified Capabilities

Nenhuma.

## Impact

- **Conteúdo:**
  - `openspec/rules.md`;
  - `padrao-openspec/openspec/config.yaml`;
  - `padrao-openspec/presets/{dotnet,nextjs,dotnet-nextjs}/config.yaml`.
- **CI:** o passo "Configs base e presets carregam sem avisos" já confere que o config base e os presets carregam sem avisos; ele deve continuar passando. O `context` não entra na checagem de regras base, mas o parágrafo precisa ser idêntico nos quatro arquivos.
- **Riscos:**
  - Dados pessoais e autenticação: não se aplicam.
  - Não há esquema de dados nem segredos novos.
  - Compatibilidade: nenhuma quebra. Stores já configurados recebem o parágrafo só se reaplicarem o preset ou editarem o `config.yaml`.
