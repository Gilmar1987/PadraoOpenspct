# Design

## Context

O `comecar.mjs` (667 linhas) tem dois modos: `newProject` (opção 1) e `joinProject` (opção 2). O `newProject` já aceita, com `--codigo`, uma pasta de código existente ("criada por um gerador") e, quando ela tem histórico ou trabalho sem commit, commita só os arquivos do padrão (`standardPaths`). Ele deixa de fora os que já tinham edições do dev (`uncommittedPaths`, `editedBefore`), como entregue na v1.16.0. Falta a esse caminho o que a adoção precisa: uma branch própria, as recusas (projeto que já usa o padrão, árvore suja, HEAD destacado) e a marca para o init.

O setup (`setup-project.mjs`) chama o `install-skills.mjs`, que monta o manifesto `.openspec-padrao.json` do zero a cada instalação: versão, commit, origem, destino, data, `managedFiles`, `managedBlocks` e `managedSettings`. Um campo que só o setup conhecesse se perderia no primeiro `--update`.

Motivação: veja proposal.md, "Why".

## Goals / Non-Goals

**Goals:**

- Uma função `adoptProject` que reaproveita do `newProject` a pasta base, a conferência do id, o clone do store, o setup e o commit inicial, sem duplicar essa lógica.
- Recusas feitas todas antes da confirmação, com os mesmos dados que o resumo mostra.
- Marca de adoção que sobrevive às atualizações do padrão.

**Non-Goals:**

- Mudar o comportamento dos modos 1 e 2: o `--codigo` do projeto novo continua aceitando só caminho.
- Ler a marca no `/opsx:init` (change 2).

## Decisions

### D1. Modo `adotar` numa função própria, com os passos comuns extraídos

O menu ganha a opção 3, e o `--modo` aceita `adotar`. Uma função nova, `adoptProject`, segue a ordem das outras:

1. pasta base;
2. código (caminho ou URL);
3. recusas;
4. nome e id;
5. resumo;
6. execução.

Os passos que o `newProject` já faz e a adoção repete saem dele para funções compartilhadas, sem mudar o comportamento do modo 1:

- o clone do store na tag e a criação da `main`;
- a chamada do setup;
- a mensagem final com o `offerToOpenVsCode`.

O commit reaproveita o `initialCommit`, com `codeHadWork = true`, e ganha um parâmetro só para a mensagem do commit do código.

*Alternativa:* estender o `newProject` com `--codigo` e uma flag de branch. Foi descartada, porque o modo 1 ficaria com dois comportamentos para a mesma opção, e o resumo, a mensagem final e as recusas ficariam cheios de condições.

### D2. Código por caminho ou URL no mesmo `--codigo`

No modo adoção, `--codigo` aceita uma URL quando o valor tem `://`, começa com `git@` ou termina em `.git`. A URL é clonada em `<base>/<nome-do-repositório>` (`repoName`, já usado pela opção 2), e a pasta não pode existir. Um caminho relativo é resolvido a partir da pasta base, como no `--codigo` do projeto novo. Sem a opção, o script pergunta "Código existente: caminho local ou URL do repositório".

O clone por URL acontece **depois** da confirmação, porque é uma escrita. Por isso, as recusas que dependem do conteúdo do código (`store:`, `openspec/`, commits) rodam logo depois do clone. Se uma delas disparar, a pasta clonada entra em `progress.created`, e a mensagem de erro manda apagá-la, como os outros erros do script. A árvore suja e o HEAD destacado não acontecem num clone novo.

### D3. Recusas e como cada uma é detectada

Todas rodam antes do resumo, com caminho local, ou logo depois do clone, com URL (D2):

| Recusa | Detecção |
|---|---|
| Já usa o padrão | `openspec/config.yaml` ou `config.yml` com a linha `store:` (mesma expressão do `readStoreId`) |
| OpenSpec sem o padrão | Pasta `openspec/` sem a linha `store:` |
| Não é repositório Git | `git -C <código> rev-parse --is-inside-work-tree` diferente de `true` |
| Sem commits | `git rev-parse -q --verify HEAD` falha |
| Árvore suja | `git status --porcelain=v1 --untracked-files=no` não vazio; o erro lista até 10 caminhos |
| HEAD destacado | `git symbolic-ref -q HEAD` falha |
| Operação em andamento | Existe algum dos caminhos `git rev-parse --git-path` de `rebase-merge`, `rebase-apply`, `MERGE_HEAD`, `CHERRY_PICK_HEAD` ou `REVERT_HEAD` |
| Branch já existe ou nome inválido | `git show-ref --verify -q refs/heads/<branch>` e `git check-ref-format --branch <branch>` |
| Pasta do store ou id já registrado | `refuseExisting` e `refuseRegisteredId`, como nos outros modos |

A pasta do código é a raiz do repositório (`git rev-parse --show-toplevel` igual ao caminho informado, comparado com `realpathSync.native`). Uma subpasta de um repositório é recusada, porque o setup gravaria os arquivos do padrão fora da raiz.

Os arquivos não rastreados saem do `uncommittedPaths`, que já existe. O resumo mostra até 10 e o total. Eles ficam fora do commit, porque o commit da adoção é feito com os caminhos do manifesto.

*Alternativa para repositório sem commits:* o rascunho previa oferecer `git init` sem commit. Isso foi descartado, porque a branch de adoção precisa de uma branch principal com histórico para o PR e porque o primeiro commit do código é uma decisão do dev sobre o que versionar. O erro mostra os comandos (`git init`, `git add`, `git commit`).

### D4. Branch de adoção

Depois da confirmação e antes do clone do store, o script roda `git -C <código> switch -c <branch>`. O nome padrão é `chore/adota-padrao-openspec`, e `--branch` troca esse nome. A troca entra em `progress.done`, para que um erro posterior diga em que branch o código ficou e como voltar (`git switch <branch-original>` e `git branch -D <branch>`).

### D5. Marca de adoção no manifesto

O setup ganha `--adoption` e o repassa ao `install-skills.mjs`, que também ganha `--adoption`. O manifesto passa a ter `adoption: true` quando a opção é passada **ou** quando o manifesto anterior já tinha a marca, e não tem o campo nos outros casos. Assim, uma atualização pelo `--update` ou pelo workflow de atualização mantém a marca. O campo está em inglês, como os outros do manifesto (`managedFiles`, `managedBlocks`). O rascunho da change 2 cita `"adocao": true` e passa a usar `adoption`.

*Alternativa:* gravar a marca no `openspec/project.md` do store ou num arquivo próprio no código. Foi descartada: o init já lê o manifesto, e um arquivo novo no código seria mais um arquivo gerenciado sem outro uso.

### D6. Nome, id e mensagem final

- **Nome sugerido:** o `name` do `package.json` da raiz do código, quando existir; senão, o nome da pasta do código.
- **Id sugerido:** `slugify(nome)`, com as mesmas regras e recusas do modo 1.
- **Mensagem final:** troca o passo 3 do modo 1 pelo PR: `Depois do /opsx:init, abra um PR da branch <branch> para <branch-original>`. Mantém os passos do workspace (`openWorkspaceSteps`) e a oferta de abrir o VS Code (`offerToOpenVsCode`), com as mesmas regras de `--yes`.

### D7. Testes na CI

O passo "Smoke test do script de entrada" ganha um bloco do modo adoção, com repositórios temporários e ids `ci-adota-*-$sfx` no `trap` de limpeza:

- **Adoção com sucesso:**
  - um código com um commit e um arquivo não rastreado;
  - confere a branch de adoção, o último commit com a mensagem e só arquivos do manifesto;
  - confere `"adoption": true`, a branch principal intacta e o arquivo não rastreado fora do commit.
- **Recusas:** árvore suja, `store:` presente, `openspec/` sem `store:`, repositório sem commits, HEAD destacado e branch existente. Cada uma sai com código diferente de zero, e nenhuma pasta de store é criada.
- **`--branch`:** com outro nome, a adoção acontece nessa branch.
- **Atualização:** um `install-skills.mjs --update` no código adotado mantém `"adoption": true`.

Cada conferência negativa é vista falhando no apply: com o script alterado para não recusar, o passo tem de sair com 1.

## Risks / Trade-offs

- [Clone por URL antes das recusas de conteúdo] → A pasta clonada fica para trás quando a recusa dispara. Mitigação: ela entra em `progress.created`, e a mensagem final de erro manda apagá-la, como nos outros modos.
- [Refatoração do `newProject` para compartilhar passos] → Pode mudar o modo 1 sem querer. Mitigação: os blocos atuais do "Smoke test do script de entrada" (projeto novo, gerador, edições do dev, sem commit, sem identidade) continuam passando sem alteração.
- [Marca de adoção que nunca sai] → Um projeto adotado tem a marca para sempre. Isso é aceito: ela só muda o comportamento do `/opsx:init` (change 2), que roda uma vez por projeto.
- [Repositório com submódulos ou LFS] → O setup não mexe neles, e o commit leva só os arquivos do padrão. Nenhuma recusa é necessária.
