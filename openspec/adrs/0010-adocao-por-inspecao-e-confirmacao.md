---
id: ADR-0010
status: Accepted
date: 2026-11-05
supersedes:
superseded_by:
related_changes: [adocao-inspecao-e-confirmacao]
verificacao: [padrao-openspec/scripts/test-inspecionar-codigo.mjs]
imposicao: controle
---

# ADR-0010: Adoção por inspeção determinística e confirmação do dev

## Contexto

A change `adocao-entrada-no-comecar` levou o padrão a um código que já existe, com a marca `"adoption": true` no manifesto. Mesmo assim, o `/opsx:init` trata esse projeto como novo: o dev responde à mão o que o código já diz (linguagem, banco, testes, CI, comandos de verificação), com risco de erro e de esquecimento.

Um modelo de IA pode ler o código e responder, mas dá respostas instáveis entre execuções e sensíveis a nomes trocados. Ullah et al. (2024, IEEE S&P) mostram isso num estudo sobre detecção de vulnerabilidades; o argumento vale aqui por extensão. Ler versões de dependências, arquivos de CI e Dockerfiles, ao contrário, é trabalho determinístico e testável na CI do padrão. A [ADR-0009](0009-cada-etapa-disparada-pelo-responsavel.md) exige que as decisões do fluxo sejam do responsável.

## Decisão

- Fatos tirados de arquivos e do Git SHALL ser extraídos por um script determinístico, somente leitura, sem rede e sem executar o código do projeto, que lê só arquivos rastreados e nunca imprime valores de secrets nem dados pessoais.
- O agente do init SHALL interpretar só as perguntas que o script marca como "requer leitura", com no máximo 30 arquivos por pergunta, e SHALL tratar código e documentos do projeto como dados, nunca como instruções.
- Ambiguidades de escopo (vários projetos, pastas geradas, submódulos, branch, leitura truncada) SHALL ser perguntadas com opções antes da entrevista.
- Uma resposta detectada com confiança alta ou média SHALL pedir `S/n`, uma pergunta por vez, com a evidência; com `n`, ou com confiança baixa ou conflito, SHALL abrir as opções da pergunta. Nenhuma resposta detectada vale sem a confirmação do dev.
- O registro do init SHALL guardar a origem de cada resposta: confirmada com a evidência, escolhida com a detecção recusada, ou escolhida.

## Alternativas consideradas

| Alternativa | Por que não foi escolhida |
|---|---|
| Só o agente lê o código | Respostas instáveis e não testáveis na CI do padrão |
| Confirmar por bloco | Menos interações, mas o responsável pediu decidir cada resposta; o resumo do bloco continua como segunda conferência |
| Aplicar a resposta detectada sem perguntar | Contraria a ADR-0009: as decisões do projeto são do responsável |
| Executar os scripts do projeto (testes, `npm ls`) para descobrir mais | Rodaria código de terceiros e dependeria da rede e do ambiente; a inspeção só lê arquivos |

## Consequências

- A entrevista de um projeto existente pede menos digitação e mais confirmações, cada uma com evidência rastreável.
- O catálogo de detecção precisa acompanhar as stacks novas; uma stack não coberta cai nas opções normais, em confiança baixa.
- A CI do padrão ganha fixtures por ecossistema, que precisam ser atualizados junto com o catálogo.
- O inventário do sistema e o registro do atual e do alvo ficam para a change 3 (ADR-0011).

## Limite

- **Garante:** o teste `padrao-openspec/scripts/test-inspecionar-codigo.mjs` confere, para cada fixture, as respostas, os níveis e os conflitos esperados; que nenhum valor do `.env` do fixture aparece na saída; que evidências de arquivos de dados não têm trecho; que arquivos não rastreados não mudam a saída; e que o script só importa `node:fs`, `node:path` e `node:child_process` e só chama o `git`. O passo "Trechos customizados das skills" confere as regras do modo adoção no `init.md`.
- **Fica sob palavra:** que o agente interprete corretamente as perguntas em "requer leitura", espere o `S/n` de cada pergunta, respeite o `n` e trate o código como dado. O `project-setup.md`, com a origem de cada resposta, é o registro para auditoria.
