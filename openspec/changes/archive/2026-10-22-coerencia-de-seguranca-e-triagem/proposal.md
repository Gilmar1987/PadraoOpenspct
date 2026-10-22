# Proposal

## Why

Uma ferramenta de análise externa avaliou o controleCondominio (2026-10-20) e apontou 16 achados de segurança. A triagem feita à mão mostrou dois problemas no padrão, que valem para qualquer projeto:

- **O init aceita desligar a segurança sem questionar.** O projeto registrou "Não aplicável" para a auditoria de dependências e para a varredura de secrets, embora tenha dependências e guarde credenciais em `.env`. Com isso, nada no fluxo rodou um auditor, e dois CVEs reais do Django REST framework passaram. O init também aceitou, sem apontar, a combinação "dados pessoais (CPF) + sem autenticação + sem proteção contra ataques". O próprio texto da pergunta de autenticação não tem opção "sem autenticação", e a resposta só entrou por "Outro".
  Desde então, a pergunta 7.1 passou a sugerir ferramentas de auditoria e de varredura, e o apply passou a rodá-las (v1.4.0); a checagem de coerência ganhou a combinação "dados pessoais sem controles de LGPD" (v1.3.1). Continua faltando o principal: "Não aplicável" na auditoria e na varredura passa sem nenhum aviso, a pergunta de autenticação continua sem a opção, e nada aponta dados pessoais sem autenticação e sem proteção (o caso do Lava Jato, em 2026-10-21, também registrou "sem autenticação" por "Outro").
- **Não há orientação para triar um relatório externo.** Cerca de 11 dos 16 achados eram falsos positivos ou não se aplicavam (CSRF numa API sem sessão, XSS em texto escapado pelo template, "credenciais" que eram marcadores de exemplo), e os reais estavam misturados com eles. Sem um critério de triagem, um agente tende a corrigir tudo às cegas ou a descartar tudo, e as duas saídas são ruins.

## What Changes

- **Pergunta 3.6 do init:** ganha a opção "0) Sem autenticação no MVP".
- **Checagem de coerência do init**, com três combinações novas:
  - auditoria de dependências "Não aplicável" num projeto com dependências de terceiros;
  - varredura de secrets "Não aplicável" num projeto que usa credenciais (`.env`, chaves de API, banco);
  - dados pessoais ou sensíveis (1.5) com sem autenticação (3.6) e sem proteção contra ataques (6.4).
  Para as duas primeiras, a proposta é registrar uma ferramenta do ecossistema ou adiar com justificativa; "Não aplicável" só se mantém com justificativa. Para a terceira, a proposta é restringir o uso a ambiente local com dados de teste, registrado como restrição no `project.md`, ou adotar autenticação e limite de requisições. Ela complementa a combinação de LGPD que já existe, que continua igual.
- **Triagem de relatório externo no verify:** quando há relatório de uma ferramenta de análise (SAST, scanner de dependências, revisão automatizada), o verify confirma cada achado no código e nas decisões registradas e o classifica como real, não se aplica, risco aceito ou falso positivo, sempre com evidência. Achado confirmado mantém a severidade; achado não conferido fica "não verificado". O resultado vai para o `verification.md`.
- **Versão:** `1.7.0` no `VERSION` e no `CHANGELOG.md`, com as ações para projetos existentes.
- Marcador novo na CI para o trecho da triagem.

### Fora do escopo

- Corrigir o controleCondominio: atualizar o DRF e o pytest, corrigir o regex do `shared/logging.py` e reavaliar autenticação e rate limiting são decisões e changes daquele projeto.
- Escolher ou instalar uma ferramenta de análise; o padrão continua sem stack embutida (ADR-0003).
- Bloquear o init: o responsável pode manter qualquer combinação, com justificativa registrada.
- Publicar a release `1.7.0`, que depende do merge e de pedido explícito.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `project-initialization`: opção "sem autenticação" na 3.6 e três combinações novas na checagem de coerência.
- `workflow-governance`: triagem de relatórios de ferramentas externas no verify.

## Impact

- **Comandos e skills:** `padrao-openspec/.claude/commands/opsx/init.md`; `padrao-openspec/.claude/commands/opsx/verify.md` e `skills/openspec-verify-change/SKILL.md`. Espelhados pelo sync.
- **Versão:** `padrao-openspec/VERSION` e `CHANGELOG.md`.
- **CI:** `.github/workflows/validate.yml` (marcador da triagem).
- **Base:** a branch parte da `main` na versão 1.6.0 (depois do PR #25), e a `apply-verify-mais-rigorosos` entra depois dela, como 1.8.0, por decisão do responsável em 2026-10-22. Se a `main` andar antes do apply, a branch é rebaseada de novo.
- **Riscos:**
  - Dados pessoais: a change não coleta nem trata dados pessoais; ela orienta o init a apontar o risco nos projetos.
  - Autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - **Compatibilidade:** projetos já inicializados não mudam. A ação no CHANGELOG sugere rever as respostas "Não aplicável" de segurança no `project.md`. A entrevista do init fica um pouco mais longa só quando uma das combinações aparece.

## Aprovação

- Responsável: Gilmar Campelo
- Data: 2026-10-22
- Escopo: apply
- Condições: nenhuma
- Origem: "Eu, gilmar campelo, aprovo a change coerencia-de-seguranca-e-triagem para apply"
- Archive: Gilmar Campelo, 2026-10-22, escopo archive. Condições: nenhuma declarada; seguem as do fluxo (validate --strict, sync-root --check, lint e smoke tests passando, verify sem críticos). Origem: "confirmo 1, 2, e 3", em resposta a "Falta você decidir: 1. A ordem [...] 2. A aprovação de archive da minha change, com as condições que quiser. 3. O push e o PR, quando quiser."
