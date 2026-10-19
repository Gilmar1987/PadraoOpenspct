# Tasks

## 1. Apply

- [x] 1.1 Acrescentar o marcador "Confirm progress per task group" (comando e skill de apply) ao passo "Trechos customizados das skills" de `.github/workflows/validate.yml`. Verificar rodando o passo localmente: ele deve falhar, citando os dois trechos ausentes.
- [x] 1.2 Trocar a linha de confirmação por tarefa pelo texto do D1 em `padrao-openspec/.claude/commands/opsx/apply.md` e `padrao-openspec/.claude/skills/openspec-apply-change/SKILL.md`. Verificar comparando os trechos com `diff` e o passo da 1.1 passando.

## 2. Quebras de linha

- [x] 2.1 Criar `.gitattributes` na raiz com o conteúdo do D2. Verificar que `git add --renormalize .` não deixa nenhuma alteração além do próprio `.gitattributes`.

## 3. Documentação e integração

- [x] 3.1 Acrescentar ao `README.md` a seção "Desempenho e ambiente" (D3) e o trecho customizado novo na tabela de manutenção. Verificar com o lint da raiz sem issues.
- [x] 3.2 Rodar `node padrao-openspec/scripts/sync-root.mjs`, `openspec validate --all --strict`, o lint nos dois lugares e o passo de trechos customizados. Verificar que todos saem com código 0.
