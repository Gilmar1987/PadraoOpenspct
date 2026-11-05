# Proposal

## Why

O script de entrada (`comecar.mjs`) tem dois caminhos: criar um projeto novo ou entrar num projeto que já usa o padrão. Um projeto que já tem código, mas nunca usou o padrão, precisa hoje passar pelo modo projeto novo com `--codigo`. Esse caminho faz o setup direto na branch atual, mistura a adoção com o trabalho em curso e não recusa uma árvore suja nem um projeto que já usa o OpenSpec. Esta é a primeira de três changes da adoção (rascunho `adocao-1-entrada-no-comecar.md`). Ela dá à adoção uma entrada própria, que termina num PR revisável, e prepara a marca que a inspeção do código (change 2) vai ler.

## What Changes

- Opção 3 no menu do `comecar.mjs`, **Adotar o padrão num projeto que já existe**, e `--modo adotar`. As opções valem como respostas: `--codigo <pasta-ou-url>`, `--nome`, `--id`, `--pasta`, `--branch <nome>`, `--yes` e `--sem-commit`. O `--codigo` passa a aceitar também uma URL no modo adoção.
- **Recusas antes de qualquer escrita:**
  - código que já declara um store (`store:` no `openspec/config.yaml`), com a indicação da opção 2;
  - código que usa o OpenSpec sem o padrão (`openspec/` sem `store:`);
  - pasta que não é um repositório Git, ou repositório sem nenhum commit;
  - arquivos rastreados com alterações sem commit;
  - HEAD destacado, ou rebase, merge, cherry-pick ou revert em andamento;
  - branch de adoção que já existe;
  - pasta do store que já existe e id já registrado;
  - pasta do store dentro da pasta do código (por exemplo, a pasta base igual à do código).

  Os arquivos não rastreados não bloqueiam: o script avisa e lista até 10.
- **Branch de adoção:** o script cria `chore/adota-padrao-openspec` (ou o nome do `--branch`) a partir da branch atual, clona a última release do padrão em `<base>/<id>-openspec`, roda o setup e oferece o commit. No código, o commit leva só os arquivos do padrão, com a mensagem `chore: adota o padrão OpenSpec`. O script não faz push nem abre PR.
- **Pasta base sugerida:** na adoção, o script pergunta primeiro pelo código e depois pela pasta base, e sugere a pasta que contém o código. Por URL, sugere a pasta atual.
- **Marca de adoção:** o setup ganha `--adoption` e repassa a opção ao instalador, que grava `"adoption": true` no `.openspec-padrao.json` e a mantém nas reinstalações e atualizações. O `/opsx:init` ainda não lê a marca: isso é da change 2.
- A mensagem final cita a branch de adoção, manda rodar o `/opsx:init` e abrir o PR depois dele, e oferece abrir o VS Code, como os outros modos.
- O `COMECE-AQUI.md` ganha a seção "Projeto que nunca usou o padrão", o `README.md` cita o modo adoção e o `CHANGELOG.md` e o `padrao-openspec/VERSION` abrem a 1.19.0, porque a v1.18.0 saiu sem a adoção.
- O passo "Smoke test do script de entrada" da CI confere o modo adoção em repositórios temporários.

### Fora do escopo

- A inspeção do código e a entrevista do `/opsx:init` com S/n por pergunta (change 2, `adocao-inspecao-e-confirmacao`).
- O inventário do sistema e o registro do atual e do alvo (change 3, `adocao-inventario-e-alvo`).
- A migração de um projeto que usa o OpenSpec sem o padrão: a opção 3 recusa esse caso.
- Criar o repositório Git ou o primeiro commit do código. O rascunho previa um `git init` sem commit, mas a branch de adoção precisa de uma branch principal para o PR. Por isso, um repositório sem commits é recusado, com os comandos para fazer o primeiro commit.
- Push e PR: só com pedido explícito (`rules.md` §3 e §4).

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `project-onboarding`: o script de entrada ganha o modo adoção, com as recusas, a branch de adoção e o commit só dos arquivos do padrão; o guia ganha a seção do projeto que nunca usou o padrão.
- `skill-installation`: o manifesto `.openspec-padrao.json` passa a guardar a marca de adoção e a mantê-la nas reinstalações.

## Impact

- **Código:** `padrao-openspec/scripts/comecar.mjs` (menu, `--modo adotar`, `--branch`, `adoptProject`), `padrao-openspec/scripts/setup-project.mjs` (`--adoption`), `padrao-openspec/scripts/install-skills.mjs` (`--adoption`, campo `adoption` no manifesto).
- **CI:** `.github/workflows/validate.yml`, passo "Smoke test do script de entrada", com os casos do modo adoção.
- **Documentação:** `COMECE-AQUI.md`, `README.md`, `CHANGELOG.md` (seção nova `## 1.19.0` no topo) e `padrao-openspec/VERSION` (1.19.0).
- **Dependências:** nenhuma nova.
- **Contratos de interface:** não se aplica; a change não toca interface com outros sistemas.
- **Versão:** combinada com a outra sessão (projetoopenspct-df). A v1.18.0 saiu sem esta change, que abre a 1.19.0. A outra sessão não tem change em andamento e não vai tocar nesses arquivos enquanto esta estiver aberta. As ADRs 0010 e 0011 ficam reservadas para as changes 2 e 3.
- Changes concorrentes: nenhuma.
- Débitos: o `openspec/estado-atual.md` não existe neste repositório.
- Falhas aceitas: o `openspec/estado-atual.md` não existe; sem a seção "Falhas aceitas".

## Aprovação

- Responsável: Pendente
- Data: —
- Escopo: —
- Condições: —
- Origem: —
- Aprovação anterior: Gilmar Campelo, 2026-11-05, apply; Condições: —; Origem: "Eu aprovo fazer a implementação da entrada pelo comecar.mjs para adotar o padrão num projeto existente", seguida do comando `/opsx:apply`; Reconfirmação: 2026-11-05, "sim" a "Confirma as 4 revisões e a reconfirmação do selo?" (adoção na 1.19.0); Conteúdo: sha256:385e8adcb077ac99c69ce4054ba64af63f43f9cfbdad83447f4a07407a43bdb4
