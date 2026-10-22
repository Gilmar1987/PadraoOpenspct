# Proposal

## Why

O relatório da Livraria (projeto testado em outra máquina, com outro agente, 2026-10-22) mostrou que as travas do padrão existem só como texto que o agente lê:

- **Apply sem aprovação (L1):** o apply foi feito com `Responsável: Pendente`. A trava está no passo 4a do apply, que o agente não seguiu.
- **Verify confundido com o CLI (L3):** o agente rodou `openspec verify`, recebeu "unknown command" e seguiu sem verificar. Nada diz a ele que os `/opsx:*` são fluxos do agente, e não comandos do OpenSpec CLI.
- **Archive direto pelo CLI (L4, L6):** o agente rodou `openspec archive ... --yes`, que não confere aprovação, verify, revisão nem tarefas pendentes, e o `--yes` pulou até a confirmação do próprio CLI.
- **Store não resolvido (L5):** `no_root_with_registered_stores` ao rodar o CLI na pasta da aplicação, sem orientação no guia.

No PadraoOpenspct também apareceu uma trava só de texto que falhou: a release `v1.7.0` foi publicada sem o `comecar.mjs` anexado, apesar do passo no README, e precisou de correção à mão.

## What Changes

- **Portão no repositório de código:** novo script `padrao-openspec/scripts/portao.mjs`, entregue ao código como o arquivo gerenciado `docs/openspec-portao.mjs`:
  - `node docs/openspec-portao.mjs apply <change>` confere a seção `## Aprovação` (Responsável diferente de `Pendente`, com Data, Escopo e Origem);
  - `node docs/openspec-portao.mjs archive <change>` confere o escopo `archive` (ou o item `Archive:`), todas as tarefas marcadas, o `verification.md` presente e, numa change que alterou código, o `review.md`;
  - opções `--json` e `--store <id>`; códigos de saída: 0 libera, 1 bloqueia com os motivos, 2 é erro de uso ou de ambiente;
  - a change e o progresso vêm do OpenSpec CLI (`openspec status` e `openspec instructions apply`), rodado a partir do código, o que respeita a declaração `store:`;
  - `node docs/openspec-portao.mjs instalar-hook` instala, só quando pedido, um hook `commit-msg` que recusa um commit com `OpenSpec-Change: <change>` se o portão de apply bloquear.
- **Fluxos chamam o portão:** o passo 4a do apply e o 4a do archive (comandos e skills) rodam o portão quando ele existe no código e respeitam o resultado. Sem o portão, seguem a checagem em texto, como hoje.
- **Bloco no `AGENTS.md` e regras globais:**
  - os `/opsx:*` são fluxos do agente, e não comandos do OpenSpec CLI;
  - não existe `openspec verify`;
  - nunca rodar `openspec archive` direto;
  - rodar o portão antes de escrever código e antes de arquivar;
  - sem store resolvido, usar `--store <id>`.
- **Release no PadraoOpenspct:** novo workflow `.github/workflows/release.yml`, disparado quando uma release é publicada, que anexa o `comecar.mjs` da própria tag se ele faltar e falha se o anexo continuar ausente.
- **Guias:** o COMECE-AQUI ganha a linha `no_root_with_registered_stores` nos problemas comuns, e o guia do projeto ganha a seção "Portão".
- **CI:**
  - smoke test do portão (aprovação pendente e completa; archive com tarefas pendentes, sem `verification.md`, sem `review.md` e completo; hook);
  - checagem de sintaxe;
  - trechos customizados novos.
- **Versão:** `1.9.0`, a combinar com a outra sessão antes do apply.

### Fora do escopo

- Hooks e subagentes do Claude Code (change `subagentes-e-ganchos`, da outra sessão), que vão chamar este portão.
- Instalar o hook `commit-msg` por padrão: ele altera a configuração local do Git do dev e só entra quando pedido.
- Impedir fisicamente o uso do `openspec archive`: o CLI é externo; o portão e as regras orientam, e o hook pega o commit.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `change-approval`: o apply e o archive usam o portão quando ele existe no código.
- `skill-installation`: o instalador entrega o portão como arquivo gerenciado, e o bloco do `AGENTS.md` ganha as orientações sobre CLI, portão e store.
- `continuous-validation`: smoke test do portão e workflow de release que garante o anexo.

## Impact

- **Código:**
  - `padrao-openspec/scripts/portao.mjs` (novo);
  - `padrao-openspec/scripts/install-skills.mjs` (`templateFiles`);
  - `padrao-openspec/templates/agents-block.md`.
- **Comandos e skills:** `apply` e `archive` (4 arquivos), com as cópias da raiz pelo `sync-root`.
- **Regras:** `padrao-openspec/openspec/rules.md`.
- **Workflows:** `.github/workflows/release.yml` (novo) e `.github/workflows/validate.yml`.
- **Guias:** `COMECE-AQUI.md`, `templates/openspec-padrao.md`, README (tabela de trechos e "Como publicar uma release").
- **Versão:** `VERSION` e `CHANGELOG.md`.
- **Riscos:**
  - **Portão errado bloquear trabalho legítimo:** mitigação: smoke tests de cada caso, e mensagens com o motivo e o que fazer.
  - **Workflow de release com permissão de escrita:** ele só anexa o arquivo da própria tag (`contents: write`, sem outros acessos).
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.

## Aprovação

- Responsável: Pendente
- Data: —
- Escopo: —
- Condições: —
- Origem: —
