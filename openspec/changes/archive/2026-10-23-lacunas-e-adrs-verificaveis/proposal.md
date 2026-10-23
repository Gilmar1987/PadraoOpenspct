# Proposal

## Why

Dois projetos de referência analisados em 2026-10-21 (um motor de cálculo e uma aplicação financeira) mostraram três práticas de SDD que o padrão ainda não tem:

- **Lacunas declaradas, e não esquecidas.** O que o sistema ainda não cumpre de um documento de referência (um modelo de dados, um contrato, uma regra do legado) fica num registro com motivo, data e o hash da fonte. Um teste falha nas duas direções: aparece uma lacuna nova sem declaração (regressão), ou some uma lacuna declarada (a etapa andou e a declaração ficou velha). Se o hash da fonte muda, a declaração inteira é relida. No padrão, hoje, uma divergência conhecida fica em texto solto (Open Questions, `design.md` arquivado) ou em lugar nenhum, e o verify não tem como saber se ela foi decidida.
- **ADR com teste que a sustenta.** As regras de arquitetura desses projetos ("o domínio não importa infraestrutura", "o modelo segue o DER") são testes de arquitetura (*fitness functions*) que rodam na suíte. No padrão, uma ADR `Accepted` é só texto: nada confere se o código ainda a respeita.
- **Precedência entre documentos.** Os dois projetos dizem qual documento vence num conflito (contrato → arquitetura → ADRs → código) e que divergência entre os dois primeiros vai para a revisão humana. No padrão, o agente lê `project.md`, ADRs e specs sem uma ordem para conflitos e decide sozinho qual seguir.

## What Changes

- **Registro de lacunas declaradas** (`openspec/lacunas.md` no store, com modelo em `padrao-openspec/openspec/lacunas.md`): uma linha por lacuna, com a fonte, o SHA-256 da fonte, o item não cumprido, o motivo, a data e o encaminhamento. Motivo e data são obrigatórios.
- **Script `padrao-openspec/scripts/lacunas.mjs`**, sem dependências e neutro de stack: confere o formato do registro (campos obrigatórios e data válida), a existência da fonte e se o SHA-256 registrado ainda é o da fonte. Fonte alterada sai com erro e pede a releitura da declaração inteira daquela fonte, e não só a troca do hash.
- **Verify, heurística "Declared gaps"**: roda o script quando o registro existe; aponta como crítico a divergência nova, entre a change e uma fonte de referência, que não está declarada nem corrigida (direção "lacuna nova"), e a lacuna declarada que a change fechou sem atualizar o registro (direção "lacuna fechada"). Quando o projeto registra em "Comandos de verificação" um comando de conferência de lacunas, o verify o roda.
- **ADR verificável**: o modelo de ADR ganha o campo opcional `verificacao`, com o teste ou comando que sustenta a decisão. O propose, ao criar uma ADR cuja regra pode ser conferida por código, preenche o campo e cria a tarefa do teste. O verify, heurística "ADR verification", roda a verificação das ADRs `Accepted` ligadas à change e aponta como crítica a verificação ausente ou falhando.
- **Precedência entre documentos** em `rules.md` e numa seção nova do modelo de `project.md`: contrato de interface → specs principais → arquitetura (`arquitetura.md` e `project.md`) → ADRs `Accepted` → código. Código que diverge de um documento converge para ele, salvo lacuna declarada. Divergência entre o contrato e as specs é reportada à revisão humana, e o agente não escolhe sozinho.
- **CI**: marcadores dos trechos novos no passo "Trechos customizados das skills", `node --check` do script novo e um smoke test do `lacunas.mjs`. README com os trechos novos.
- **Versão:** acrescenta os seus itens à seção da versão aberta no `CHANGELOG.md` (1.12.0, aberta pela `qualidade-de-interface`), sem mexer no `VERSION` se ele já estiver nela; a release sai só quando o responsável pedir (modelo decidido em 2026-10-22).

### Fora do escopo

- Testes de arquitetura prontos para uma stack: o padrão continua sem stack embutida (ADR-0003). Os exemplos citam vários ecossistemas.
- Contrato de interface como fonte da verdade, teste de contrato e cópia fixada de contrato de terceiros: ficam na change `contratos-de-interface`. Aqui o contrato só aparece na ordem de precedência.
- Arquitetura-alvo separada do estado atual, débitos datados e matriz de camadas de verificação: ficam na change `debitos-e-camadas-de-verificacao`.
- Portão mecânico de apply e archive e hooks do Claude Code: ficam nas changes `guardas-mecanicas` (outra sessão) e `subagentes-e-ganchos`.
- Preencher lacunas ou `verificacao` nas ADRs do próprio PadraoOpenspct.

## Capabilities

### New Capabilities

- `declared-gaps`: registro de lacunas declaradas no store, conferência mecânica do registro e do hash das fontes, e a cobrança das duas direções no verify.

### Modified Capabilities

- `workflow-governance`: ADR com verificação declarada, criada no propose e conferida no verify (requisito novo).
- `agent-context-discipline`: precedência entre documentos num conflito (requisito novo).

## Impact

- **ADR:** [ADR-0007](../../adrs/0007-lacunas-declaradas-e-precedencia-entre-documentos.md) (`Accepted` em 2026-10-23), criada por decisão do responsável.
- **Comandos e skills:** `padrao-openspec/.claude/commands/opsx/verify.md` e `skills/openspec-verify-change/SKILL.md` (heurísticas "Declared gaps" e "ADR verification"); `padrao-openspec/.claude/commands/opsx/propose.md` e `skills/openspec-propose/SKILL.md` (campo `verificacao` ao criar ADR). Espelhados na raiz pelo `sync-root.mjs`.
- **Modelos do store:** `padrao-openspec/openspec/lacunas.md` (novo), `padrao-openspec/openspec/adrs/template.md` e `adrs/README.md` (campo `verificacao`), `padrao-openspec/openspec/project.md` (seção "Precedência dos documentos" e linha "Conferência de lacunas" em "Comandos de verificação").
- **Regras:** `padrao-openspec/openspec/rules.md` (precedência); chega aos projetos como `docs/openspec-regras.md` e aos blocos gerenciados dos agentes.
- **Script:** `padrao-openspec/scripts/lacunas.mjs` (novo, Node.js sem dependências, como os outros scripts).
- **CI e documentação:** `.github/workflows/validate.yml`, `README.md`, `padrao-openspec/VERSION`, `CHANGELOG.md`.
- **Dependências:** nenhuma nova; o script usa só `node:crypto` e `node:fs`.
- **Riscos:**
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - **Compatibilidade:** projetos sem `openspec/lacunas.md` e ADRs sem `verificacao` não mudam de comportamento; as heurísticas só agem quando o registro ou o campo existem. A seção nova do `project.md` vale para stores novos; os existentes recebem a ação no CHANGELOG.
  - **Conflito com a outra sessão:** os arquivos de verify, propose, `validate.yml`, `VERSION` e `CHANGELOG.md` são editados também pelas changes da projetoopenspct-5a; rebasear na `main` antes do apply.

## Aprovação

- Responsável: Gilmar Campelo
- Data: 2026-10-22
- Escopo: apply
- Condições: versões aprovadas: 1.10.0 subagentes-e-ganchos, 1.11.0 validacao-e-paralelismo, 1.12.0 qualidade-de-interface, 1.13.0 lacunas-e-adrs-verificaveis, 1.14.0 contratos-de-interface e 1.15.0 debitos-e-camadas-de-verificacao (esta change: 1.13.0); cada apply começa depois do merge da anterior, com rebase na main
- Ordem confirmada: Gilmar Campelo, 2026-10-22, "aprovo também: [...] a confirmação da ordem das versões"
- Versão (atualizada em 2026-10-22): a versão só sobe quando o responsável decidir publicar; esta change acrescenta itens à seção aberta (1.12.0). Origem: "sim", em resposta a "Confirma esse modelo? [...] tudo entra na 1.12.0 [...] a release sai quando você pedir"
- Origem: "Aprovado 2, 3 e 4", em resposta a "2. ADR para a lacunas-e-adrs-verificaveis [...] Crio a ADR-0008 (Proposed) nessa change? 3. Ordem do apply: a minha sugestão é primeiro a guardas-mecanicas [...] e depois subagentes-e-ganchos, lacunas-e-adrs-verificaveis, contratos-de-interface e debitos-e-camadas-de-verificacao. 4. Aprovação para o apply: pode ser de uma change por vez, ou de várias de uma vez com condições."
- Archive: Gilmar Campelo, 2026-10-23; condições: CI verde nos três jobs (root, store no Ubuntu e no Windows) no PR #37, com archive, push e merge autorizados; Origem: "Para a lacunas-e-adrs-verificaveis: pode fazer archive, push e merge do PR #37 se a CI passar nos três jobs"; Conteúdo: sha256:f3d5ea27972a3bdf7322c8e51de824e79d2cb6130bcec77bc36b211c4828eaaa
- Nota: a ADR criada por esta change foi renumerada de 0008 para 0007 em 2026-10-22, porque a 0007 reservada para a guardas-mecanicas não foi usada; a citação acima mantém o número original da pergunta.
