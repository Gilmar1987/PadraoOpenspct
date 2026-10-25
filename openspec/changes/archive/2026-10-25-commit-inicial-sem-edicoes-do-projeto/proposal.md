# Proposal

## Why

Quando o script de entrada (`comecar.mjs`) instala o padrão numa pasta de código que já tem trabalho, como a de um gerador de projeto, o commit inicial leva só os arquivos do padrão. Só que o Git commita o arquivo inteiro. Se um desses arquivos (`.gitignore`, `.gitattributes`, `.claude/settings.json`, `CLAUDE.md`, `AGENTS.md`) já tinha edições do projeto que ainda não estavam commitadas, essas edições entram no commit "chore: instala o padrão OpenSpec", sem o dev ter revisado. A segunda revisão de código da `entrega-no-codigo` achou o caso e o deixou registrado no `review.md` como defeito anterior, candidato a uma change própria.

A change preserva a qualidade que o script de entrada promete: o commit inicial não leva trabalho do projeto que o dev não decidiu commitar.

## What Changes

- **Commit inicial do script de entrada,** numa pasta de código com trabalho:
  - antes do setup, o script anota quais arquivos já tinham edições não commitadas (modificados, encenados ou não versionados);
  - no commit inicial, um arquivo do padrão que já estava nessa lista fica de fora; os outros arquivos do padrão entram como hoje;
  - no fim, o script lista os arquivos que ficaram de fora, diz que eles têm edições do próprio dev junto das do padrão e mostra o comando para commitá-los depois da revisão.
- Sem arquivo nessa situação, nada muda: o commit leva todos os arquivos do padrão, e a árvore fica limpa.
- **Versão:** pelo modelo de versão acumulada, se a change da outra sessão no propose entrar antes, esta acrescenta itens à seção `## 1.16.0` que ela abre; se não, abre a 1.16.0. A release sai só quando o responsável pedir.
- **CI:** um cenário novo no "Smoke test do script de entrada".

### Fora do escopo

- Separar, dentro de um arquivo, as linhas do padrão das linhas do projeto. O Git commita o arquivo inteiro, e o dev decide depois de revisar.
- O `install-skills.mjs --update`, que já exige a árvore limpa antes de começar.
- O commit do store, que é sempre um repositório novo, clonado pelo próprio script.
- A pasta de código criada pelo script, sem trabalho anterior, que continua commitando tudo.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `project-onboarding`: o commit inicial numa pasta com trabalho deixa de fora os arquivos do padrão que já tinham edições do projeto, e o script mostra como commitá-los depois.

## Impact

- **Script:** `padrao-openspec/scripts/comecar.mjs` (a detecção antes do setup, a lista de arquivos do commit inicial e a mensagem final).
- **CI:** `.github/workflows/validate.yml`, no "Smoke test do script de entrada".
- **Documentação:** `CHANGELOG.md`.
- **Dependências:** nenhuma nova.
- **Riscos:**
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - Compatibilidade: sem edições anteriores nos arquivos do padrão, o comportamento é o de hoje.
  - Árvore suja depois do commit: os arquivos deixados de fora ficam modificados até o dev commitá-los, e o `--update` pede a árvore limpa. A mensagem final diz isso e mostra o comando.
- **Interface com outros sistemas:** não se aplica.
- **Débitos:** o repositório não tem `openspec/estado-atual.md`.
- **Falhas aceitas:** o repositório não tem `openspec/estado-atual.md`, então a seção não existe.
- **Changes concorrentes:** nenhuma ativa nesta branch. A change da outra sessão no propose (versões consultadas e ADR no commit, branch local) não toca o `comecar.mjs`; ela mexe no `validate.yml` (outro passo), no README e no CHANGELOG, onde abre a 1.16.0. Quem entrar por último rebaseia.

## Aprovação

- Responsável: Gilmar Campelo
- Data: 2026-10-25
- Escopo: archive
- Condições: verify sem críticos; o fluxo vai até o PR, e o merge fica com o responsável; cada etapa só começa com a aprovação escrita e o comando `/opsx:<etapa>` digitado pelo responsável
- Conteúdo: sha256:dda6af707167d1b4188b6763e4136153502cf126f21d56ead55b5240e3672841
- Origem: "Eu aprovo fazer o apply da change do commit inicial sem edições do projeto, até o archive, com PR; o merge fica comigo"
- Reconfirmação: 2026-10-25; Origem: "Eu aprovo fazer a reconfirmação do selo e o archive da change do commit inicial", depois de ver as revisões do D1, do D2 e do D3 do design; Conteúdo: sha256:7721f26c36acb1211cd3fd4883176474f1497887c8075f6d105ca010aed2821b
