# Proposal

## Why

O teste de ponta a ponta (lote 2 do plano de correção) mostrou que a skill `nextjs-implementation` está desatualizada para o Next.js 16, que o `create-next-app` instala hoje:

- **O typecheck recomendado falha** num app recém-criado: `tsc --noEmit` dá `TS2304: Cannot find name 'LayoutProps'`, porque esses tipos vêm do `next typegen` (atrito 3).
- **A skill não conhece o `cacheComponents`,** que o `create-next-app` 16 liga por padrão (atrito 4):
  - uma leitura de arquivo ou banco sem cache precisa ser marcada e envolvida em `<Suspense>`;
  - um POST de formulário sem JavaScript não devolve a página inteira, então progressive enhancement e "testar a Server Action por HTTP" deixam de funcionar;
  - as rotas aparecem como PPR, e não como "dinâmicas".

  O design do teste precisou ser corrigido no meio do apply.
- **A regra "adicionar dependência só quando o design justifica"** não prevê subir a versão de uma dependência existente quando outra exige. Foi o caso do `@types/node` `^20` × vitest 5 (atrito 16).
- **A skill não diz o que fazer quando o `create-next-app` recusa** o repositório já preparado pelo setup (atrito 1, complementando o README tratado na `fix-setup-bootstrap`).

## What Changes

- **Typecheck:** a seção de comandos de validação passa a recomendar `next typegen && tsc --noEmit` quando o projeto usa Next.js 15.5 ou mais recente e não tem um script de typecheck.
- **Nova subseção "Rendering model in Next.js 16"** nas regras de implementação:
  - detectar `cacheComponents` no `next.config`;
  - marcar a leitura sem cache com a API que a versão instalada documenta e envolvê-la em `<Suspense>`;
  - registrar no design se o formulário funciona sem JavaScript;
  - nunca testar Server Action por POST HTTP cru; usar teste unitário da função extraída e um teste em navegador para o fluxo.
- **Tabela de cenários:** a linha de Server Action passa a citar o teste em navegador, e uma regra nova cobre cenários de interface quando o projeto decidiu não ter E2E.
- **Dependências:** a regra passa a permitir subir a versão de uma dependência existente quando outra exige, com o menor salto compatível, registrado no design ou na tarefa.
- **Criação do app:** a etapa de descoberta orienta o caso em que o `create-next-app` recusa a pasta: gerar numa pasta temporária, copiar sem `node_modules` e instalar.

### Fora do escopo

- Mudar a decisão do projeto sobre E2E ou a regra de E2E dos presets: fica para a change de alinhamento do init com os presets (lote 4).
- Orientação para versões do Next.js anteriores à 15.
- Instalar ou configurar Playwright.
- Mudar a skill `dotnet-implementation`.

## Capabilities

### New Capabilities

- `nextjs-implementation-guidance`: o que a skill de stack Next.js orienta sobre typecheck, modelo de renderização do Next.js 16, teste de Server Actions, versões de dependências e criação do app num repositório já preparado.

### Modified Capabilities

Nenhuma.

## Impact

- **Skill:** `padrao-openspec/.claude/skills/nextjs-implementation/SKILL.md` e o espelho em `.claude/skills/`, regenerado pelo sync.
- **CI:** nenhuma mudança. A skill é coberta pelo lint de Markdown do `padrao-openspec` e pelo sync.
- **Riscos:**
  - Dados pessoais, autenticação e dados: não se aplicam.
  - Não há configuração nova.
  - **Compatibilidade:** a orientação nova é condicionada à versão (15.5+ e `cacheComponents`), e projetos mais antigos continuam com a orientação atual.
  - **Precisão:** o nome da API que marca leitura sem cache muda entre versões, então a skill manda consultar a documentação embutida no pacote, em vez de fixar um nome.

## Aprovação

- Responsável: gilmar.campelo
- Data: 2026-10-19
- Escopo: archive
- Condições: `openspec validate --strict` passa; o verify termina sem críticos; a CI fica verde
- Origem: resposta do usuário no chat, "Até o archive, com condições (Recomendado)", ao pedido "faça na sequencia 1, 2, 3 e 4"
