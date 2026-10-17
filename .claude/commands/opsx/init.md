---
name: "OPSX: Init"
description: "Inicializa um projeto novo: conduz entrevista estruturada, registra todas as decisões e gera o documento de setup do projeto."
allowed-tools: Bash(openspec:*), Read, Write
category: "Workflow"
tags: ["workflow", "init", "setup", "initialization"]
---

Você está no modo de inicialização do projeto. Seu papel é conduzir uma entrevista estruturada com o desenvolvedor, registrar todas as decisões e gerar os artefatos de configuração do projeto.

**IMPORTANTE:** Este comando só deve ser executado uma vez, no início do projeto. Se `openspec/project.md` já estiver preenchido sem placeholders, avise o dev e pergunte se deseja revisar as configurações existentes antes de continuar.

---

## Regras da entrevista

- Faça **uma pergunta por vez**. Nunca agrupe perguntas.
- Cada pergunta apresenta **5 opções numeradas** + **opção 6: Outro (digitar livremente)**.
- Quando o dev escolher 6, peça a resposta livre e registre exatamente o que ele digitou.
- Algumas perguntas aceitam **múltipla escolha** — indique claramente quando for o caso (ex: "Escolha uma ou mais opções").
- Perguntas marcadas com `[OPCIONAL]` podem ser respondidas com `0` para pular.
- Mantenha um registro interno de todas as respostas durante a conversa.
- Não avance para o próximo bloco sem confirmar o bloco atual.
- Ao final de cada bloco, exiba um resumo das respostas do bloco e pergunte: **"Confirma este bloco? [s/n]"**. Se o dev responder `n`, volte ao início do bloco.
- Ao final de todos os blocos, exiba o resumo completo e solicite confirmação final + nome do dev.

---

## Bloco 1 — Projeto e Negócio

> Antes de qualquer decisão técnica, precisamos entender o produto.

**1.1 — Qual é o nome do projeto?**
_(Resposta livre — digite o nome)_

---

**1.2 — Como você descreveria o produto em uma frase?**
_(Resposta livre — descreva o que o produto faz, para quem e qual problema resolve)_

---

**1.3 — Qual é o público-alvo principal?**

```
1) Usuários finais (B2C) — pessoas físicas usando diretamente
2) Empresas (B2B) — times ou organizações como clientes
3) Desenvolvedores/APIs (B2D) — produto técnico ou plataforma
4) Uso interno (interno) — ferramenta para a própria equipe
5) Misto (ex: B2B2C — empresa contrata, usuário final usa)
6) Outro (digitar livremente)
```

---

**1.4 — Qual é o volume esperado no lançamento (MVP)?**

```
1) Pequeno — até 100 usuários ativos / até 10k req/dia
2) Médio — até 1.000 usuários ativos / até 100k req/dia
3) Grande — até 10.000 usuários ativos / até 1M req/dia
4) Escala — acima de 10.000 usuários ativos
5) Ainda não sei — priorizar simplicidade agora
6) Outro (digitar livremente)
```

---

**1.5 — O produto lida com dados pessoais ou sensíveis (LGPD/GDPR)?**

```
1) Sim — coleta e processa dados pessoais (nome, e-mail, CPF, etc.)
2) Sim — coleta dados sensíveis (saúde, biometria, financeiro, etc.)
3) Sim — ambos (pessoais e sensíveis)
4) Não — nenhum dado pessoal ou sensível
5) Ainda não sei — avaliar durante o desenvolvimento
6) Outro (digitar livremente)
```

---

**1.6 — O produto é multi-tenant (múltiplos clientes/organizações isolados)?**

```
1) Sim — isolamento por schema de banco (schema-per-tenant)
2) Sim — isolamento por coluna (tenant_id em todas as tabelas)
3) Sim — isolamento por banco separado (database-per-tenant)
4) Não — produto single-tenant ou uso interno
5) Ainda não sei
6) Outro (digitar livremente)
```

---

**1.7 — Quais idiomas o produto precisa suportar?**
_(Múltipla escolha — separe os números por vírgula, ex: 1,3)_

```
1) Português (pt-BR)
2) Inglês (en-US)
3) Espanhol (es)
4) Apenas um idioma (sem i18n)
5) Ainda não sei
6) Outro (digitar livremente)
```

---

**1.8 — O produto precisa funcionar offline ou tem requisitos de PWA?**

```
1) Não — sempre conectado
2) Sim — funcionalidades básicas offline (PWA com cache)
3) Sim — sincronização offline-first completa
4) Aplicativo nativo (não é web)
5) Ainda não sei
6) Outro (digitar livremente)
```

---

> **Resumo do Bloco 1** — exiba todas as respostas e pergunte: **"Confirma este bloco? [s/n]"**

---

## Bloco 2 — Arquitetura

> Decisões estruturais que afetam toda a base de código.

**2.1 — Qual é o estilo de arquitetura do back-end?**

```
1) Monólito modular — um único deploy, módulos isolados por capability
2) Clean Architecture — camadas Domain / Application / Infrastructure / API
3) Vertical Slice — organização por feature, cada fatia com seu handler
4) Microsserviços — serviços independentes com deploy separado
5) Serverless — funções stateless (Lambda, Azure Functions, Vercel Functions)
6) Outro (digitar livremente)
```

---

**2.2 — Como o código será organizado em repositórios?**

```
1) Monorepo — front-end e back-end no mesmo repositório
2) Multi-repo — um repositório por serviço ou camada
3) Apenas back-end (sem front-end próprio)
4) Apenas front-end (consome APIs externas)
5) Ainda não sei
6) Outro (digitar livremente)
```

---

**2.3 — Como as regras de negócio serão organizadas?**

```
1) Serviços de domínio — classes de serviço com lógica de negócio
2) Casos de uso / Commands & Queries (CQRS) — um handler por operação
3) Domain Model rico — entidades com comportamento (DDD)
4) Procedural — lógica diretamente nos handlers/controllers
5) Ainda não sei — decidir na primeira change
6) Outro (digitar livremente)
```

---

**2.4 — Como a comunicação entre módulos/serviços será feita?**

```
1) Chamada direta (in-process) — módulos no mesmo processo
2) REST/HTTP — chamadas HTTP entre serviços
3) Mensageria assíncrona — filas ou eventos (RabbitMQ, Kafka, SQS)
4) gRPC — comunicação binária de alta performance
5) Misto — síncrono para leitura, assíncrono para escrita
6) Outro (digitar livremente)
```

---

**2.5 — O sistema precisa de jobs ou processamento em background?**

```
1) Não — apenas requisições síncronas
2) Sim — jobs agendados (cron)
3) Sim — filas de tarefas assíncronas
4) Sim — ambos (cron + filas)
5) Ainda não sei
6) Outro (digitar livremente)
```

---

> **Resumo do Bloco 2** — exiba todas as respostas e pergunte: **"Confirma este bloco? [s/n]"**

---

## Bloco 3 — Stack Técnica

> Tecnologias concretas que serão usadas no projeto.

**3.1 — Qual é a linguagem e framework principal do back-end?**

```
1) TypeScript + Node.js (Express, Fastify, Hono)
2) C# + .NET (Minimal API, Web API, Blazor)
3) Python (FastAPI, Django, Flask)
4) Java / Kotlin (Spring Boot)
5) Go (Gin, Echo, Fiber)
6) Outro (digitar livremente)
```

---

**3.2 — Qual é o framework do front-end?** `[OPCIONAL — responda 0 se não houver front-end]`

```
0) Não há front-end próprio
1) Next.js (React — App Router ou Pages Router)
2) React puro (Vite + React Router)
3) Vue.js (Nuxt ou Vite)
4) Angular
5) Blazor (WebAssembly ou Server)
6) Outro (digitar livremente)
```

---

**3.3 — Qual banco de dados será usado?**

```
1) PostgreSQL
2) MySQL / MariaDB
3) SQL Server
4) SQLite (desenvolvimento local ou produto embarcado)
5) MongoDB
6) Outro (digitar livremente)
```

---

**3.4 — O banco será gerenciado (cloud) ou self-hosted?**

```
1) Gerenciado na cloud — Neon, Supabase, PlanetScale, RDS, Azure SQL
2) Self-hosted em contêiner — Docker local e em produção
3) Self-hosted em VM/servidor dedicado
4) Local apenas (SQLite ou desenvolvimento)
5) Ainda não sei
6) Outro (digitar livremente)
```

---

**3.5 — Qual ORM ou biblioteca de acesso a dados será usada?**

```
1) Prisma (TypeScript)
2) Drizzle (TypeScript)
3) Entity Framework Core (.NET)
4) Dapper (.NET)
5) SQLAlchemy (Python)
6) Outro (digitar livremente)
```

---

**3.6 — Qual será a estratégia de autenticação?**

```
1) JWT Bearer — token stateless, validado em cada requisição
2) Sessão + cookie — stateful, armazenado no servidor
3) OAuth2 / OpenID Connect — provedor externo (Google, GitHub, Entra ID)
4) Auth.js / NextAuth — integrado ao Next.js
5) Serviço gerenciado — Clerk, Auth0, Supabase Auth, Firebase Auth
6) Outro (digitar livremente)
```

---

**3.7 — Como a validação de entrada será feita?**

```
1) Zod (TypeScript)
2) Valibot (TypeScript)
3) FluentValidation (.NET)
4) Pydantic (Python)
5) Validação manual / Data Annotations
6) Outro (digitar livremente)
```

---

**3.8 — Se houver jobs/filas (respondido no 2.5), qual biblioteca será usada?** `[OPCIONAL]`

```
0) Não aplicável
1) pg-boss (PostgreSQL como fila)
2) BullMQ (Redis)
3) Inngest (cloud-native, serverless-friendly)
4) Trigger.dev
5) Hangfire (.NET)
6) Outro (digitar livremente)
```

---

**3.9 — Como o envio de e-mails será feito?** `[OPCIONAL]`

```
0) Não aplicável
1) Resend
2) SendGrid
3) Amazon SES
4) SMTP próprio / Nodemailer
5) Mailgun
6) Outro (digitar livremente)
```

---

**3.10 — Haverá armazenamento de arquivos?** `[OPCIONAL]`

```
0) Não aplicável
1) Amazon S3
2) Azure Blob Storage
3) Google Cloud Storage
4) Cloudflare R2
5) Sistema de arquivos local (apenas dev)
6) Outro (digitar livremente)
```

---

> **Resumo do Bloco 3** — exiba todas as respostas e pergunte: **"Confirma este bloco? [s/n]"**

---

## Bloco 4 — Infraestrutura e Deploy

> Como o sistema será executado e entregue.

**4.1 — Qual será o ambiente de deploy em produção?**

```
1) Vercel (ideal para Next.js)
2) AWS (EC2, ECS, Lambda, App Runner)
3) Azure (App Service, AKS, Container Apps)
4) Google Cloud (Cloud Run, GKE)
5) VPS / servidor dedicado (DigitalOcean, Hetzner, Linode)
6) Outro (digitar livremente)
```

---

**4.2 — O sistema será containerizado com Docker?**

```
1) Sim — Docker em produção e desenvolvimento local
2) Sim — Docker apenas em produção
3) Sim — Docker apenas em desenvolvimento local (docker-compose)
4) Não — deploy direto sem contêiner
5) Kubernetes em produção (com Docker nas imagens)
6) Outro (digitar livremente)
```

---

**4.3 — Quais ambientes existirão além de produção?**
_(Múltipla escolha — separe os números por vírgula)_

```
1) Development (local)
2) Staging / Homologação
3) QA / Testes
4) Preview (por PR/branch)
5) Apenas produção
6) Outro (digitar livremente)
```

---

**4.4 — Como as variáveis de ambiente e secrets serão gerenciadas?**

```
1) .env local + cofre em produção (AWS Secrets Manager, Azure Key Vault)
2) .env local + variáveis de ambiente da plataforma (Vercel, Railway)
3) HashiCorp Vault
4) Doppler
5) Apenas .env (projetos simples ou internos)
6) Outro (digitar livremente)
```

---

**4.5 — O sistema precisa de CDN ou cache de borda?**

```
1) Sim — Cloudflare (CDN + proteção DDoS)
2) Sim — AWS CloudFront
3) Sim — Vercel Edge Network (embutido)
4) Não — sem CDN por enquanto
5) Ainda não sei
6) Outro (digitar livremente)
```

---

> **Resumo do Bloco 4** — exiba todas as respostas e pergunte: **"Confirma este bloco? [s/n]"**

---

## Bloco 5 — Processo e Qualidade

> Como o time vai trabalhar e garantir a qualidade do código.

**5.1 — Qual será a estratégia de branches no Git?**

```
1) Trunk-based — commits direto na main, feature flags para isolamento
2) GitHub Flow — branches de feature curtas, PR para main
3) Git Flow — branches develop, release, hotfix
4) Apenas main — projeto solo ou protótipo
5) Ainda não sei
6) Outro (digitar livremente)
```

---

**5.2 — Haverá CI/CD automatizado?**

```
1) Sim — GitHub Actions
2) Sim — GitLab CI
3) Sim — Azure DevOps Pipelines
4) Sim — outro (digitar livremente na opção 6)
5) Não — deploy manual por enquanto
6) Outro (digitar livremente)
```

---

**5.3 — Quais verificações automáticas rodarão no CI?**
_(Múltipla escolha — separe os números por vírgula)_

```
1) Lint (ESLint, dotnet format, Ruff, etc.)
2) Typecheck (tsc --noEmit, compilação .NET)
3) Testes unitários
4) Testes de integração
5) Testes E2E
6) Outro (digitar livremente)
```

---

**5.4 — Qual framework de testes unitários será usado?**

```
1) Vitest (TypeScript/JavaScript)
2) Jest (TypeScript/JavaScript)
3) xUnit (.NET)
4) NUnit (.NET)
5) Pytest (Python)
6) Outro (digitar livremente)
```

---

**5.5 — Qual framework de testes E2E será usado?** `[OPCIONAL]`

```
0) Não aplicável — sem testes E2E por enquanto
1) Playwright
2) Cypress
3) Selenium
4) Puppeteer
5) Testcontainers (integração de banco/serviços)
6) Outro (digitar livremente)
```

---

**5.6 — Qual será a cobertura mínima de testes exigida?**

```
1) 80% nos módulos de domínio e regras de negócio
2) 70% geral no projeto
3) 90% nos módulos críticos (pagamento, auth, dados sensíveis)
4) Sem cobertura mínima definida por enquanto
5) 100% nos módulos de domínio (TDD estrito)
6) Outro (digitar livremente)
```

---

**5.7 — Pull Request exige revisão de código?**

```
1) Sim — ao menos 1 aprovação obrigatória
2) Sim — ao menos 2 aprovações obrigatórias
3) Sim — aprovação + CI verde obrigatórios
4) Não — merge direto permitido
5) Projeto solo — sem PR obrigatório
6) Outro (digitar livremente)
```

---

> **Resumo do Bloco 5** — exiba todas as respostas e pergunte: **"Confirma este bloco? [s/n]"**

---

## Bloco 6 — Observabilidade e Segurança

> Como o sistema será monitorado e como dados sensíveis serão protegidos.

**6.1 — Como os logs serão gerenciados?**

```
1) Console / stdout — coletado pela plataforma (Vercel, Railway, ECS)
2) Datadog
3) Grafana Loki
4) AWS CloudWatch
5) Azure Monitor / Application Insights
6) Outro (digitar livremente)
```

---

**6.2 — Haverá monitoramento de erros em tempo real?**

```
1) Sentry
2) Datadog APM
3) Bugsnag
4) Rollbar
5) Não — apenas logs por enquanto
6) Outro (digitar livremente)
```

---

**6.3 — Haverá rastreamento distribuído (tracing)?** `[OPCIONAL]`

```
0) Não aplicável — sistema simples ou monólito sem necessidade
1) OpenTelemetry (agnóstico de backend)
2) Datadog APM
3) AWS X-Ray
4) Jaeger
5) Ainda não sei
6) Outro (digitar livremente)
```

---

**6.4 — Como a proteção contra ataques será feita?**
_(Múltipla escolha — separe os números por vírgula)_

```
1) Rate limiting por IP / usuário
2) Bloqueio após N tentativas de login falhas
3) CSRF protection (formulários e mutations)
4) Helmet / headers de segurança HTTP
5) WAF (Web Application Firewall) — Cloudflare, AWS WAF
6) Outro (digitar livremente)
```

---

**6.5 — Se o produto lida com LGPD/GDPR (respondido no 1.5), quais controles serão implementados?** `[OPCIONAL]`

```
0) Não aplicável
1) Consentimento explícito com registro de aceite
2) Direito de exclusão de dados (right to erasure)
3) Exportação de dados do usuário (portabilidade)
4) Anonimização de dados em logs e relatórios
5) Todos os anteriores
6) Outro (digitar livremente)
```

---

**6.6 — Como os dados em repouso serão protegidos?**

```
1) Criptografia gerenciada pela plataforma (RDS, Azure SQL)
2) Criptografia de campos sensíveis na aplicação (ex: CPF, cartão)
3) Banco self-hosted sem criptografia adicional
4) Não aplicável — sem dados sensíveis
5) Ainda não sei
6) Outro (digitar livremente)
```

---

> **Resumo do Bloco 6** — exiba todas as respostas e pergunte: **"Confirma este bloco? [s/n]"**

---

## Confirmação Final e Geração do Documento

Após todos os blocos confirmados:

1. Exiba o **resumo completo** de todas as decisões organizadas por bloco.

2. Pergunte:
   ```
   Todas as escolhas estão corretas?
   Digite seu nome completo para registrar a inicialização do projeto: _
   ```

3. Aguarde a confirmação e o nome.

4. Gere os seguintes arquivos:

### Arquivo 1: `openspec/project-setup.md`

```markdown
# Registro de Inicialização — {{Nome do Projeto}}

**Responsável:** {{nome do dev}}
**Data:** {{data atual}}
**Comando:** /opsx:init

---

## 1. Projeto e Negócio

| Decisão | Escolha |
|---|---|
| Nome | {{resposta 1.1}} |
| Visão | {{resposta 1.2}} |
| Público-alvo | {{resposta 1.3}} |
| Volume esperado (MVP) | {{resposta 1.4}} |
| LGPD/GDPR | {{resposta 1.5}} |
| Multi-tenant | {{resposta 1.6}} |
| Idiomas | {{resposta 1.7}} |
| Offline/PWA | {{resposta 1.8}} |

## 2. Arquitetura

| Decisão | Escolha |
|---|---|
| Estilo de arquitetura | {{resposta 2.1}} |
| Organização de repositórios | {{resposta 2.2}} |
| Organização das regras de negócio | {{resposta 2.3}} |
| Comunicação entre módulos | {{resposta 2.4}} |
| Jobs / background processing | {{resposta 2.5}} |

## 3. Stack Técnica

| Decisão | Escolha |
|---|---|
| Back-end | {{resposta 3.1}} |
| Front-end | {{resposta 3.2}} |
| Banco de dados | {{resposta 3.3}} |
| Banco — hospedagem | {{resposta 3.4}} |
| ORM / acesso a dados | {{resposta 3.5}} |
| Autenticação | {{resposta 3.6}} |
| Validação | {{resposta 3.7}} |
| Jobs / filas | {{resposta 3.8}} |
| E-mail | {{resposta 3.9}} |
| Armazenamento de arquivos | {{resposta 3.10}} |

## 4. Infraestrutura e Deploy

| Decisão | Escolha |
|---|---|
| Ambiente de produção | {{resposta 4.1}} |
| Docker | {{resposta 4.2}} |
| Ambientes | {{resposta 4.3}} |
| Secrets / variáveis de ambiente | {{resposta 4.4}} |
| CDN / cache de borda | {{resposta 4.5}} |

## 5. Processo e Qualidade

| Decisão | Escolha |
|---|---|
| Estratégia de branches | {{resposta 5.1}} |
| CI/CD | {{resposta 5.2}} |
| Verificações no CI | {{resposta 5.3}} |
| Testes unitários | {{resposta 5.4}} |
| Testes E2E | {{resposta 5.5}} |
| Cobertura mínima | {{resposta 5.6}} |
| Revisão de código | {{resposta 5.7}} |

## 6. Observabilidade e Segurança

| Decisão | Escolha |
|---|---|
| Logs | {{resposta 6.1}} |
| Monitoramento de erros | {{resposta 6.2}} |
| Tracing distribuído | {{resposta 6.3}} |
| Proteção contra ataques | {{resposta 6.4}} |
| Controles LGPD/GDPR | {{resposta 6.5}} |
| Dados em repouso | {{resposta 6.6}} |

---

> Documento gerado automaticamente pelo comando `/opsx:init`.
> Para revisar as decisões, edite este arquivo e atualize `openspec/project.md` e `openspec/config.yaml`.
```

### Arquivo 2: `openspec/project.md`

Preencha o template do preset ativo com todas as escolhas confirmadas. Substitua todos os campos "A definir" e "{{Nome do Projeto}}" pelos valores reais. Mantenha a estrutura do template — apenas preencha os valores.

### Arquivo 3: `openspec/config.yaml`

Atualize o campo `context:` com as decisões reais de stack, arquitetura e convenções. Remova o bloco `Inicialização do projeto` após a conclusão — ele não é mais necessário.

---

## Próximos passos (exibir ao final)

```
Inicialização concluída. Próximos passos:

  1. Revise openspec/project.md e complete os campos de domínio e capabilities.
  2. Registre decisões transversais como ADRs em openspec/adrs/.
  3. Faça commit dos artefatos gerados:
       git add openspec/
       git commit -m "chore: initialize project setup"
  4. Quando tiver uma funcionalidade para especificar, rode /opsx:explore.
```
