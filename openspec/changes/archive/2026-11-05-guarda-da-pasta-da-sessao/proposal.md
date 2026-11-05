# Proposal

## Why

No teste ponta a ponta da Clínica Bem Viver (v1.16.0, relatório `C:\TesteOpenSpct\clinica-response.md`, falha 1), o Claude Code foi aberto na pasta acima do repositório de código. Os comandos `/opsx:*` chegaram ao agente como texto puro. No primeiro `/opsx:init` o agente recusou; no segundo, achou os arquivos de comando na subpasta e os seguiu à mão, apoiado na exceção do `rules.md` §3 ("num agente sem os comandos `/opsx:*`, … seguir o arquivo `.claude/commands/opsx/<etapa>.md`").

Assim, o init, o explore e o propose da primeira change rodaram sem hooks, sem subagentes e sem skills. É a mesma causa do item 1 do teste do Lava Jato. A v1.3.1 tratou o problema só com texto: a mensagem final do `comecar.mjs`, o COMECE-AQUI e a solução de problemas. Os três avisos existiam, e o erro aconteceu mesmo assim. A correção precisa ser mecânica e ficar no que o agente lê mesmo na pasta errada.

## What Changes

- **Guarda nos arquivos de comando e nas skills do fluxo:**
  - um bloco curto no topo dos 10 arquivos `.claude/commands/opsx/*.md` e das 7 skills `openspec-*`;
  - quando o agente é o Claude Code e leu o arquivo à mão porque o comando ou a skill não carregou (a sessão está fora da pasta que contém esse `.claude/`), ele para, não segue o arquivo e pede para abrir a pasta do código numa janela nova, mostrando o caminho;
  - a guarda não dispara no texto expandido pelo Claude Code, num subagente despachado pela sessão principal nem na edição do arquivo.
- **Exceção restrita nas regras:**
  - a etapa pedida pelo nome e o arquivo de comando seguido à mão (`rules.md` §3) passam a valer só para agentes que não são o Claude Code (Copilot, Codex, Cursor, Gemini e afins);
  - no Claude Code, um `/opsx:*` que chega como texto, fora do início da mensagem, não é o comando: o agente não começa a etapa e pede para reenviar só o comando no início de uma mensagem nova.
- **Conferência das proteções no apply, no verify e no archive:**
  - quando o repositório de código tem o portão (`docs/openspec-portao.mjs`), o Claude Code confere, antes de começar, se recebeu o contexto "Estado do fluxo OpenSpec" do hook de início de sessão;
  - sem esse contexto, os hooks estão desligados (pasta errada, `settings.json` ignorado ou hooks desativados): o agente para, explica o que fica sem proteção e mostra como reabrir;
  - um subagente despachado para a etapa não confere, porque o contexto vai só para a sessão principal, que já conferiu; se o próprio portão não responder, o agente mostra o erro em vez de mandar reabrir;
  - ele segue só se o responsável decidir, nessa conversa, continuar sem os hooks, e registra isso na evidência da etapa.
- **Script de entrada abre a pasta certa:**
  - no fim, quando o comando `code` existe e o script roda num console interativo, o `comecar.mjs` pergunta "Abrir o VS Code na pasta do código agora? [S/n]";
  - se a resposta for sim, ele roda `code "<pasta do código>"`;
  - com `--yes`, ou sem o `code`, a mensagem continua como hoje.
- **CI:** o passo "Trechos customizados das skills" confere o bloco de guarda nos 10 comandos e nas 7 skills, a conferência das proteções e a exceção restrita, e barra a volta do texto antigo da exceção; o "Smoke test do script de entrada" usa um `code` falso para provar que, com `--yes`, o VS Code não é aberto.
- **Versão:** é a primeira change depois da v1.17.0, que saiu só com a atualização do OpenSpec CLI para a 1.15.0. Pelo modelo de versão acumulada, ela abre a 1.18.0 (`VERSION` e seção do `CHANGELOG.md`), salvo se outra change abrir a versão antes. A release sai só quando o responsável pedir.

### Fora do escopo

- Um `CLAUDE.md` na pasta acima do código. Ele avisaria já na primeira mensagem, mas é carregado também nas sessões abertas na pasta certa e fica numa pasta do usuário, que pode ter vários projetos. Fica para uma decisão futura do responsável.
- Um hook para detectar a pasta errada: os hooks são justamente o que não carrega nessa situação.
- A checagem dentro do `portao.mjs`: o portão não sabe em que pasta a sessão foi aberta, porque o agente faz `cd` antes de rodá-lo.
- Mudar o comportamento dos agentes que não são o Claude Code: para eles, a etapa pedida pelo nome continua valendo como hoje.
- As outras falhas do relatório da clínica, que vão para changes próprias (plano de melhoria, seção 8).

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `change-approval`: a etapa pedida pelo nome passa a valer só em agentes que não são o Claude Code; no Claude Code, um comando em texto pede o reenvio no início da mensagem.
- `agent-guardrails`: guarda nos arquivos de comando e nas skills contra a pasta errada, sem disparar em subagentes nem na edição do arquivo, e conferência do contexto do hook de início no apply, no verify e no archive, só na sessão principal.
- `project-onboarding`: a mensagem final do script de entrada oferece abrir o VS Code na pasta do código.
- `continuous-validation`: a CI protege o bloco de guarda e a exceção restrita.

## Impact

- **Comandos e skills:**
  - os 10 `padrao-openspec/.claude/commands/opsx/*.md`;
  - as 7 `padrao-openspec/.claude/skills/openspec-*/SKILL.md`.
- **Regras:**
  - `padrao-openspec/openspec/rules.md` e a cópia da raiz `openspec/rules.md`, pelo `sync-root.mjs`;
  - o bloco de agentes `padrao-openspec/templates/agents-block.md` ("Sem os comandos `/opsx:*` … siga o arquivo do comando"), que chega ao `AGENTS.md` e aos outros arquivos de instrução dos projetos.
- **Script:** `padrao-openspec/scripts/comecar.mjs`. É um script interativo, então o responsável testa num console real do Windows (PowerShell) antes do archive, conforme o `project.md`.
- **Documentação:**
  - `COMECE-AQUI.md`, nas seções "Outros agentes" e solução de problemas;
  - `padrao-openspec/templates/openspec-padrao.md`, se ele repetir a exceção;
  - `CHANGELOG.md` e `padrao-openspec/VERSION`.
- **CI:** `.github/workflows/validate.yml`, nos passos "Trechos customizados das skills" e "Smoke test do script de entrada".
- **Dependências:** nenhuma nova.
- **Riscos:**
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - Compatibilidade: na pasta certa, o bloco de guarda não muda nada, e o contexto do hook está presente. Num projeto sem portão, a conferência do apply, do verify e do archive não roda.
  - Falso alarme da conferência: uma sessão aberta antes da atualização do padrão, ou um hook que falhou, não traz o contexto. O agente para e explica, e o responsável pode reabrir a sessão ou decidir seguir.
- **Interface com outros sistemas:** não se aplica.
- **Débitos:** o repositório não tem `openspec/estado-atual.md`.
- **Falhas aceitas:** o repositório não tem `openspec/estado-atual.md`, então a seção não existe.
- **Changes concorrentes:** nenhuma. Não há outra change ativa nem outra worktree. Se a outra sessão abrir uma change antes do apply, a versão e o `CHANGELOG.md` são combinados com ela na tarefa 1.1.

## Aprovação

- Responsável: Gilmar Campelo
- Data: 2026-10-30
- Escopo: apply
- Condições: —
- Conteúdo: sha256:baff7c18810a46eed81c19aa8abe07e3156664f3ddcc040ad91a37dff26ed308
- Origem: "Eu aprovo fazer a implementação das correções da revisão da guarda da pasta da sessão", seguida do comando `/opsx:apply`
- Aprovação anterior: Gilmar Campelo, 2026-10-30, apply; Condições: —; Origem: "Eu aprovo fazer a implementação da guarda da pasta da sessão", seguida do comando `/opsx:apply`; Conteúdo: sha256:e7cb95709dfc6e69c30d627009a8801fc9bca67a8c2f820dd80073623be98b57
- Reconfirmação: 2026-10-30; Origem: "Confirma as 5 revisões e a reconfirmação do selo?" — "sim"; Conteúdo: sha256:4ec1e2f7a7eccc96f2f98abf23a1cf20c4c28bce01069ffef3ed6d10cfaa5d22
- Reconfirmação: 2026-11-05; Origem: "Confirma as 5 revisões e a reconfirmação do selo?" (versão 1.18.0 e desmarcar as tarefas 1.1, 4.1 e 4.2) — "sim"; Conteúdo: sha256:45241c7f964374b30230181e3859096b334924f284e8bff30d9b2bb1e9893d03
- Archive: 2026-11-05; Origem: "Eu aprovo fazer o arquivamento da guarda da pasta da sessão", seguida do comando `/opsx:archive`
