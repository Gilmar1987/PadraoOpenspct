# Proposal

## Why

A `qualidade-de-interface` (1.12.0) exige o relatório de interface com nota "médio" ou melhor, mas só nas changes cujo `design.md` tem a seção "Brief visual". O pedido do brief está só na skill `interface-quality`, que o agente carrega pela `description`, e na orientação de apply que o init grava no `config.yaml` dos projetos com front-end. O comando do propose não cita o brief, e o `design.md` é opcional no schema. Uma change com telas proposta sem a skill, ou sem `design.md`, passa pelo verify sem validação nenhuma. O verify da própria `qualidade-de-interface` registrou essa brecha como warning, e a revisão de código apontou o mesmo.

## What Changes

- **Propose:** trecho novo **"Interface brief"** no comando e na skill do propose. Quando a change cria ou muda telas, páginas ou componentes visuais:
  - o `design.md` deixa de ser opcional;
  - o `design.md` traz a seção "Brief visual" no modelo da skill `interface-quality`;
  - as tarefas citam os estados de cada tela e uma tarefa de validação no navegador antes de marcar a tela;
  - o agente segue a skill `interface-quality`.
- **Verify:** o trecho "Interface quality gate" ganha um caso. Quando o `design.md` não tem "Brief visual", mas a change mostra sinais de tela, o verify registra um WARNING "Screens without visual brief" e pergunta ao responsável se a change tem telas. Os sinais são:
  - tarefas, design ou delta specs que citam tela, página, formulário, layout, componente visual, front-end ou UI;
  - um arquivo `interface/jornadas.json` na change.

  Com a resposta "sim", o caso vira CRITICAL e a change volta ao propose ou ao update para receber o brief. É warning, e não crítico direto, porque a detecção é por palavras e pode errar.
- **Versão:** item da versão aberta no CHANGELOG (1.12.0), sem subir o `VERSION`; a release sai quando o responsável pedir.

### Fora do escopo

- Detectar telas pelo código (arquivos `.tsx`, `.vue`, templates): o padrão é neutro de stack (ADR-0003), e as palavras do planejamento bastam como sinal.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `interface-quality`: o propose passa a exigir o `design.md` com o brief nas changes com telas.
- `verification-record`: o verify avisa quando há sinais de tela sem brief.

## Impact

- **Comandos e skills:** `commands/opsx/propose.md` e `skills/openspec-propose/SKILL.md` (trecho "Interface brief"), `commands/opsx/verify.md` e `skills/openspec-verify-change/SKILL.md` (caso novo no "Interface quality gate"), com as cópias da raiz; a skill `interface-quality` cita o trecho do propose.
- **CI, documentação e versão:** `validate.yml` ("Trechos customizados": "Interface brief" no par do propose e "Screens without visual brief" no par do verify), `README.md`, `CHANGELOG.md` (item na 1.12.0).
- **Changes concorrentes:** `lacunas-e-adrs-verificaveis` (outra sessão, em apply) mexe no propose e no verify, em trechos diferentes. A `aprovacao-por-conteudo` (esta sessão, aprovada) mexe no propose (Artifact Creation Guidelines). Quem entrar depois na main faz o rebase.
- **Riscos:**
  - **Falso positivo** de palavras como "tela" numa change de back-end. Mitigação: o warning pergunta ao responsável, e só a confirmação vira crítico.

## Aprovação

- Responsável: gilmar.campelo
- Data: 2026-10-22
- Escopo: apply
- Condições: —
- Origem: "Aprovo: brief-visual-obrigatorio: está proposta e commitada (3387790) [...] Falta a sua aprovação: só apply ou até archive, e com quais condições". A resposta não escolhe entre apply e archive nem dá condições, então o escopo registrado é apply; archive, push, PR e merge pedem confirmação.
- Archive: 2026-10-22; Condições: archive, push, PR e merge, se a CI passar nos três jobs; release só quando o responsável pedir; Origem: "pode fazer archive, push, PR e merge se a CI passar nos três jobs", em resposta a "posso fazer archive, push, PR e merge se a CI passar nos três jobs?"
