# Proposal

## Why

O teste de ponta a ponta com Django (controleCondominio, 2026-10-19) chegou ao archive, mas deixou lacunas de auditoria no caminho:

- **Planejamento fora do git (A12).** A change nunca foi commitada no store enquanto estava ativa; tudo entrou num commit só, junto com o archive. O histórico não mostra o planejamento antes do código.
- **Archive sem confirmação registrada (A24).** A aprovação tinha escopo `apply`, que pela regra exige nova confirmação para arquivar. O proposal arquivado não mostra essa confirmação, e a skill de archive não tem passo que confira o escopo.
- **Aprovação elíptica (A20).** "Pode realizar 1, 2 e 3" aprovou várias decisões de uma vez; só ficou auditável porque o agente citou também a pergunta.
- **Push sem pedido explícito (A19).** O agente fez push depois que o usuário passou a URL do repositório. As regras proíbem "push sem pedido", mas não dizem o que conta como pedido.
- **Evidência sem registro (A13, A14, A18).** Tarefas foram marcadas com o critério desatualizado (porta 8000 em vez de 8030; venv Python 3.12 numa máquina com 3.14; "cópia limpa" sem commits), sem registro de como foram verificadas.
- **Verificação em navegador opaca (A16, A17).** O roteiro foi executado por um script não versionado e deixou dados no banco de desenvolvimento.

## What Changes

- **Propose:** ao terminar os artefatos, commita a change no store (só os arquivos da change, com o trailer `OpenSpec-Change`), quando a raiz está num repositório git.
- **Archive:**
  - novo passo que confere a `## Aprovação`: com escopo `archive`, segue se as condições valem; com escopo `apply`, pede confirmação explícita e a registra no proposal (item `Archive:` com data e origem);
  - ao final, commita no store o archive, as specs e o `project.md`.
- **Origem da aprovação:** quando a declaração do usuário só faz sentido com a pergunta do agente, a Origem cita as duas.
- **Push e PR:** só com pedido explícito do usuário na conversa ou com uma condição da aprovação que os inclua. Passar uma URL, criar um repositório ou pedir para configurar o remoto não é pedido de push: o agente configura e pergunta.
- **Evidência por tarefa:** ao marcar uma tarefa, o apply acrescenta abaixo dela uma linha `Evidência:` com o comando e o resultado; se o critério foi adaptado, diz o que mudou e por quê.
- **Verificação em navegador:** a orientação gerada pelo init passa a exigir roteiro versionado, script versionado quando a execução for automatizada, registro de quem executou e marcador e limpeza dos dados criados.
- `rules.md`, config base e README atualizados; marcadores novos na CI.

### Fora do escopo

- Commits do código por grupo de tarefas (A15): continua opcional.
- Ferramenta de automação de navegador específica; o padrão continua sem stack embutida.
- Reescrever changes já arquivadas.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `change-approval`: Origem com a pergunta; confirmação de archive registrada quando o escopo é `apply`.
- `change-traceability`: commits do planejamento e do archive no store.
- `workflow-governance`: pedido explícito de push; evidência registrada na tarefa.
- `project-initialization`: orientação de verificação em navegador versionada e reproduzível.

## Impact

- **Skills e comandos:** `openspec-propose`, `openspec-apply-change`, `openspec-archive-change` e os comandos `propose.md`, `apply.md`, `archive.md`; `init.md` (texto da orientação de navegador). Espelhados pelo sync.
- **Regras:** `openspec/rules.md` (raiz) e `padrao-openspec/openspec/config.yaml` (regra da Origem).
- **CI:** `.github/workflows/validate.yml` (trechos customizados).
- **Documentação:** tabela de trechos customizados do `README.md`.
- **Riscos:**
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - **Compatibilidade:** o item `Archive:` novo na `## Aprovação` não muda o campo `Data`, que as métricas de fluxo leem. Commits automáticos no store usam só os caminhos da change, para não levar arquivos que o usuário tenha preparado.

## Aprovação

- Responsável: gilmar.campelo
- Data: 2026-10-20
- Escopo: archive
- Condições: `openspec validate --all --strict` passa na raiz e em `padrao-openspec/`; `sync-root.mjs --check` passa; o lint de Markdown passa nos dois lugares; os smoke tests locais passam; o verify termina sem críticos; nenhum arquivo fora do raio de impacto é alterado sem confirmação. Commits na branch `feat/padrao-generalista-e-correcoes`; push e PR só com pedido do responsável.
- Origem: respostas do usuário no chat, depois de "implemente toda as correções e aprimoramentos": "Por tema, 4 changes (Recomendado)" e, à pergunta "Qual autorização você dá?", "Até o archive, com condições (Recomendado)", cuja opção dizia "condições 'validate --strict, sync-root --check e markdownlint passando; sem mudar arquivos fora do raio de impacto'" e "Commits em branch; push e PR só com seu pedido"
