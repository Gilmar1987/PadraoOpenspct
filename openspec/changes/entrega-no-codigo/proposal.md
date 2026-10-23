# Proposal

## Why

O teste do padrão no projeto lava-jato (relatório `C:\TesteOpenSpct\response.md`, de 2026-10-22) achou cinco atritos na entrega do padrão ao repositório de código. Nenhum quebrou o fluxo, mas todos custaram retrabalho ou deixaram um risco:

- **Item 26:** o repositório de código não tem `.gitattributes`. Cada `git add` no Windows avisa "LF will be replaced by CRLF", e a quebra de linha pode divergir nas comparações dos arquivos gerenciados pelo padrão.
- **Item 23:** a skill `docker` não diz em que interface publicar as portas. O compose do projeto publicou o SQL Server em `0.0.0.0:1433`, com a senha conhecida do `.env.example`. A revisão pegou o problema como achado importante.
- **Item 8:** no explore, o agente fez perguntas "isto ou aquilo" sem numerar as opções. As respostas "sim" ficaram ambíguas e precisaram de perguntas extras. A entrevista do init, com opções numeradas, não teve esse problema.
- **Item 19:** no Git Bash, a conversão automática de caminhos trocou `http://.../fr` por `C:/Program Files/Git/fr`. O `MSYS_NO_PATHCONV=1`, usado para contornar, quebrou o caminho de saída do `curl`.
- **Item 15:** o `.gitignore` gerado por uma ferramenta tinha `.env*` e ignorava também o `.env.example`.

A change preserva a qualidade da entrega no código: menos ruído no Git, nenhum serviço de desenvolvimento exposto na rede e respostas sem ambiguidade no explore.

## What Changes

- **`.gitattributes` no repositório de código:**
  - quando o repositório de código não tem `.gitattributes`, o instalador cria um, com o bloco gerenciado do padrão:
    - `* text=auto eol=lf`;
    - `*.bat` e `*.cmd` com `eol=crlf`, porque o `cmd.exe` exige CRLF.
  - Quando o arquivo já existe sem o bloco do padrão, o instalador não o altera: ele diz que o arquivo já existe e sugere as linhas.
  - No arquivo que tem o bloco, o instalador o mantém atualizado a cada execução, sem duplicá-lo.
- **Skill `docker`:**
  - serviços de desenvolvimento (bancos, filas, caches) publicam portas só em `127.0.0.1`, por exemplo `"127.0.0.1:${DB_PORT:-5432}:5432"`;
  - o exemplo de compose passa a usar isso;
  - o `.env.example` traz marcadores (`<troque>`), e não senhas que funcionem.
- **Explore:** uma pergunta com alternativas numera as opções e pede o número, como a entrevista do init. Um "sim" a uma pergunta "isto ou aquilo" é ambíguo, e o agente pergunta de novo.
- **README do padrão, em "Desempenho e ambiente":**
  - a conversão de caminhos do Git Bash e como contorná-la (PowerShell, ou `MSYS_NO_PATHCONV=1` só em comandos sem caminho de arquivo);
  - o `.gitignore` com `.env*` precisa de `!.env.example`.
- **Versão:** pelo modelo de versão acumulada, se a `descoberta-do-produto` entrar antes, esta change acrescenta itens à seção `## 1.15.0`; se não, abre a 1.15.0. A release sai só quando o responsável pedir.
- **CI:** marcadores dos trechos novos e o smoke test do instalador com o `.gitattributes`.

### Fora do escopo

- Os outros itens do relatório:
  - commit inicial do padrão (item 14);
  - checagem de coerência e ferramentas do init (itens 5, 9, 10, 13 e 24), que ficam na change `init-coerencia-e-ferramentas`.
- Mexer num `.gitattributes` que já existe no repositório de código, ou renormalizar os arquivos já commitados (`git add --renormalize`). O projeto decide isso.
- Proteger os serviços de produção: a regra é para o compose de desenvolvimento.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `skill-installation`:
  - o instalador entrega o `.gitattributes` ao repositório de código que não tem um;
  - a skill `docker` distribuída orienta portas só no host local.
- `workflow-governance`: o explore numera as alternativas das perguntas.

## Impact

- **Script:** `padrao-openspec/scripts/install-skills.mjs`, com a função nova para o `.gitattributes`, no padrão da `ensureConsumerGitignore`.
- **Skills e comandos, com as cópias da raiz espelhadas pelo `sync-root.mjs`:**
  - `padrao-openspec/.claude/skills/docker/SKILL.md` e `docker-guidelines.md`;
  - `padrao-openspec/.claude/commands/opsx/explore.md` e `skills/openspec-explore/SKILL.md`.
- **Documentação:** `README.md`, em "Desempenho e ambiente".
- **Versão e CI:** `padrao-openspec/VERSION`, `CHANGELOG.md` e `.github/workflows/validate.yml` (marcadores e o smoke test do instalador).
- **Riscos:**
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - Compatibilidade:
    - projetos com `.gitattributes` não mudam;
    - nos projetos sem o arquivo, o `.gitattributes` novo só vale para o que for adicionado ou alterado depois. Os arquivos já commitados mantêm a quebra de linha até o projeto renormalizar.
- Changes concorrentes: nenhuma ativa nesta branch. A `descoberta-do-produto` (outra sessão, branch `feat/descoberta-do-produto`) também mexe no `README.md`, mas em outras seções: tabela de comandos, fluxo e tabela de trechos customizados. Ela vai entrar antes e abrir a 1.15.0, e esta change rebaseia antes do apply.
- Contrato de interface: não se aplica.
- Débitos: o repositório do padrão não tem `openspec/estado-atual.md`; nenhum.

## Aprovação

- Responsável: Pendente
- Data: —
- Escopo: —
- Condições: —
- Origem: —
