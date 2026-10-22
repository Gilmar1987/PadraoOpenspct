# Design

## Context

- O init gera cinco artefatos no store: `project-setup.md`, `project.md`, `config.yaml`, as ADRs fundacionais e o `arquitetura.md` (Arquivo 5). O `arquitetura.md` termina em "Pontos adiados", preenchido com as respostas "Adiado" e as combinações mantidas na checagem de coerência. Nenhum comando atualiza essa seção depois.
- O `project.md` tem "Comandos de verificação" (bloco 7: instalar, executar, testes, lint, typecheck/build, migrações, auditoria, varredura). O bloco 5 já registra:
  - o CI (5.2) e as verificações que ele roda (5.3);
  - o framework unitário (5.4) e o de E2E (5.5, que pode ser "Não aplicável");
  - a cobertura mínima (5.6).

  O config já acrescenta a orientação de E2E ou de roteiro em navegador conforme a 5.5.
- O verify grava no `verification.md` as linhas de contagem (`Críticos`, `Warnings`, `Sugestões`, `Não verificado`), mais `Cobertura fora da suíte` e `Avaliação`. O `flow-metrics.mjs` lê só as quatro primeiras, pela primeira ocorrência de cada rótulo.
- O archive já atualiza a tabela de capabilities do `project.md` ("Update the project overview").
- Referência externa (análise de 2026-10-21): no marelli, o `sdd/architecture.md` (descritivo) tem a seção "Fora do ciclo atual", e o `arquitetura.md` é normativo. Os itens adiados "saem quando forem feitos, ou quando um ADR disser que não serão".

## Architecture Decisions

Não há ADR nova. A mudança acrescenta um documento de processo ao store e uma seção ao `project.md`, sem decisão de stack e sem padrão que restrinja o código dos projetos. Ela segue a [ADR-0003](../../adrs/0003-padrao-sem-stack-embutida.md): camadas e comandos vêm das respostas de cada projeto, sem ferramenta embutida. Segue também a [ADR-0004](../../adrs/0004-distribuicao-versionada-do-padrao.md): versão e CHANGELOG com as ações para os projetos.

## Goals / Non-Goals

**Goals:**

- Todo item adiado continua visível até ser feito ou descartado por ADR.
- O verify diz, por change, quais camadas rodaram e quais faltaram.
- Nenhuma pergunta nova na entrevista.

**Non-Goals:**

- Medir cobertura por camada ou exigir um mínimo por camada.
- Detectar sozinho, pelo diff, que uma change abriu um débito: quem declara é o proposal.

## Decisions

### D1. `estado-atual.md` como Arquivo 6 do init

O init gera `<root>/openspec/estado-atual.md` depois do Arquivo 5:

```markdown
# Estado atual — {{Nome do Projeto}}

> Descritivo: o que o projeto é hoje. O alvo está em [arquitetura.md](arquitetura.md), que é
> normativo; onde os dois divergem, é o código que converge para o alvo, ou uma ADR muda o alvo.

## Fora do ciclo atual

Itens adiados de propósito. Um item sai daqui quando é feito (a change que o fecha é citada no
commit do archive) ou quando uma ADR Accepted diz que não será feito. "Não é para agora" não tira
um item da lista.

| Item | Motivo | Desde | Origem | Sai quando |
|---|---|---|---|---|
| {{uma linha por resposta "Adiado" e por combinação mantida na checagem de coerência}} | | {{data do init}} | {{pergunta, por exemplo "7.1 Migrações"}} | {{condição, por exemplo "primeira change com banco"}} |
```

Alternativa considerada: manter a lista no `project.md`. Foi rejeitada porque o `project.md` é a visão geral que todo comando lê, e a lista cresce com o projeto. Um documento próprio deixa claro o par normativo/descritivo que os projetos de referência usam.

### D2. `arquitetura.md` normativo, sem lista própria

No Arquivo 5:

- o aviso do topo passa a dizer que o documento é **normativo** (a arquitetura-alvo);
- a seção "Pontos adiados" passa a ter só a frase "Ver [Fora do ciclo atual](estado-atual.md#fora-do-ciclo-atual)".

Uma lista em dois lugares diverge na primeira change.

### D3. Débitos no explore e no propose

Trecho novo **"Related debts"**, igual no comando e na skill de cada um:

- Quando `<root>/openspec/estado-atual.md` existe, o explore e o propose leem "Fora do ciclo atual".
- O propose acrescenta ao "Impact" do proposal a linha `Débitos: fecha <item>; abre <item>`, ou `Débitos: nenhum`.
- "Abre" vale só para o que a change adia **explicitamente** no "Fora do escopo" com intenção de fazer depois. O que nunca será feito não é débito.
- Sem o arquivo, o comando diz que ele não existe e segue.

### D4. Débitos no archive

Trecho novo **"Update the open debts"** no archive (comando e skill), depois de "Update the project overview":

- com o `estado-atual.md` presente, remove as linhas que o proposal cita como fechadas e acrescenta as abertas, com a data do archive e a change como origem;
- o arquivo entra no commit do archive (o `git add` do passo 5a passa a incluir `openspec/estado-atual.md`);
- uma linha sai por outro motivo só quando uma ADR Accepted a descarta, e o archive cita essa ADR.

### D5. Matriz "Camadas de verificação" no `project.md`

Seção nova no template, depois de "Comandos de verificação":

```markdown
## Camadas de verificação

| Camada | O que cobre | Comando ou procedimento | Onde roda |
|---|---|---|---|
| Unitário | <!-- regras de domínio, funções --> | <!-- comando de testes --> | <!-- local, CI --> |
| Contrato | <!-- API x contrato publicado --> | <!-- Adiado ou Não aplicável --> | |
| Arquitetura | <!-- dependências entre camadas, regras das ADRs --> | <!-- Adiado ou Não aplicável --> | |
| E2E | <!-- fluxos de interface --> | <!-- comando de E2E --> | |
| Roteiro manual | <!-- interface sem E2E, conferência humana --> | <!-- roteiro versionado --> | |
| Produção | <!-- verificação depois do deploy --> | <!-- Adiado ou Não aplicável --> | |
```

O init preenche a matriz no Arquivo 2, só com respostas existentes:

| Camada | Fonte |
|---|---|
| Unitário | 5.4 e o comando de testes da 7.1; "Onde roda" ganha "CI" quando a 5.3 inclui testes |
| Contrato | "Não aplicável" quando a 2.4 não expõe API (nenhuma comunicação por HTTP, gRPC ou mensageria); senão "Adiado" |
| Arquitetura | "Adiado" (nenhuma resposta define teste de arquitetura) |
| E2E | 5.5 e o comando de E2E (ou o de testes, se for o mesmo); "Não aplicável" quando a 5.5 é 0 |
| Roteiro manual | presente quando a 5.5 é 0 e há front-end (3.2), com a orientação do config; senão "Não aplicável" |
| Produção | "Não aplicável" quando o bloco 4 não tem produção; senão "Adiado" |

Uma camada "Adiado" na matriz também vira débito no `estado-atual.md` (D1), porque é um item adiado como os outros.

Alternativa considerada: perguntar a camada no bloco 7. Foi rejeitada, porque o escopo combinado não acrescenta perguntas, e as respostas atuais bastam para a primeira versão da matriz.

### D6. Camadas no verify

Trecho novo **"Verification layers"**, igual no comando e na skill:

- Com a matriz no `project.md`, o verify decide quais camadas se aplicam à change. Exemplos: tela alterada → E2E ou roteiro manual; rota alterada → contrato; regra de domínio → unitário.
- No formato do registro, uma linha nova `- Camadas: <camada (comando); ...>`, depois de `Não verificado`, com as camadas que rodaram.
- A camada que se aplica e não rodou entra em `Não verificado`, com o motivo, inclusive quando a matriz a marca como "Adiado".
- Sem a matriz, a linha fica `- Camadas: — (sem matriz no project.md)`.

O `flow-metrics.mjs` não muda: a linha nova tem um rótulo próprio.

### D7. Versão, CHANGELOG e CI

- **Versão:** a próxima minor livre, combinada com a outra sessão antes do apply.
- **Ações no projeto:** criar à mão o `estado-atual.md` a partir das respostas "Adiado" do `project-setup.md`, e acrescentar a seção "Camadas de verificação" ao `project.md` do store.
- **CI:** o passo "Trechos customizados das skills" passa a exigir:
  - "Related debts" no propose e no explore;
  - "Update the open debts" no archive;
  - "Verification layers" no verify;
  - `estado-atual.md` e "Camadas de verificação" no init.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/.claude/commands/opsx/init.md` | D1, D2, D5 | espelho da raiz; smoke do setup não lê o init |
| `padrao-openspec/openspec/project.md` | D5 (template) | stores novos; o setup copia o store inteiro |
| `propose.md`, `explore.md` e skills | D3 | espelhos |
| `archive.md` e skill | D4 | espelhos |
| `verify.md` e skill | D6 | espelhos; `flow-metrics.mjs` (sem mudança, conferir pelo smoke) |
| `VERSION`, `CHANGELOG.md`, `validate.yml` | D7 | passo "Versão e changelog"; workflow de atualização |

## Risks / Trade-offs

- [O proposal pode não citar um débito que a change fecha] → o débito continua na lista, o que é o erro seguro; o verify não exige a linha `Débitos:`.
- [A linha `Débitos:` vira burocracia em change pequena] → `Débitos: nenhum` basta.
- [Conflito de texto com a `init-coerencia-e-ferramentas`, que também mexe no `init.md`] → a ordem e a posição dos trechos são combinadas antes do apply; esta change não toca na checagem de coerência nem nas perguntas.
- [A apply-verify-mais-rigorosos (1.8.0) acrescentou trechos ao verify] → o trecho novo entra depois de "External report triage", sem mudar os anteriores.

## Migration Plan

Stores existentes recebem os comandos novos pelo PR de atualização e seguem funcionando sem os arquivos novos (D3, D4, D6). A ação do CHANGELOG cria os arquivos à mão. Rollback: reverter os commits e voltar o `VERSION` para a versão anterior.

## Open Questions

Nenhuma que mude o que será construído. O número da versão é combinado com a outra sessão antes do apply (tarefa 1.1).
