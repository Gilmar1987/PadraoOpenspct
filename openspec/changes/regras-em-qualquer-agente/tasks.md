# Tasks

## 1. Fonte única das regras

- [x] 1.1 Aplicar o D1: mover `openspec/rules.md` para `padrao-openspec/openspec/rules.md` com o texto ajustado e acrescentar o mapeamento ao `sync-root.mjs`. Verificar com `sync-root.mjs` gerando de novo `openspec/rules.md`, `sync-root.mjs --check` em dia, o `CLAUDE.md` e os stubs da raiz ainda resolvendo o arquivo, e um teste do sync com a regra editada na fonte.
  - Evidência: `git mv openspec/rules.md padrao-openspec/openspec/rules.md` com o título, a introdução e a seção 1 ajustados; mapeamento `openspec/rules.md` no `sync-root.mjs`, cuja guarda passou a reconhecer a raiz pelo `COMECE-AQUI.md` (o `rules.md` da raiz agora é gerado); `sync-root.mjs` → "missing openspec/rules.md", "Synced 1 paths."; `--check` → em dia; `cmp` raiz × fonte → iguais; `.claude/CLAUDE.md`, `.cursorrules`, `.windsurfrules`, `.amazonq/rules/openspec-rules.md` e `.github/copilot-instructions.md` continuam apontando para `openspec/rules.md`, que existe; numa cópia com a fonte editada, `--check` → exit 1 com "diff openspec/rules.md", e o sync → cópia igual à fonte.

## 2. Blocos gerenciados no instalador

- [x] 2.1 Conferir na documentação de cada agente o arquivo de instrução que ele lê (Cursor, Codex, Claude Code, Gemini CLI, Copilot, Windsurf, Amazon Q) e registrar as fontes no design. Verificar com a tabela do D4 batendo com a documentação; ajustar só os nomes de arquivo, se preciso.
  - Evidência: duas buscas na web (2026-10-22), fontes no design ("Open Questions"). Copilot: `AGENTS.md` e `.github/copilot-instructions.md`; Windsurf: lê `AGENTS.md`, então o `.windsurf/rules/` saiu do plano (spec, proposta e design ajustados); Cursor: `AGENTS.md`; Claude Code: `CLAUDE.md` com `@AGENTS.md`; Gemini CLI: `GEMINI.md`; Amazon Q: `.amazonq/rules/` mantido, sem confirmação nas fontes encontradas. `openspec validate --strict` → valid.
- [ ] 2.2 Acrescentar o passo "Smoke test dos blocos de agentes" do D5 ao `validate.yml`. Verificar rodando-o no Git Bash: deve falhar.
- [ ] 2.3 Implementar o D2 e o D3 no instalador (template, `ensureManagedBlock`, `docs/openspec-regras.md`, `managedBlocks` no manifesto e integração com `--update`/`--in-place`). Verificar com o passo da 2.2 passando e os smoke tests do instalador e do setup passando.

## 3. Guias e versão

- [ ] 3.1 Aplicar o D4 no `templates/openspec-padrao.md`, no COMECE-AQUI e no README, e o D6 no `VERSION` e no `CHANGELOG.md`. Verificar com o lint nos dois lugares sem issues e os passos "Guia de primeiros passos" e "Versão e changelog" passando.
- [ ] 3.2 Rodar o instalador sobre uma cópia do repositório de código do Lava Jato numa pasta temporária. Verificar que o bloco do Next.js no `AGENTS.md` continua igual e que os cinco arquivos e o `docs/openspec-regras.md` aparecem como o D2 descreve.
- [ ] 3.3 Promover a ADR-0005 de `Proposed` para `Accepted` (o responsável aprova junto com a change) e rodar os comandos de verificação do `openspec/project.md` (todos os passos dos jobs `store` e `root`). Verificar que todos saem com código 0.

## Workflow follow-up

- Depois da release: abrir o projeto num segundo agente (por exemplo, o Copilot no VS Code) e pedir um `/opsx:propose` seguindo o arquivo do comando, para confirmar que ele lê as regras.
