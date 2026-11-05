# Proposal

## Why

O padrão está fixado no OpenSpec CLI 1.14.2: as skills e os comandos `/opsx:*` foram gerados nessa versão, a CI instala essa versão e o script de entrada oferece instalá-la. Desde então, o upstream publicou a 1.14.3 e a 1.15.0. A 1.14.3 corrige o travamento do `validate --all` em hooks de pre-commit, tira o alerta do `braces` do `npm audit` e prende à pasta da change o caminho de artefatos definidos por glob. Já a 1.15.0 passa a casar um requisito REMOVED pelo nome exato no `/opsx:verify` e traz o `openspec update --dry-run`. A 1.16.0 também saiu, mas exige Node.js 22.12 nas instalações por npm e fica para uma change própria.

Sem a atualização, o padrão distribui skills com o texto antigo dessas duas correções, e os projetos instalam um CLI com problemas já resolvidos no upstream.

## What Changes

- **Versão fixada do CLI:** de `1.14.2` para `1.15.0` em todos os lugares que fixam a versão:
  - no script de entrada (`comecar.mjs`), que oferece instalar o CLI e confere a versão instalada;
  - na mensagem de CLI ausente do portão (`portao.mjs`);
  - nos dois passos "Instalar OpenSpec CLI" do `validate.yml`;
  - nos comandos de instalação e validação citados no `README.md`, no `padrao-openspec/README.md`, no `COMECE-AQUI.md` e no `openspec/project.md`.
- **Skills e comandos `/opsx:*`:** recebem as mudanças de texto do upstream entre a 1.14.2 e a 1.15.0, sem perder os trechos do padrão:
  - a escolha e a checagem do caminho de um artefato por glob antes de gravar, em `propose`, `explore` e `update`;
  - o casamento exato do nome de um requisito REMOVED no `verify`;
  - o campo `generatedBy` passa a `1.15.0` nas sete skills.
  O texto novo é aplicado como diferença entre a saída pura das duas versões, e não por regeneração. Assim os trechos customizados continuam no lugar, e a CI confere que nenhum sumiu.
- **CI:** um passo novo falha quando a versão do CLI não é a mesma em todos estes lugares: o `comecar.mjs`, o `portao.mjs`, os passos de instalação do `validate.yml`, o `generatedBy` das skills e os comandos `@fission-ai/openspec@<versão>` dos documentos.
- **Manutenção:** a seção "Manutenção do padrão" do `README.md` passa a descrever a atualização do CLI pela diferença entre as duas versões, com a pasta temporária, o patch e o conflito resolvido à mão.
- **Versão do padrão:** pelo modelo de versão acumulada, se a change da outra sessão entrar antes, esta acrescenta itens à seção `## 1.17.0` que ela abre; senão, esta abre a 1.17.0 (`VERSION` e seção do `CHANGELOG.md`). A release sai só quando o responsável pedir. "Ações no projeto" pede atualizar o CLI com `npm install -g @fission-ai/openspec@1.15.0`.

### Fora do escopo

- O CLI 1.16.0 e o Node.js 22.12 que ele exige nas instalações por npm: ficam para uma change própria, com a decisão sobre o Node mínimo do padrão.
- O mínimo de Node.js conferido pelo padrão. Hoje o padrão confere 18+, mas o CLI já exige 20.19.0 desde a 1.14.2 (`engines` do pacote). Esta change não altera essa conferência, e a correção fica para uma change própria.
- O futuro do `project.md` diante da migração para o `config.yaml` que o upstream oferece; ele vai para um `/opsx:explore` com ADR.
- A remoção de trechos customizados que o upstream passou a cobrir: a frente de simplificação é outra change.
- A adoção de recursos novos do CLI: `show --diff`, `status --all`, chaves `x-` no `.openspec.yaml`, `version --check --json`, `OPEN_SPEC_INTERACTIVE=0` nos hooks e o `update --dry-run` no fluxo dos projetos.
- A instalação do CLI pelo binário standalone. O padrão continua instalando pelo npm.
- Os comandos próprios do padrão (`init`, `ingest`, `discover`), que o CLI não gera.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `continuous-validation`: a CI instala o CLI 1.15.0 e ganha a checagem de que todas as versões fixadas do CLI são iguais.
- `project-onboarding`: o script de entrada oferece instalar o CLI 1.15.0.

## Impact

- **Skills e comandos:** os sete arquivos de `padrao-openspec/.claude/skills/openspec-*/SKILL.md` e os sete de `padrao-openspec/.claude/commands/opsx/` gerados pelo CLI (`apply`, `archive`, `explore`, `propose`, `sync`, `update` e `verify`), com as cópias da raiz em `.claude/` pelo `sync-root.mjs`.
- **Scripts:** `padrao-openspec/scripts/comecar.mjs` (constante `cliVersion`) e `padrao-openspec/scripts/portao.mjs` (mensagem de CLI ausente).
- **CI:** `.github/workflows/validate.yml` (dois passos de instalação e um passo novo de coerência das versões).
- **Documentação:** `README.md`, `padrao-openspec/README.md`, `COMECE-AQUI.md`, `openspec/project.md`, `CHANGELOG.md` e, se esta change abrir a versão, `padrao-openspec/VERSION`.
- **Dependências:** `@fission-ai/openspec` de 1.14.2 para 1.15.0 (ferramenta, sem `package.json`).
- **Riscos:**
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - Validação mais rígida: o `openspec validate --all --strict` do 1.15.0 já passa no padrão hoje (raiz com 22 de 22; `padrao-openspec/` sem itens).
  - Trechos customizados perdidos: o delta não regenera os arquivos, e o passo "Trechos customizados das skills" falha se algum sumir.
  - Script interativo: o `comecar.mjs` muda, então, pela regra do `project.md`, o responsável faz um teste num console real do Windows antes do archive.
  - Projetos com o CLI 1.14.2: o script de entrada mostra `ok (o padrão usa 1.15.0)` e segue; os comandos funcionam com as duas versões.
- **Interface com outros sistemas:** não se aplica.
- **Débitos:** o repositório não tem `openspec/estado-atual.md`.
- **Falhas aceitas:** o repositório não tem `openspec/estado-atual.md`, então a seção não existe.
- **Changes concorrentes:** `guarda-da-pasta-da-sessao`, da outra sessão, no worktree `ProjetoOpenspct-guarda-da-pasta-da-sessao` (`agent-guardrails`, `change-approval`, `continuous-validation` e `project-onboarding`):
  - Os requisitos não se sobrepõem: ela acrescenta "Guarda da pasta da sessão protegida pela CI" e modifica "Mensagem final abre o projeto como workspace".
  - Os arquivos se sobrepõem: todas as skills e comandos, o `validate.yml`, o `comecar.mjs`, o `CHANGELOG.md` e o `VERSION`.
  - Ordem sugerida: ela entra primeiro, porque está mais adiantada, e esta rebaseia sobre a `main` antes do apply. Os trechos dela ficam preservados, porque o delta do upstream não regenera os arquivos.

## Aprovação

- Responsável: Gilmar Campelo
- Data: 2026-11-04
- Escopo: apply
- Condições: —
- Conteúdo: sha256:6ec54310e9b10f8c3d5252440be78453e94a1e284e1ca0ba382de7e5c36a6d92
- Origem: "Eu aprovo fazer a implementação do upgrade do OpenSpec CLI para a 1.15.0", seguida do comando `/opsx:apply`
