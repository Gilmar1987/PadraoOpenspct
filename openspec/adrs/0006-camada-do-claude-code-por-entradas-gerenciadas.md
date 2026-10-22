---
id: ADR-0006
status: Accepted
date: 2026-10-22
supersedes:
superseded_by:
related_changes: [subagentes-e-ganchos]
---

# ADR-0006: Camada do Claude Code entregue por arquivos e entradas gerenciadas no settings.json

## Contexto

A [ADR-0005](0005-regras-entregues-por-blocos-gerenciados.md) entrega as regras a qualquer agente como texto, em blocos gerenciados nos arquivos de instrução. Texto não impede o agente de descumprir uma regra. O Claude Code, onde o fluxo `/opsx:*` roda, oferece três mecanismos que impõem limites:

- subagentes em `.claude/agents/` com `tools` e `model` próprios (a documentação também prevê hooks no frontmatter, que valeriam só enquanto o subagente roda, mas eles não dispararam no Claude Code real; ver a Decisão);
- hooks de sessão no `.claude/settings.json` (`PreToolUse`, `PostToolUse`, `Stop`), que podem negar uma ferramenta ou recusar o fim do turno;
- permissões `allow`, `ask` e `deny` no mesmo arquivo, com `deny` avaliado antes de `ask` e de `allow`.

O `.claude/settings.json` pertence ao projeto: ele guarda as permissões e os hooks da equipe. Em JSON não cabe um bloco entre marcadores, como o que a ADR-0005 usa em Markdown.

## Decisão

- O padrão SHALL entregar ao repositório de código uma camada própria do Claude Code, que complementa a ADR-0005 e não a substitui:
  - subagentes em `.claude/agents/openspec-*.md`;
  - scripts de hook em `.claude/hooks/openspec-padrao/`;
  - entradas de hook e de permissão no `.claude/settings.json`.
- Os subagentes e os scripts SHALL ser arquivos gerenciados, listados em `managedFiles`, como as skills.
- No `.claude/settings.json`, o instalador SHALL gerenciar só as entradas que são dele:
  - um hook é do padrão quando o comando aponta para `.claude/hooks/openspec-padrao/`;
  - uma permissão é do padrão quando está listada em `managedSettings` no manifesto.
- O instalador acrescenta as entradas que faltam, atualiza as suas e remove as que deixaram de fazer parte do padrão. Ele MUST NOT alterar nem remover outras entradas, e MUST parar sem nenhuma mudança quando o arquivo não for JSON válido.
- Os hooks SHALL ser escritos em Node.js, já exigido pelo padrão, e chamados como `node` com `args`.
- Todos os hooks SHALL ficar no `.claude/settings.json`. Os que valem só para um papel reconhecem o subagente pelo campo `agent_type` da entrada e não interferem nas chamadas do agente principal. O hook declarado no frontmatter do subagente não disparou no Claude Code real (roteiro manual de 2026-10-22), e a forma `args` só está documentada para o `settings.json`.
- A lógica de aprovação, de apply e de archive SHALL ficar no portão neutro de agente (`docs/openspec-portao.mjs`, da change `guardas-mecanicas`). Os hooks o chamam e não repetem a regra.

## Alternativas consideradas

| Alternativa | Por que não foi escolhida |
|---|---|
| Sobrescrever o `.claude/settings.json` inteiro | Apagaria as permissões e os hooks do projeto |
| Entregar só um `settings.example.json` para o dev copiar | Depende de cada dev lembrar; a atualização do padrão não alcançaria o arquivo |
| Usar `.claude/settings.local.json` | É pessoal e fica fora do git; o time não receberia os limites |
| Hooks em Python ou shell | Python não é exigido pelo padrão; shell muda entre Git Bash e PowerShell no Windows |
| Repetir nos hooks a lógica do portão de aprovação | Duas cópias da mesma regra divergem na primeira alteração |

## Consequências

- No Claude Code, os limites de papel e as obrigações do fluxo passam a ser cobrados por mecanismo, não só por instrução.
- O instalador passa a editar um arquivo JSON do projeto, ainda que só nas suas entradas. O `--update` e o PR de atualização mostram o diff.
- As entradas gerenciadas precisam ser rastreadas no manifesto, para que uma versão nova remova as suas sem tocar nas do projeto.
- Os hooks são heurísticos. Um comando por outro caminho (`sh -c`, caminho absoluto) pode escapar, e a documentação deixa isso claro.
- Os agentes do Copilot em `.github/agents/` continuam. A paridade de papéis entre as duas pastas passa a ser checada na CI.
