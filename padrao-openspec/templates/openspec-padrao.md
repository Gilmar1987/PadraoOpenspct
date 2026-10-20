# Padrão OpenSpec neste repositório

Este repositório usa o padrão OpenSpec do [PadraoOpenspct](https://github.com/Gilmar1987/PadraoOpenspct):
skills, comandos `/opsx:*` e agentes que guiam o fluxo propose → apply → verify → archive.
Este guia é gerenciado pelo padrão e é substituído a cada atualização; não o edite à mão.

## Versão instalada

A versão do padrão, o commit e o repositório de origem ficam em `.openspec-padrao.json`, na raiz
do repositório. O campo `managedFiles` lista os arquivos que o instalador gerencia, como os de
`.claude/`, `.agents/skills/` e `.github/agents/`, este guia e o workflow de atualização.

Não edite esses arquivos à mão: a próxima atualização os substitui. Uma customização precisa
virar mudança no padrão ou ficar num arquivo fora da lista.

## Como a atualização chega

O workflow `.github/workflows/openspec-padrao-update.yml` roda toda segunda-feira e pode ser
disparado à mão em **Actions → Atualização do padrão OpenSpec → Run workflow**. Ele compara a
versão instalada com a última release do padrão. Se houver versão nova, ele:

1. cria a branch `chore/padrao-vX.Y.Z` a partir da branch padrão;
2. instala a versão nova e commita só os arquivos gerenciados;
3. abre um PR com as **Ações no projeto** em destaque e o changelog entre as duas versões.

Revise o PR como qualquer outro. As "Ações no projeto" são os passos manuais da versão, por
exemplo acrescentar uma seção ao `project.md` do store OpenSpec. Faça-os antes ou junto do merge.

### Permissão necessária

Para o workflow conseguir abrir o PR, ligue no GitHub:
**Settings → Actions → General → Workflow permissions → Allow GitHub Actions to create and approve
pull requests**. Sem ela, o workflow falha no passo "Abrir o PR" e não altera mais nada.

O workflow usa só o `GITHUB_TOKEN` do próprio repositório, com permissão de escrever código e
abrir PRs, e lê o padrão pela release pública. Um PR aberto com o `GITHUB_TOKEN` não dispara os
outros workflows: para rodar a CI no PR de atualização, faça um push na branch ou feche e reabra
o PR.

## Atualizar à mão

Sem o workflow, ou para testar antes, a partir de um clone do padrão na tag desejada:

```sh
git clone --depth 1 --branch vX.Y.Z https://github.com/Gilmar1987/PadraoOpenspct padrao-tmp
node padrao-tmp/padrao-openspec/scripts/install-skills.mjs <este-repositório> --update
```

O `--update` exige a árvore limpa, cria a branch `chore/padrao-vX.Y.Z`, instala e commita. Ele
não faz push. Para gravar direto na branch atual, sem commit, use `--in-place` no lugar de
`--update`. Sem um dos dois, o instalador se recusa a alterar arquivos já instalados.

## Onde ver o que mudou

No `CHANGELOG.md` do PadraoOpenspct e nas releases do repositório. Cada versão tem "O que mudou"
e "Ações no projeto".
