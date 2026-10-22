# Proposal

## Why

Neste repositório, duas sessões de agente trabalharam ao mesmo tempo (2026-10-21 e 2026-10-22), e o trabalho em paralelo mostrou lacunas que o padrão não cobre:

- **Changes que se sobrepõem:**
  - a `coerencia-de-seguranca-e-triagem` e a `apply-verify-mais-rigorosos` mexiam nos mesmos arquivos de verify, no `validate.yml`, no `VERSION` e no `CHANGELOG`;
  - a `coerencia-de-seguranca-e-triagem` cobria parte de uma change futura (as linhas de coerência);
  - a sobreposição só apareceu porque as sessões trocaram mensagens. Nada no propose aponta outras changes ativas na mesma capability.
- **Recursos compartilhados da máquina:**
  - as suítes locais das duas sessões usam os mesmos ids de teste (`ci-store`, `ci-entrada`, `ci-drive`…) no registro global de stores. O `unregister` de uma apagou o registro da outra, e um passo falhou sem defeito no código;
  - uma suíte reinstalou o OpenSpec CLI global (`npm install -g`) enquanto a outra o usava, e deu `openspec: command not found`;
  - o passo "Smoke test da declaração do store" deixa o id `ci-store` registrado quando falha, porque não tem `trap`.
- **Pastas e versões:**
  - no relatório do Lava Jato (item 29), duas sessões abertas na mesma pasta trocaram mensagens duplicadas;
  - a outra sessão passou a usar uma worktree própria, e isso evitou conflitos, mas o padrão não orienta isso;
  - a ordem de versões e de ADRs entre as sessões foi combinada por mensagem, sem regra escrita.

## What Changes

- **Propose aponta changes concorrentes:** trecho novo **"Check concurrent changes"** na skill e no comando de propose.
  - Antes de escrever os artefatos, o agente lista as changes ativas (`openspec list --json`) e as capabilities das delta specs de cada uma.
  - Ao escrever as delta specs, compara essas capabilities com as da change nova.
  - Cada sobreposição vai para o Impact do proposal, numa linha "Changes concorrentes", e é mostrada ao usuário antes da aprovação, com a sugestão de ordem.
- **Regras para trabalho em paralelo** (`rules.md`, seção nova "Trabalho em paralelo"):
  - com mais de uma sessão ou agente no mesmo repositório, cada change fica numa worktree e numa branch próprias (`git worktree add`), uma sessão por worktree;
  - a versão e o número de uma ADR nova são combinados antes do apply;
  - quem for rodar uma suíte que usa recursos da máquina (registro de stores, ferramentas globais) avisa antes.
- **CI sem recursos compartilhados:**
  - os ids de store dos testes ganham um sufixo por execução (`ci-store-<sufixo>`), com o `run_id` no GitHub e um sufixo aleatório na execução local, e todo passo que registra um store desregistra pelo `trap`;
  - a instalação do CLI só roda quando a versão certa não está instalada, e nunca reinstala por cima.
- **Guia deste repositório:** o `openspec/project.md` ganha a nota "Execução local da suíte" (não reinstalar o CLI; avisar a outra sessão).
- **Versão:** a próxima livre depois das changes já combinadas com a outra sessão (provisoriamente depois da `subagentes-e-ganchos`, v1.10.0). O número é combinado antes do apply.

### Fora do escopo

- Criar worktrees automaticamente ou um script de coordenação entre sessões.
- Bloquear mecanicamente o propose quando há sobreposição: ele só aponta, e o usuário decide.
- Mudar a CI de projetos consumidores.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `workflow-governance`: o propose aponta changes concorrentes; regras de trabalho em paralelo (worktree, versão e ADR combinadas, aviso antes de suítes).
- `continuous-validation`: ids de teste únicos por execução, desregistro garantido e instalação do CLI sem reinstalar.

## Impact

- **Comandos e skills:** `commands/opsx/propose.md` e `skills/openspec-propose/SKILL.md`, com as cópias da raiz pelo `sync-root`.
- **Regras:** `padrao-openspec/openspec/rules.md` (e `docs/openspec-regras.md` dos projetos).
- **CI:** `.github/workflows/validate.yml` (ids e `trap` em seis passos, instalação do CLI nos dois jobs).
- **Documentação:** `openspec/project.md` deste repositório, `README.md` (tabela de trechos), `CHANGELOG.md`, `VERSION`.
- **Changes concorrentes:** a `subagentes-e-ganchos` (outra sessão, em apply) também toca `validate.yml`, `VERSION` e `CHANGELOG`; esta change entra depois dela e é rebaseada.
- **Riscos:**
  - **Erro de digitação ao trocar os ids:** um id esquecido volta a colidir. Mitigação: uma checagem na CI que falha se aparecer `ci-` sem sufixo num `--register-id` ou num `store unregister`.
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.

## Aprovação

- Responsável: gilmar campelo
- Data: 2026-10-22
- Escopo: apply
- Condições: —
- Origem: "As duas aprovadas : qualidade-de-interface , validacao-e-paralelismo", em resposta a "Para eu implementar, aprove indicando onde ela entra na fila [...]" e à ordem sugerida "1. subagentes-e-ganchos; 2. validacao-e-paralelismo; 3. qualidade-de-interface; 4. as três changes de SDD". A resposta não cita archive, PR nem release, então o escopo registrado é apply.
