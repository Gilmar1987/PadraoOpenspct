# Proposal

## Why

No primeiro teste do `comecar.mjs` da `v1.3.0` num console real do Windows (projeto Lava Jato, 2026-10-21), três problemas apareceram:

- **Falso erro no fim do setup.** O dev digitou a pasta com o drive em minúscula (`c:\TesteOpenSpct`). O setup compara o caminho do store, de `realpathSync`, que mantém o `c:`, com o caminho que o OpenSpec CLI devolve, `C:\...`. São a mesma pasta, mas a comparação de texto falha: o setup termina com erro depois de ter feito tudo certo. O modo "projeto em andamento" do script tem a mesma comparação.
- **A pergunta da pasta não aparece.** O script escreve a pergunta por conta própria. Num console real, o readline do Node redesenha a linha com o prompt dele (`> `) e apaga a pergunta. O dev viu só `> ` e respondeu sem saber o que estava sendo perguntado. O `setup-project.mjs` pergunta do mesmo jeito.
- **O dev abre a pasta errada.** A mensagem final diz "Abra a pasta ... no editor". O dev abriu a pasta-mãe, onde o Claude Code não carrega os comandos `/opsx:*`, que ficam em `<código>\.claude\commands\`, e o `/opsx:init` não existia na sessão.

## What Changes

- **Comparação de caminhos:** o `setup-project.mjs` e o `comecar.mjs` comparam a raiz resolvida pelo CLI com o store pelo caminho real normalizado (`realpathSync.native`), que no Windows padroniza a letra do drive.
- **Perguntas:** o texto de cada pergunta passa a ser o prompt do próprio readline (`setPrompt` + `prompt`), nos dois scripts, para não ser apagado quando o readline redesenha a linha.
- **Mensagem final do `comecar.mjs`, nos dois modos:**
  - abrir a pasta do código como pasta do workspace, e não a pasta acima dela;
  - mostrar `code "<pasta>"` quando o comando `code` existir;
  - mostrar o caminho do menu do VS Code;
  - dizer que, se `/opsx` não aparecer, o Claude Code foi aberto em outra pasta.
- **`COMECE-AQUI.md`:** os exemplos de conversa e a seção "Inicializar" seguem a mensagem nova; a tabela de problemas comuns ganha "`/opsx` não aparece → Claude Code aberto na pasta errada".
- **Testes:** o smoke test do script passa a conferir a orientação de workspace na mensagem final dos dois modos. A comparação com o drive em minúscula só existe no Windows; ela é conferida rodando o setup e o script com `c:\...` no Git Bash do Windows.
- **Versão:** `1.3.1` (correção).

### Fora do escopo

- Abrir o VS Code ou o Claude Code automaticamente.
- Um job da CI em Windows.
- Mudar o fluxo, as perguntas ou as opções do script.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `project-onboarding`: mensagem final com a orientação de workspace, perguntas visíveis no console real e comparação de caminhos sem diferenciar a letra do drive no modo "projeto em andamento".
- `store-setup`: a verificação de resolução do store aceita o mesmo caminho com a letra do drive em outra caixa.

## Impact

- **Código:** `padrao-openspec/scripts/comecar.mjs` e `padrao-openspec/scripts/setup-project.mjs`.
- **Documentação:** `COMECE-AQUI.md`.
- **CI:** `.github/workflows/validate.yml` (smoke test do script de entrada).
- **Versão:** `padrao-openspec/VERSION` e `CHANGELOG.md`.
- **Riscos:**
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - **Compatibilidade:** nenhuma quebra; só a mensagem final e a forma de exibir as perguntas mudam.
  - **Projetos já configurados:** recebem o `setup-project.mjs` corrigido pelo PR de atualização, mas o setup não roda de novo neles. "Ações no projeto": nenhuma.

## Aprovação

- Responsável: gilmar campelo
- Data: 2026-10-21
- Escopo: archive
- Condições: CI passar; o responsável repetir o teste no console antes da release; em seguida, PR, merge e release `v1.3.1` (com o `comecar.mjs` anexado)
- Origem: "pode, aprovo também o archive, o PR e a release v1.3.1. A condição seria a CI passar e você repetir o teste no console antes da release", em resposta a "Posso abrir a change `corrige-caminho-e-prompt-no-windows` com esses três itens, numa branch nova? Se quiser adiantar, aprove também o archive, o PR e a release v1.3.1. A condição seria a CI passar e você repetir o teste no console antes da release." O "você" da condição é o responsável (o teste em console real só pode ser feito por ele).
