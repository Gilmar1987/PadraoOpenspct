# Proposal

## Why

No teste do Lava Jato (2026-10-21 e 2026-10-22), duas lacunas do processo apareceram:

- **Init e entrada não commitam o que geram.** O propose, o apply e o archive commitam o que produzem; o `/opsx:init` e o `comecar.mjs` não. O Lava Jato ficou com o código sem nenhum commit e com o init sem commit no store. Sem um primeiro commit, o `--update` do instalador nem roda, porque exige um repositório limpo e com histórico.
- **Projeto sem remoto não recebe atualização.** A atualização chega pelo workflow semanal, que só roda no GitHub. Num projeto sem remoto, como o Lava Jato, os comandos do ciclo só mostram "há atualização do padrão" e mandam ler o guia. O projeto ficou na v1.3.0 enquanto o padrão corrigia defeitos até a v1.5.0.

## What Changes

- **`/opsx:init` commita os artefatos:** novo passo "Commit the init". Depois de gerar `project-setup.md`, `project.md`, `config.yaml`, `arquitetura.md` e as ADRs, o init commita só `openspec/` da raiz do store (`git -C <root> add -- openspec/`), quando a raiz está num repositório Git. Ele nunca faz push. Os "Próximos passos" deixam de mandar commitar à mão.
- **`comecar.mjs` oferece o commit inicial:** no modo projeto novo, depois do setup, pergunta "Fazer o commit inicial do código e do store? [S/n]".
  - O `--yes` aceita, e a nova opção `--sem-commit` recusa.
  - No código, commita tudo o que o setup instalou (e o que o gerador já tinha criado, se houver `--codigo`). No store, commita a configuração do setup.
  - Se o Git não tiver identidade configurada ou o commit falhar, o script não falha: avisa e mostra os comandos.
- **Atualização oferecida nos comandos do ciclo:** o "Standard version check" de propose, apply, verify e archive (comandos e skills) continua mostrando "há atualização do padrão". Quando o repositório de código não tem remoto, ou quando o usuário pedir, ele passa a oferecer a atualização à mão com os comandos do "Atualizar à mão" na versão nova. Só roda com a confirmação explícita do usuário e com a árvore limpa, antes de continuar o comando.
- **Guias:** o COMECE-AQUI e o `docs/openspec-padrao.md` refletem os commits automáticos e a atualização oferecida.
- **CI:**
  - o smoke test do script de entrada confere os commits iniciais e o `--sem-commit`;
  - os trechos customizados passam a cobrir "Commit the init" e a oferta de atualização.
- **Versão:** `1.6.0`.

### Fora do escopo

- Push automático em qualquer caso.
- Atualizar sem confirmação do usuário.
- Commit pelo `setup-project.mjs` quando usado sozinho (o caminho manual continua com o commit à mão, como o guia descreve).

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `project-initialization`: o init commita os artefatos no store.
- `project-onboarding`: o script de entrada oferece o commit inicial dos dois repositórios.
- `standard-update`: o aviso de versão nos comandos do ciclo passa a oferecer a atualização à mão.

## Impact

- **Comandos e skills:** `init.md`, e o "Standard version check" de `propose`, `apply`, `verify` e `archive` (comandos e skills), com as cópias da raiz pelo `sync-root`.
- **Script:** `padrao-openspec/scripts/comecar.mjs`, que é interativo. Pela regra do `openspec/project.md`, a change exige o teste do responsável num console real antes da release.
- **Guias, CI, versão:** `COMECE-AQUI.md`, `templates/openspec-padrao.md`, `.github/workflows/validate.yml`, `VERSION`, `CHANGELOG.md`.
- **Riscos:**
  - **Commit com conteúdo indesejado:** um commit inicial pode incluir arquivos que o dev não queria. Mitigação: o script pergunta e lista as pastas, o `--sem-commit` existe, e o commit é local, sem push.
  - **Atualização no meio de um trabalho:** mitigação: o comando só oferece a atualização com a árvore limpa, e ela cria uma branch própria (`--update`).
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.

## Aprovação

- Responsável: Pendente
- Data: —
- Escopo: —
- Condições: —
- Origem: —
