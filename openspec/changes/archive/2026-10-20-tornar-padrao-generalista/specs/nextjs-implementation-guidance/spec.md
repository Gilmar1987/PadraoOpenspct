# Spec Delta

## REMOVED Requirements

### Requirement: Typecheck compatível com o Next.js 16

**Reason**: A skill `nextjs-implementation` foi removida (ADR-0003); o padrão não traz orientação de stack.

**Migration**: O comando de typecheck do projeto é registrado pelo `/opsx:init` na seção "Comandos de verificação" do `project.md`.

### Requirement: Modelo de renderização com cacheComponents

**Reason**: A skill `nextjs-implementation` foi removida (ADR-0003).

**Migration**: Projetos Next.js seguem a documentação da versão instalada e as skills oficiais do fornecedor, instaladas à parte.

### Requirement: Teste de Server Actions

**Reason**: A skill `nextjs-implementation` foi removida (ADR-0003).

**Migration**: A forma de testar cada cenário é decidida no `design.md` da change, com base nos comandos de verificação do `project.md`.

### Requirement: Cenários de interface sem E2E

**Reason**: A orientação deixa de ser exclusiva do Next.js; o requisito "Precedência da decisão de testes" de `project-initialization` já a aplica a qualquer stack.

**Migration**: Nenhuma; o `config.yaml` gerado pelo init continua orientando a verificação em navegador versionada quando o projeto não tem E2E.

### Requirement: Atualização de versão de dependência existente

**Reason**: A skill `nextjs-implementation` foi removida (ADR-0003).

**Migration**: A subida de versão de uma dependência é registrada no design ou na tarefa da change, como qualquer decisão técnica.

### Requirement: Criação do app num repositório preparado

**Reason**: A skill `nextjs-implementation` foi removida (ADR-0003).

**Migration**: Quando um gerador de projeto recusa a pasta por causa de `.agents/`, `.github/` ou `openspec/`, gera-se o app numa pasta temporária e copiam-se os arquivos, como já descreve o README.
