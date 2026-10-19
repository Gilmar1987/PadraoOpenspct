# Proposal

## Why

O teste de ponta a ponta e este repositório mostraram dois custos de ambiente que o padrão multiplica (lote 5 do plano de correção):

- **Chamadas ao CLI depois de cada tarefa.** O apply manda rodar `openspec instructions apply` depois de cada tarefa para confirmar o progresso. Nesta máquina Windows, cada chamada levou de 40 a 90 segundos, ou cerca de 10 minutos numa change de 14 tarefas. A sessão de teste passou a confirmar por grupo de tarefas por conta própria (atrito 17).
- **Quebras de linha no Windows.** Sem `.gitattributes`, o `core.autocrlf` deixa parte dos arquivos em CRLF e parte em LF depois de um `pull`. O `sync-root.mjs --check`, que compara byte a byte, acusa divergências que não existem no repositório.

A investigação da lentidão já tem resposta. Na CI, o passo de configs faz 16 chamadas ao CLI e leva 4 segundos, cerca de 0,25 s por chamada. A lentidão é da máquina local (carga, antivírus, processos `node` órfãos), não do CLI.

## What Changes

- **Apply:** o comando e a skill passam a confirmar o progresso no CLI ao terminar cada grupo de tarefas e no fim. Depois de cada tarefa, só a marcação do checkbox, que já é feita pelo `sourcePath` e pela `line` devolvidos. O passo de CI de trechos customizados protege o texto novo.
- **`.gitattributes`** na raiz, com `* text=auto eol=lf`. Todos os arquivos de texto ficam em LF na árvore de trabalho, em qualquer sistema.
- **README:** uma seção "Desempenho e ambiente" registra as medições (CLI na CI contra local) e o que fazer quando o CLI fica lento (exclusões do antivírus para a pasta do projeto e do npm, encerrar processos `node` órfãos).

### Fora do escopo

- Mudar ou fazer cache do próprio CLI do OpenSpec.
- Configurar o antivírus ou o sistema operacional de quem usa o padrão.
- Diminuir as chamadas ao CLI no propose e no archive. A mudança se limita ao apply, que repete chamadas por tarefa; os outros fluxos fazem poucas chamadas por execução.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `workflow-governance`: acrescenta o requisito de confirmar o progresso no CLI por grupo de tarefas.
- `source-sync`: acrescenta o requisito de que a checagem de divergência não acuse diferenças só de quebra de linha.

## Impact

- **Comando e skill:** `padrao-openspec/.claude/commands/opsx/apply.md` e `skills/openspec-apply-change/SKILL.md`, espelhados pelo sync.
- **Repositório:** `.gitattributes` novo.
- **CI:** marcador novo no passo de trechos customizados.
- **Documentação:** `README.md` e a tabela de trechos customizados.
- **Riscos:**
  - Dados pessoais, autenticação e dados: não se aplicam.
  - **Compatibilidade:** quem já clonou verá os arquivos de texto convertidos para LF no próximo checkout; o conteúdo no repositório não muda, porque o índice já está em LF. O único `.ps1` do repositório funciona com LF no PowerShell 5.1.

## Aprovação

- Responsável: gilmar.campelo
- Data: 2026-10-19
- Escopo: archive
- Condições: `openspec validate --strict` passa; o verify termina sem críticos; a CI fica verde
- Origem: resposta do usuário no chat, "Até o archive, com condições (Recomendado)", à pergunta sobre os lotes 3, 4 e 5, depois de "pode continuar"
