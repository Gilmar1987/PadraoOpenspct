# Tasks

## 1. Preparação e checagem primeiro

- [ ] 1.1 Combinar a versão com a outra sessão (`guarda-da-pasta-da-sessao`): se ela já estiver na `main`, rebasear esta branch e acrescentar itens à 1.17.0 que ela abriu; senão, combinar quem abre a 1.17.0 (D5). Verificar com `git log --oneline HEAD..origin/main` vazio e a decisão citada na evidência.
- [ ] 1.2 Escrever o passo "Versão do OpenSpec CLI coerente" no job `root` do `.github/workflows/validate.yml` (D4), citando num comentário o requisito "Versão do OpenSpec CLI coerente" e seus cenários. Verificar rodando o passo a partir de um arquivo (`bash -e -o pipefail step.sh`) três vezes, com os códigos de saída na evidência: com tudo em `1.14.2`, ele passa; com `cliVersion` trocada temporariamente para `1.15.0`, falha citando os outros arquivos e a versão `1.14.2`; de volta ao estado original, passa. A troca temporária não é commitada.

## 2. Skills e comandos

- [ ] 2.1 Gerar a saída pura do CLI 1.14.2 e do 1.15.0 numa pasta temporária fora do repositório, com a configuração isolada por `XDG_CONFIG_HOME` (D2, passos 1 e 2), e montar o patch com os caminhos de `padrao-openspec/.claude/` (passo 3). Verificar com `openspec config path` apontando para a pasta temporária durante a geração, com a configuração global sem mudança (`git diff --no-index` ou hash antes e depois) e com `git apply --check -v` listando o único trecho que falha (as "Artifact Creation Guidelines" do `propose`, em comando e skill).
- [ ] 2.2 Aplicar o patch em `padrao-openspec/.claude/`, resolver à mão o trecho do D3 nos dois arquivos do `propose` e rodar `node padrao-openspec/scripts/sync-root.mjs`. Verificar com:
  - o `diff -ru` entre a saída pura do 1.15.0 e `padrao-openspec/.claude/`, que mostra só os trechos do padrão, sem nenhuma linha do 1.14.2 que o upstream trocou;
  - `generatedBy: "1.15.0"` nas sete skills;
  - os passos "Trechos customizados das skills" e "Raiz em dia com padrao-openspec" passando.

## 3. Versão fixada e documentação

- [ ] 3.1 Trocar `1.14.2` por `1.15.0` em `padrao-openspec/scripts/comecar.mjs` (`cliVersion`), `padrao-openspec/scripts/portao.mjs` (mensagem de CLI ausente) e nos dois passos "Instalar OpenSpec CLI" do `validate.yml`. Verificar com `node --check` nos dois scripts, com o passo "Versão do OpenSpec CLI coerente" ainda falhando só pelos documentos e com os passos "Smoke test do script de entrada" e "Portão testado na CI" passando com o CLI 1.15.0.
- [ ] 3.2 Atualizar a documentação:
  - `README.md`: a versão na seção "Manutenção do padrão", o comando de validação local e o roteiro do D2 no lugar do "regenere e reaplique", com a pasta temporária, o `XDG_CONFIG_HOME`, o patch e o conflito resolvido à mão;
  - `padrao-openspec/README.md`, `COMECE-AQUI.md` (incluindo a saída de exemplo `OpenSpec CLI . 1.15.0 ok`) e `openspec/project.md` (linha "Instalar dependências").
  Verificar com o passo "Versão do OpenSpec CLI coerente" passando, com `grep -rn "1\.14\.2" --exclude-dir=archive . | grep -v CHANGELOG.md` sem nenhuma linha fora das specs principais que esta change modifica e com o lint de Markdown na raiz e em `padrao-openspec/` passando.
- [ ] 3.3 Atualizar o `CHANGELOG.md` com o item "OpenSpec CLI 1.15.0" na seção 1.17.0 e a ação `npm install -g @fission-ai/openspec@1.15.0` em "Ações no projeto" (D5); se esta change abrir a versão, também o `padrao-openspec/VERSION`. Verificar com os passos "Versão e changelog" e "Smoke test do changelog-range" passando.

## 4. Integração

- [ ] 4.1 Rodar, com o CLI 1.15.0 instalado, `openspec validate --all --strict` na raiz e em `padrao-openspec/`, o `sync-root.mjs --check`, o lint nos dois lugares e todos os passos dos jobs `store` e `root` localmente, a partir de arquivo e com tempo limite por passo. Antes de instalar o CLI 1.15.0 na máquina e antes da suíte, avisar a outra sessão e esperar a resposta (seção 8 das regras: CLI global e registro de stores). Verificar com todos os passos saindo com código 0 e nenhum id `ci-*` sobrando no registro de stores.
- [ ] 4.2 Pedir ao responsável o teste do `comecar.mjs` num console real do Windows (PowerShell), com as respostas digitadas, conferindo a linha `OpenSpec CLI` da conferência do ambiente, conforme o `project.md`. Verificar com o resultado registrado no `verification.md` como cobertura fora da suíte; sem o teste, o archive espera.

## Workflow follow-up

- Revisão de código, `/opsx:verify` e `/opsx:archive`, cada um com a aprovação e o comando do responsável.
- PR depois do archive; o merge fica com o responsável.
