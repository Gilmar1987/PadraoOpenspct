# Proposal

## Why

A entrevista do `/opsx:init` segue uma ordem fixa de perguntas, cada uma com uma lista fixa de opções, e quase não usa as respostas anteriores. Na prática:

- o dev responde perguntas que não se aplicam (tipo de fila com "sem jobs", E2E de interface sem front-end, proteção de dados em repouso sem dados pessoais);
- escolhe entre opções que não combinam com a stack que acabou de escolher (ORM de .NET num projeto Python, Blazor sem .NET, Auth.js sem Next.js);
- só descobre as combinações incoerentes no fim, depois de todas as perguntas, quando voltar custa mais.

A `descoberta-do-produto` resolveu a falta de contexto antes da entrevista. Esta change faz a entrevista usar o contexto que ela mesma vai juntando.

## What Changes

- **Perguntas puladas quando não se aplicam.** Uma tabela de regras no `init.md` diz quais respostas tornam uma pergunta sem sentido. A pergunta não é feita e recebe o valor da regra ("Não aplicável" ou a opção equivalente). O resumo do bloco mostra cada pergunta pulada com o motivo, e o dev pode pedir para respondê-la mesmo assim. Exemplos:
  - 2.5 = "Não" (sem jobs) → 3.8 (tipo de fila) "Não aplicável";
  - 2.2 = "Apenas back-end" → 3.2 (front-end) "0) Não há front-end próprio";
  - 2.2 = "Apenas front-end" → 2.1 (estilo do back-end) e 3.1 (linguagem do back-end) "Não aplicável";
  - 1.5 = "Não" (sem dados pessoais) → 6.5 (já é assim hoje) e 6.6 (dados em repouso) "Não aplicável".
- **Ordem do Bloco 2:** a 2.2 (organização em repositórios) passa a ser perguntada antes da 2.1, para que "Apenas front-end" possa pular o estilo do back-end. A numeração não muda.
- **Opções filtradas pelas respostas anteriores.** Uma tabela de filtros diz quais opções não combinam com respostas já dadas. A numeração das opções não muda: as que não combinam ficam ocultas, e uma linha diz quantas foram ocultadas e por quê; o dev pode digitar `todas` para ver a lista inteira. Exemplos:
  - 3.5 (ORM), 3.7 (validação) e 5.4 (testes unitários) mostram as opções da linguagem da 3.1;
  - 3.2 esconde Blazor fora de .NET; 3.6 esconde Auth.js sem Next.js;
  - 5.5 (E2E) sem front-end mostra só "Não aplicável", Testcontainers e "Outro";
  - 4.5 esconde a Vercel Edge Network fora da Vercel.
- **Coerência na hora.** Cada combinação da tabela "Checagem de coerência" é avaliada assim que a última resposta envolvida é dada, com o mesmo "Ajustar ou manter?". A checagem final continua, mas não pergunta de novo o que já foi decidido.
- **Combinação nova:** 2.1 = "Microsserviços" com 1.4 = "Pequeno" ou "Ainda não sei", ou com 5.9 = "Uma pessoa": aponta o custo de operar vários serviços e propõe monólito modular.
- **Arquivo de respostas:** as respostas do arquivo valem como estão, inclusive para perguntas que uma regra pularia e opções que um filtro ocultaria. Uma pergunta que o arquivo não responde e que uma regra pula recebe o valor da regra sem ser perguntada. A coerência continua só no fim, como hoje.
- **Documentação:** README (tabela de trechos customizados), COMECE-AQUI (uma frase sobre a entrevista adaptativa) e CHANGELOG na seção aberta.

### Fora do escopo

- Mudar o texto das perguntas, acrescentar ou remover opções, ou mudar a numeração.
- Outras linhas da checagem de coerência (banco local × serverless, `.env` × chave de criptografia, cobertura mínima × sem comando de cobertura): continuam na change planejada `init-coerencia-e-ferramentas`.
- A recomendação a partir do brief (da `descoberta-do-produto`): não muda. Uma opção oculta por filtro nunca é recomendada.
- O questionário dos outros comandos (propose, explore).
- Publicar a release.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `project-initialization`: perguntas puladas, ordem do Bloco 2, opções filtradas, coerência na hora, a combinação de microsserviços e o comportamento com arquivo de respostas. Os requisitos existentes continuam valendo; o de LGPD (6.5 pulada com 1.5 = "Não") passa a ser um caso das regras de salto.

## Impact

- **Comando** (fonte em `padrao-openspec/.claude/commands/opsx/init.md`, espelhado pelo `sync-root.mjs`): "Regras da entrevista" (salto, filtro e coerência na hora), tabelas "Regras de salto" e "Filtros de opções", ordem do Bloco 2, resumo do bloco com as puladas, "Respostas pré-preenchidas", linha nova na "Checagem de coerência".
- **CI:** marcadores do init no passo "Trechos customizados das skills" de `.github/workflows/validate.yml`.
- **Documentação:** `README.md`, `COMECE-AQUI.md` e `CHANGELOG.md`.
- **Dependências:** nenhuma nova.
- **Riscos:**
  - Compatibilidade: o arquivo de respostas usa os mesmos números de pergunta e de opção, e o teste E2E com arquivo de respostas não muda. Projetos já inicializados não são afetados.
  - Uma regra de salto errada esconderia uma decisão: por isso a pergunta pulada aparece no resumo com o motivo e pode ser respondida.
- **Interface com outros sistemas:** não se aplica.
- **Débitos:** o repositório não tem `openspec/estado-atual.md`.
- **Falhas aceitas:** o repositório não tem `openspec/estado-atual.md`, então a seção "Falhas aceitas" não existe.
- **Changes concorrentes:** nenhuma ativa nesta branch. Em outras branches:
  - `descoberta-do-produto` (PR #45, arquivada, aguardando merge): esta branch parte dela, porque as duas mexem nas "Regras da entrevista" do `init.md`. Depois do merge do #45, rebase na `main`.
  - `entrega-no-codigo` (outra sessão, aguardando aprovação): toca o README, mas não o `init.md`.
- **Versão:** acrescenta itens à seção aberta do `CHANGELOG.md` (1.15.0, aberta pela `descoberta-do-produto`), sem mexer no `VERSION`.

## Aprovação

- Responsável: Pendente
- Data: —
- Escopo: —
- Condições: —
- Origem: —
