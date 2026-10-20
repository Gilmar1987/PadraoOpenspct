# Design

## Context

- O README manda clonar o PadraoOpenspct como store do projeto (`git clone ... C:\openspec\<projeto>-openspec`). O clone fica com `origin` apontando para o padrão, e o setup não mexe nos remotes.
- O bloco 5 do `/opsx:init` pergunta branches (5.1), CI (5.2), verificações (5.3), testes (5.4, 5.5), cobertura (5.6) e revisão de PR (5.7). Não pergunta se há remoto nem quantas pessoas revisam.
- O init gera `project-setup.md`, `project.md`, `config.yaml` e ADRs depois da confirmação final, sem cruzar respostas.
- O `config.yaml` base é copiado para cada store; suas regras de tasks valem para todo propose.

## Architecture Decisions

Não há ADR nova: as mudanças ajustam o setup e a entrevista, sem decisão transversal durável. Segue a [ADR-0003](../../adrs/0003-padrao-sem-stack-embutida.md) (edição na fonte única e espelho pelo sync).

## Goals / Non-Goals

**Goals:**

- Um `git push` no store recém-configurado nunca chega ao repositório do padrão.
- O planejamento só exige PR e CI remoto quando o projeto tem remoto.
- Incoerências entre respostas do init viram decisões explícitas, registradas.

**Non-Goals:**

- Detectar o remoto do repositório de código automaticamente; a resposta vem do responsável.
- Impedir o responsável de manter uma combinação incoerente; ele decide, com justificativa.

## Decisions

### D1. Remote do padrão no setup

- Detecção: `git -C <storeRoot> remote get-url origin` (funciona com o store em subpasta). A URL é do padrão quando casa com `/[/:]PadraoOpenspct(?:\.git)?\/?$/i`.
- Ação: `git -C <storeRoot> remote rename origin padrao`. Renomear, e não remover, mantém o caminho para atualizações do padrão (`git fetch padrao`) e é reversível.
- Se já existir um remote `padrao`, o setup não renomeia e avisa.
- Interativo: a pergunta "Renomear o remote origin (repositório do padrão) para padrao? [S/n]" entra antes do resumo. Com `--yes` ou sem terminal, renomeia. `--keep-origin` desliga a ação.
- O resumo ganha a linha do remote; ao final, o setup mostra `git -C <store> remote add origin <url-do-store-do-projeto>` e, para desfazer, `git -C <store> remote rename padrao origin`.
- Store fora de um repositório git, ou sem `origin`: nada a fazer, sem aviso.

*Alternativa:* remover o `origin`. Rejeitada: perde a origem das atualizações do padrão e não é reversível pela mensagem.

### D2. Perguntas 5.8 e 5.9 do init

```text
5.8 — Onde o repositório de código fica hospedado (remoto)?
1) GitHub
2) GitLab
3) Azure DevOps
4) Bitbucket
5) Sem remoto por enquanto (só local)
6) Outro (digitar livremente)

5.9 — Quantas pessoas desenvolvem e revisam o código?
1) Uma pessoa (projeto solo)
2) Duas ou três
3) De quatro a dez
4) Mais de dez
5) Ainda não sei
6) Outro (digitar livremente)
```

As duas entram na tabela "5. Processo e Qualidade" do `project-setup.md` ("Remoto" e "Time") e na convenção "Git e revisão" do `project.md`.

### D3. Checagem de coerência

Nova seção "Checagem de coerência", entre o bloco 7 e a confirmação final. O init avalia ao menos estas combinações:

| Combinação | O que propor |
|---|---|
| 5.7 exige aprovação e 5.9 é "Uma pessoa" | Revisão por subagente (`requesting-code-review`) com o resultado anexado ao PR, ou "merge sem revisão formal" registrado |
| 5.2 tem CI ou 5.1/5.7 dependem de PR, e 5.8 é "Sem remoto" | Verificações locais obrigatórias até o remoto existir |
| 3.8 tem biblioteca de filas e 2.5 é "Não" | Adiar a biblioteca para a primeira change que precisar |
| 2.4 é REST/HTTP, gRPC ou mensageria e 2.1 é um monólito | Confirmar o custo, ou trocar por chamada direta entre módulos |
| 4.4 usa variáveis ou cofre da plataforma e 4.1/4.3 não têm produção | Registrar só o `.env` local por enquanto |
| 5.5 tem framework de E2E e 5.3 não inclui testes E2E (ou o contrário) | Alinhar as duas respostas |

Para cada combinação: mostrar as respostas envolvidas, a consequência e a proposta; o responsável escolhe "Ajustar" (volta à pergunta) ou "Manter" (com justificativa). O `project-setup.md` ganha a seção "Checagem de coerência" com uma linha por combinação (respostas, decisão, justificativa) ou "Nenhuma incoerência encontrada". Com arquivo de respostas, a checagem também roda; uma decisão ausente é perguntada no chat.

### D4. Regra de tasks no config base

Nova regra em `rules.tasks` do `padrao-openspec/openspec/config.yaml`:

> Tarefas que dependem de push, PR ou CI remoto só entram quando o project.md registra um remoto; sem ele, a tarefa usa a verificação local equivalente e diz qual é

O passo "Config base carrega sem avisos" da CI confere que a regra aparece nas instruções.

### D5. Documentação

- README da raiz e `padrao-openspec/README.md`: o setup renomeia o `origin` do padrão para `padrao`; como adicionar o remoto do store do projeto; `--keep-origin`.

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/scripts/setup-project.mjs` | D1 | CI (smokes de setup), `test-setup.ps1` (o clone do teste ganha o remote `padrao`) |
| `padrao-openspec/.claude/commands/opsx/init.md` | D2, D3 | espelho da raiz |
| `padrao-openspec/openspec/config.yaml` | D4 | CI de config base; todo propose em stores novos |
| `.github/workflows/validate.yml` | smoke do D1 | nenhum |
| `README.md`, `padrao-openspec/README.md` | D5 | nenhum |
| `.claude/commands/opsx/init.md` da raiz | sync | nenhum |

## Risks / Trade-offs

- [Renomear o `origin` do clone de desenvolvimento do padrão] → pergunta no modo interativo, `--keep-origin`, comando de desfazer na saída.
- [A checagem de coerência alongar a entrevista] → ela só mostra combinações encontradas; sem incoerência, uma linha.

## Migration Plan

Stores já configurados não mudam; quem quiser pode renomear o remote à mão. Rollback: reverter os commits.

## Open Questions

Nenhuma.
