# Proposal

## Why

Quem clona o PadraoOpenspct para começar um projeto encontra as orientações no meio do `README.md` da raiz, que também traz o conteúdo de quem mantém o padrão (sync, trechos customizados, CI). Revisando essa orientação, faltam partes que o dev precisa no primeiro dia:

- **Pré-requisitos:** nenhum README diz como instalar o OpenSpec CLI, embora o setup dependa dele para registrar o store. Node.js 18 aparece só no README de `padrao-openspec/`.
- **Exemplo incompleto:** o "Exemplo real" (Livraria) para no setup e não mostra o `/opsx:init`. Quem copia só o exemplo fica sem a entrevista.
- **Depois do init:** o que commitar em cada repositório, como criar o remoto do store (o setup renomeia o `origin` do padrão) e como fazer a primeira change estão espalhados ou ausentes.
- **No repositório de código:** depois do setup, o projeto não recebe nenhum guia de primeiros passos; o `docs/openspec-padrao.md` trata só de atualizações.

## What Changes

- **`COMECE-AQUI.md` na raiz**, curto e voltado a quem vai iniciar um projeto:
  - pré-requisitos e como conferi-los;
  - os passos (clone, repositório de código, setup, `/opsx:init`);
  - o que commitar e onde, e como criar o remoto do store;
  - o primeiro ciclo de uma change (propose → aprovação → apply → verify → archive);
  - problemas comuns e onde procurar mais.
- **README da raiz:** um aviso no topo apontando para o `COMECE-AQUI.md`; o "Exemplo real" passa a incluir o `/opsx:init`; a seção "Como iniciar um projeto novo" passa a remeter ao guia para pré-requisitos e passos seguintes.
- **Guia entregue ao projeto** (`padrao-openspec/templates/openspec-padrao.md`, instalado como `docs/openspec-padrao.md`): ganha a seção "Primeiros passos" (init, commits, ciclo de uma change), antes das seções de atualização.
- **Mensagem final do setup:** passa a citar o `docs/openspec-padrao.md` como guia de primeiros passos.
- **CI:** confere que o `COMECE-AQUI.md` existe, é linkado pelo README e cita o setup e o `/opsx:init`.
- **Versão:** entrada no `CHANGELOG.md` e `VERSION` atualizado, porque o guia entregue aos projetos muda.

### Fora do escopo

- Reescrever o restante do README de manutenção do padrão.
- Traduzir os guias para outros idiomas.
- Automatizar a instalação dos pré-requisitos.
- Alterar projetos já configurados: eles recebem o guia novo pelo PR de atualização.

## Capabilities

### New Capabilities

- `project-onboarding`: guia de primeiros passos para quem inicia um projeto com o padrão e resumo dos próximos passos entregue ao repositório de código.

### Modified Capabilities

Nenhuma.

## Impact

- **Documentação:** `COMECE-AQUI.md` (novo) e `README.md` na raiz.
- **Modelo entregue aos projetos:** `padrao-openspec/templates/openspec-padrao.md`.
- **Script:** `padrao-openspec/scripts/setup-project.mjs` (só a mensagem final).
- **Versão:** `padrao-openspec/VERSION` e `CHANGELOG.md`.
- **CI:** `.github/workflows/validate.yml`.
- **Dependência de entrega:** depende do PR #16 (`atualizacao-versionada-do-padrao`), que cria o guia do projeto, o `VERSION` e o `CHANGELOG.md`. A branch parte da branch do #16 e será rebaseada na `main` depois do merge. A change `coerencia-de-seguranca-e-triagem` também sobe a versão; a que entrar depois usa a próxima minor livre.
- **Riscos:**
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - Compatibilidade: nenhuma quebra; só documentação, a mensagem do setup e o guia entregue.

## Aprovação

- Responsável: Pendente
- Data: —
- Escopo: —
- Condições: —
- Origem: —
