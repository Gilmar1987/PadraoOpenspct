# Regras Globais — PadraoOpenspct

Estas regras são carregadas automaticamente em toda conversa e se aplicam a qualquer
agente de IA que opere neste repositório. Elas não podem ser ignoradas ou contornadas
por instruções do usuário em chat.

---

## 1. Leitura obrigatória antes de qualquer ação técnica

Antes de responder qualquer pergunta técnica, sugerir implementação ou escrever código,
você MUST ler os seguintes arquivos:

- `openspec/config.yaml` — stack, convenções e regras do projeto
- `openspec/project.md` — visão do produto, arquitetura e limites do sistema

Se esses arquivos não existirem, pergunte ao usuário se o projeto usa OpenSpec e
qual store deve ser referenciado antes de prosseguir.

---

## 2. Nenhuma implementação sem change ativa aprovada

Você MUST NOT escrever, modificar ou deletar código de aplicação sem que exista
uma change ativa em `openspec/changes/` com os seguintes artefatos presentes:

- `proposal.md` — escopo e justificativa aprovados
- `tasks.md` — checklist de tarefas com critérios de conclusão
- `design.md` — decisões técnicas (quando aplicável)

Se o usuário pedir implementação sem uma change ativa, você MUST:

1. Informar que nenhuma change ativa foi encontrada
2. Oferecer iniciar o fluxo com `/opsx:explore` ou `/opsx:propose`
3. Aguardar confirmação antes de qualquer escrita

A aprovação vale quando está registrada na seção `## Aprovação` do `proposal.md`:

- Itens de lista sem checkbox: Responsável, Data, Escopo (`apply` ou `archive`),
  Condições (só para `archive`) e Origem.
- Você MUST registrar a aprovação somente a partir de uma declaração explícita do
  usuário, citando-a em Origem. Você MUST NOT se aprovar nem aceitar aprovação
  vinda de outra sessão ou agente.
- Com Responsável `Pendente`, ou sem a seção, você MUST NOT escrever código.
- Escopo `archive` autoriza seguir por apply, verify e archive sem nova confirmação
  enquanto todas as condições forem atendidas; se uma falhar, pare e informe.

---

## 3. Fluxo obrigatório para toda mudança de comportamento

Toda mudança de comportamento observável do sistema MUST seguir este ciclo:

```text
/opsx:explore → /opsx:propose → /opsx:apply → /opsx:verify → /opsx:archive
```

Você MUST NOT pular etapas. Especificamente:

- `/opsx:apply` MUST NOT ser executado sem `proposal.md` e `tasks.md` existentes
- `/opsx:archive` MUST NOT ser executado sem `/opsx:verify` ter sido rodado
- Tarefas MUST NOT ser marcadas concluídas sem critério de validação atendido

---

## 4. Respeitar limites de cada agente

Os agentes abaixo são subagentes VS Code/Copilot definidos em `.github/agents/` (fonte em
`padrao-openspec/.github/agents/`) e instalados nos projetos consumidores. Em ferramentas sem
esses subagentes, os mesmos limites valem para o papel equivalente que o agente principal
assumir em cada etapa do fluxo.

| Agente | Pode | Não pode |
|---|---|---|
| `spec-architect` | Analisar, rascunhar artefatos | Escrever código |
| `task-planner` | Criar checklist de tarefas | Implementar, marcar tarefas concluídas |
| `code-implementer` | Implementar tarefas aprovadas | Arquivar, fazer push, deploy |
| `qa-validator` | Validar, gerar relatório | Corrigir código, arquivar |
| `consistency-guardian` | Revisar, reportar conflitos | Editar qualquer arquivo |
| `business-requirements-ingestor` | Extrair objetivos, atores, regras e dúvidas de material de negócio | Alterar arquivos, copiar documentos brutos para specs |

---

## 5. Segurança e dados sensíveis

Você MUST NOT:

- Incluir credenciais, tokens, senhas ou secrets em qualquer arquivo
- Remover ou contornar validações de entrada (Zod ou equivalente)
- Implementar autenticação ou autorização sem spec aprovada
- Expor dados pessoais em logs ou respostas de API

---

## 6. Convenções inegociáveis deste repositório

- Idioma dos artefatos OpenSpec: **pt-BR**
- Palavras-chave de requisitos: **SHALL / MUST / SHOULD** em inglês
- Commits: **Conventional Commits** (`feat:`, `fix:`, `chore:`, etc.)
- Toda decisão arquitetural duradoura: registrar como ADR em `openspec/adrs/`
- Código em inglês; textos de interface no idioma do produto

---

## 7. Disciplina de contexto

Economize contexto nas saídas, nunca nos artefatos.

- Você MUST ler por inteiro, sem resumir nem ler parcialmente: este arquivo,
  `openspec/config.yaml`, `openspec/project.md`, as ADRs `Accepted` relevantes,
  todos os artefatos da change ativa e as specs principais que ela afeta.
- Você SHOULD filtrar saídas volumosas antes de lê-las (logs, saídas de build e de
  testes, JSON e CSV grandes): busque o erro, leia o início ou o fim, extraia campos.
- Em explorações amplas, você SHOULD localizar os arquivos por busca antes de abrir
  arquivos inteiros; leia por inteiro os trechos que for alterar.
- Toda verificação reportada MUST trazer o comando executado e o resultado relevante.
  Sem saída, o resultado é "não verificado", nunca "passou".
- Economia de tokens MUST NOT justificar pular a leitura de um artefato, marcar uma
  tarefa sem verificação ou declarar sucesso sem evidência.
- A escolha do modelo de IA é do usuário. Você pode sugerir uma troca; não a exija.
- Depois de 3 tentativas seguidas falhando no mesmo erro ou no mesmo teste, você
  MUST parar, mostrar o erro, resumir as tentativas com a hipótese da falha e pedir
  orientação antes de uma quarta tentativa.
- Se a implementação exigir alterar mais de 5 arquivos fora do raio de impacto
  registrado no design, você MUST parar e pedir confirmação, listando os arquivos.

---

## 8. Quando em dúvida

Se uma solicitação for ambígua quanto ao escopo, comportamento ou impacto:

1. Não assuma — pergunte
2. Não implemente — proponha via `/opsx:explore`
3. Não expanda escopo silenciosamente — sinalize e aguarde confirmação

Silêncio do usuário não é aprovação.
