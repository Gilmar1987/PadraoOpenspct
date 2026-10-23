# Revisão de código — qualidade-de-interface

## 2026-10-22

- Intervalo: 958baf198a099d78e2361e0ecfb96254e4ec4c8b..739045a1195fc1edb40579a4c2ea517b3517ef9a
- Revisor: subagente requesting-code-review (leitura estática)
- Críticos: 0
- Importantes: 4 (corrigidos 4)
- Menores: 11 (corrigidos 10, justificados 1)
- Segurança: não aplicável no repositório (a change não acrescenta dependências ao padrão; o script instala `playwright@1.64.1` e `@axe-core/playwright@4.14.0` só numa pasta temporária, em versões fixas); varredura de secrets não definida no `openspec/project.md`

Achados:

- [importante] Erros HTTP esperados numa jornada (o 422 de uma validação no servidor) viravam erro de console e nota "fraco" — corrigido em 3b122b3: "Failed to load resource" vai para "Respostas de rede com erro"; só os da página inicial contam como defeito. A fixture `boa` envia o cadastro a `/api/cadastro`, que responde 422 sem nome, e a CI confere que a nota não cai.
- [importante] `clicar` e `preencher` decidiam o localizador com `count()` sem esperar o elemento — corrigido em 3b122b3 com localizadores compostos por `or()`, que esperam até 10 s; a fixture `boa` ganhou um botão que aparece depois de 1,5 s, e a jornada "Novidades que aparecem depois" passa.
- [importante] `waitUntil: 'networkidle'` derrubava apps com SSE, polling ou analytics — corrigido em 3b122b3: `load` e depois `networkidle` com espera máxima de 5 s, sem falhar.
- [importante] A skill dizia que o verify registra crítico sem brief, mas o gate só olha changes com brief — corrigido em 3b122b3 no texto da skill (o brief é obrigatório no propose; relatório sem brief leva "fraco" do validador). Endurecer o gate para detectar telas sem brief é decisão de spec, levada ao responsável.
- [menor] Erro do passo, nome da jornada e `lang` entravam no Markdown sem escape — corrigido em 3b122b3 (`inline()`, crases trocadas no código do passo, nome numa linha).
- [menor] `startsWith(location.origin)` aceitava `localhost:30001` como interno — corrigido em 3b122b3 comparando `URL.origin`.
- [menor] Links com efeito colateral eram requisitados e o corte em 50 era silencioso — corrigido em 3b122b3: links que parecem mudar estado não são requisitados e aparecem no relatório, junto com a contagem dos não conferidos; aviso na skill e no CHANGELOG.
- [menor] O status da URL principal não era registrado — corrigido em 3b122b3: "Status da URL" no relatório e nota "fraco" com 400 ou mais.
- [menor] O script tirava o "bom" por violação `minor`, e a skill fala só em moderada — corrigido em 3b122b3: só `moderate` tira o "bom".
- [menor] Sem passos de teclado, lista e caixa — corrigido em 3b122b3: `pressionar`, `selecionar` e `marcar`, documentados na skill e no uso do script.
- [menor] Instalação incompleta e duas execuções simultâneas — corrigido em 3b122b3: trava por `mkdir` com expiração de 5 min e uma reinstalação automática quando o carregamento falha.
- [menor] A dica `install-deps` do Playwright se perdia no Linux — corrigido em 3b122b3 (a mensagem de erro inclui o comando).
- [menor] Capturas de execuções anteriores ficavam na pasta — corrigido em 3b122b3 (o script apaga `inicio-*` e `jornada-*` antes de rodar).
- [menor] O laço de espera da CI saía em silêncio — corrigido em 3b122b3 (falha mostrando os logs). O caminho do `npm` no Windows segue sem cobertura na CI, que roda o smoke só no Linux pelo download do navegador — justificado: ele foi exercitado na evidência da tarefa 2.1, no Windows.
- [menor] O CHANGELOG não citava a orientação do `config.yaml` — corrigido em 3b122b3.

Depois das correções: "Smoke test da validação de interface" (com o 422 esperado, o botão atrasado e o recurso `faltando.png` da fixture `ruim`), "Sintaxe dos scripts", "Lint de Markdown" nos dois lugares, "Versão e changelog" e "Raiz em dia com padrao-openspec" → PASS no Git Bash.
