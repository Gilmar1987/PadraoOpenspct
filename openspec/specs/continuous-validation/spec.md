# continuous-validation Specification

## Purpose

Define as validações automáticas que protegem este repositório em pull requests e na `main`, garantindo que a fonte única, os scripts e os artefatos OpenSpec continuem consistentes.

## Requirements

### Requirement: Execução da CI no repositório

O repositório SHALL ter um workflow em `.github/workflows/` da raiz que rode em todo pull request e em push na `main`. Nenhum workflow SHALL permanecer em `padrao-openspec/.github/workflows/`.

#### Scenario: Pull request aberto

- **WHEN** um pull request é aberto contra a `main`
- **THEN** o workflow de validação é executado pelo GitHub Actions

### Requirement: Validações do store

O workflow SHALL executar, dentro de `padrao-openspec/`, as validações existentes: `openspec validate --all --strict`, carga do config base sem avisos, lint de Markdown, sintaxe dos scripts e smoke tests do instalador e do setup. Os smoke tests SHALL cobrir a instalação dos comandos OPSX, o destino padrão `both` e a recusa da opção `--stack` pelo instalador e pelo setup.

#### Scenario: Comando ausente na instalação

- **WHEN** uma mudança faz o instalador deixar de copiar `init.md` para `.claude/commands/opsx/`
- **THEN** o smoke test do instalador falha

#### Scenario: Opção de stack aceita por engano

- **WHEN** uma mudança faz o setup voltar a aceitar `--stack`
- **THEN** o smoke test do setup falha

### Requirement: Validações da raiz

O workflow SHALL falhar quando a checagem do sync detectar divergência, quando `openspec validate --all --strict` falhar na raiz ou quando o lint de Markdown falhar nos documentos da raiz. Skills e comandos gerados pelo OpenSpec CLI SHALL ficar fora do lint.

#### Scenario: Raiz editada sem passar pela fonte

- **WHEN** um pull request altera `.claude/commands/opsx/init.md` da raiz sem alterar `padrao-openspec/.claude/commands/opsx/init.md`
- **THEN** o workflow falha no passo de checagem do sync

#### Scenario: Change inválida na raiz

- **WHEN** um pull request adiciona em `openspec/changes/` um requisito sem cenário
- **THEN** o workflow falha no passo de validação OpenSpec da raiz

### Requirement: Versão e changelog consistentes

O workflow de validação SHALL falhar quando o conteúdo de `padrao-openspec/VERSION` não for semver válido ou não for igual à primeira versão listada no `CHANGELOG.md`, ou quando essa seção não tiver "O que mudou" e "Ações no projeto".

#### Scenario: VERSION sem entrada no changelog

- **WHEN** um PR muda `VERSION` para `1.1.0` sem acrescentar a seção `1.1.0` ao CHANGELOG
- **THEN** o workflow falha no passo de versão

### Requirement: Smoke da atualização versionada

Os smoke tests do instalador SHALL cobrir o manifesto da primeira instalação, a recusa de reinstalação com mudanças sem modo, o `--update` num repositório limpo e a recusa do `--update` com alterações pendentes.

#### Scenario: Instalador volta a sujar a branch atual

- **WHEN** uma mudança faz a reinstalação com mudanças gravar arquivos sem `--update` nem `--in-place`
- **THEN** o smoke test do instalador falha

### Requirement: Validações do store também no Windows

As validações do store SHALL rodar em Linux e em Windows a cada pull request, e uma falha em qualquer um dos dois sistemas SHALL reprovar a CI. No Windows, a CI SHALL rodar o script de entrada nos dois modos com a pasta base em letra de drive minúscula e conferir que o OpenSpec CLI resolve o store a partir do código.

#### Scenario: Defeito só no Windows

- **WHEN** uma mudança faz um script falhar só no Windows (por exemplo, comparando caminhos com diferença de caixa na letra do drive)
- **THEN** a execução do job de validação do store no Windows falha e o pull request fica reprovado, mesmo com a execução no Linux passando

#### Scenario: Drive em minúscula

- **WHEN** o script de entrada roda no Windows com `--pasta` em letra minúscula, nos modos projeto novo e projeto em andamento
- **THEN** os dois modos terminam com código zero, e o CLI rodado no código resolve a pasta `padrao-openspec` do store

#### Scenario: Defeito só no Linux

- **WHEN** uma mudança faz um passo falhar só no Linux (por exemplo, um commit sem identidade Git configurada)
- **THEN** a execução no Linux falha e o pull request fica reprovado, mesmo com a execução no Windows passando

### Requirement: Release com o script de entrada anexado

O repositório SHALL ter um workflow que roda quando uma release é publicada e garante que ela tem o `comecar.mjs` anexado, anexando o arquivo da própria tag quando ele faltar e falhando se o anexo continuar ausente.

#### Scenario: Release publicada sem o anexo

- **WHEN** uma release `vX.Y.Z` é publicada sem o `comecar.mjs`
- **THEN** o workflow anexa o `padrao-openspec/scripts/comecar.mjs` da tag `vX.Y.Z`, e a release passa a tê-lo

### Requirement: Portão testado na CI

A CI SHALL testar o portão contra um store registrado: aprovação pendente e completa no `apply`; tarefas pendentes, falta de `verification.md`, falta de `review.md` numa change de código e change pronta no `archive`; e o hook recusando um commit de change não aprovada.

#### Scenario: Portão que deixa passar aprovação pendente

- **WHEN** uma mudança faz o portão liberar `apply` com `Responsável: Pendente`
- **THEN** o smoke test do portão falha

### Requirement: Suíte sem recursos compartilhados

Os passos da CI que registram stores SHALL usar ids com um sufixo único por execução e SHALL desregistrá-los no fim, mesmo quando falham. A instalação do OpenSpec CLI SHALL ser pulada quando a versão exigida já estiver instalada, e MUST NOT reinstalar o CLI por cima de uma instalação igual.

#### Scenario: Duas execuções ao mesmo tempo na mesma máquina

- **WHEN** duas execuções locais da suíte rodam ao mesmo tempo
- **THEN** cada uma registra e desregistra só os próprios ids, e uma não remove o registro da outra

#### Scenario: Passo que falha no meio

- **WHEN** o passo da declaração do store falha depois de registrar o id
- **THEN** o id é desregistrado no fim do passo

#### Scenario: CLI já instalado

- **WHEN** o OpenSpec CLI `1.15.0` já está instalado
- **THEN** o passo de instalação não roda o `npm install -g`

### Requirement: Ids de teste conferidos

A CI SHALL falhar quando um passo usar um id de store de teste sem o sufixo de execução num `--register-id`, num `--id` ou num `store unregister`.

#### Scenario: Id fixo esquecido

- **WHEN** um passo novo registra o store com `--register-id ci-novo`
- **THEN** a checagem de ids falha citando a linha

### Requirement: Versão do OpenSpec CLI coerente

A CI SHALL falhar quando a versão do OpenSpec CLI que o padrão fixa não for a mesma em todos os lugares que a declaram: o script de entrada, a mensagem de CLI ausente do portão, os passos de instalação do CLI na CI, o campo `generatedBy` de cada skill `openspec-*` (em `padrao-openspec/` e na raiz) e cada `@fission-ai/openspec@<versão>` citado no `README.md`, no `padrao-openspec/README.md`, no `COMECE-AQUI.md` e no `openspec/project.md`. A falha SHALL citar o arquivo e a versão divergente.

#### Scenario: Versões iguais

- **WHEN** o script de entrada, o portão, os passos de instalação e as skills declaram o CLI `1.15.0`
- **THEN** a checagem passa

#### Scenario: Skill gerada por outra versão

- **WHEN** uma skill `openspec-*` tem `generatedBy: "1.14.2"` e o script de entrada fixa `1.15.0`
- **THEN** a checagem falha citando a skill e a versão `1.14.2`

#### Scenario: Passo de instalação esquecido

- **WHEN** um dos passos "Instalar OpenSpec CLI" da CI continua instalando `@fission-ai/openspec@1.14.2` depois de o script de entrada passar a `1.15.0`
- **THEN** a checagem falha citando o `validate.yml` e a versão `1.14.2`

#### Scenario: Documento com o comando antigo

- **WHEN** o `COMECE-AQUI.md` ainda manda rodar `npm install -g @fission-ai/openspec@1.14.2`
- **THEN** a checagem falha citando o `COMECE-AQUI.md` e a versão `1.14.2`

### Requirement: Guarda da pasta da sessão protegida pela CI

A CI SHALL falhar quando um dos 10 arquivos de comando `.claude/commands/opsx/*.md` ou uma das skills `openspec-*` do padrão perder o bloco de guarda da pasta da sessão, quando o apply, o verify ou o archive (comando e skill) perderem a conferência do contexto do hook de início, ou quando o `rules.md` ou o bloco de agentes voltarem a autorizar seguir o arquivo de comando à mão sem restringir isso a agentes que não são o Claude Code.

#### Scenario: Comando sem a guarda

- **WHEN** uma mudança remove o bloco de guarda de `.claude/commands/opsx/sync.md`
- **THEN** o passo "Trechos customizados das skills" falha citando o arquivo

#### Scenario: Exceção larga de volta

- **WHEN** o `rules.md` volta a dizer "num agente sem os comandos `/opsx:*`, aceitar como comando o pedido da etapa pelo nome", sem a restrição a agentes que não são o Claude Code
- **THEN** a CI falha citando o trecho antigo

### Requirement: Inspeção do código conferida contra fixtures

O job `store` da CI SHALL rodar o teste da inspeção, que copia cada fixture para uma pasta temporária com `git init`, roda o script e compara a saída com o esperado do fixture. O teste SHALL falhar quando uma resposta, um nível ou um conflito mudar, quando um valor de secret ou um trecho de arquivo de dados aparecer na saída, e quando o script importar algo além de `node:fs`, `node:path` e `node:child_process` ou chamar outro programa que não o `git`.

#### Scenario: Dependência trocada no fixture

- **WHEN** o fixture Node troca `vitest` por `mocha` sem atualizar o esperado
- **THEN** o passo do teste da inspeção falha e cita a 5.4

#### Scenario: Script que passa a rodar outro programa

- **WHEN** o script passa a chamar `npm` pelo `child_process`
- **THEN** o passo do teste da inspeção falha

### Requirement: Guarda do clone do store protegida pela CI

A CI SHALL falhar quando um dos 10 comandos `.claude/commands/opsx/*.md` ou uma das 7 skills `openspec-*` perder o parágrafo da guarda do clone do store ou o tiver depois da guarda da pasta da sessão, quando o `rules.md` ou o bloco de agentes perderem a frase do clone com "em qualquer agente", ou quando o repositório do padrão tiver `padrao-openspec/.openspec-store/`.

#### Scenario: Skill sem a guarda do clone

- **WHEN** uma mudança remove o parágrafo da guarda do clone do store de `.claude/skills/openspec-apply-change/SKILL.md`
- **THEN** o passo "Trechos customizados das skills" falha citando o arquivo

#### Scenario: Guarda do clone depois da guarda da sessão

- **WHEN** uma mudança move o parágrafo da guarda do clone do store para depois do `**Session folder guard**` em `.claude/commands/opsx/init.md`
- **THEN** o passo "Trechos customizados das skills" falha citando o arquivo

#### Scenario: Marcador de store no repositório do padrão

- **WHEN** alguém registra o próprio repositório do padrão como store e o `padrao-openspec/.openspec-store/store.yaml` entra num commit
- **THEN** a CI falha citando o arquivo

#### Scenario: Regras sem a frase do clone

- **WHEN** uma mudança remove do `rules.md` a frase sobre o clone do store
- **THEN** o passo "Trechos customizados das skills" falha citando o `rules.md`
