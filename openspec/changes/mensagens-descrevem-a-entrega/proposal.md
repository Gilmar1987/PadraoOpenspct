# Proposal

## Why

Os fluxos `/opsx:*` identificam a change pelo nome em kebab-case: "Using change: entrega-no-codigo", "**Change:** questionario-adaptativo", "rode `/opsx:verify entrega-no-codigo`". O nome é um identificador técnico e não diz ao dev o que foi feito. O responsável pediu, em 2026-10-23, que as mensagens digam **o que está sendo entregue** e que o próximo passo apareça só como o comando a digitar, sem o nome. O próprio comando já descobre a change pelo contexto e pergunta quando há mais de uma ativa.

## What Changes

- **Regra global (`rules.md`, seção 3):** ao citar uma change para o usuário, o agente descreve em uma linha o que ela entrega. O nome da change só aparece quando é indispensável, por exemplo para escolher entre duas changes ativas. O próximo passo é indicado pelo comando sem o nome, como `/opsx:verify`.
- **Fluxos do agente, comando e skill de cada um** (`propose`, `apply`, `verify`, `archive`, `update`, `sync`):
  - o anúncio `Using change: <name>` passa a ser uma linha que descreve o que a change entrega. O nome entra só quando há mais de uma change ativa;
  - os modelos de saída trocam `**Change:** <change-name>` por `**Entrega:** <uma linha sobre o que a change entrega>`;
  - o resumo do propose troca "Change name and location" pela descrição da entrega e o local dos arquivos;
  - o próximo passo sugerido é sempre o comando sem argumento.
- **CI e documentação:** o marcador do trecho novo no passo "Trechos customizados das skills", uma linha na tabela de trechos customizados do README e um item no CHANGELOG na seção aberta.

### Fora do escopo

- Mudar o nome das changes, das pastas de archive, dos commits (`OpenSpec-Change:`) ou dos comandos do CLI: o nome continua sendo o identificador técnico.
- O `/opsx:explore`, o `/opsx:init`, o `/opsx:ingest` e o `/opsx:discover`, que não anunciam uma change selecionada.
- Os agentes de outros fornecedores além do que já recebem pelas regras (`docs/openspec-regras.md` e os blocos gerenciados): a regra chega a eles pelo `rules.md`.
- Publicar a release.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `workflow-governance`: dois requisitos novos, a mensagem que descreve a entrega e o próximo passo indicado pelo comando sem o nome.

## Impact

- **Regras:** `padrao-openspec/openspec/rules.md`, espelhado na raiz e entregue pelos blocos gerenciados (ADR-0005).
- **Comandos e skills** (espelhados pelo `sync-root.mjs`): `commands/opsx/{propose,apply,verify,archive,update,sync}.md` e `skills/openspec-{propose,apply-change,verify-change,archive-change,update-change,sync-specs}/SKILL.md`.
- **CI e documentação:** `.github/workflows/validate.yml`, `README.md` e `CHANGELOG.md`.
- **Dependências:** nenhuma nova.
- **Riscos:**
  - Compatibilidade: nenhum comando muda de argumento, e `/opsx:verify <nome>` continua aceito.
  - Os trechos alterados são de arquivos gerados pelo OpenSpec CLI: ao regenerá-los, o trecho precisa ser reaplicado, e o marcador da CI aponta a falta.
- **Interface com outros sistemas:** não se aplica.
- **Débitos:** o repositório não tem `openspec/estado-atual.md`.
- **Falhas aceitas:** o repositório não tem `openspec/estado-atual.md`, então a seção não existe.
- **Changes concorrentes:** nenhuma ativa.
- **Versão:** acrescenta um item à seção aberta do `CHANGELOG.md` (1.15.0, ainda sem release), sem mexer no `VERSION`.

## Aprovação

- Responsável: Gilmar Campelo
- Data: 2026-10-23
- Escopo: apply
- Condições: cada etapa só começa com o comando `/opsx:<etapa>` digitado pelo responsável
- Conteúdo: sha256:a16e46631ea88407819d60ef6fb65f7197e59107e6a134fd433e210214034c3e
- Origem: "aprovo para apply", em resposta a "Para seguir, aprove por escrito, por exemplo \"aprovo para apply\", e depois digite `/opsx:apply`."
- Reconfirmação: 2026-10-23; Origem: "sim", em resposta a "Confirma a correção de formatação?" (crases em `<name>` no proposal, no design e nas tasks, sem mudar o texto); Conteúdo: sha256:93db05d433956a024400eac224c106b8bf67a7950537308bf0aa1cf1fb648aaa
