# Tasks

## 1. Regras do repositório

- [x] 1.1 Acrescentar a seção "7. Disciplina de contexto" ao `openspec/rules.md` com o texto do D1 e renumerar "Quando em dúvida" para 8. Verificar com `grep -n "^## " openspec/rules.md` (oito seções, na ordem certa) e com o lint de Markdown da raiz sem issues.

## 2. Stores consumidores

- [x] 2.1 Acrescentar o parágrafo do D2 ao `context` de `padrao-openspec/openspec/config.yaml` e dos presets `dotnet`, `nextjs` e `dotnet-nextjs`, logo após o bloco "Inicialização do projeto". Verificar que o parágrafo extraído dos quatro arquivos é idêntico (`diff` entre as extrações) e que `openspec instructions proposal` com cada config exibe "Disciplina de contexto".
- [x] 2.2 Rodar localmente o passo "Configs base e presets carregam sem avisos" da CI. Verificar que sai com código 0.

## 3. Integração

- [x] 3.1 Rodar `openspec validate --all --strict` na raiz e em `padrao-openspec/` e o lint de Markdown nos dois. Verificar que todos saem com código 0.

## Workflow follow-up

- Rodar `/opsx:verify` e, depois da revisão do PR, `/opsx:archive`.
