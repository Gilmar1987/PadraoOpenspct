# Proposal

## Why

O teste de ponta a ponta (lote 4 do plano de correção) mostrou que a entrevista do `/opsx:init` e os presets não conversam:

- **Campos que a entrevista não pergunta.** Os presets têm de 13 a 21 campos "A definir", como gerenciador de pacotes, estilização, componentes de UI, data fetching e versão do framework. O `config.yaml` trata qualquer "A definir" como projeto não inicializado, então o agente foi obrigado a inventar valores (atrito 9).
- **Opções que não servem a todas as stacks:**
  - a 3.1 só oferece servidores separados (Express, Fastify, Hono), sem o back-end no próprio Next.js;
  - a 3.5 só oferece ORMs;
  - a 6.4 não tem "nenhuma";
  - a 5.3 pergunta "verificações no CI" quando a 5.2 pode ser "sem CI" (atrito 10).
- **E2E:** o preset manda cobrir fluxos críticos com E2E, e o init permite decidir "sem E2E". Nada diz qual prevalece (atrito 8).
- **ADRs com respostas negativas:** não está claro se "Não" para Docker, "Sem deploy" ou "Sem autenticação" geram ADR (atrito 11).
- **Sem respostas pré-preenchidas:** a entrevista exige um humano respondendo pergunta por pergunta, o que impede automação e testes do próprio padrão (atrito 20).

## What Changes

- **Bloco 7, "Complemento da stack":** depois do bloco 6, o `/opsx:init` lê a Stack Summary do `project.md` do preset ativo e faz uma pergunta para cada campo que continua "A definir" e não foi coberto pelas respostas. As opções vêm da coluna de opções do próprio preset, mais "Adiar" e "Outro". "Adiar" grava "Adiado: decidir na primeira change que precisar", que não conta como "A definir".
- **Opções revistas:**
  - a 3.1 passa a incluir o back-end no próprio app (Route Handlers e Server Actions do Next.js);
  - a 3.5 ganha "Nenhum: acesso direto";
  - a 6.4 ganha "Nenhuma no MVP";
  - a 5.3 explica que, sem CI, as respostas viram verificações locais obrigatórias.
- **Precedência da decisão de testes:**
  - a decisão de E2E registrada pelo projeto prevalece sobre o padrão do preset;
  - os presets `nextjs` e `dotnet-nextjs` passam a dizer "salvo decisão registrada do projeto";
  - o init, quando a resposta for "sem E2E", ajusta o `operations.apply.guidance` do `config.yaml` gerado.
- **ADRs com respostas negativas:** uma resposta negativa a uma decisão obrigatória gera ADR com a restrição explícita (por exemplo, "O projeto SHALL NOT usar contêiner no MVP"). "Ainda não sei" e "Não aplicável" continuam sem ADR.
- **Arquivo de respostas:** o `/opsx:init` aceita, opcionalmente, o caminho de um arquivo Markdown com as respostas. Com ele, o agente aplica as respostas sem perguntar uma a uma, mostra o resumo completo e pede uma confirmação final. Essa confirmação também pode vir do arquivo, com `Confirmação final: sim` e o nome do responsável.

### Fora do escopo

- Reescrever ou reordenar os blocos 1 a 6.
- Criar uma entrevista diferente para cada preset: o bloco 7 adapta a entrevista a partir do próprio preset.
- Validação automática por script do arquivo de respostas.
- Mudar os presets além da linha de E2E.

## Capabilities

### New Capabilities

- `project-initialization`: o que o `/opsx:init` pergunta, como completa os campos do preset, que ADRs gera, como trata a decisão de testes e como aceita respostas pré-preenchidas.

### Modified Capabilities

Nenhuma.

## Impact

- **Comando:** `padrao-openspec/.claude/commands/opsx/init.md`, espelhado pelo sync.
- **Presets:** `padrao-openspec/presets/nextjs/config.yaml` e `presets/dotnet-nextjs/config.yaml` (linha de E2E).
- **Documentação:** `README.md` da raiz (uso do arquivo de respostas).
- **CI:** nenhuma mudança de passo. O passo de configs dos presets precisa continuar passando.
- **Riscos:**
  - **Dados pessoais:** o arquivo de respostas pode conter o nome do responsável, que já vai para o `project-setup.md`.
  - Autenticação: não se aplica.
  - **Compatibilidade:** stores já inicializados não são afetados. O bloco 7 só roda no `/opsx:init`.

## Aprovação

- Responsável: gilmar.campelo
- Data: 2026-10-19
- Escopo: archive
- Condições: `openspec validate --strict` passa; o verify termina sem críticos; a CI fica verde
- Origem: resposta do usuário no chat, "Até o archive, com condições (Recomendado)", à pergunta sobre os lotes 3, 4 e 5, depois de "pode continuar"
