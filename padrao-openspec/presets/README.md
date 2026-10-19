# Presets de stack

Pontos de partida para o store de um projeto que já sabe sua stack. Cada preset
substitui dois arquivos do store:

| Preset | `openspec/project.md` | `openspec/config.yaml` | Skill no repositório de código |
|---|---|---|---|
| `dotnet` | Arquiteturas usuais e opções de stack .NET na Stack Summary | Contexto .NET + regras base + regras de .NET | `--stack dotnet` |
| `nextjs` | Estrutura App Router e opções de stack Next.js na Stack Summary | Contexto Next.js + regras base + regras de Next.js | `--stack nextjs` |
| `dotnet-nextjs` | Back-end .NET, front-end Next.js e o contrato entre eles | Contexto das duas partes + regras base + regras de contrato de API | `--stack dotnet,nextjs` |

## Como aplicar

Use o setup interativo descrito em [Usar em um novo projeto](../README.md#usar-em-um-novo-projeto):
`node scripts/setup-project.mjs` pergunta a stack e aplica o preset, instala as
skills, os comandos `/opsx:*` e os agentes no repositório de código, registra o
store e declara-o no repositório de código.

Para aplicar só o preset, sem o script, copie os dois arquivos no store do projeto
antes de criar a primeira change:

```powershell
Copy-Item presets\dotnet\project.md openspec\project.md
Copy-Item presets\dotnet\config.yaml openspec\config.yaml
```

Depois, em qualquer dos dois caminhos:

1. Preencha a Stack Summary do `openspec/project.md` com as escolhas reais. O
   `config.yaml` do preset manda os agentes lerem as decisões de lá e perguntarem
   quando algo estiver `A definir`, por isso o contexto não lista opções.
2. Registre as decisões transversais (estilo de arquitetura, banco, autenticação)
   como ADRs em `openspec/adrs/`.

## Manutenção

Cada `config.yaml` de preset repete as regras do `openspec/config.yaml` base e
acrescenta as da stack. Ao mudar uma regra base, atualize os presets também: o CI
falha se um preset perder alguma regra base ou tiver uma regra que o OpenSpec
descarte.
