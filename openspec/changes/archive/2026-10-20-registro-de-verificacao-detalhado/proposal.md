# Proposal

## Why

No teste de ponta a ponta com Django (controleCondominio, 2026-10-19), o `/opsx:verify` gravou um `verification.md` com "Sugestões: 3" e "Não verificado: —". As três sugestões, os comandos executados e as evidências reaproveitadas ficaram só no chat da sessão (A21). Depois do archive, quem lê o registro não sabe o que foi apontado nem como foi verificado, o que contraria a regra 7 do `rules.md` ("toda verificação reportada MUST trazer o comando executado e o resultado relevante"). O "Não verificado: —" também escondeu que o roteiro de navegador tinha sido executado por um script fora do repositório, que a heurística "Evidence reuse" manda reportar como cobertura fora da suíte (A22).

Além disso, a change `tornar-padrao-generalista` passou a registrar no `project.md` os comandos de verificação do projeto, mas o verify ainda não manda usá-los.

## What Changes

- O formato de cada entrada do `verification.md` ganha:
  - a linha `- Cobertura fora da suíte:` (cenários verificados por roteiro manual, script fora do repositório ou ferramenta externa, com onde está a evidência e quem executou), ou `—`;
  - a lista "Itens:", com uma linha curta por crítico, warning e sugestão (`- [crítico]`, `- [warning]`, `- [sugestão]`) e a referência de arquivo quando houver;
  - a lista "Comandos:", com cada comando executado ou reaproveitado e o resultado relevante com o código de saída.
- As linhas de contagem (`Críticos`, `Warnings`, `Sugestões`, `Não verificado`, `Avaliação`) continuam iguais, então as métricas de fluxo não mudam.
- O verify passa a rodar os comandos da seção "Comandos de verificação" do `project.md` que se aplicam à change, ou a reaproveitar a evidência do apply pelas regras atuais.
- O passo de trechos customizados da CI protege os textos novos; o smoke das métricas de fluxo passa a usar uma entrada no formato novo.

### Fora do escopo

- Copiar o relatório completo para o `verification.md`; o registro continua curto.
- Novas colunas nas métricas de fluxo.
- Reescrever entradas antigas de `verification.md` já arquivadas.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `verification-record`: o registro passa a conter os itens, os comandos e a cobertura fora da suíte.
- `workflow-governance`: o verify usa os comandos de verificação do `project.md`.

## Impact

- **Skill e comando:** `padrao-openspec/.claude/skills/openspec-verify-change/SKILL.md` e `padrao-openspec/.claude/commands/opsx/verify.md`, espelhados pelo sync.
- **CI:** `.github/workflows/validate.yml` (trechos customizados e smoke das métricas).
- **Documentação:** tabela de trechos customizados do `README.md`.
- **Riscos:**
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - **Compatibilidade:** o `flow-metrics.mjs` lê só as linhas de contagem; as linhas novas usam marcadores que não colidem com elas. O smoke da CI confirma.

## Aprovação

- Responsável: gilmar.campelo
- Data: 2026-10-20
- Escopo: archive
- Condições: `openspec validate --all --strict` passa na raiz e em `padrao-openspec/`; `sync-root.mjs --check` passa; o lint de Markdown passa nos dois lugares; os smoke tests locais passam; o verify termina sem críticos; nenhum arquivo fora do raio de impacto é alterado sem confirmação. Commits na branch `feat/padrao-generalista-e-correcoes`; push e PR só com pedido do responsável.
- Origem: respostas do usuário no chat, depois de "implemente toda as correções e aprimoramentos": "Por tema, 4 changes (Recomendado)" e, à pergunta "Qual autorização você dá?", "Até o archive, com condições (Recomendado)", cuja opção dizia "condições 'validate --strict, sync-root --check e markdownlint passando; sem mudar arquivos fora do raio de impacto'" e "Commits em branch; push e PR só com seu pedido"
