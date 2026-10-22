# Design

## Context

- O Bloco 2 do `/opsx:init` termina na 2.5 (jobs). A 2.4 pergunta a comunicação **entre módulos** do próprio sistema, mas nada pergunta pela interface exposta a outros sistemas nem pelo contrato dela.
- A 7.1 pergunta um comando por finalidade da seção "Comandos de verificação" do `project.md`. O template tem oito linhas, da instalação à varredura de secrets.
- O template do `project.md` não tem lugar para contratos. Hoje a seção "Fluxo de dados e integrações" de Architecture recebe as integrações em texto livre.
- O apply já para diante de escopo não pedido ("Unrequested fixes are scope"), e o verify já usa os comandos do `project.md` ("Project validation commands"). Esta change se apoia nos dois em vez de criar mecanismos paralelos.
- A outra sessão mantém o `init.md` e os comandos do ciclo em changes próprias. A tabela de coerência do init é dela (`init-coerencia-e-ferramentas`).

## Architecture Decisions

Não há ADR nova. A mudança é uma regra de processo nos comandos do ciclo. Ela segue:

- a [ADR-0003](../../adrs/0003-padrao-sem-stack-embutida.md): formatos e ferramentas aparecem só como exemplos de vários ecossistemas;
- a [ADR-0004](../../adrs/0004-distribuicao-versionada-do-padrao.md): versão e CHANGELOG;
- a [ADR-0005](../../adrs/0005-regras-entregues-por-blocos-gerenciados.md): a linha nova do `rules.md` chega ao código pelo bloco gerenciado, sem mecanismo novo.

## Goals / Non-Goals

**Goals:**

- Toda interface registrada tem um contrato com caminho conhecido, e toda mudança nela passa pelo contrato antes do código.
- O verify sabe com qual comando conferir o contrato, e diz "não verificado" quando não há comando.
- A cópia de contrato de terceiros não muda em silêncio.

**Non-Goals:**

- Gerar código ou cliente a partir do contrato.
- Exigir um formato de contrato específico.
- Comparar o contrato sem o teste do projeto, por exemplo com um parser do padrão.

## Decisions

### D1. Pergunta 2.6 no Bloco 2

Texto, depois da 2.5:

```text
**2.6 — O sistema expõe ou consome uma API para outros sistemas?** _(Múltipla escolha — separe os números por vírgula)_

0) Não — nenhuma interface com outros sistemas
1) Expõe uma API HTTP (REST) — contrato em OpenAPI
2) Expõe uma API GraphQL — contrato em SDL
3) Expõe ou consome gRPC — contrato em Protocol Buffers
4) Publica ou consome eventos/mensagens — contrato em AsyncAPI ou esquema equivalente
5) Consome a API de terceiros — cópia do contrato no repositório
6) Outro (digitar livremente)
```

Para cada opção de 1 a 5, o init pergunta o caminho do contrato no repositório de código (por exemplo, `api/openapi.yaml`). Na opção 5, pergunta também a origem (URL ou fornecedor) e a versão. Um caminho que ainda não existe é aceito: o arquivo nasce na primeira change que mexer na interface.

O resumo do Bloco 2 e a tabela do `project-setup.md` ganham a linha "Contratos de interface".

Alternativa descartada: perguntar na 2.4. A 2.4 trata da comunicação interna e alimenta a combinação 2.4×2.1 da tabela de coerência; misturar as duas mudaria uma pergunta que a outra sessão usa.

### D2. Seção "Contratos de interface" no `project.md`

Template, depois de "Fluxo de dados e integrações", dentro de Architecture:

```markdown
### Contratos de interface

| Interface | Direção | Formato | Contrato | Origem (terceiros) |
|---|---|---|---|---|
| <!-- A definir ou Não aplicável --> | | | | |
```

"Direção" é `expõe` ou `consome`. "Origem" só vale para cópia de terceiros e aponta para o `ORIGEM.md`. O init preenche a tabela pela 2.6. Com 2.6 = 0, a primeira linha registra "Não aplicável".

### D3. Linha "Teste de contrato" e a 7.1

O template dos Comandos de verificação ganha a linha `| Teste de contrato | <!-- A definir ou não aplicável --> | |`, depois de "Testes".

A 7.1 passa a listar "teste de contrato" entre as finalidades:

- só pergunta quando a 2.6 registrou um contrato; senão grava "Não aplicável";
- as sugestões vêm do ecossistema escolhido, por exemplo:
  - `schemathesis run api/openapi.yaml` para OpenAPI;
  - um teste do próprio projeto que compara as rotas registradas com o contrato (`pytest tests/test_contrato.py`);
  - `buf breaking` para Protocol Buffers;
  - `graphql-inspector diff` para SDL.

O requisito "Comandos de verificação do projeto" (`project-initialization`) não muda de texto: a linha nova é coberta pelo requisito "Comando do teste de contrato" da capability nova.

### D4. Propose: contrato no Impact e tarefa antes do código

Trecho novo, **"Interface contract first"**, igual no comando e na skill de propose, junto das regras de criação de `tasks.md`:

> **Interface contract first**: when `openspec/project.md` registers an interface contract (section "Contratos de interface") and the change creates, changes or removes an operation of that interface (route, message, schema field), list the contract file in the proposal's Impact and add a task that updates the contract before any implementation task. When the project has no registered contract, say so in the proposal and continue.

### D5. Apply: mesmo commit e nada fora do contrato

Trecho novo, **"Contract and code in the same commit"**, igual no comando e na skill de apply, depois de "Unrequested fixes are scope":

> **Contract and code in the same commit**: update the registered interface contract before the code that implements it, and commit both together. If the implementation needs an operation the contract does not declare, stop: it is new scope (see **Unrequested fixes are scope**). Never change a third-party contract copy without updating its `ORIGEM.md` (source, date, version and SHA-256) in the same commit.

### D6. Verify: duas direções e hash de terceiros

Trecho novo, **"Interface contract check"**, igual no comando e na skill de verify, depois de "Project validation commands":

> **Interface contract check**: when the change touches an interface registered in "Contratos de interface", run the "Teste de contrato" command from `project.md` and report both directions: operations declared but not implemented, and operations implemented but not declared. A confirmed divergence is CRITICAL. A missing or postponed command is not verified, with the reason. When the change touches a third-party contract copy or its integration, recompute its SHA-256 and compare it with `ORIGEM.md`; a mismatch is CRITICAL. A service that does not expose its contract hash is not an issue.

Os resultados entram em `Comandos:` do `verification.md`, como os outros comandos. O formato do registro não muda.

### D7. Regra global e hash exposto

- `rules.md`, seção 3, um item novo: "Quando o `project.md` registra um contrato de interface, o contrato MUST ser atualizado antes do código e commitado junto com ele."
- O hash exposto aparece só como recomendação (SHOULD), numa nota da seção "Contratos de interface" do template: "Recomendado: o serviço expõe o SHA-256 do contrato que implementa (por exemplo, num cabeçalho de resposta), para o consumidor detectar a divergência."

### D8. Versão, CI e README

- `VERSION` e `CHANGELOG.md`: a próxima minor livre, combinada com a outra sessão antes do apply. As "Ações no projeto" mandam acrescentar ao `project.md` do store a seção "Contratos de interface" e a linha "Teste de contrato" (ou "Não aplicável").
- CI, passo "Trechos customizados das skills":
  - "Interface contract first" no propose;
  - "Contract and code in the same commit" no apply;
  - "Interface contract check" no verify;
  - "**2.6 — O sistema expõe ou consome uma API" no init.
- README: os trechos novos entram na tabela.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/.claude/commands/opsx/init.md` | D1, D2, D3 | espelho da raiz; smoke do setup (não lê o init) |
| `padrao-openspec/openspec/project.md` | D2, D3, D7 | projetos novos; smoke do setup copia o template |
| `propose.md`, `skills/openspec-propose/SKILL.md` | D4 | espelhos |
| `apply.md`, `skills/openspec-apply-change/SKILL.md` | D5 | espelhos |
| `verify.md`, `skills/openspec-verify-change/SKILL.md` | D6 | espelhos; `flow-metrics.mjs` não muda (o formato do registro é o mesmo) |
| `padrao-openspec/openspec/rules.md` | D7 | `docs/openspec-regras.md` nos projetos, pelo instalador |
| `.github/workflows/validate.yml`, `README.md` | D8 | nenhum |
| `padrao-openspec/VERSION`, `CHANGELOG.md` | D8 | passo "Versão e changelog"; workflow de atualização |

## Risks / Trade-offs

- [Entrevista mais longa] → uma pergunta a mais. Os caminhos só são perguntados para as opções escolhidas, e "0" encerra a pergunta.
- [Teste de contrato inexistente na maioria dos projetos no começo] → o verify registra "não verificado" com o motivo. É o mesmo tratamento dos outros comandos adiados, e a ausência fica visível sem bloquear.
- [Conflito de texto com a outra sessão no `init.md` e nos comandos do ciclo] → os trechos novos ficam em posições próprias (2.6, depois de 2.5; trechos nomeados nos comandos). Rebasear na `main` antes do apply.
- [Projetos existentes sem a seção] → o propose avisa "contrato não registrado" e segue; a ação do CHANGELOG orienta acrescentar a seção.

## Migration Plan

Projetos existentes recebem as skills pelo PR de atualização e fazem a ação do CHANGELOG. Rollback: reverter os commits e voltar o `VERSION` para a versão anterior.
