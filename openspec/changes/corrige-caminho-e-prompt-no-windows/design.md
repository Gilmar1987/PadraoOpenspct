# Design

## Context

- `setup-project.mjs:257` compara `realpathSync(resolved)` com `realpathSync(storeRoot)`; `comecar.mjs:355,402` faz o mesmo no modo projeto em andamento. O `fs.realpathSync` do Node mantém a caixa do drive que recebeu (`realpathSync('c:\\Windows')` → `c:\Windows`), e o `fs.realpathSync.native` a normaliza (`C:\Windows`). O CLI devolve a raiz com `C:`.
- O `storeRoot` do setup vem do caminho com que o script foi chamado; o `comecar.mjs` o chama com o caminho digitado pelo dev.
- Os dois scripts têm um `createPrompter` igual: escrevem a pergunta com `process.stdout.write(prompt)` e leem pelo iterador de linhas. Em modo terminal, o readline redesenha a linha com o prompt dele (`> ` por padrão) e apaga o que foi escrito por fora.
- A mensagem final do `comecar.mjs` diz "Abra a pasta <código> no editor".

## Architecture Decisions

Não há ADR nova; as correções são locais aos dois scripts.

## Goals / Non-Goals

**Goals:**

- O teste do Lava Jato, repetido com `c:\...`, termina sem erro, com as perguntas visíveis e o dev abrindo a pasta certa.

**Non-Goals:**

- Normalizar caminhos em outros pontos que não comparam a raiz do store.

## Decisions

### D1. Comparação de caminhos

Os dois scripts comparam a raiz do store com `realpathSync.native`, em vez de `realpathSync`, dos dois lados. Alternativa rejeitada: `toLowerCase()` no Windows, porque também ignoraria a caixa do resto do caminho num volume que diferencia maiúsculas (raro, mas possível no Windows com WSL).

### D2. Perguntas

No `createPrompter` dos dois scripts, `question(prompt)` passa a chamar `rl.setPrompt(prompt)` e `rl.prompt()`, em vez de `process.stdout.write(prompt)`. O readline passa a conhecer o texto e o redesenha junto com a resposta. A leitura continua pelo iterador de linhas, que aceita respostas coladas de uma vez. Sem terminal, os scripts não criam o prompter, então nada muda nos testes da CI.

### D3. Mensagem final

Modo projeto novo:

```text
Pronto. Próximo passo:
  1. Abra a pasta do projeto como pasta do workspace (não a pasta acima dela):
       code "<código>"
     ou, no VS Code: File → Open Folder → <código>
  2. Nessa janela, abra o Claude Code e rode: /opsx:init
     Se /opsx não aparecer, o Claude Code foi aberto em outra pasta.
Depois do init, commite os dois repositórios e crie os remotos (...)
No GitHub do código, ligue Settings → Actions (...)
```

- A linha `code "<código>"` só aparece quando `code --version` termina com código zero.
- No modo projeto em andamento, a primeira linha do bloco é "Pronto. O projeto já está inicializado: não rode /opsx:init.", e o passo 2 termina em `/opsx:propose <nome-da-change>`.

### D4. Guia

- **`COMECE-AQUI.md`:** os dois exemplos de conversa usam a mensagem do D3, com a linha `code`.
- **"Inicializar":** passa a dizer "Abra a pasta do código como pasta do workspace (File → Open Folder), não a pasta acima dela".
- **Problemas comuns:** a linha atual "`/opsx` não aparece no Claude Code" ganha a causa mais comum, o Claude Code aberto em outra pasta, antes da causa "`.claude/` não commitado".

### D5. Testes

- O smoke test do script confere `grep -qF 'pasta do workspace'` nas saídas dos dois modos.
- A comparação de drive é conferida no Windows, no Git Bash, rodando o `comecar.mjs` nos dois modos com `--pasta "c:/..."` contra o padrão local, como na CI. Isso fica registrado como cobertura fora da suíte, porque a CI roda em Ubuntu.
- As perguntas visíveis são conferidas pelo responsável no console real, que é a condição da aprovação.

### D6. Versão

`1.3.1` no `VERSION` e seção `## 1.3.1` no CHANGELOG ("O que mudou": as três correções; "Ações no projeto": Nenhuma).

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/scripts/comecar.mjs` | D1–D3 | smoke test do script |
| `padrao-openspec/scripts/setup-project.mjs` | D1, D2 | smoke tests do setup |
| `COMECE-AQUI.md` | D4 | passo do guia, lint |
| `.github/workflows/validate.yml` | D5 | nenhum |
| `padrao-openspec/VERSION`, `CHANGELOG.md` | D6 | passo "Versão e changelog" |

## Risks / Trade-offs

- [`setPrompt` mudar a exibição em terminais que não redesenham] → o texto é o mesmo; só passa a ser escrito pelo readline.
- [`code --version` lento no Windows] → roda uma vez, no fim, e só serve para decidir se a linha aparece.

## Migration Plan

Nenhuma migração. Rollback: reverter os commits.

## Open Questions

Nenhuma.
