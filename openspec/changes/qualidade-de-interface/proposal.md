# Proposal

## Why

As páginas criadas nos projetos de teste (Lava Jato, Livraria, Estoque) saíram funcionais, mas fracas: sem direção visual, sem estados de carregamento, vazio ou erro, com acessibilidade e responsividade não conferidas. Não dava para apresentá-las a um cliente. O padrão não tem nenhuma orientação de interface desde que os presets de stack saíram (ADR-0003); a recomendação da skill `frontend-design` era presa à stack Next.js e saiu junto.

A verificação de interface também é fraca. O roteiro de navegador costuma ser rodado pelo agente sem clicar (por HTTP), e desde a v1.8.0 isso conta como cobertura parcial. Mas não existe uma forma padronizada de simular um usuário e medir se a página está pronta para cliente.

## What Changes

- **Skill neutra `interface-quality`** (sem stack: vale para qualquer tecnologia de front-end):
  - **Brief visual no design:** numa change que cria ou muda telas, o `design.md` traz uma seção "Brief visual":
    - público e tom;
    - paleta com contraste;
    - tipografia;
    - hierarquia e layout por largura;
    - componentes;
    - os estados de cada tela (carregando, vazio, erro, sucesso);
    - textos reais.
  - **Checklist "pronto para cliente"**, usado no apply e conferido no verify:
    - responsividade em três larguras (390, 768 e 1280 px);
    - acessibilidade WCAG 2.2 AA (contraste, foco visível, rótulos, texto alternativo, navegação por teclado);
    - estados de carregando, vazio, erro e sucesso;
    - formulários com validação e mensagens claras;
    - conteúdo real, sem lorem ipsum;
    - consistência de espaçamento e tipografia;
    - 404, título, favicon e metadados;
    - console sem erros;
    - links internos sem quebra.
- **Script `validar-interface.mjs`**, entregue ao código como `docs/openspec-validar-interface.mjs`:
  - roda num navegador de verdade, com o Playwright instalado só numa pasta temporária fora do repositório, sem dependência no projeto;
  - recebe a URL da aplicação e o arquivo de jornadas da change (`interface/jornadas.json`: visitar, clicar, preencher, conferir texto);
  - grava capturas de tela nas três larguras;
  - roda a checagem de acessibilidade (axe-core) e confere o console, os links internos, o título, o favicon e a 404;
  - executa as jornadas como um usuário;
  - gera `interface-report.md` e `interface-report.json` na pasta da change, com uma nota automática.
- **Subagente `openspec-validador-de-interface`:**
  - lê o relatório e as capturas de tela;
  - avalia o que o script não mede: hierarquia visual, consistência, acabamento e o brief;
  - atribui a nota final (fraco, médio, bom ou ótimo) com uma lista de correções;
  - só lê, sem editar: o veredito é dele, e as correções são do apply.
  - O subagente segue o formato de `.claude/agents` da change `subagentes-e-ganchos` e tem o equivalente em `.github/agents/` para o Copilot.
- **Verify:** trecho novo **"Interface quality gate"**. Numa change com "Brief visual" no design, o verify exige o `interface-report.md` com a nota do subagente **médio ou superior**. Abaixo disso, é crítico, e a change volta ao apply. Um relatório com jornadas executadas pelo navegador conta como cobertura com interação, como define o "Agent-run browser scripts".
- **Init:** quando a 3.2 tem um front-end, o init registra nos Comandos de verificação a linha "Validação de interface" (`node docs/openspec-validar-interface.mjs <url>`) e, no `config.yaml`, a orientação de usar a skill nas changes com telas.
- **CI:**
  - um smoke test do script contra uma página estática local (servidor do Node), só no Ubuntu: uma página boa passa e uma página com problemas plantados falha nos pontos certos;
  - checagens dos trechos novos.
- **Versão:** 1.12.0, depois da `subagentes-e-ganchos` (1.10.0) e da `validacao-e-paralelismo` (1.11.0).

### Fora do escopo

- Gerar telas automaticamente ou impor uma biblioteca de componentes.
- Testes visuais por comparação de pixels entre versões.
- Instalar o Playwright no projeto ou na CI dos projetos consumidores.
- Avaliar desempenho em profundidade (Lighthouse completo). O script mede só o básico: console, links e tamanho da página.

## Capabilities

### New Capabilities

- `interface-quality`: direção visual no design, checklist "pronto para cliente", validação por navegador simulando um usuário e nota mínima para changes com telas.

### Modified Capabilities

- `verification-record`: o verify exige o relatório de interface com nota mínima nas changes com telas.

## Impact

- **Skills e subagentes:**
  - `padrao-openspec/.claude/skills/interface-quality/` (nova);
  - `padrao-openspec/.claude/agents/openspec-validador-de-interface.md` (novo, no formato da `subagentes-e-ganchos`);
  - `padrao-openspec/.github/agents/validador-de-interface.agent.md` (novo).
- **Script:** `padrao-openspec/scripts/validar-interface.mjs` (novo), entregue pelo instalador como `docs/openspec-validar-interface.mjs`.
- **Comandos:** verify (trecho novo) e init (comandos de verificação e `config.yaml`), com as cópias da raiz.
- **CI, documentação e versão:** `validate.yml`, `README.md`, `COMECE-AQUI.md`, guia do projeto, `CHANGELOG.md`, `VERSION`.
- **Changes concorrentes:**
  - a `subagentes-e-ganchos` (outra sessão, em apply) define o formato dos subagentes, o hook `somente-leitura.mjs` e o passo "Paridade de papéis" da CI. Esta change entra depois dela;
  - a `validacao-e-paralelismo` (esta sessão) também mexe no `validate.yml`, no `VERSION` e no `CHANGELOG`.
- **Riscos:**
  - **Download do navegador na primeira execução:** cerca de 150 MB. Mitigação: só na pasta temporária, com aviso antes, e reaproveitado entre execuções pelo cache do Playwright.
  - **Nota subjetiva:** a parte visual depende do julgamento do subagente. Mitigação: critérios escritos na skill, capturas de tela no relatório para o humano conferir, e a nota automática como piso.
  - Dados pessoais, autenticação e variáveis de ambiente: o script só acessa a URL informada e não guarda credenciais; as jornadas usam dados de teste.

## Aprovação

- Responsável: gilmar.campelo
- Data: 2026-10-22
- Escopo: archive
- Condições: versão 1.12.0, depois da `subagentes-e-ganchos` (1.10.0) e da `validacao-e-paralelismo` (1.11.0); o apply começa depois do merge da `subagentes-e-ganchos`; push, PR, merge e release só com pedido explícito do responsável, que não os incluiu nesta aprovação.
- Origem: pergunta "1. Aprovação para o apply da `qualidade-de-interface`. Diga o escopo (só apply ou até archive) e as condições […] 2. Ordem das versões entre as duas sessões. Minha sugestão: v1.10.0: `subagentes-e-ganchos`; v1.11.0: `validacao-e-paralelismo`; v1.12.0: `qualidade-de-interface`; v1.13.0 a v1.15.0: as changes de SDD da outra sessão"; resposta "1 - Até archive . 2- Sim".
