# Design

## Context

- Pela ADR-0003, o padrão não traz stack, e por isso a orientação de interface precisa ser neutra (React, Blazor, Django, Rails…). O script testa a **URL** da aplicação, e não o código, o que o torna independente da stack.
- O verify (v1.8.0) já trata roteiros de navegador: um roteiro sem interação é cobertura parcial. Um navegador que clica e digita cobre o cenário.
- A change `subagentes-e-ganchos` (outra sessão, v1.10.0, em apply) define:
  - o local `padrao-openspec/.claude/agents/openspec-<papel>.md`;
  - o frontmatter (`name`, `description`, `tools`, `model`, `hooks.PreToolUse` com `somente-leitura.mjs`, que libera `node arquivo.mjs` e `npx playwright test`);
  - a nota "Subagente só do Claude Code…";
  - o passo "Paridade de papéis" da CI, que exige `.github/agents/<papel>.agent.md` salvo na lista `only_claude`.
- O instalador entrega scripts ao código por `templateFiles` (como o `docs/openspec-portao.mjs`).

## Architecture Decisions

Não há ADR nova: a skill, o subagente e o script seguem decisões já aceitas:

- ADR-0003: nada preso a stack;
- ADR-0004: arquivo gerenciado;
- ADR-0006, da outra sessão: formato e limites dos subagentes.

## Goals / Non-Goals

**Goals:**

- Toda change com telas sai com um brief visual e um relatório de interface com nota "médio" ou melhor, conferidos no verify.

**Non-Goals:**

- Substituir a revisão humana do design: as capturas de tela ficam no relatório para o responsável conferir.

## Decisions

### D1. Skill `interface-quality`

`padrao-openspec/.claude/skills/interface-quality/SKILL.md`, com `description` que dispara em changes com telas. Conteúdo:

1. **Brief visual:** o modelo da seção do `design.md`, com:
   - público e tom;
   - paleta (cor primária, neutras, sucesso, erro), com o contraste mínimo de 4,5:1 para texto;
   - tipografia (família, escala de tamanhos, peso);
   - grid e espaçamento (escala de 4 ou 8 px);
   - layout em 390, 768 e 1280 px;
   - componentes reutilizados;
   - estados por tela;
   - textos reais.
2. **Checklist "pronto para cliente":** os itens da proposta, cada um com como conferir.
3. **Critérios de nota:**

   | Nota | Critério |
   |---|---|
   | fraco | alguma jornada falha, há violação de acessibilidade séria ou crítica, há erro de console, falta título, ou não há brief |
   | médio | jornadas e acessibilidade séria ou crítica sem falhas; restam problemas de acabamento (espaçamento irregular, estados faltando numa tela, 404 sem estilo) |
   | bom | tudo do médio, mais o brief seguido nas três larguras, os estados de todas as telas e nenhuma violação moderada |
   | ótimo | tudo do bom, mais um acabamento que se apresenta sem ressalvas: hierarquia clara, microcopy cuidada e feedback em cada ação |

4. **Ordem de trabalho no apply:** o brief vem antes do código, as telas vêm com os estados, e o validador roda antes de marcar a tarefa da tela.

### D2. Script `validar-interface.mjs`

```text
node docs/openspec-validar-interface.mjs <url> [--jornadas <arquivo>] [--saida <pasta>] [--json]
```

- **Ambiente:**
  - cria (ou reaproveita) uma pasta em `os.tmpdir()/openspec-validar-interface`;
  - instala ali `playwright` e `@axe-core/playwright` em versões fixas, consultadas no registro na tarefa 2.1 e gravadas no próprio script;
  - roda `npx playwright install chromium` na primeira vez, avisando do download;
  - nada é instalado no projeto.
- **Varredura da URL:**
  - capturas de página inteira em 390, 768 e 1280 px;
  - axe (WCAG 2.2 AA) em cada largura;
  - erros de console e de página;
  - links internos (mesma origem) com status ≥ 400;
  - presença de `<title>`, favicon e `lang`;
  - resposta de uma rota inexistente (404 com conteúdo).
- **Jornadas** (`interface/jornadas.json` na pasta da change, quando existir): lista de passos `{"visitar": "/caminho"}`, `{"clicar": "texto ou rótulo"}`, `{"preencher": {"rotulo": "valor"}}`, `{"conferir": "texto esperado"}`, executados pelos localizadores acessíveis do Playwright (por papel, rótulo e texto). Um passo que falha grava a captura de tela.
- **Saída:** em `--saida` (por padrão, a pasta atual):
  - `interface-report.json` com tudo;
  - `interface-report.md` legível, com a nota automática pelos critérios do D1 (até "bom", porque "ótimo" é julgamento do subagente);
  - as capturas em `interface/capturas/`.
- **Códigos de saída:** 0 com nota "médio" ou melhor, 1 com "fraco", 2 em erro de ambiente (URL inacessível, falha no download).

### D3. Subagente `openspec-validador-de-interface`

- **Arquivo:** `padrao-openspec/.claude/agents/openspec-validador-de-interface.md`, no formato da ADR-0006.
- **Frontmatter:**
  - `tools: Read, Grep, Glob, Bash, PowerShell`, sem Edit nem Write (PowerShell para funcionar no Windows sem Git Bash);
  - `model: sonnet`;
  - o hook `somente-leitura.mjs`.
- **Corpo:**
  1. roda o script, que o hook libera como `node arquivo.mjs`;
  2. lê o relatório e as capturas de tela (o Read do Claude Code lê imagens);
  3. confere o brief do `design.md`;
  4. atribui a nota final: pode subir no máximo um nível acima da automática, e descer quanto for preciso;
  5. devolve ao agente principal a nota, as correções por tela e um parágrafo de avaliação. O agente principal acrescenta a seção "Avaliação do validador" ao `interface-report.md`.
- **Copilot:** o equivalente em `.github/agents/validador-de-interface.agent.md`, para o passo "Paridade de papéis".

### D4. Verify

Trecho novo **"Interface quality gate"**, em Correctness:

> when the change's `design.md` has a "Brief visual" section, read `interface-report.md` in `changeRoot`. Missing report, or a final grade ("Avaliação do validador") of `fraco`: CRITICAL "Interface below client-ready", citing the grade and the corrections. A report whose journeys ran in the browser counts as interactive coverage for those scenarios.

### D5. Init

- **Comandos de verificação:** quando a 3.2 não for "0" (sem front-end), o `project.md` gerado ganha a linha "Validação de interface | `node docs/openspec-validar-interface.mjs <url-local> --jornadas <arquivo>` | rodada pelo subagente validador nas changes com telas".
- **`config.yaml`:** o `operations.apply.guidance` ganha "Em changes com telas, seguir a skill interface-quality: brief visual antes do código e relatório de interface com nota médio ou superior antes de marcar a tarefa da tela."

### D6. CI

- **Fixtures** em `padrao-openspec/scripts/test-fixtures/interface/`:
  - `boa/`: página acessível, com título, favicon, `lang`, estados e 404;
  - `ruim/`: imagem sem `alt`, erro de console, link quebrado e sem título;
  - `jornadas.json`.
- **Passo "Smoke test da validação de interface"** (só Ubuntu, pelo download do navegador):
  - sobe um servidor estático do Node em segundo plano;
  - a página `boa` com jornada → saída 0, nota ≥ médio;
  - a página `ruim` → saída 1, e o relatório cita `alt`, console e link.
- **Checagens:**
  - "Trechos customizados": "Interface quality gate" no par do verify;
  - sintaxe: `node --check scripts/validar-interface.mjs`;
  - "Paridade de papéis": coberta pelos dois arquivos de agente.

### D7. Versão

1.12.0, na ordem aprovada pelo responsável. "Ações no projeto":

- "Nenhuma obrigatória. Projetos com front-end: nas próximas changes com telas, o verify exige o relatório de interface."

## Raio de impacto

| Arquivo-alvo | Mudança | Dependentes afetados |
|---|---|---|
| `padrao-openspec/.claude/skills/interface-quality/SKILL.md` (nova) | D1 | instalador (skills), cópias da raiz |
| `padrao-openspec/scripts/validar-interface.mjs` (novo), `scripts/test-fixtures/interface/` | D2, D6 | instalador (`templateFiles`), CI |
| `padrao-openspec/.claude/agents/openspec-validador-de-interface.md`, `.github/agents/validador-de-interface.agent.md` (novos) | D3 | instalador, "Paridade de papéis" |
| `commands/opsx/verify.md`, skill do verify | D4 | trechos customizados |
| `commands/opsx/init.md` | D5 | cópia da raiz |
| `.github/workflows/validate.yml`, `README.md`, `COMECE-AQUI.md`, `templates/openspec-padrao.md`, `CHANGELOG.md`, `VERSION` | D6, D7 | lint, guia, versão |

## Risks / Trade-offs

- [Download de cerca de 150 MB e tempo de CI] → só no Ubuntu e com cache do Playwright; nos projetos, só quando o validador roda.
- [Fixture "boa" acusar algo e virar teste instável] → a fixture é mínima e conferida na tarefa 2.1; a nota esperada é "≥ médio", e não exata.
- [Formato da ADR-0006 mudar antes do merge da `subagentes-e-ganchos`] → esta change só começa o apply depois do merge dela, com rebase.

## Migration Plan

Nenhuma migração. Rollback: reverter os commits; a skill e o script saem na próxima atualização dos projetos.

## Open Questions

Nenhuma; as versões das dependências do script são fixadas na tarefa 2.1.
