# Proposal

## Why

O padrão não trata o contrato de uma interface (a API que o projeto expõe ou consome) como artefato próprio. Hoje uma change que cria ou altera um endpoint passa por propose, apply e verify sem que nada exija um contrato escrito, nem que ele concorde com o código. Nos repositórios de referência analisados (motor-calculo e marelli), a prática que mais evitou divergência foi:

- tratar o contrato (OpenAPI) como fonte da verdade, escrito antes do código e commitado no mesmo commit da implementação;
- conferir o contrato e a implementação por teste, nas duas direções;
- fixar a cópia de um contrato de terceiros com SHA-256 e um registro de origem.

## What Changes

- **Init, nova pergunta 2.6** (depois da 2.5, no Bloco 2): o projeto expõe ou consome uma API para outros sistemas? Se sim, o init pergunta o formato do contrato e o caminho dele no repositório de código. Exemplos de formato: OpenAPI, GraphQL SDL, Protocol Buffers e AsyncAPI.
  - A resposta vai para uma seção nova, "Contratos de interface", no `project.md`.
  - Quando a 2.6 registra uma API, a 7.1 pergunta também o comando do teste de contrato, gravado na linha nova "Teste de contrato" dos Comandos de verificação.
  - Sem API, a seção registra "Não aplicável", e a linha do teste também.
- **Propose:** uma change que cria, altera ou remove uma operação de interface (rota, mensagem, campo de esquema) lista o arquivo de contrato no Impact e tem uma tarefa de atualizar o contrato **antes** das tarefas de código.
- **Apply:** o contrato é atualizado antes da implementação e entra no mesmo commit que ela. A implementação não inventa operação que o contrato não declara.
- **Verify:**
  - confere o contrato e a implementação pelo comando "Teste de contrato" do `project.md`;
  - sem esse comando, registra a conferência como não verificada, com o motivo;
  - quando há cópia de contrato de terceiros, confere o SHA-256 dela contra o registro de origem.
- **Contrato de terceiros:** uma cópia versionada de um contrato consumido é fixada com:
  - o SHA-256 do arquivo;
  - um `ORIGEM.md` ao lado, com de onde veio, quando, qual versão e o hash.

  Uma cópia que muda sem atualizar o registro é divergência.
- **Hash exposto (opcional):** o serviço pode expor o hash do contrato que implementa (por exemplo, num cabeçalho de resposta), para o consumidor detectar a divergência. O padrão recomenda, mas não exige.
- **Regras globais (`rules.md`):** uma linha na seção 3 diz que, quando o projeto tem contrato de interface, o contrato vem antes do código e no mesmo commit.
- **CI e README:** os trechos novos entram na checagem de trechos customizados e na tabela do README.
- **Versão:** acrescenta os seus itens à seção da versão aberta no `CHANGELOG.md` (1.12.0, aberta pela `qualidade-de-interface`), sem mexer no `VERSION` se ele já estiver nela; a release sai só quando o responsável pedir (modelo decidido em 2026-10-22).

### Fora do escopo

- Escolher, instalar ou gerar ferramentas de contrato (geradores de cliente, validadores, mocks): cada projeto registra as suas. O padrão continua sem stack embutida (ADR-0003).
- Versionamento e descontinuação de contratos entre serviços (janelas de compatibilidade, enums tolerantes): fica para uma change futura, se for pedida.
- Linhas novas na tabela de coerência do init: ficam na change `init-coerencia-e-ferramentas`, da outra sessão.
- Projetos já inicializados não são alterados. O CHANGELOG traz a ação manual.
- Publicar a release.

## Capabilities

### New Capabilities

- `interface-contracts`: o contrato de interface como fonte da verdade. Cobre o registro no init, o contrato antes do código no propose e no apply, a conferência nas duas direções no verify, a cópia de terceiros fixada por hash e o hash exposto opcional.

### Modified Capabilities

Nenhuma. Os requisitos novos ficam todos em `interface-contracts`. Os existentes de init, apply e verify continuam valendo como estão.

## Impact

- **Comandos e skills** (espelhados pelo `sync-root.mjs`):
  - `padrao-openspec/.claude/commands/opsx/init.md`: pergunta 2.6, resumo do Bloco 2, linha "Teste de contrato" na 7.1, seção "Contratos de interface" no `project.md` gerado;
  - `propose.md` e `skills/openspec-propose/SKILL.md`;
  - `apply.md` e `skills/openspec-apply-change/SKILL.md`;
  - `verify.md` e `skills/openspec-verify-change/SKILL.md`.
- **Templates e regras:**
  - `padrao-openspec/openspec/project.md`: seção "Contratos de interface" e linha "Teste de contrato";
  - `padrao-openspec/openspec/rules.md`: seção 3.
- **CI e documentação:** `.github/workflows/validate.yml` (marcadores) e `README.md` (tabela de trechos customizados).
- **Versão:** `padrao-openspec/VERSION` e `CHANGELOG.md`.
- **Dependências:** nenhuma nova.
- **Riscos:**
  - Compatibilidade: projetos existentes não mudam até seguirem a ação do CHANGELOG. Uma change que mexe em interface num projeto sem a seção nova é tratada como "contrato não registrado", com aviso, e não como falha.
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam ao padrão. Nos projetos, o hash exposto não revela conteúdo do contrato.
- **Coordenação:** a outra sessão (projetoopenspct-5a) mexe no `init.md` e nos comandos do ciclo. A versão e a ordem de entrada são combinadas antes do apply.

## Aprovação

- Responsável: Gilmar Campelo
- Data: 2026-10-22
- Escopo: apply
- Condições: versões aprovadas: 1.10.0 subagentes-e-ganchos, 1.11.0 validacao-e-paralelismo, 1.12.0 qualidade-de-interface, 1.13.0 lacunas-e-adrs-verificaveis, 1.14.0 contratos-de-interface e 1.15.0 debitos-e-camadas-de-verificacao (esta change: 1.14.0); cada apply começa depois do merge da anterior, com rebase na main
- Ordem confirmada: Gilmar Campelo, 2026-10-22, "aprovo também: [...] a confirmação da ordem das versões"
- Versão (atualizada em 2026-10-22): a versão só sobe quando o responsável decidir publicar; esta change acrescenta itens à seção aberta (1.12.0). Origem: "sim", em resposta a "Confirma esse modelo? [...] tudo entra na 1.12.0 [...] a release sai quando você pedir"
- Origem: "Aprovado 2, 3 e 4", em resposta a "2. ADR para a lacunas-e-adrs-verificaveis [...] Crio a ADR-0008 (Proposed) nessa change? 3. Ordem do apply: a minha sugestão é primeiro a guardas-mecanicas [...] e depois subagentes-e-ganchos, lacunas-e-adrs-verificaveis, contratos-de-interface e debitos-e-camadas-de-verificacao. 4. Aprovação para o apply: pode ser de uma change por vez, ou de várias de uma vez com condições."
- Archive: pendente de aprovação
