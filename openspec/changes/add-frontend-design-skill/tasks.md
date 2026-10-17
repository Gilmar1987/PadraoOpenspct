# Tasks

## 1. Instalador

- [x] 1.1 Transformar `officialSkills` em lista em `padrao-openspec/scripts/install-skills.mjs`, acrescentar a `frontend-design` à stack `nextjs` e imprimir uma linha por recomendação (D1). Verificar que `--stack nextjs` exibe as duas linhas, que `--stack dotnet` não cita `frontend-design` e que, sem `--stack`, não aparece nenhuma recomendação.
- [x] 1.2 Acrescentar ao smoke test do instalador em `.github/workflows/validate.yml` os três cenários da spec, incluindo a ausência da pasta `frontend-design` no consumidor. Verificar rodando o passo localmente no Git Bash.

## 2. Skill nextjs-implementation

- [x] 2.1 Atualizar `padrao-openspec/.claude/skills/nextjs-implementation/SKILL.md`: citar a `frontend-design` em "Relationship with other skills" e registrar o plano visual no item **Design** da seção "2. Planning" (D2). Verificar com `grep -n "frontend-design"`, que deve encontrar as duas seções, e com o lint de Markdown de `padrao-openspec/` sem issues.
- [x] 2.2 Rodar `node padrao-openspec/scripts/sync-root.mjs` e verificar que `--check` sai com código 0.

## 3. Documentação

- [x] 3.1 Incluir a `frontend-design` na tabela de skills oficiais externas do `README.md` e do `padrao-openspec/README.md`, com o comando de instalação e a licença. Verificar com `grep` nos dois arquivos e com o lint da raiz e de `padrao-openspec/` sem issues.

## 4. Integração

- [x] 4.1 Rodar `openspec validate --all --strict` na raiz e os passos dos jobs `store` e `root` da CI que esta change afeta (lint, smoke test do instalador e sync). Verificar que todos saem com código 0.

## Workflow follow-up

- Rodar `/opsx:verify` e, depois da revisão do PR, `/opsx:archive`.
