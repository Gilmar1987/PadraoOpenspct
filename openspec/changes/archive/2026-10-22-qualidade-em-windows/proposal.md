# Proposal

## Why

Três dos defeitos achados no teste do Lava Jato (2026-10-21 e 2026-10-22) só existem no Windows, onde está a maioria dos devs, e a CI roda só em Ubuntu:

- **Drive em minúscula:** o setup acusava "not this store" quando a pasta era digitada como `c:\...`.
- **Prompt apagado:** a pergunta da pasta sumia no console.
- **Identidade Git:** o commit do `--update` sem identidade só falha no Linux e passava despercebido no Windows. É o efeito inverso, mas vem da mesma falta de cobertura nos dois sistemas.

Além disso, o prompt apagado só foi pego quando o responsável rodou o script num PowerShell de verdade. O terminal simulado dos testes não redesenha a linha. Hoje, nada no processo exige esse teste antes de uma release.

## What Changes

- **CI em Windows:** o job `store` do `validate.yml` passa a rodar numa matriz `ubuntu-latest` + `windows-latest`, com `shell: bash` (Git Bash no Windows) e `fail-fast: false`, para os dois resultados aparecerem sempre. Passos que dependem de ferramentas só do Linux ficam portáveis; por exemplo, o `python3` da checagem de YAML passa a ter `python` como alternativa.
- **Teste do drive minúsculo:** passo novo, só no Windows, que roda o `comecar.mjs` nos dois modos com a pasta base em letra minúscula e confere que o CLI resolve o store.
- **Teste em console real:** o `openspec/project.md` deste repositório passa a exigir, para toda change que altera um script interativo (`comecar.mjs`, `setup-project.mjs` ou outro que pergunte no terminal), um teste do responsável num console real do Windows (PowerShell) antes da release, registrado no `verification.md`. A tabela "Comandos de verificação" passa a citar a matriz de sistemas.

### Fora do escopo

- Job `root` em Windows: ele só valida Markdown, specs e o sync, sem caminhos de sistema.
- macOS na matriz.
- Automatizar o teste de console real (por exemplo, com um pseudo-terminal), que não reproduz o redesenho do console do Windows.
- Mudar scripts ou o que é entregue aos projetos: não há release nem mudança de versão.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `continuous-validation`: as validações do store rodam também no Windows, incluindo o caso do drive em minúscula.

## Impact

- **CI:** `.github/workflows/validate.yml`. O job `store` passa a ter duas execuções, e o tempo total sobe com a do Windows, que é mais lenta.
- **Processo deste repositório:** `openspec/project.md` (Comandos de verificação e Git & Process).
- **Projetos:** nenhum efeito; nada é entregue a eles.
- **Riscos:**
  - **Passo que só funciona no Linux:** pode falhar no Windows. Mitigação: o apply roda a matriz no PR e ajusta o passo para ficar portável, sem pular passos no Windows sem justificativa registrada.
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.

## Aprovação

- Responsável: gilmar campelo
- Data: 2026-10-22
- Escopo: archive
- Condições: CI passar nos três jobs (`store (ubuntu-latest)`, `store (windows-latest)` e `root`); em seguida, PR e merge (sem release)
- Origem: "Aprovo a change qualidade-em-windows para archive, com PR e merge, se a CI passar nos três jobs"
