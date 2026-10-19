# Proposal

## Why

O teste de ponta a ponta (lote 1 do plano de correção) mostrou que o setup deixa um projeto novo em estado frágil:

- **O `create-next-app` recusa o repositório preparado pelo setup.** As pastas `.agents/`, `.github/` e `openspec/` contam como conflito, e todo projeto Next.js novo cai nisso (atrito 1).
- **O `.gitignore` do código ignora `/openspec/` inteiro**, inclusive o `openspec/config.yaml` com a declaração `store:`. Quem clona o repositório perde a ligação com o store (atrito 2).
- **O setup gera `.bak` de arquivos intactos** quando o store é uma subpasta de um repositório git, que é o caso do fluxo recomendado (atrito 21). O `git show HEAD:<caminho>` é resolvido a partir da raiz do repositório, não da pasta do store.
- **O próximo passo do `/opsx:init`** sugere `git -C <root>` sem explicar que a raiz do store pode ser uma subpasta do repositório git (atrito 15).

## What Changes

- **Declaração do store versionada.** O bloco gerenciado no `.gitignore` do código passa de `/openspec/` para `/openspec/*` mais `!/openspec/config.yaml`. O resto do `openspec/` local continua ignorado, mas a declaração do store vai para o git.
  - O instalador migra o bloco antigo no lugar, sem duplicar.
- **Backup só de arquivos editados.** O setup passa a comparar com a versão commitada usando o caminho relativo à pasta do store (`HEAD:./<caminho>`), e deixa de gerar `.bak` quando o store é uma subpasta do repositório.
- **Ordem com o `create-next-app`.** Os READMEs orientam a criar o app antes do setup, ou a gerar numa pasta temporária e copiar quando o setup já rodou.
- **`/opsx:init`:** o próximo passo explica que `<root>` pode ser uma subpasta do repositório git e que o comando funciona a partir dela.
- **CI:**
  - o smoke test do instalador confere a declaração versionada e a migração do bloco antigo;
  - um smoke test novo roda o setup com o store como subpasta de um repositório e confere que nenhum `.bak` é gerado.

### Fora do escopo

- Mudar o setup para criar o app ou detectar a stack automaticamente.
- Orientação técnica sobre o Next 16 (typecheck, `cacheComponents`): fica na change `update-nextjs-skill-next16`.
- Registrar automaticamente o store na máquina de quem clona o repositório de código: a declaração passa a ser versionada, mas o registro continua local e é feito pelo setup.
- Commit automático do preset aplicado pelo setup.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `skill-installation`: acrescenta o requisito de manter a declaração do store fora do bloco ignorado do `.gitignore`.
- `store-setup`: acrescenta o requisito de gerar backup só de arquivos realmente editados, com o store dentro ou fora de uma subpasta.

## Impact

- **Código:** `padrao-openspec/scripts/install-skills.mjs` (bloco do `.gitignore`) e `padrao-openspec/scripts/setup-project.mjs` (`committedVersion`).
- **Comandos:** `padrao-openspec/.claude/commands/opsx/init.md`, espelhado pelo sync.
- **CI:** smoke tests do instalador e do setup em `.github/workflows/validate.yml`.
- **Documentação:** `README.md` e `padrao-openspec/README.md`.
- **Riscos:**
  - Dados pessoais e autenticação: não se aplicam.
  - Não há esquema de dados nem segredos novos.
  - **Compatibilidade:** repositórios com o bloco antigo são migrados na próxima execução do instalador, e o `openspec/config.yaml` passa a aparecer como arquivo novo no `git status`. O arquivo só contém o id do store, sem segredo.

## Aprovação

- Responsável: gilmar.campelo
- Data: 2026-10-19
- Escopo: archive
- Condições: `openspec validate --strict` passa; o verify termina sem críticos; a CI fica verde
- Origem: resposta do usuário no chat, "Até o archive, com condições (Recomendado)", ao pedido "faça na sequencia 1, 2, 3 e 4"
