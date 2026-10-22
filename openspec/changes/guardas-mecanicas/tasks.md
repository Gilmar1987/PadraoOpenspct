# Tasks

## 1. Testes na CI

- [ ] 1.1 Aplicar o D6 no `validate.yml` (sintaxe, "Smoke test do portão" e "Run the gate" nos trechos customizados). Verificar rodando os passos no Git Bash: devem falhar.

## 2. Portão

- [ ] 2.1 Criar `padrao-openspec/scripts/portao.mjs` conforme o D1 e entregá-lo pelo instalador. Verificar com o "Smoke test do portão" e os smoke tests do instalador passando no Git Bash.

## 3. Fluxos, bloco e regras

- [ ] 3.1 Aplicar o D2 nos 4 arquivos do apply e do archive e o D3 no `agents-block.md` e no `rules.md`, e regenerar a raiz com `sync-root.mjs`. Verificar com "Trechos customizados das skills", "Smoke test dos blocos de agentes" e `sync-root --check` passando.

## 4. Release, guias e versão

- [ ] 4.1 Criar o `.github/workflows/release.yml` conforme o D4 e aplicar o D5 e o D7. Verificar com `yaml.safe_load` do workflow, o lint nos dois lugares sem issues e os passos "Guia de primeiros passos" e "Versão e changelog" passando.
- [ ] 4.2 Rodar os comandos de verificação do `openspec/project.md` localmente, depois de combinar com a outra sessão que ela não roda a suíte ao mesmo tempo, e conferir no PR os três jobs. Verificar que todos passam.

## Workflow follow-up

- Depois do merge e da release `v1.9.0`, conferir que o workflow de release rodou e que o anexo está lá (o primeiro teste real do D4).
- Avisar a outra sessão da interface final do portão, se ela mudar em relação à combinada.
