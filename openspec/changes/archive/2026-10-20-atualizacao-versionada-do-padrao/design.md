# Design

## Context

- `install-skills.mjs` copia para o repositório de código as skills (`.agents/skills/`, `.claude/skills/`, conforme `--target`), os comandos (`.claude/commands/opsx/`) e os agentes (`.github/agents/`), e mantém o bloco do `.gitignore`. Ele para antes de copiar se um destino difere da fonte sem `--force`, e reinstalar sem mudanças imprime `Done. 0 installed`.
- `setup-project.mjs` chama o instalador numa primeira instalação e termina com os próximos passos.
- O padrão não tem versão nem changelog; os projetos não registram o que instalaram.
- O controleCondominio mostrou o efeito: `install-skills.mjs --force` gravou 18 arquivos na branch ativa, sem commit nem aviso.
- Os comandos `propose.md`, `apply.md`, `verify.md` e `archive.md` e as skills correspondentes começam com os blocos "Store selection" e "Project check".

## Architecture Decisions

- **ADR-0004 — distribuição versionada do padrão** (`openspec/adrs/0004-distribuicao-versionada-do-padrao.md`, `Proposed`): versão semver e changelog no padrão, manifesto no projeto, atualização puxada pelo projeto por PR, instalador que não altera a branch atual sem modo explícito. Deve passar a `Accepted` antes do archive.
- Segue a [ADR-0003](../../adrs/0003-padrao-sem-stack-embutida.md): os modelos novos ficam em `padrao-openspec/` e não dependem de stack.

## Goals / Non-Goals

**Goals:**

- Projeto novo nasce com manifesto, workflow de atualização e guia, sem passo manual.
- Atualização chega como PR revisável, com as ações manuais em destaque.
- O instalador nunca suja a branch atual sem pedido explícito.

**Non-Goals:**

- Migrar projetos já configurados.
- Remover arquivos que uma versão nova deixou de distribuir.

## Decisions

### D1. Versão e changelog

- `padrao-openspec/VERSION`: uma linha com `1.0.0`.
- `CHANGELOG.md` na raiz do repositório (o clone do padrão leva a raiz inteira), no formato:

  ```markdown
  # Changelog

  ## 1.0.0 — 2026-10-20

  ### O que mudou

  - ...

  ### Ações no projeto

  - ... (ou "Nenhuma")
  ```

- A `1.0.0` resume o estado atual: padrão generalista (sem `--stack`), comandos de verificação, remoto e coerência no init, registro detalhado do verify, fluxo auditável, revisão de código e checagens de segurança, e este mecanismo de versão. Ações no projeto: acrescentar ao `project.md` do store as seções "Comandos de verificação" (com auditoria e varredura) quando vierem de versões anteriores.

### D2. Script `changelog-range.mjs`

`node padrao-openspec/scripts/changelog-range.mjs --from <versão> --to <versão> [--file <CHANGELOG.md>] [--actions]`

- Lê as seções `## X.Y.Z` do arquivo; imprime as que estão no intervalo `(from, to]`, na ordem do arquivo.
- Com `--actions`, imprime só os itens de "Ações no projeto" dessas seções, com a versão de cada um, ignorando os "Nenhuma".
- Versão sem `v` ou com `v` é aceita. Origem igual ao destino imprime nada e sai com 0. Destino ausente no arquivo é erro.

### D3. Manifesto `.openspec-padrao.json`

```json
{
  "version": "1.0.0",
  "commit": "<sha do padrão ou null>",
  "source": "https://github.com/Gilmar1987/PadraoOpenspct",
  "target": "both",
  "installedAt": "2026-10-20",
  "managedFiles": [".claude/commands/opsx/apply.md", "..."]
}
```

- `commit`: `git -C <padrão> rev-parse HEAD`, ou `null` fora de um repositório git.
- `source`: URL do remote `padrao` ou `origin` do clone do padrão quando aponta para o PadraoOpenspct; senão a URL padrão do repositório público.
- `managedFiles`: todos os arquivos que o instalador copiou, em caminhos relativos com `/`, ordenados. O `.gitignore` não entra (é editado em bloco, não substituído).
- Gravado em todo modo que instala; é ele próprio um arquivo gerenciado.

### D4. Modos de reinstalação

- Antes de copiar, o instalador calcula quais destinos mudariam. Se algum destino já existe e mudaria, e não há `--update` nem `--in-place`, ele termina com: `The project already has standard files that would change. Rerun with --update (new branch and commit, recommended) or --in-place (write to the current branch).` Nenhum arquivo muda.
- Sem destinos existentes (primeira instalação) ou sem mudanças, segue como hoje.
- `--in-place`: o comportamento atual (grava no working tree, sem commit). O `--force` deixa de ter efeito: é aceito por compatibilidade, com um aviso, e não substitui o modo. Arquivos gerenciados são sobrescritos pelos dois modos; uma customização neles aparece no diff do PR ou do working tree (ajuste da revisão, D10).
- `--update`:
  1. exige repositório git e `git status --porcelain` vazio; senão erro listando as alterações;
  2. lê a versão de `VERSION`; `git switch -c chore/padrao-vX.Y.Z` (erro se a branch já existir);
  3. instala e grava o manifesto;
  4. `git add -- <managedFiles> .gitignore .openspec-padrao.json` e `git commit -m "chore: atualiza padrão OpenSpec para vX.Y.Z" -m "Padrao-OpenSpec: vX.Y.Z" -- <os mesmos caminhos>`;
  5. imprime a branch criada e o próximo passo (push e PR), sem fazer push.
- `--update` e `--in-place` juntos é erro.

### D5. Workflow `openspec-padrao-update.yml`

Modelo em `padrao-openspec/templates/openspec-padrao-update.yml`, instalado em `.github/workflows/openspec-padrao-update.yml`:

- `on: schedule: - cron: "0 9 * * 1"` e `workflow_dispatch`.
- `permissions: contents: write, pull-requests: write`.
- Passos:
  1. `actions/checkout@v4` com `fetch-depth: 0`;
  2. lê `version`, `source` e `target` do manifesto (sem manifesto, termina com aviso);
  3. última release: `gh release view --repo <owner/repo do source> --json tagName -q .tagName`; sem release, termina;
  4. compara semver; se não for mais nova, termina;
  5. se já existe PR aberto de `chore/padrao-<tag>`, termina;
  6. clona o padrão na tag (`git clone --depth 1 --branch <tag> <source> "$RUNNER_TEMP/padrao"`);
  7. configura autor `github-actions[bot]` e roda `node "$RUNNER_TEMP/padrao/padrao-openspec/scripts/install-skills.mjs" . --update --target <target>`;
  8. `git push origin chore/padrao-<tag>`;
  9. monta o corpo com `changelog-range.mjs --actions` ("Ações no projeto" em destaque) e `changelog-range.mjs` (changelog), mais um aviso de que a CI do projeto não roda automaticamente num PR aberto pelo `GITHUB_TOKEN`; `gh pr create --base <branch padrão do repositório> --head chore/padrao-<tag> --title "chore: atualiza padrão OpenSpec para <tag>" --body-file ...`.
- `env: GH_TOKEN: ${{ github.token }}`. Nenhum outro segredo.

### D6. Guia `docs/openspec-padrao.md`

Modelo em `padrao-openspec/templates/openspec-padrao.md`, instalado em `docs/openspec-padrao.md`: o que é o manifesto e os arquivos gerenciados (não editar à mão); como o workflow avisa; como ligar "Settings → Actions → General → Workflow permissions → Allow GitHub Actions to create and approve pull requests"; como atualizar à mão (`install-skills.mjs . --update` a partir de um clone do padrão na tag); onde ler o CHANGELOG. A versão aparece no manifesto, não no guia, para o guia não mudar a cada versão.

### D7. Aviso nos comandos do ciclo

Bloco novo, igual nos comandos e skills de propose, apply, verify e archive, depois de "Project check":

> **Standard version check**: if the code repository has `.openspec-padrao.json`, read its `version` and `source`, and run `git ls-remote --tags --refs "<source>" "v*"`. If the highest `vX.Y.Z` tag is newer than the installed version, show one line: `há atualização do padrão: v<installed> → v<latest> (veja docs/openspec-padrao.md)`. If the file is missing, the command fails, or there is no network, continue silently. Never update anything from this check.

### D8. Setup e documentação

- A mensagem final do `setup-project.mjs` passa a citar o manifesto, o workflow e o guia, e o passo de ligar a permissão de Actions quando o repositório tiver remoto no GitHub.
- README da raiz e de `padrao-openspec/`: seção "Versões e atualização" (manifesto, workflow, `--update`, `--in-place`) e "Como publicar uma release" (D1, merge, `git tag vX.Y.Z`, `gh release create vX.Y.Z --notes-file <(node padrao-openspec/scripts/changelog-range.mjs --from <anterior> --to X.Y.Z)`), com o aviso de que publicar é ação do responsável.

### D9. CI

- Passo novo "Versão e changelog": `VERSION` casa `^[0-9]+\.[0-9]+\.[0-9]+$`; a primeira seção `## X.Y.Z` do CHANGELOG é igual; ela tem "### O que mudou" e "### Ações no projeto".
- Smoke do instalador: manifesto na primeira instalação (versão = `VERSION`, `managedFiles` contém `.claude/commands/opsx/apply.md` e o workflow); reinstalação sem mudança passa sem flag; com um comando alterado na fonte de uma cópia temporária do padrão, a reinstalação sem modo falha sem mudar nada; `--update` num repositório limpo cria a branch e um commit e deixa a branch original igual; `--update` com alteração pendente falha.
- Smoke do `changelog-range.mjs` com um CHANGELOG de exemplo de três versões.
- Sintaxe: `node --check scripts/changelog-range.mjs`; o YAML do modelo de workflow é validado com `python -c "import yaml; yaml.safe_load(...)"`.
- Trechos customizados: os quatro pares de comando e skill exigem "Standard version check".

### D10. Ajustes da revisão de código

A revisão do intervalo `82615c0..9a870fa` apontou 7 achados importantes, corrigidos:

- `--update` transacional: qualquer falha depois de criar a branch (hook, identidade do git, nada a commitar) volta à branch original e apaga a branch nova; o "já está na versão" é checado antes de exigir árvore limpa.
- Comparação por sobreposição: arquivos extras numa pasta gerenciada não contam como mudança.
- Mudança só de versão também exige modo, porque regrava o manifesto.
- `source` normalizado para HTTPS; o workflow clona sempre `https://github.com/<repo>.git`.
- Workflow: `PADRAO_UPDATE_TOKEN` opcional (escopo `workflow`) e erro explicativo quando o push de `.github/workflows/` é recusado; branch remota de uma execução que falhou é reaproveitada só para abrir o PR; versão cujo PR foi fechado não é reproposta; checkout explícito da branch padrão; `GH_TOKEN` só nos passos que chamam `gh`; tag conferida contra o `VERSION` do clone; falha de consulta da release distinta de "sem release"; o corpo do PR cita os PRs de atualização anteriores ainda abertos.
- `--force` ignorado com aviso (D4); CHANGELOG 1.0.0 com a ação para quem reinstala com `--force`.
- CI: YAML do modelo validado; smoke com arquivo extra, hook que falha, mudança só de versão e `--in-place`.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/scripts/install-skills.mjs` | D3, D4, entrega de D5 e D6 | `setup-project.mjs`, smokes da CI, `test-setup.ps1` |
| `padrao-openspec/scripts/changelog-range.mjs` (novo) | D2 | workflow modelo, README |
| `padrao-openspec/scripts/setup-project.mjs` | D8 (mensagem final) | smokes de setup |
| `padrao-openspec/VERSION`, `CHANGELOG.md` (novos) | D1 | instalador, CI |
| `padrao-openspec/templates/openspec-padrao-update.yml`, `openspec-padrao.md` (novos) | D5, D6 | instalador |
| `padrao-openspec/.claude/commands/opsx/{propose,apply,verify,archive}.md` e as skills `openspec-{propose,apply-change,verify-change,archive-change}` | D7 | espelhos da raiz |
| `.github/workflows/validate.yml` | D9 | nenhum |
| `README.md`, `padrao-openspec/README.md` | D8 | nenhum |
| `openspec/adrs/0004-distribuicao-versionada-do-padrao.md` (novo) | ADR | nenhum |
| `padrao-openspec/.markdownlint-cli2.jsonc` | possível exclusão do modelo `openspec-padrao.md`, se o lint acusar algo próprio de modelo | lint do store |

## Risks / Trade-offs

- [Workflow com escrita no repositório] → só `contents` e `pull-requests`, só `GITHUB_TOKEN`, lê o padrão público por HTTPS; documentado no guia e na ADR.
- [PR de atualização sem CI automática] → aviso na descrição do PR e no guia (push vazio ou fechar e reabrir).
- [Quebra para quem reinstala com `--force`] → mensagem que cita `--update` e `--in-place`; README com a migração.
- [Aviso dos comandos lento ou sem rede] → uma chamada `git ls-remote` curta, ignorada em qualquer falha.
- [Customização num arquivo gerenciado] → o guia e o manifesto dizem para não editar esses arquivos; o `--update` sobrescreve e a mudança aparece no diff do PR, onde pode ser recusada.

## Migration Plan

Projetos novos recebem tudo pelo setup. Projetos existentes podem adotar quando quiserem: clonar o padrão na tag e rodar `install-skills.mjs <projeto> --update` uma vez, revisando o PR. O controleCondominio não é alterado por esta change. Rollback: reverter os commits; os projetos que já têm o manifesto continuam funcionando, só sem aviso.

## Open Questions

Nenhuma.
