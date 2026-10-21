# Design

## Context

- O `COMECE-AQUI.md` tem seis seções numeradas (antes de começar, criar o projeto, inicializar, commitar e publicar, primeira change, problemas comuns), todas do ponto de vista de quem cria um projeto.
- O setup registra como store a pasta `padrao-openspec` dentro do clone (`storeRoot` em `setup-project.mjs`), grava `store: <id>` em `openspec/config.yaml` do código e confirma que o CLI resolve essa pasta a partir do código.
- Num projeto configurado, o repositório de código já tem `.claude/`, `.agents/`, `.github/agents/`, `openspec/config.yaml` e `docs/openspec-padrao.md` commitados. O store do projeto é um repositório próprio, com a `main` do projeto e sem o remote do padrão.
- O README da raiz (linha 100 hoje) diz `openspec store register <caminho-do-store> --id <projeto>`, sem dizer que o caminho é a pasta `padrao-openspec`.
- O passo "Guia de primeiros passos" da CI usa `grep -qF` sobre o guia, o README e o template.
- A `1.2.1` está no `VERSION` e no topo do CHANGELOG, mas ainda não tem tag nem release.

## Architecture Decisions

Não há ADR nova. A change é só de documentação e da CI que a protege. O caminho B usa o registro e a declaração de store definidos em `store-setup`, sem mudá-los.

## Goals / Non-Goals

**Goals:**

- Um dev que tem só o clone do padrão ou só o clone do código chega ao primeiro `/opsx:propose` sem perguntar nada além do que o guia manda pedir ao tech lead.

**Non-Goals:**

- Detectar no setup que o dev está no caminho errado (por exemplo, recusar rodar num clone chamado `PadraoOpenspct`).

## Decisions

### D1. Estrutura do `COMECE-AQUI.md`

```text
# Comece aqui
> Aviso: este clone é para ler o guia. Não trabalhe nele (D2).
## 1. Antes de começar            (pré-requisitos; inalterado)
## 2. Qual é o seu caso?          (tabela A/B + o que pedir ao tech lead)
## 3. Caminho A: projeto novo     (antigo passo 2 + cuidados com a pasta)
### Inicializar / Commitar e publicar   (antigos 3 e 4, rebaixados)
## 4. Caminho B: projeto em andamento   (D3)
## 5. Primeira change             (comum aos dois caminhos)
## 6. macOS e Linux               (D4)
## 7. Problemas comuns            (linhas atuais + D5)
## 8. Para saber mais
```

Alternativa considerada: dois arquivos (`COMECE-AQUI.md` e `ENTRAR-NO-PROJETO.md`). Rejeitada porque o dev que só fez o clone vê um único ponto de entrada, e a seção 5 é comum aos dois caminhos.

### D2. Aviso do topo e "Qual é o seu caso?"

Aviso, logo depois do título:

> Se você acabou de rodar `git clone https://github.com/Gilmar1987/PadraoOpenspct`, esse clone serve para ler este guia. Não rode o setup nem crie arquivos nele: cada caminho abaixo diz o que clonar e onde.

Tabela da seção 2:

| Seu caso | Caminho | Peça antes ao tech lead |
|---|---|---|
| Vou criar um projeto que ainda não existe | A | O nome do projeto (vira `<projeto>`), quem responde a entrevista do `/opsx:init` (visão, arquitetura, stack) e permissão para criar os dois repositórios no GitHub e mudar as configurações de Actions |
| Vou trabalhar num projeto que já usa o padrão | B | A URL do repositório de código e a URL do repositório do store, com acesso de leitura e escrita aos dois |

Uma frase depois da tabela: "Na dúvida, pergunte se o projeto já tem um repositório de store. Se tem, é o caminho B."

### D3. Caminho B

```powershell
# 1. Clone o código e o store do projeto, lado a lado
git clone <url-do-codigo> C:\openspec\<projeto>
git clone <url-do-store>  C:\openspec\<projeto>-openspec

# 2. Leia o id do store que o código declara
Select-String -Path C:\openspec\<projeto>\openspec\config.yaml -Pattern '^store:'
#    exemplo de saída: store: livraria  → o id é livraria

# 3. Registre a pasta padrao-openspec do store com esse id
#    --yes confirma criar os metadados do store se o clone não os trouxer (o setup usa o mesmo)
openspec store register C:\openspec\<projeto>-openspec\padrao-openspec --id <id> --yes

# 4. Confira: rodado no código, o CLI tem de resolver o store
cd C:\openspec\<projeto>
openspec context --json
#    "root" → "path" tem de terminar em <projeto>-openspec\padrao-openspec
```

Depois do bloco, em texto:

- Não rode o `setup-project.mjs` nem o `/opsx:init`: o projeto já foi configurado e inicializado. O setup reinstalaria os arquivos do padrão, e o init refaria a entrevista.
- O registro vale para esta máquina: cada dev faz o passo 3 uma vez.
- Abra o Claude Code no repositório de código e siga a seção 5. Para ver o que já existe: `openspec list`.
- Se o `docs/openspec-padrao.md` do código citar uma versão nova do padrão, a atualização chega por PR; não atualize à mão no primeiro dia.

Alternativa considerada: `openspec store doctor <id>` como conferência. Fica como dica na tabela de problemas; a conferência principal é o `context --json` rodado no código, que é o que os comandos `/opsx:*` usam.

### D4. macOS e Linux

Uma seção curta com uma tabela de troca e os blocos dos passos que mudam:

| No Windows | No macOS/Linux |
|---|---|
| `C:\openspec\<projeto>` | `~/openspec/<projeto>` |
| crase no fim da linha | `\` no fim da linha |
| `Select-String -Path <arquivo> -Pattern '^store:'` | `grep '^store:' <arquivo>` |

E o comando do setup do caminho A em Bash, porque é o único com várias linhas.

### D5. Problemas comuns novos

| Sintoma | O que fazer |
|---|---|
| Rodei o setup no clone `PadraoOpenspct` | Clone de novo com o nome do projeto (caminho A, passo 1) e refaça o setup apontando para o clone novo; apague o antigo depois de conferir |
| Movi ou renomeei a pasta do store e o CLI não acha mais o store | `openspec store register <novo-caminho>\padrao-openspec --id <id>` e confira com `openspec context --json` no código |
| Caminho B: `context --json` mostra como raiz a pasta do código, ou o erro cita `Declared in ...openspec/config.yaml` | O store não está registrado com o id da linha `store:`. Refaça o passo 3 do caminho B com esse id |
| Caminho B: registrei a pasta raiz do store e não a `padrao-openspec` | `openspec store unregister <id>` e registre de novo com `\padrao-openspec` no fim |
| Caminho B: `/opsx` não aparece no Claude Code | O código não tem `.claude/` commitado. Peça ao tech lead para commitar o que o setup instalou |

A linha atual "O CLI não encontra o store a partir do código" fica, apontando para o caminho B passo 3.

### D6. READMEs

- README da raiz, aviso do topo: "**Vai começar um projeto ou entrar num que já existe?** Abra o [COMECE-AQUI.md](COMECE-AQUI.md), inclusive se você acabou de clonar este repositório: ele separa o caminho do projeto novo e o do projeto em andamento."
- README da raiz, parágrafo "Quem clona um repositório de código já configurado": troca o `<caminho-do-store>` por `<store>\padrao-openspec` e aponta para o caminho B.
- `padrao-openspec/README.md`, "Usar em um novo projeto": uma frase no fim da introdução: "Para trabalhar num projeto que já usa o padrão, não clone este repositório: siga o caminho B do COMECE-AQUI.md."

### D7. Guia do projeto (`templates/openspec-padrao.md`)

Seção nova "Entrar neste projeto", entre a introdução e "Primeiros passos", com o bloco do D3 a partir do passo 1 (o código já está clonado, então o passo 1 clona só o store, na pasta vizinha) e o link `https://github.com/Gilmar1987/PadraoOpenspct/blob/main/COMECE-AQUI.md#4-caminho-b-projeto-em-andamento`. "Primeiros passos" ganha no item 1 "Se o projeto é novo, ...", para não sugerir o init a quem está entrando.

### D8. CI

No passo "Guia de primeiros passos":

```bash
grep -qF '## 4. Caminho B: projeto em andamento' COMECE-AQUI.md
grep -qF 'openspec store register' COMECE-AQUI.md
grep -qF '## Entrar neste projeto' padrao-openspec/templates/openspec-padrao.md
```

As checagens atuais continuam, incluindo a que proíbe clonar o padrão pela `main`.

### D9. Versão

Sem mudar o `VERSION` (continua `1.2.1`). A seção `## 1.2.1` do CHANGELOG ganha o item "Guia com dois caminhos", e "Ações no projeto" troca "Nenhuma." por: "Nenhuma obrigatória. O `docs/openspec-padrao.md` ganha a seção 'Entrar neste projeto' pelo PR de atualização."

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `COMECE-AQUI.md` | D1–D5 | CI (passo do guia), lint |
| `README.md`, `padrao-openspec/README.md` | D6 | lint |
| `padrao-openspec/templates/openspec-padrao.md` | D7 | instalador (copia o arquivo), smoke tests do instalador, CI |
| `.github/workflows/validate.yml` | D8 | nenhum |
| `CHANGELOG.md` | D9 | passo "Versão e changelog" |

## Risks / Trade-offs

- [O guia fica mais longo] → a seção 2 manda o dev direto para o caminho dele, e os passos de cada caminho ficam num bloco só.
- [Comando do caminho B errado ou desatualizado em relação ao CLI] → teste real numa pasta temporária (tasks), com um store e um código criados pelo setup.
- [Link com âncora para o `COMECE-AQUI.md` quebrar se o título mudar] → a checagem do D8 fixa o título exato.
- [Template alterado muda o hash dos arquivos gerenciados] → é o caminho normal de uma versão nova; os projetos recebem pelo PR de atualização.

## Migration Plan

Nenhuma migração. Rollback: reverter os commits.

## Open Questions

Nenhuma.
