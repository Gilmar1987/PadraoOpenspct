---
name: interface-quality
description: >
  Use em toda change OpenSpec que cria ou muda telas, páginas ou componentes visuais, em qualquer
  tecnologia de front-end: brief visual no design.md, checklist "pronto para cliente", validação no
  navegador com o script do padrão e nota mínima "médio" antes de marcar a tarefa da tela.
license: MIT
metadata:
  author: PadraoOpenspct
  version: "1.0"
---

# Qualidade de interface

Uma tela entregue pelo padrão tem de poder ser mostrada a um cliente. Funcionar não basta: a tela
precisa de direção visual, estados completos, acessibilidade e acabamento. Esta skill vale para
qualquer stack (ADR-0003): ela descreve o resultado e como conferir, não a biblioteca.

## Ordem de trabalho

1. **Propose:** numa change com telas, o `design.md` traz a seção "Brief visual" (modelo abaixo), e as
   tarefas citam os estados de cada tela. O verify só exige o relatório de interface quando o design
   tem o brief: uma change com telas e sem brief escapa da validação, por isso o brief é obrigatório
   no propose. Se o relatório existir sem brief, o validador dá "fraco".
2. **Apply:** o brief vem antes do código. Cada tela nasce com os estados de carregando, vazio, erro e
   sucesso, e com textos reais.
3. **Antes de marcar a tarefa de uma tela:** suba a aplicação, escreva ou atualize
   `interface/jornadas.json` na pasta da change e rode a validação (seção "Validação no navegador").
   A nota final tem de ser "médio" ou melhor. Abaixo disso, corrija e rode de novo.
4. **Verify:** o trecho "Interface quality gate" confere o `interface-report.md` da change.

## Modelo do brief visual

Copie para o `design.md`, numa seção `## Brief visual`, e preencha cada item:

```markdown
## Brief visual

- Público e tom: <quem usa e como a tela deve soar: formal, próximo, técnico>
- Paleta: primária <cor>, neutras <cores>, sucesso <cor>, erro <cor>; contraste mínimo de 4,5:1 para texto (3:1 para texto grande)
- Tipografia: <família>, escala <tamanhos>, pesos <pesos>
- Grid e espaçamento: escala de <4 ou 8> px; largura máxima do conteúdo <valor>
- Layout por largura: 390 px <como fica>; 768 px <como fica>; 1280 px <como fica>
- Componentes: <componentes reutilizados ou criados>
- Estados por tela: <tela>: carregando <...>, vazio <...>, erro <...>, sucesso <...>
- Textos reais: <títulos, rótulos, mensagens de erro e de sucesso, sem lorem ipsum>
```

## Checklist "pronto para cliente"

| Item | Como conferir |
|---|---|
| Responsividade em 390, 768 e 1280 px | Capturas do relatório, sem rolagem horizontal |
| Acessibilidade WCAG 2.2 AA | axe-core sem violação séria ou crítica; foco visível; navegação por teclado numa jornada (passo `pressionar`) |
| Rótulos e texto alternativo | Todo campo com rótulo associado; toda imagem informativa com `alt` |
| Estados de carregando, vazio, erro e sucesso | Uma jornada por estado relevante, ou capturas de cada um |
| Formulários com validação e mensagens claras | Jornada que envia vazio e confere a mensagem de erro |
| Conteúdo real | Nenhum lorem ipsum nem "teste 123" nas capturas |
| Consistência de espaçamento e tipografia | Comparação das capturas com o brief |
| 404, título, favicon e metadados | Seção "Página" do relatório |
| Console sem erros | Seção "Console" do relatório |
| Links internos sem quebra | Seção "Links internos" do relatório |

## Critérios de nota

| Nota | Critério |
|---|---|
| fraco | alguma jornada falha, há violação de acessibilidade séria ou crítica, há erro de console, há link interno quebrado, falta título, ou não há brief |
| médio | jornadas e acessibilidade séria ou crítica sem falhas; restam problemas de acabamento (espaçamento irregular, estados faltando numa tela, 404 sem estilo, metadados ausentes) |
| bom | tudo do médio, mais o brief seguido nas três larguras, os estados de todas as telas e nenhuma violação moderada |
| ótimo | tudo do bom, mais um acabamento que se apresenta sem ressalvas: hierarquia clara, microcopy cuidada e feedback em cada ação |

O script dá a nota automática, que vai até "bom". A nota final é do validador, que olha o que o
script não mede: hierarquia, consistência, acabamento e aderência ao brief. Ela pode subir no máximo
um nível acima da automática e descer quanto for preciso.

## Validação no navegador

O script `docs/openspec-validar-interface.mjs` abre a URL num navegador real. Na primeira execução,
instala o Playwright e o axe-core numa pasta temporária fora do projeto e baixa o Chromium (cerca de
100 MB). Nada é instalado no projeto.

```text
node docs/openspec-validar-interface.mjs http://localhost:<porta>/ --jornadas openspec/changes/<change>/interface/jornadas.json --saida openspec/changes/<change>
```

Num projeto com store separado, a pasta da change fica no store: use os caminhos de lá em
`--jornadas` e `--saida`.

Formato das jornadas:

```json
{
  "jornadas": [
    {
      "nome": "Cadastro com sucesso",
      "passos": [
        { "visitar": "/cadastro" },
        { "preencher": { "Nome": "Ana" } },
        { "clicar": "Enviar" },
        { "conferir": "Cadastro concluído" }
      ]
    }
  ]
}
```

Passos aceitos: `visitar` (caminho), `clicar` (texto de botão ou link, ou rótulo), `preencher`
(rótulo ou placeholder → valor), `selecionar` (rótulo de uma lista → texto da opção), `marcar` (rótulo
de caixa ou opção), `pressionar` (tecla, como `Tab` ou `Enter`) e `conferir` (texto que deve aparecer).
Os passos usam o que o usuário vê: texto de botão e link, rótulo de campo, texto na tela. Uma jornada
que só passa por seletor de CSS não prova que a tela é usável. Cada passo espera até 10 segundos pelo
elemento, e cada `conferir` grava uma captura do estado da tela.

O script requisita os links internos da página inicial para achar links quebrados, menos os que parecem
mudar estado (sair, excluir, remover, delete, logout). Rode-o contra a aplicação com dados de
desenvolvimento, nunca contra produção. Erros HTTP durante as jornadas (o 422 de uma validação, por
exemplo) vão para "Respostas de rede com erro" sem derrubar a nota; na página inicial, contam como
defeito.

Saída do script: 0 com nota "médio" ou "bom", 1 com "fraco", 2 quando a URL não abre ou o ambiente
falha (Node.js anterior ao 20, sem rede no primeiro download).

**Quem dá a nota final:**

- No Claude Code, despache o subagente `openspec-validador-de-interface` com a URL, o caminho das
  jornadas e a pasta da change. Ele roda o script, lê o relatório e as capturas e devolve a nota final,
  as correções por tela e um parágrafo de avaliação.
- Em outros agentes, rode o script, abra as capturas e aplique você mesmo os critérios acima.

Em seguida, acrescente ao fim do `interface-report.md`:

```markdown
## Avaliação do validador

- Nota final: <fraco|médio|bom|ótimo>
- Avaliador: <subagente openspec-validador-de-interface | agente | pessoa>

<parágrafo de avaliação>

Correções:

- <tela>: <correção>
```

Rodar o script de novo regrava o relatório: acrescente a avaliação depois da última execução.
