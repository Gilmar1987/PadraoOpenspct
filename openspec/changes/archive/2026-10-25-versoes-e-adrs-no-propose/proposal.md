# Proposal

## Why

Três itens do relatório do teste Lava Jato (`C:\TesteOpenSpct\response.md`) continuam abertos no `/opsx:propose`:

- **Versões assumidas sem consulta** (item 9). O design citou "Vitest 4.x" e uma migração do Prisma de memória, sem consultar o registro. A estável já era a 5, e os desvios apareceram no apply.
- **Pré-release na tag `latest`** (item 10). O `npm view prisma version` devolvia uma RC. Um `npm install` sem versão instalaria uma pré-release em produção.
- **ADR criada no propose fora do commit** (item 7). O "Commit the planning" commita só a pasta da change, então uma ADR nova em `openspec/adrs/` fica sem versionar. Quem clonar o store não a recebe.

## What Changes

- **Versões consultadas no propose.** Para cada dependência nova que o design acrescenta (biblioteca, pacote ou ferramenta), o agente consulta o registro do ecossistema no momento do propose. Exemplos: `npm view <pkg> dist-tags engines peerDependencies`, `pip index versions <pkg>`, `dotnet package search <pkg> --exact-match`, a busca do Maven Central. O `design.md` ganha uma tabela com o pacote, a versão escolhida, a fonte e a data da consulta e as restrições de runtime e de pares.
- **Versão exata e estável.** A versão escolhida é exata e estável. Pré-releases (`rc`, `beta`, `alpha`, `preview`, `next`, `canary`, `dev`) são recusadas mesmo quando a tag `latest` aponta para elas, e o agente escolhe a estável mais recente. A tarefa que instala a dependência cita essa versão.
- **Sem acesso ao registro.** A versão fica marcada `[INFERIDO: sem consulta ao registro]`, e o portão de apply bloqueia até o responsável confirmar, como já faz com qualquer inferência.
- **ADR no commit do planejamento.** O "Commit the planning" passa a incluir, além da pasta da change, cada ADR que o propose criou em `openspec/adrs/`, com o mesmo pathspec explícito.
- **Comando e skill do propose, CI e documentação.** O trecho novo entra no comando e na skill do propose, com marcadores na CI, uma linha no README e um item na 1.15.0 do CHANGELOG.

### Fora do escopo

- Conferir no verify se a versão instalada bate com a do design. A conferência de dependências do Impact contra o manifesto já existe ("Dependencies in Impact").
- Atualizar versões de dependências já existentes no projeto.
- Publicar a release.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `workflow-governance`: três requisitos novos. São eles: as versões consultadas e registradas no design, a versão exata e estável, e a ADR do propose no commit do planejamento.

## Impact

- **Comando e skill** (fonte em `padrao-openspec/.claude/`, espelhados pelo `sync-root.mjs`): `commands/opsx/propose.md` e `skills/openspec-propose/SKILL.md`, nas "Artifact Creation Guidelines" e no passo 8 ("Commit the planning").
- **CI e documentação:** marcadores no passo "Trechos customizados das skills" (`.github/workflows/validate.yml`), `README.md` e `CHANGELOG.md`.
- **Dependências:** nenhuma nova.
- **Riscos:**
  - Sem rede, a consulta não roda. A marca `[INFERIDO]` torna isso visível e bloqueia o apply até a confirmação.
  - Ecossistemas sem comando de consulta simples: o agente usa a página do registro e registra a URL como fonte.
- **Interface com outros sistemas:** não se aplica.
- **Débitos:** o repositório não tem `openspec/estado-atual.md`.
- **Falhas aceitas:** o repositório não tem `openspec/estado-atual.md`, então a seção não existe.
- **Changes concorrentes:** nenhuma ativa nesta branch. A change da outra sessão que leva ao padrão a aprovação escrita e o comando por etapa (branch `feat/aprovacao-e-comando-por-etapa`) mexe no fim do propose (o Output) e nas mesmas skills. Esta mexe nas "Artifact Creation Guidelines" e no passo 8, então o conflito é textual. Quem entrar por último faz o rebase.
- **Versão:** primeira change depois da release v1.15.0: sobe `padrao-openspec/VERSION` para 1.16.0 e abre a seção `## 1.16.0` do `CHANGELOG.md`, com o item desta change; as changes seguintes acrescentam itens a ela.

## Aprovação

- Responsável: Gilmar Campelo
- Data: 2026-10-25
- Escopo: apply
- Condições: cada etapa só começa com o comando `/opsx:<etapa>` digitado pelo responsável
- Conteúdo: sha256:a69d3a14ce8f82d9dacb790bc2ce8c0aadece98a0acbf2bdf8b071b0fd117dd9
- Origem: "Eu aprovo fazer a consulta de versões e a ADR no commit do propose"
- Reconfirmação: 2026-10-25; Origem: "sim", em resposta a "Confirma as duas revisões do design e a reconfirmação?" (D1 com o texto implementado: dependências de par, estável pela lista completa, título `## Dependency versions`, marca em texto puro; D2 com "created or changed"); Conteúdo: sha256:0b075424f5fee99dff7bfa70d5b9a4eeab00ea3bdaca9d2ac4bdc06fa1909cf6
- Reconfirmação: 2026-10-25; Origem: "sim", em resposta à proposta de passar a linha "Versão" do proposal para a 1.16.0 e voltar a tarefa 3.1 para pendente com a 1.16.0, depois da release v1.15.0 (4710c02); Conteúdo: sha256:ee15b88f81d523774083508e6eea8fcdcc14d54de64b3da1ce98a1ffbb3648dc
- Archive: 2026-10-25; Origem: "Eu aprovo fazer o archive da consulta de versões no propose"; sem CI remota (push e PR não autorizados), com a suíte local; Conteúdo: sha256:ee15b88f81d523774083508e6eea8fcdcc14d54de64b3da1ce98a1ffbb3648dc
