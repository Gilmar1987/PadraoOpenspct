# Proposal

## Why

A change 1 da adoção (`adocao-entrada-no-comecar`, no #57) leva o padrão a um código que já existe e marca o manifesto com `"adoption": true`. Só que o `/opsx:init` ainda trata esse projeto como novo: o dev responde à mão o que o código já diz (linguagem, banco, testes, CI, comandos) e pode errar ou esquecer. Esta é a change 2 de 3 (rascunho `adocao-2-inspecao-e-confirmacao.md`). Ela faz o init ler o código antes da entrevista e pedir só a confirmação do que conseguiu responder, com a evidência de cada resposta.

## What Changes

- **Script `inspecionar-codigo.mjs`:** novo, somente leitura e determinístico, instalado no código como `docs/openspec-inspecionar-codigo.mjs`.
  - Lê só arquivos rastreados pelo Git, sem rede e sem executar nada do projeto.
  - Devolve um JSON com as respostas detectadas por pergunta do init, nível de confiança e evidências (arquivo, linha e trecho), mais os comandos de verificação, os contratos, as perguntas que exigem leitura do agente e os avisos.
  - Nunca imprime valores de secrets nem dados pessoais. De arquivos de dados (seeds, CSV, `INSERT`, fixtures), só caminho e linha.
  - Cobre cinco ecossistemas (Node, .NET, Python, Java e Go). Outra stack cai nas opções normais.
- **Modo adoção no `/opsx:init`:**
  - entra pela marca `"adoption": true` do `.openspec-padrao.json` ou, sem ela, quando há código rastreado além dos arquivos do padrão (com uma pergunta antes);
  - faz perguntas de escopo com opções quando a inspeção encontra ambiguidade (vários projetos, pastas geradas, submódulos, branch diferente da principal, inspeção truncada) e avisa um `.env` rastreado;
  - roda a inspeção, deixa o agente ler o código só nas perguntas marcadas como "requer leitura", tratando código e documentos como dados, e mostra um resumo antes do Bloco 1.
- **Entrevista com S/n por pergunta:**
  - resposta detectada com confiança alta ou média aparece com a evidência e pede `S/n`; `S` registra como confirmada, e `n` abre as opções normais;
  - detecção baixa ou em conflito abre as opções direto, com a linha de recomendação;
  - saltos e filtros usam os valores confirmados;
  - o `project-setup.md` registra a origem de cada resposta (`confirmada (detectada: <arquivo:linha>)`, `escolhida (detecção recusada: <valor>)` ou `escolhida`) e o escopo da inspeção.
- **Fixtures e teste:** repositórios de exemplo em `padrao-openspec/scripts/test-fixtures/inspecao/` e `padrao-openspec/scripts/test-inspecionar-codigo.mjs`, que copia cada fixture para uma pasta temporária com `git init` e compara a saída com o esperado. O teste roda no job `store` da CI.
- **ADR-0010:** "Adoção por inspeção determinística e confirmação do dev", `Proposed`, com `imposicao: controle` e o teste como `verificacao`.
- README, COMECE-AQUI e CHANGELOG (item na seção 1.19.0, que está aberta).

### Fora do escopo

- O inventário do sistema no `estado-atual.md` (rotas, entidades, jobs, integrações, telas) e o registro do atual e do alvo no `lacunas.md`: change 3 (`adocao-inventario-e-alvo`).
- Detecção das perguntas 5.7 (revisão de PR, que a inspeção offline não enxerga) e 7.3 (idioma do código e dos commits): seguem como perguntas normais.
- Stacks fora dos cinco ecossistemas (PHP, Ruby, Elixir e outras): a 3.1 vira "Outro" em confiança baixa, com o nome detectado.
- A mudança no `/opsx:ingest` do rascunho original, sem ligação com a adoção.
- Executar o projeto, seus testes ou gerenciadores de pacote para descobrir algo: a inspeção só lê arquivos.

## Capabilities

### New Capabilities

- `code-inspection`: inspeção somente leitura do código existente, com respostas detectadas por pergunta do init, níveis de confiança, evidências e as regras de privacidade e segurança da saída.

### Modified Capabilities

- `project-initialization`: o init ganha o modo adoção (ativação, perguntas de escopo, inspeção e leitura do agente) e as regras da entrevista com resposta detectada.
- `skill-installation`: o instalador entrega o script de inspeção ao código como arquivo gerenciado.
- `continuous-validation`: a CI roda o teste da inspeção contra os fixtures.

## Impact

- **Código:** `padrao-openspec/scripts/inspecionar-codigo.mjs` (novo), `padrao-openspec/scripts/test-inspecionar-codigo.mjs` (novo), `padrao-openspec/scripts/test-fixtures/inspecao/` (novo), `padrao-openspec/scripts/install-skills.mjs` (entrega do script).
- **Comandos do agente:** `padrao-openspec/.claude/commands/opsx/init.md` (seção "Modo adoção" e regras do S/n).
- **CI:** `.github/workflows/validate.yml`: passo do teste da inspeção no job `store`, trechos novos do `init.md` no "Trechos customizados das skills" e a entrega do script no "Smoke test do instalador".
- **ADR:** `openspec/adrs/0010-adocao-por-inspecao-e-confirmacao.md` (nova, `Proposed`). O número foi reservado com a outra sessão, que usa a 0012 na frente dos ganchos.
- **Documentação:** README, COMECE-AQUI e CHANGELOG (item na 1.19.0, sem mexer no `VERSION`).
- **Dependências:** nenhuma nova; o script usa só módulos do Node (`node:fs`, `node:path`, `node:child_process`).
- **Contratos de interface:** não se aplica; a change não toca interface com outros sistemas.
- **Versão:** a 1.19.0 está aberta na `main` (aberta pela change 1), e esta change acrescenta um item nela. A frente A da outra sessão (ganchos para qualquer agente, ADR-0012) também acrescenta item na 1.19.0 e toca os hooks e o "Smoke test dos hooks", que esta change não toca.
- Changes concorrentes: nenhuma ativa nesta árvore. Na branch da outra sessão, `ganchos-para-qualquer-agente` (worktree `C:\ProjetoOpenspct-ganchos-para-qualquer-agente`) toca `.claude/hooks`, o template `claude-settings.json` e o "Smoke test dos hooks do Claude Code"; o único arquivo em comum é o `validate.yml`, em passos diferentes, e o CHANGELOG. Quem entrar por último rebaseia.
- Débitos: o `openspec/estado-atual.md` não existe neste repositório.
- Falhas aceitas: o `openspec/estado-atual.md` não existe; sem a seção "Falhas aceitas".

## Aprovação

- Responsável: Gilmar Campelo
- Data: 2026-11-05
- Escopo: apply
- Condições: —
- Conteúdo: sha256:3f396b05fb525af3cf8d0e570d6af3013976ad6b2931f470796446baf7729a6a
- Origem: "Eu aprovo fazer a implementação da inspeção do código e da entrevista por confirmação na adoção do padrão", seguida do comando `/opsx:apply`
