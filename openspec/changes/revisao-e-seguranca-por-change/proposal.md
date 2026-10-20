# Proposal

## Why

O padrão tem a skill `requesting-code-review`, mas nenhuma etapa do fluxo exige usá-la. No teste de ponta a ponta com Django (controleCondominio, 2026-10-19), o PR da primeira change foi mergeado sem nenhuma revisão (A23), e o verify não tinha como cobrar uma. A segurança também fica só na pergunta de riscos da proposal: nada no fluxo audita dependências com vulnerabilidade conhecida nem procura secrets antes de um commit, embora o `rules.md` proíba versionar secrets.

As duas práticas valem para qualquer stack e cabem no padrão generalista (ADR-0003): a revisão usa uma skill neutra, e as ferramentas de auditoria e varredura entram nos "Comandos de verificação" de cada projeto.

## What Changes

- **Revisão de código por change:** ao terminar as tarefas que alteram código, o apply pede a revisão pela skill `requesting-code-review` (ou registra a revisão de uma pessoa), corrige ou justifica cada achado crítico e importante e grava o resultado em `review.md` na pasta da change.
- **Verify cobra a revisão:** uma change que alterou código e não tem `review.md`, ou que tem achado crítico ou importante sem correção nem justificativa, gera um item crítico no verify.
- **Checagens de segurança:** o `project.md` neutro ganha as finalidades "Auditoria de dependências" e "Varredura de secrets" nos Comandos de verificação; o init as pergunta, com sugestões de vários ecossistemas; o apply as roda antes da revisão.
  - Secret encontrado: o agente para antes de commitar e avisa.
  - Vulnerabilidade alta ou crítica em dependência: corrigir ou justificar no `review.md`.
- **Riscos da proposal:** a pergunta de riscos do config base passa a cobrir dependências novas ou atualizadas.
- `rules.md` seção 5, README e marcadores da CI atualizados.

### Fora do escopo

- Escolher ou instalar ferramentas de auditoria e de varredura; elas são decisão de cada projeto.
- Política de versões e de licenças de dependências, definição de pronto comum, observabilidade e acessibilidade (próxima change, depois de decisões do time).
- Revisão de segurança aprofundada (modelagem de ameaças, pentest).
- Revisão de changes que só mexem em documentação ou em artefatos de planejamento: registram "não aplicável".

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `workflow-governance`: revisão de código obrigatória por change e cobrança pelo verify.
- `implementation-safeguards`: auditoria de dependências e varredura de secrets durante a implementação.
- `project-initialization`: o init registra os comandos de auditoria e de varredura.

## Impact

- **Skills e comandos:** `openspec-apply-change` e `apply.md` (revisão e checagens de segurança), `openspec-verify-change` e `verify.md` (cobrança da revisão), `init.md` (perguntas novas no bloco 7.1). Espelhados pelo sync.
- **Store neutro:** `padrao-openspec/openspec/project.md` (duas finalidades novas) e `config.yaml` (pergunta de riscos).
- **Regras:** `openspec/rules.md` seção 5.
- **CI e documentação:** marcadores novos em `.github/workflows/validate.yml`; tabela de trechos customizados do `README.md`.
- **Riscos:**
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - **Compatibilidade:** changes em andamento em projetos já configurados passam a exigir `review.md` no próximo verify. Mitigação: o verify aceita uma revisão de pessoa registrada e o "não aplicável" para changes sem código.
  - **Agentes sem subagentes:** quem não consegue disparar um subagente registra a revisão de uma pessoa ou roda a revisão em outra sessão; o `review.md` diz quem revisou.

## Aprovação

- Responsável: gilmar campelo
- Data: 2026-10-20
- Escopo: apply
- Condições: —
- Origem: "Eu, gilmar campelo aprovo a change revisao-e-seguranca-por-change para apply"
