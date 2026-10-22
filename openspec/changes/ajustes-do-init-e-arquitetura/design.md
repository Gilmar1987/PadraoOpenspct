# Design

## Context

- `init.md:832` manda **trocar** no `operations.apply.guidance` "a exigência de teste E2E" quando a 5.5 é "0) Não aplicável". O `padrao-openspec/openspec/config.yaml` neutro (linhas 58-63) não tem linha de E2E; ela existia nos presets de stack removidos pela ADR-0003 (`fef82be`).
- O `project.md` neutro tem, em "Development Conventions", os campos "Idioma do código", "Idioma dos textos visíveis ao usuário", "Organização e estilo", "Git e revisão", "Testes e critérios de qualidade" e "Segurança e tratamento de dados". A 1.7 pergunta os idiomas do produto, e a 7.2 (`init.md:676`) só os campos da Stack Summary.
- A 3.8 (`init.md:323-334`) tem a opção "1) pg-boss / BullMQ (Node.js)". O pg-boss só funciona com PostgreSQL.
- O init gera quatro artefatos (`project-setup.md`, `project.md`, `config.yaml` e as ADRs), com os modelos dentro do próprio `init.md`. O `project.md` neutro tem a seção "Architecture" com a subseção "Componentes e limites".
- A spec "Opções de stack de vários ecossistemas" exige opções de pelo menos três ecossistemas na pergunta de jobs.

## Architecture Decisions

Não há ADR nova: a change ajusta a entrevista e acrescenta um artefato de documentação ao que o init já gera. O `arquitetura.md` resume decisões que continuam nas ADRs; a regra "mudança de arquitetura vira ADR" não muda.

## Goals / Non-Goals

**Goals:**

- Uma entrevista como a do Lava Jato termina sem campos "Adiado" por falta de pergunta, sem incoerência entre fila e banco e com um documento de arquitetura legível.

**Non-Goals:**

- Manter o `arquitetura.md` atualizado automaticamente depois do init.

## Decisions

### D1. E2E no config (b)

Em "Arquivo 3", o parágrafo da decisão de testes passa a dizer: "acrescente ao `operations.apply.guidance`, depois das linhas do config base":

- com um framework na 5.5: "Cobrir os cenários de interface com testes E2E em <framework da 5.5>, rodados pelo comando de testes registrado.";
- com "0) Não aplicável": o texto atual do roteiro de verificação em navegador.

"Se já houver uma linha sobre E2E (por exemplo, num store antigo), substitua-a em vez de duplicar."

### D2. Idioma do código e Development Conventions (c)

Nova pergunta no bloco 7, depois da 7.2:

```text
**7.3 — Em que idioma o código será escrito (identificadores, comentários e mensagens de commit)?**

1) Inglês em tudo
2) Português em tudo
3) Inglês no código e português nos comentários e commits
4) Inglês no código e nos commits, português nos comentários
5) Seguir o idioma da stack ou do time existente (descreva no complemento)
6) Outro (digitar livremente)
```

A 7.2 passa a valer também para os campos de Development Conventions que continuarem sem resposta. Mapa dos campos:

- "Idioma dos textos visíveis ao usuário" vem da 1.7;
- "Git e revisão" vem do bloco 5;
- "Testes e critérios de qualidade" vem de 5.3 a 5.6;
- "Segurança e tratamento de dados" vem do bloco 6 e da 1.5;
- "Organização e estilo" vem de 2.2 e 2.3.

Só o que sobrar é perguntado. O "Arquivo 2" registra a 7.3 em "Idioma do código".

### D3. Opções da 3.8 (d)

```text
**3.8 — Se houver jobs/filas (respondido no 2.5), qual tipo de fila será usado?** `[OPCIONAL]`

_(Dê exemplos compatíveis com a linguagem da 3.1 e o banco da 3.3.)_

0) Não aplicável
1) Fila no próprio banco (pg-boss no PostgreSQL, Hangfire com SQL Server, tabela de jobs em qualquer banco)
2) Fila em Redis (BullMQ no Node.js, RQ ou Celery no Python, Sidekiq no Ruby)
3) Broker dedicado (RabbitMQ, Kafka, Azure Service Bus)
4) Agendamento simples (cron do sistema ou do provedor de deploy)
5) Serviço gerenciado (Inngest, Trigger.dev, filas da cloud)
6) Outro (digitar livremente)
```

São mais de três ecossistemas nos exemplos (Node.js, Python, Ruby, .NET), como a spec exige. Linha nova na checagem de coerência:

| Combinação | Consequência | Proposta |
|---|---|---|
| 3.8 cita uma biblioteca presa a um banco (por exemplo, pg-boss) e 3.3 é outro banco | A fila exige um banco que o projeto não tem | Fila no banco da 3.3 (tabela de jobs, Hangfire etc.), ou registrar o banco extra na 3.3 e no deploy |

A nota de compatibilidade de arquivos de respostas: a opção 1 antiga (pg-boss/BullMQ) passa a se dividir entre 1 e 2; o CHANGELOG registra a mudança de numeração.

### D4. Documento de arquitetura

"Arquivo 5: `<root>/openspec/arquitetura.md`", gerado depois das ADRs (para poder linká-las), com este modelo:

````markdown
# Arquitetura — {{Nome do Projeto}}

> Gerado pelo /opsx:init em {{data}}. Mantenha em dia: toda mudança de arquitetura vira ADR
> (openspec/adrs/) e é refletida aqui na mesma change.

## Visão geral
{{1.2, em 2 ou 3 frases, e o público da 1.3}}

## Estilo e organização
- Estilo: {{2.1}}
- Repositórios: {{2.2}}
- Regras de negócio: {{2.3}}

## Componentes
| Componente | Tecnologia | Responsabilidade |
|---|---|---|
{{uma linha por componente escolhido: front-end (3.2), back-end (3.1), banco (3.3/3.4),
acesso a dados (3.5), autenticação (3.6), jobs (2.5/3.8), e-mail (3.9), arquivos (3.10);
omita o que for "Não aplicável"}}

## Comunicação
{{2.4: como os componentes se falam; integrações externas citadas nas respostas}}

## Diagrama
```mermaid
flowchart LR
  {{só os componentes da tabela acima e as setas de comunicação da 2.4}}
```

## Dados
- Banco: {{3.3}}, {{3.4}}; acesso: {{3.5}}
- Dados pessoais: {{1.5}}; controles: {{6.5}}; em repouso: {{6.6}}

## Infraestrutura e deploy
{{bloco 4: ambientes, onde roda, configuração e segredos}}

## Observabilidade e segurança
{{6.1 a 6.4}}

## Decisões
| ADR | Decisão |
|---|---|
{{uma linha por ADR gerada, com link relativo: [0001](adrs/0001-...md)}}

## Pontos adiados
{{respostas "Adiado" e pontos mantidos na checagem de coerência; "Nenhum" se não houver}}
````

- O bloco Mermaid fica aninhado no modelo; no `init.md`, o modelo usa uma cerca de quatro crases para conter a cerca de três.
- "Arquivo 2" passa a dizer que a seção "Architecture" do `project.md` traz um resumo de 3 a 5 linhas e o link `[Arquitetura detalhada](arquitetura.md)`; o `project.md` neutro troca o comentário da seção por esse lembrete.
- "Próximos passos" do init: o item 2 passa a citar também o `arquitetura.md`, e o item 5 passa a dizer "registrada como nova ADR e refletida no `arquitetura.md`".

### D5. CI

No passo "Trechos customizados das skills", o job `store` confere no `commands/opsx/init.md`:

- `arquitetura.md`;
- `**7.3 — Em que idioma o código será escrito`;
- `Fila no próprio banco`;
- `acrescente ao \`operations.apply.guidance\``.

O passo segue o mesmo padrão de `grep -qF` dos trechos atuais.

### D6. Versão

`1.3.2`, como pedido. Nota: pelo semver da ADR-0004, um artefato novo gerado é uma funcionalidade, o que pediria `1.4.0`. A escolha final é do responsável, na aprovação. "Ações no projeto":

- "Nenhuma obrigatória.";
- "Projetos já inicializados podem pedir ao agente que gere `openspec/arquitetura.md` a partir do `project-setup.md`, seguindo o 'Arquivo 5' do `.claude/commands/opsx/init.md`.";
- "Arquivos de respostas com a 3.8: a numeração das opções mudou."

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/.claude/commands/opsx/init.md` | D1–D4 | cópia da raiz (sync-root), instalador |
| `padrao-openspec/openspec/project.md` | D4 (seção Architecture) | smoke do setup (compara o project.md com o neutro) |
| `.github/workflows/validate.yml` | D5 | nenhum |
| `padrao-openspec/VERSION`, `CHANGELOG.md` | D6 | passo "Versão e changelog" |

## Risks / Trade-offs

- [O `arquitetura.md` envelhecer depois do init] → o cabeçalho do documento e o item 5 dos próximos passos pedem para atualizá-lo junto com cada ADR de arquitetura.
- [Diagrama inventado] → o modelo restringe o diagrama aos componentes da tabela, e a spec cobre o caso "Componente não escolhido".
- [Duplicação com o `project.md`] → o `project.md` fica com um resumo e o link.

## Migration Plan

Nenhuma migração. Rollback: reverter os commits.

## Open Questions

Nenhuma; a versão (1.3.2 ou 1.4.0) é decidida na aprovação.
