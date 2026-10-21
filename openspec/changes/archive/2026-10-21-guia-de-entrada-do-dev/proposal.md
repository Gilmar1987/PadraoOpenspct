# Proposal

## Why

Hoje um dev que recebe só o link do padrão precisa ler o `COMECE-AQUI.md`, montar os comandos com o nome do projeto e acertar pasta, tag e registro do store. Três problemas aparecem:

- O caminho natural, `git clone https://github.com/Gilmar1987/PadraoOpenspct`, cria uma pasta `PadraoOpenspct` que não serve de store: tem o nome errado e não está numa release. O guia manda clonar de novo.
- Quem vai entrar num projeto já em andamento não tem instrução. O README tem uma frase com um caminho ambíguo (`<caminho-do-store>`, quando o registro é da pasta `padrao-openspec` do clone).
- Os comandos são só de Windows e dependem de o dev copiar e trocar os marcadores sem errar.

Um script interativo, baixado sozinho de cada release, resolve os três: o dev roda dois comandos, responde a poucas perguntas e o script faz o único clone necessário, já na pasta certa.

## What Changes

- **Script `padrao-openspec/scripts/comecar.mjs` (novo)**, em Node, sem dependências:
  - confere Git, Node.js 18+ e o OpenSpec CLI, e oferece instalar o CLI `1.14.2` quando falta;
  - pergunta se o projeto é novo ou já existe e a pasta base (sugestão: a pasta atual; aceita qualquer caminho, cria a pasta se não existir, avisa quando a pasta é sincronizada por OneDrive, Dropbox ou Google Drive);
  - **projeto novo:** pergunta o nome e o id, descobre a última release, clona o padrão direto em `<base>/<id>-openspec` pela tag, cria a branch `main`, cria o repositório de código (ou usa a pasta que um gerador como o `create-next-app` já criou) e roda o `setup-project.mjs`;
  - **projeto em andamento:** pergunta as URLs do código e do store, clona os dois, lê o id na linha `store:` do código, registra a pasta `padrao-openspec` do store e confere que o CLI resolve o store a partir do código;
  - mostra um resumo e pede confirmação antes de criar qualquer coisa; recusa uma pasta de projeto que já existe;
  - aceita todas as respostas por opção (`--modo`, `--pasta`, `--nome`, `--id`, `--codigo`, `--url-codigo`, `--url-store`, `--yes`) para uso sem terminal interativo e para os testes;
  - termina dizendo o próximo passo: `/opsx:init` no projeto novo e `/opsx:propose` no projeto em andamento.
- **Release:** cada GitHub Release passa a ter o `comecar.mjs` anexado, para que `https://github.com/Gilmar1987/PadraoOpenspct/releases/latest/download/comecar.mjs` sempre baixe o da última release. "Como publicar uma release" no README ganha esse anexo.
- **`COMECE-AQUI.md`** encolhe:
  - aviso no topo: não clone o padrão para começar; baixe e rode o script;
  - os dois comandos (Windows e macOS/Linux);
  - o que pedir ao tech lead em cada caso;
  - um exemplo de cada conversa com o script;
  - a primeira change;
  - "Sem o script": os passos manuais dos dois casos;
  - problemas comuns.
- **READMEs:** o topo do README da raiz mostra os dois comandos e aponta para o guia. A frase sobre quem clona um repositório de código já configurado passa a indicar o script no modo "projeto em andamento", com o caminho de registro correto. O `padrao-openspec/README.md` aponta para o script.
- **Guia entregue ao projeto (`templates/openspec-padrao.md`):** ganha a seção "Entrar neste projeto", antes de "Primeiros passos", com o comando do script no modo "projeto em andamento".
- **CI:**
  - a sintaxe do script passa a ser conferida;
  - smoke tests do script nos dois modos, contra um repositório local com tag;
  - o passo "Guia de primeiros passos" passa a conferir o link de download e a seção nova do template.
- **Versão:** `1.3.0`. A `1.2.1` não foi publicada; a seção dela no CHANGELOG vira a `1.3.0`, com o clone pela release e o script.

### Fora do escopo

- Instalar Git, Node.js ou Claude Code pelo script: ele só confere e diz onde baixar.
- Criar os repositórios remotos no GitHub, fazer push ou mudar as configurações de Actions pelo script.
- Rodar o `/opsx:init` pelo script: a entrevista continua no Claude Code.
- Um instalador `irm | iex` ou `curl | bash` que execute o script sem salvá-lo.
- Mudar o comportamento do `setup-project.mjs`, do instalador ou do workflow de atualização.
- Automatizar a publicação da release (o anexo é um argumento a mais no `gh release create`).

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `project-onboarding`: entrada pelo script `comecar.mjs` nos casos de projeto novo e projeto em andamento; o guia, os READMEs e o guia do projeto apontam para ele; a CI testa o script.
- `standard-versioning`: a publicação da release passa a anexar o `comecar.mjs`.

## Impact

- **Código:** `padrao-openspec/scripts/comecar.mjs` (novo).
- **Documentação:** `COMECE-AQUI.md`, `README.md`, `padrao-openspec/README.md` e `padrao-openspec/templates/openspec-padrao.md`. O template é gerenciado pelo instalador; os projetos recebem a seção nova pelo PR de atualização.
- **CI:** `.github/workflows/validate.yml`.
- **Versão:** `padrao-openspec/VERSION` e `CHANGELOG.md` (`1.3.0`).
- **Riscos:**
  - **Execução de código baixado:** o dev baixa e roda um script. Mitigação: o arquivo vem só da GitHub Release do padrão, por HTTPS, é salvo antes de rodar (o guia diz que ele pode abri-lo antes) e não baixa outro código além do clone pela tag.
  - **Comandos externos:** o script chama `git` com argumentos em lista, sem shell. `npm` e `openspec` são `.cmd` no Windows e só iniciam por um shell; ali cada argumento é citado, como o `setup-project.mjs` já faz, para que nomes de pasta e URLs não sejam interpretados.
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam. O script não guarda credenciais; o acesso a repositórios privados fica com o Git da máquina.
  - **Compatibilidade:** nenhuma quebra. O fluxo manual continua documentado e funcionando.
  - **Release sem o anexo:** até a `v1.3.0` sair, o link `latest/download` não existe. O guia novo só chega aos devs junto com essa release.

## Aprovação

- Responsável: gilmar campelo
- Data: 2026-10-21
- Escopo: archive
- Condições: arquivar com os itens não verificados do verify em aberto (download pela release, console real, comandos do projeto); em seguida, push no PR #19, merge e publicação da v1.3.0 com o `comecar.mjs` anexado
- Origem (archive): resposta "Archive, merge e release (Recomendado)" à pergunta "Como você quer seguir para publicar a v1.3.0?", cuja opção dizia "Arquivo a guia-de-entrada-do-dev (registra a aprovação de archive com esta resposta), faço push do commit no PR, faço o merge do PR #19 e publico a v1.3.0 com o comecar.mjs anexado, conferindo o download", depois do pedido "Publique a release v1.3.0."
- Origem: "tudo aprovado vamos começar", em resposta à apresentação do fluxo com o script `comecar.mjs` ("Se esse fluxo estiver como você quer, eu levo para a change guia-de-entrada-do-dev pelo /opsx:update [...] Quer que eu siga?") e à pergunta "Quer que a sugestão padrão seja a pasta atual ou que fique C:\openspec?"; a pasta atual, que era a sugestão, foi tomada como aprovada.
