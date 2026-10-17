# openspec-store-nextjs

Store OpenSpec para projetos web com Next.js 15 (App Router) + TypeScript.

## Neutro por design

Este store não impõe escolhas de UI, testes ou banco. Cada projeto define sua stack
no `openspec/config.yaml` e `openspec/project.md` ao iniciar.

## Como usar em um novo projeto

### 1. Registrar o store (uma vez por máquina)

```bash
openspec store setup nextjs --url https://github.com/<seu-usuario>/openspec-store-nextjs
```

### 2. Iniciar um novo projeto

```bash
mkdir meu-projeto && cd meu-projeto
openspec init --store nextjs
```

### 3. Configurar a stack do projeto

Abra `openspec/project.md` e preencha:
- Visão do produto
- Arquitetura escolhida
- Stack específica (UI, banco, auth, testes)

Abra `openspec/config.yaml` e ajuste o `context` substituindo os comentários
pelas escolhas reais do projeto (ex: "Tailwind CSS" em vez de "<!-- Tailwind / CSS Modules -->").

### 4. Iniciar o fluxo de desenvolvimento

```bash
# Explorar e planejar
/opsx:explore

# Criar uma proposta de change
/opsx:propose add-nome-da-feature

# Implementar
/opsx:apply

# Arquivar após validação
/opsx:archive
```

## Estrutura

```
openspec-store-nextjs/
├── openspec/
│   ├── config.yaml       # Convenções e opções de stack Next.js
│   ├── project.md        # Template de visão do projeto
│   ├── specs/            # Fonte da verdade (preenchida após archives)
│   ├── changes/          # Changes em andamento
│   └── schemas/          # Schemas customizados
└── .claude/
    ├── commands/opsx/    # Slash commands
    └── skills/           # Skills dos agentes
```
