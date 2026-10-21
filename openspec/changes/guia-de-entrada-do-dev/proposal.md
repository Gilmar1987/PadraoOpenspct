# Proposal

## Why

O `COMECE-AQUI.md` cobre só quem vai criar um projeto do zero. Um dev que recebe apenas o link do padrão, ou roda só `git clone https://github.com/Gilmar1987/PadraoOpenspct`, esbarra em três problemas:

- Nada no clone diz para abrir o guia antes de agir, e o clone sem parâmetros cria uma pasta `PadraoOpenspct` que parece pronta para virar store, com o nome errado e fora de uma release.
- Quem vai entrar num projeto já em andamento não tem instrução nenhuma. Ele não deve clonar o padrão nem rodar o setup. Precisa clonar o código e o store do projeto e registrar o store com o id certo. Hoje isso aparece em uma frase do README, com um caminho ambíguo (`<caminho-do-store>`, quando o registro é da pasta `padrao-openspec` dentro do clone).
- O guia não diz o que o dev precisa receber de quem lidera o projeto: nome do projeto, URLs dos repositórios, quem responde a entrevista do `/opsx:init` e as permissões no GitHub. Os comandos também são só de Windows/PowerShell.

## What Changes

- **`COMECE-AQUI.md`** é reorganizado em dois caminhos:
  - um aviso no topo: este clone serve para ler o guia; não o use como store;
  - "Qual é o seu caso?": caminho A (projeto novo) ou caminho B (projeto em andamento), com o que pedir ao tech lead em cada um;
  - **caminho A:** o fluxo atual (clone pela release, setup, `/opsx:init`, commit e publicação) com dois avisos novos: não mover nem renomear a pasta do store depois do setup, e um store por projeto;
  - **caminho B (novo):** clonar o código e o store do projeto, ler o id na linha `store:` do `openspec/config.yaml` do código, registrar `<store>\padrao-openspec` com esse id, conferir o vínculo pelo CLI e começar pela primeira change, sem setup e sem `/opsx:init`;
  - nota para macOS/Linux com os comandos equivalentes;
  - a tabela de problemas comuns ganha as linhas do caminho B.
- **README da raiz:** o aviso do topo diz para abrir o `COMECE-AQUI.md` também depois de um clone e cita os dois caminhos. A frase sobre "quem clona um repositório já configurado" passa a apontar para o caminho B, com o caminho de registro correto.
- **`padrao-openspec/README.md`:** "Usar em um novo projeto" ganha uma linha que manda quem vai entrar num projeto existente para o caminho B.
- **Guia entregue ao projeto (`templates/openspec-padrao.md`):** ganha a seção "Entrar neste projeto", antes de "Primeiros passos", para o dev que chega pelo repositório de código: clonar o store, registrar e conferir, com link para o caminho B.
- **CI:** o passo "Guia de primeiros passos" passa a conferir que o guia tem os dois caminhos, o comando de registro do caminho B e a seção nova do template.
- **Versão:** entra na `1.2.1`, que ainda não foi publicada. A seção `## 1.2.1` do CHANGELOG ganha o item, e "Ações no projeto" passa a citar a seção nova do guia do projeto, que chega pelo PR de atualização.

### Fora do escopo

- Um script ou opção do setup para entrar num projeto existente (por exemplo, `setup-project.mjs --join`). O caminho B usa só `git` e o OpenSpec CLI.
- Mudar o setup, o instalador ou o workflow de atualização.
- Traduzir o guia ou criar versões separadas por sistema operacional. Windows continua o caminho principal; macOS/Linux ganha uma nota com os equivalentes.
- Automatizar no GitHub as permissões citadas no guia.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `project-onboarding`: o guia passa a ter os caminhos "projeto novo" e "projeto em andamento", o aviso sobre o clone do padrão e o que pedir ao tech lead; o README e o guia do projeto apontam para o caminho certo; a CI protege as partes novas.

## Impact

- **Documentação:** `COMECE-AQUI.md`, `README.md`, `padrao-openspec/README.md` e `padrao-openspec/templates/openspec-padrao.md`. O template é gerenciado pelo instalador, então os projetos recebem a seção nova pelo PR de atualização.
- **CI:** `.github/workflows/validate.yml` (passo "Guia de primeiros passos").
- **Versão:** `CHANGELOG.md` (seção `1.2.1`); `padrao-openspec/VERSION` continua `1.2.1`.
- **Riscos:**
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - **Compatibilidade:** nenhuma quebra. Os comandos do caminho A continuam os mesmos.
  - **Comando errado no guia:** o caminho B é conferido com um teste real numa pasta temporária antes do archive.

## Aprovação

- Responsável: Pendente
- Data: —
- Escopo: —
- Condições: —
- Origem: —
