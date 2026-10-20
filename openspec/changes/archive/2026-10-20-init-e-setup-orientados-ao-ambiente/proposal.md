# Proposal

## Why

O teste de ponta a ponta com Django (controleCondominio, 2026-10-19) mostrou que o setup e o init não olham o ambiente real do projeto:

- **Remote do padrão no store (A1).** O store é um clone do PadraoOpenspct e fica com o `origin` apontando para o repositório do padrão. Um `git push` no store mandaria os artefatos do projeto para o padrão.
- **Remote e revisão presumidos (A8, A23).** O init perguntou estratégia de branches e revisão de PR, mas não perguntou se havia remoto nem quantas pessoas revisam. O propose planejou "CI verde no PR" e "abrir PR" num repositório sem remoto, e o apply parou em duas tarefas que não podiam ser concluídas. Depois, o PR foi mergeado sem revisão, porque o único desenvolvedor não pode aprovar o próprio PR, e a regra "PR exige aprovação" virou letra morta.
- **Respostas incoerentes aceitas sem aviso (A3, A4, A6).** O init registrou Celery sem nenhuma capability que precisasse de fila, REST/HTTP entre módulos dentro de um monólito e "variáveis da plataforma" sem ambiente de produção. Cada resposta isolada era válida; juntas, não.

## What Changes

- **Setup:** quando o `origin` do repositório do store aponta para o PadraoOpenspct, o setup o renomeia para `padrao` (as atualizações do padrão continuam disponíveis com `git fetch padrao`, e um `git push` sem remoto configurado falha em vez de publicar no padrão). A opção `--keep-origin` mantém o `origin`. O resumo e a mensagem final explicam como adicionar o remoto do projeto.
- **Init, perguntas novas:** 5.8 "Onde o repositório de código fica hospedado?" (GitHub, GitLab, Azure DevOps, Bitbucket, sem remoto por enquanto) e 5.9 "Quantas pessoas desenvolvem e revisam o código?".
- **Init, checagem de coerência:** antes da confirmação final, o init lista as combinações incoerentes entre as respostas (por exemplo, aprovação obrigatória de PR com uma pessoa só; CI ou PR sem remoto; biblioteca de filas sem processamento em background; comunicação por rede entre módulos de um monólito; variáveis de plataforma sem produção) e pede, para cada uma, ajustar a resposta ou manter com justificativa. O resultado vai para o `project-setup.md`.
- **Init, revisão de PR com uma pessoa só:** a checagem oferece registrar a revisão por subagente (`requesting-code-review`), com o resultado anexado ao PR, como substituta da aprovação humana.
- **Config base:** nova regra de tasks: tarefas que dependem de push, PR ou CI remoto só entram quando o `project.md` registra um remoto; sem ele, a tarefa usa a verificação local equivalente.
- READMEs atualizados (setup e `--keep-origin`).

### Fora do escopo

- Criar o repositório remoto do projeto ou configurá-lo; o setup só orienta.
- Mudar a estratégia de revisão de projetos já inicializados.
- Registro detalhado do verify, commits do planejamento, confirmação do archive e pedido de push: ficam nas changes `registro-de-verificacao-detalhado` e `fluxo-de-change-auditavel`.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `store-setup`: o setup desliga do store o remote do repositório do padrão.
- `project-initialization`: perguntas de remoto e tamanho do time; checagem de coerência antes da confirmação final.
- `workflow-governance`: tarefas que dependem de remoto só são planejadas quando o projeto tem remoto.

## Impact

- **Scripts:** `padrao-openspec/scripts/setup-project.mjs`.
- **Fonte única:** `padrao-openspec/.claude/commands/opsx/init.md`, `padrao-openspec/openspec/config.yaml`; espelhos da raiz pelo sync.
- **CI:** `.github/workflows/validate.yml` (smoke do remote do padrão).
- **Documentação:** `README.md` e `padrao-openspec/README.md`.
- **Riscos:**
  - Dados pessoais, autenticação, esquema de dados e variáveis de ambiente: não se aplicam.
  - **Compatibilidade:** quem roda o setup no próprio clone de desenvolvimento do padrão teria o `origin` renomeado. Mitigação: o setup pergunta antes de renomear quando há terminal, mostra o comando que desfaz (`git remote rename padrao origin`) e aceita `--keep-origin`.

## Aprovação

- Responsável: gilmar.campelo
- Data: 2026-10-20
- Escopo: archive
- Condições: `openspec validate --all --strict` passa na raiz e em `padrao-openspec/`; `sync-root.mjs --check` passa; o lint de Markdown passa nos dois lugares; os smoke tests locais do instalador e do setup passam; o verify termina sem críticos; nenhum arquivo fora do raio de impacto é alterado sem confirmação. Commits na branch `feat/padrao-generalista-e-correcoes`; push e PR só com pedido do responsável.
- Origem: respostas do usuário no chat, depois de "implemente toda as correções e aprimoramentos": "Por tema, 4 changes (Recomendado)" e, à pergunta "Qual autorização você dá?", "Até o archive, com condições (Recomendado)", cuja opção dizia "condições 'validate --strict, sync-root --check e markdownlint passando; sem mudar arquivos fora do raio de impacto'" e "Commits em branch; push e PR só com seu pedido"
