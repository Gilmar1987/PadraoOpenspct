# Proposal

## Why

O store de um projeto não distingue o que a arquitetura **deve** ser do que o código **é** hoje. O `arquitetura.md` gerado pelo init mistura os dois: descreve a arquitetura escolhida e, no fim, lista os "Pontos adiados", que ninguém atualiza depois. Esses itens adiados (autenticação, migrações, observabilidade) somem da vista na primeira change. Nos projetos de referência analisados em 2026-10-21 (motor-calculo e marelli), essa separação existe e funciona:

- um documento normativo diz o alvo;
- um documento descritivo diz o estado atual e mantém uma lista "Fora do ciclo atual";
- um item só sai dessa lista quando é feito ou quando uma decisão diz que não será.

O segundo problema é o verify. Hoje ele roda os comandos do `project.md`, mas não sabe quais **camadas** de verificação o projeto tem (unitário, contrato, arquitetura, E2E, roteiro manual, produção) nem quais delas uma change deveria exercitar. Por isso, uma change de interface pode passar só com testes unitários sem que o registro diga que o E2E não rodou. As respostas que dizem quais camadas existem (5.x e 7.1) já estão no init, mas nada as junta num lugar que o verify consulte.

## What Changes

- **Estado atual separado do alvo:**
  - o init passa a gerar `openspec/estado-atual.md` (descritivo), com a seção "Fora do ciclo atual": uma tabela de débitos com item, motivo, data de abertura, origem (resposta do init, change ou ADR) e condição de saída;
  - a lista inicial vem das respostas "Adiado" da entrevista e das combinações mantidas na checagem de coerência;
  - o `arquitetura.md` passa a se declarar normativo (o alvo), e a seção "Pontos adiados" vira um link para "Fora do ciclo atual", sem duplicar a lista.
- **Débitos no ciclo das changes:**
  - o explore e o propose leem o `estado-atual.md` e citam no proposal os débitos que a change fecha ou abre;
  - o archive atualiza a lista: remove o débito que a change fechou (com a change e a data) e acrescenta o que a change adiou explicitamente;
  - um débito só sai da lista quando é feito ou quando uma ADR Accepted diz que não será feito, nunca por "não ser para agora".
- **Matriz "Camadas de verificação" no `project.md`:**
  - nova seção, depois de "Comandos de verificação", com uma linha por camada (unitário, contrato, arquitetura, E2E, roteiro manual, produção), dizendo o que ela cobre, o comando ou procedimento e onde roda (local, CI);
  - o init a preenche só com respostas que já tem (5.2 a 5.5 e bloco 7), sem pergunta nova; camada sem resposta fica "Adiado" ou "Não aplicável";
  - o verify usa a matriz: registra no `verification.md` quais camadas a change exercitou e põe em "Não verificado" as que se aplicavam à change e não rodaram.
- **Versão:** acrescenta os seus itens à seção da versão aberta no `CHANGELOG.md` (1.12.0, aberta pela `qualidade-de-interface`), sem mexer no `VERSION` se ele já estiver nela; a release sai só quando o responsável pedir (modelo decidido em 2026-10-22).
- Marcadores novos na CI para os trechos do init, do verify, do archive, do propose e do explore.

### Fora do escopo

- Linhas novas na checagem de coerência do init, separação entre auditoria de produção e auditoria completa e checagem de presença das ferramentas. Isso fica na change `init-coerencia-e-ferramentas`, da outra sessão.
- Lacunas declaradas, ADRs verificáveis por teste e ordem de precedência dos documentos. Isso fica na change `lacunas-e-adrs-verificaveis`.
- Contratos de interface (OpenAPI e afins). Isso fica na change `contratos-de-interface`.
- Perguntas novas na entrevista do init: a matriz usa só respostas que já existem.
- Preencher a matriz e o `estado-atual.md` do próprio repositório do padrão.
- Migrar automaticamente os stores já inicializados; o CHANGELOG traz a ação manual.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `project-initialization`: o init gera o `estado-atual.md` com a lista inicial de débitos e a matriz de camadas no `project.md`; o `arquitetura.md` passa a ser normativo e aponta para a lista de débitos; o commit do init inclui o arquivo novo.
- `workflow-governance`: o explore e o propose citam os débitos relacionados; o archive atualiza a lista de débitos.
- `verification-record`: o registro do verify diz quais camadas a change exercitou e quais ficaram sem verificação.

## Impact

- **Comandos e skills:**
  - `padrao-openspec/.claude/commands/opsx/init.md` (Arquivo 2, Arquivo 5, Arquivo 6 novo e commit do init);
  - `verify.md` e `skills/openspec-verify-change/SKILL.md`;
  - `archive.md` e `skills/openspec-archive-change/SKILL.md`;
  - `propose.md` e `skills/openspec-propose/SKILL.md`;
  - `explore.md` e `skills/openspec-explore/SKILL.md`.

  As cópias da raiz são espelhadas pelo `sync-root.mjs`.
- **Template:** `padrao-openspec/openspec/project.md` ganha a seção "Camadas de verificação".
- **Versão e CI:** `padrao-openspec/VERSION`, `CHANGELOG.md`, `.github/workflows/validate.yml`.
- **Métricas:** o `flow-metrics.mjs` lê as linhas `Críticos`, `Warnings`, `Sugestões` e `Não verificado`; a linha nova `Camadas:` não as altera.
- **Riscos:**
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - Compatibilidade: stores antigos não têm `estado-atual.md` nem a matriz. Nesse caso, explore, propose, archive e verify seguem como hoje e dizem que o documento não existe, sem falhar.
  - Conflito de texto com a `init-coerencia-e-ferramentas` (outra sessão), que também mexe no `init.md`: a posição dos trechos é combinada no rebase.

## Aprovação

- Responsável: Gilmar Campelo
- Data: 2026-10-22
- Escopo: apply
- Condições: versões aprovadas: 1.10.0 subagentes-e-ganchos, 1.11.0 validacao-e-paralelismo, 1.12.0 qualidade-de-interface, 1.13.0 lacunas-e-adrs-verificaveis, 1.14.0 contratos-de-interface e 1.15.0 debitos-e-camadas-de-verificacao (esta change: 1.15.0); cada apply começa depois do merge da anterior, com rebase na main
- Ordem confirmada: Gilmar Campelo, 2026-10-22, "aprovo também: [...] a confirmação da ordem das versões"
- Versão (atualizada em 2026-10-22): a versão só sobe quando o responsável decidir publicar; esta change acrescenta itens à seção aberta (1.12.0). Origem: "sim", em resposta a "Confirma esse modelo? [...] tudo entra na 1.12.0 [...] a release sai quando você pedir"
- Origem: "Aprovado 2, 3 e 4", em resposta a "2. ADR para a lacunas-e-adrs-verificaveis [...] Crio a ADR-0008 (Proposed) nessa change? 3. Ordem do apply: a minha sugestão é primeiro a guardas-mecanicas [...] e depois subagentes-e-ganchos, lacunas-e-adrs-verificaveis, contratos-de-interface e debitos-e-camadas-de-verificacao. 4. Aprovação para o apply: pode ser de uma change por vez, ou de várias de uma vez com condições."
- Archive: pendente de aprovação
