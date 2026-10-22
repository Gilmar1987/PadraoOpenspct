# Proposal

## Why

Na entrevista do `/opsx:init` do projeto Lava Jato (2026-10-21), o responsável viu um erro na pergunta 6.5, a dos controles de LGPD/GDPR:

- **A opção 5 contradiz a opção 0.** "5) Todos os anteriores" inclui, ao pé da letra, o "0) Não aplicável".
- **A pergunta aceita uma resposta só.** Os controles de 1 a 4 não se excluem, mas a 6.5 não é de múltipla escolha, ao contrário de outras perguntas do init. Quem precisa de dois ou três controles só consegue registrá-los pelo "Outro".
- **A dependência do 1.5 não tem regra.** O título diz "respondido no 1.5", mas a pergunta é feita mesmo quando o produto não tem dados pessoais. E quem tem dados pessoais pode responder `0` sem que a checagem de coerência aponte a combinação.

## What Changes

- **Pergunta 6.5 do `init.md`:**
  - a opção 5 vira "Todos os controles de 1 a 4";
  - a pergunta passa a ser de múltipla escolha, com a mesma nota das outras ("separe os números por vírgula");
  - quando o 1.5 for "Não", ela é registrada como "Não aplicável" sem ser feita.
- **Checagem de coerência:** ganha a linha "1.5 com dados pessoais ou sensíveis e 6.5 = 0 → propor ao menos consentimento e exclusão".
- **Cópia da raiz:** o `.claude/commands/opsx/init.md` da raiz é regenerado pelo `sync-root.mjs`.
- **Versão:** entra na `1.3.1`, que ainda não foi publicada; o CHANGELOG ganha o item.

### Fora do escopo

- Revisar as outras perguntas da entrevista.
- Mudar o template do `project-setup.md` ou as ADRs fundacionais geradas.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `project-initialization`: a pergunta de controles de LGPD/GDPR aceita múltipla escolha, não é feita sem dados pessoais e entra na checagem de coerência.

## Impact

- **Comandos:** `padrao-openspec/.claude/commands/opsx/init.md` e a cópia gerada `.claude/commands/opsx/init.md`. Os projetos recebem o arquivo pelo PR de atualização.
- **Versão:** `CHANGELOG.md` (seção `1.3.1`).
- **Riscos:**
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam ao código desta change. A change melhora o registro de controles de LGPD dos projetos.
  - **Compatibilidade:** nenhuma quebra. Arquivos de respostas pré-preenchidas com `6.5 = 5` passam a significar os controles de 1 a 4, que é o que a opção sempre quis dizer.

## Aprovação

- Responsável: gilmar campelo
- Data: 2026-10-21
- Escopo: archive
- Condições: as mesmas da `corrige-caminho-e-prompt-no-windows`: CI passar e o responsável repetir o teste no console antes da release; a change entra no PR #20 e na release `v1.3.1`
- Origem: "sim", em resposta a "Quer que eu proponha a change `corrige-pergunta-lgpd-do-init` nesse PR? Se sim, aprove com as mesmas condições da anterior (CI passando e o seu teste no console antes da release)."
