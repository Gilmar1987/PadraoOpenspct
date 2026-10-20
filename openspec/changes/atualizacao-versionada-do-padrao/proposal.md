# Proposal

## Why

Hoje um projeto só recebe uma versão nova do padrão quando alguém roda `install-skills.mjs --force` à mão. No teste do controleCondominio (2026-10-20), essa reinstalação gravou 18 arquivos direto no working tree, sem commit e na branch de feature ativa (`feat/cadastro-de-proprietarios`). O dono só percebeu por um `git status` inesperado e por uma mensagem entre sessões. A ação manual que a versão nova exigia (acrescentar "Comandos de verificação" ao `project.md` do store) também só chegou por essa mensagem.

Faltam quatro coisas: o padrão não tem versão nem registro do que mudou; o projeto não sabe qual versão instalou; ninguém é avisado de que existe versão nova; e o instalador suja a branch atual. O responsável pediu que isso venha pronto na instalação de projetos novos, sem passo manual, e sem alterar o controleCondominio.

## What Changes

- **Versão e changelog do padrão:** arquivo `padrao-openspec/VERSION` (semver) e `CHANGELOG.md` na raiz, com uma seção por versão contendo "O que mudou" e "Ações no projeto". A primeira versão é a `1.0.0`, que registra o estado atual (padrão generalista, revisão e checagens de segurança). Cada release é uma tag `vX.Y.Z` com uma GitHub Release.
- **Versão registrada no projeto:** o instalador grava `.openspec-padrao.json` no repositório de código, com versão, commit e repositório de origem do padrão, destino das skills, data e a lista de arquivos que ele gerencia.
- **Atualização segura:** o instalador ganha o modo `--update`, que exige árvore limpa, cria a branch `chore/padrao-vX.Y.Z`, instala, atualiza o manifesto e commita. Uma reinstalação que mudaria arquivos já instalados passa a exigir `--update` ou `--in-place` (o comportamento antigo, agora explícito); sem um dos dois, o instalador para sem alterar nada.
- **Aviso por PR:** o instalador entrega o workflow `.github/workflows/openspec-padrao-update.yml` (semanal e manual). Ele compara a versão do manifesto com a última release do padrão e, se houver versão nova, roda o instalador com `--update` e abre um PR com o trecho do CHANGELOG entre as duas versões e as "Ações no projeto".
- **Aviso nos comandos:** `/opsx:propose`, `/opsx:apply`, `/opsx:verify` e `/opsx:archive` (comandos e skills) mostram no início "há atualização do padrão: vA → vB" quando a versão instalada for mais antiga, e seguem normalmente sem rede.
- **Documentação:** o instalador entrega `docs/openspec-padrao.md` ao projeto (versão, como atualizar, o que o workflow faz e a permissão que ele exige). O README do padrão ganha "Como publicar uma release".
- **CI:** confere que `VERSION` bate com a primeira versão do `CHANGELOG.md` e testa o manifesto, o `--update` e a recusa de reinstalação sem modo.
- ADR-0004 (Proposed): distribuição versionada por releases, com o projeto buscando a novidade.

### Fora do escopo

- Alterar o controleCondominio (`C:\openspec\tarefas`) ou outros projetos já configurados. Eles podem adotar o mecanismo rodando o instalador uma vez com `--update`.
- Publicar a tag e a release `v1.0.0`: é uma ação externa, feita só com pedido explícito do responsável depois do merge.
- O padrão empurrar atualizações para os projetos (`repository_dispatch`), que exigiria um token com escrita em todos eles.
- Atualizar o `project.md` e o `config.yaml` do store dos projetos: são do projeto, e o CHANGELOG diz o que fazer em "Ações no projeto".
- Remover arquivos que uma versão nova deixou de distribuir.

## Capabilities

### New Capabilities

- `standard-versioning`: versão, changelog e releases do padrão.
- `standard-update`: aviso de versão nova ao projeto, pelo workflow com PR e pelos comandos `/opsx:*`.

### Modified Capabilities

- `skill-installation`: manifesto de versão, modo `--update`, recusa de reinstalação sem modo e arquivos novos distribuídos (workflow e documentação).
- `continuous-validation`: checagem de versão e changelog e smoke tests do manifesto e do `--update`.

## Impact

- **Scripts:** `padrao-openspec/scripts/install-skills.mjs` (manifesto, modos, arquivos novos); novo `padrao-openspec/scripts/changelog-range.mjs` (trecho do CHANGELOG entre duas versões); `setup-project.mjs` só na mensagem final.
- **Arquivos novos no padrão:** `padrao-openspec/VERSION`, `CHANGELOG.md`, os modelos `padrao-openspec/templates/openspec-padrao-update.yml` e `padrao-openspec/templates/openspec-padrao.md`.
- **Comandos e skills:** propose, apply, verify e archive (aviso de versão).
- **CI:** `.github/workflows/validate.yml`.
- **Documentação:** `README.md` e `padrao-openspec/README.md`.
- **ADR:** `openspec/adrs/0004-distribuicao-versionada-do-padrao.md`.
- **Riscos:**
  - Dados pessoais: não se aplica.
  - **Autorização e superfície exposta:** o workflow entregue ao projeto pede `contents: write` e `pull-requests: write` no próprio repositório e precisa da opção do GitHub "Allow GitHub Actions to create and approve pull requests". Ele não usa segredo além do `GITHUB_TOKEN` e só lê o padrão, que é público.
  - Esquema de dados: não se aplica.
  - **Configuração:** a opção de Actions acima precisa ser ligada em cada projeto; a documentação entregue explica como. Sem ela, o workflow falha ao abrir o PR, sem efeito colateral.
  - **Compatibilidade:** automações que reinstalam com `--force` sobre arquivos já instalados passam a precisar de `--in-place` ou `--update`. Uma primeira instalação e uma reinstalação sem mudanças continuam funcionando sem flag.
  - **Dependências:** nenhuma dependência de pacote nova; o workflow usa `actions/checkout` e o `gh` já presente nos runners do GitHub.

## Aprovação

- Responsável: gilmar campelo
- Data: 2026-10-20
- Escopo: apply
- Condições: —
- Origem: "Eu gilmar campelo aprovo a change atualizacao-versionada-do-padrao para apply"
