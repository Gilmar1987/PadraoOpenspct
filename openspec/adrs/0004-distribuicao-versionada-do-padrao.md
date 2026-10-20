---
id: ADR-0004
status: Accepted
date: 2026-10-20
supersedes:
superseded_by:
related_changes: [atualizacao-versionada-do-padrao]
---

# ADR-0004: Distribuição versionada do padrão, com o projeto buscando a novidade

## Contexto

O padrão é copiado para cada projeto pelo instalador (ADR-0003). Até aqui não havia versão: uma melhoria só chegava a um projeto quando alguém reinstalava à mão, e a reinstalação gravava os arquivos direto na branch ativa. No teste do controleCondominio (2026-10-20), isso deixou 18 arquivos alterados sem commit numa branch de feature, e a ação manual exigida pela versão nova só foi conhecida por uma mensagem entre sessões. Veja a change `atualizacao-versionada-do-padrao`.

## Decisão

- O padrão SHALL ter versão semver em `padrao-openspec/VERSION`, um `CHANGELOG.md` com "O que mudou" e "Ações no projeto" por versão, e uma tag `vX.Y.Z` com GitHub Release para cada versão publicada.
- Cada projeto SHALL registrar a versão instalada em `.openspec-padrao.json` no repositório de código.
- A atualização SHALL ser puxada pelo projeto: um workflow do próprio projeto consulta a última release pública do padrão e abre um pull request com a atualização. O padrão MUST NOT precisar de credencial com acesso aos projetos.
- O instalador MUST NOT alterar arquivos já instalados na branch atual sem um modo explícito; o modo de atualização trabalha numa branch própria e commita.

## Alternativas consideradas

| Alternativa | Por que não foi escolhida |
|---|---|
| O padrão empurra a atualização (`repository_dispatch`) | Exige um token com escrita em todos os projetos, guardado no padrão; um vazamento atinge todos eles. |
| Submódulo git do padrão no projeto | Os arquivos precisam estar em `.claude/` e `.agents/` do projeto, não numa subpasta; o submódulo não resolve a instalação. |
| Pacote npm | Acrescenta registro, publicação e dependência de Node em projetos de qualquer stack. |
| Continuar sem versão, reinstalando à mão | É o problema observado: sem aviso, sem registro e sujando a branch atual. |

## Consequências

- Mais fácil: saber o que cada projeto tem instalado, revisar uma atualização como qualquer PR e ver os passos manuais de cada versão.
- Mais difícil: cada versão relevante do padrão exige atualizar `VERSION` e o CHANGELOG e publicar a release.
- Risco aceito: o workflow entregue aos projetos pede `contents: write` e `pull-requests: write` no próprio repositório e a opção "Allow GitHub Actions to create and approve pull requests"; um PR aberto com o `GITHUB_TOKEN` não dispara outros workflows, então a CI do projeto só roda nele depois de um novo push ou de fechar e reabrir.
- Risco aceito: o `GITHUB_TOKEN` não pode publicar mudanças em `.github/workflows/`. Uma versão que muda o próprio workflow (ou outro arquivo nessa pasta) só é automatizada com o segredo opcional `PADRAO_UPDATE_TOKEN`, um token com o escopo `workflow`; sem ele, o workflow falha com instruções e o projeto atualiza à mão.
- Risco aceito: o projeto executa, com permissão de escrita no próprio repositório, o instalador da tag publicada do padrão. A confiança no repositório do padrão é a mesma de qualquer dependência; o `GH_TOKEN` fica fora do passo que executa o instalador.
