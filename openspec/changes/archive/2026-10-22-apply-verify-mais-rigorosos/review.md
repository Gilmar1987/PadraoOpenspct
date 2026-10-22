# Revisão de código — apply-verify-mais-rigorosos

## 2026-10-22

- Intervalo: c7cdec8..ba4f9d6 (correções em aaf7ca1)
- Revisor: subagente requesting-code-review
- Críticos: 0
- Importantes: 5 (corrigidos 5, justificados 0)
- Menores: 8 (corrigidos 8)
- Segurança: varredura de secrets adiada no `openspec/project.md` deste repositório; auditoria de dependências não aplicável (a change não adiciona dependências)

Achados:

- [importante] "Simulate CI on a clean copy" podia levar o agente a rodar passos de publicação ou deploy. Corrigido em aaf7ca1: só build, testes, lint e validação; passos que publicam, fazem deploy, push ou exigem secrets da CI ficam como não verificados.
- [importante] Depois de um `/opsx:update` que zera a aprovação no meio de um apply, nada fazia o apply parar. Corrigido em aaf7ca1: o trecho "Unrequested fixes are scope" manda reler `## Aprovação` (passo 4a) depois de qualquer update, antes da próxima escrita de código.
- [importante] O passo de revisão antes do verify rodava antes do status, sem `changeRoot`, e acusaria revisão ausente quando há store. Corrigido em aaf7ca1: virou o passo 2a, depois do status, e procura o `review.md` em `changeRoot`.
- [importante] O roteiro executado por agente pedia execução humana "antes do archive", sem dizer se isso bloqueia. Corrigido em aaf7ca1: é uma pausa, também com `Escopo: archive`, até a execução humana ou o aceite explícito da cobertura parcial.
- [importante] "Production-mode check" não dizia o que fazer sem os comandos no `project.md`. Corrigido em aaf7ca1: comando ausente é "não verificado", nunca inventado.
- [menor] O ramo "Missing file" do "Code review record" ficou como reserva. Corrigido em aaf7ca1: indica que normalmente o verify já parou no 2a.
- [menor] "Unrequested fixes are scope" e a pausa "surface the added scope" pareciam dois procedimentos. Corrigido em aaf7ca1: o trecho diz que é a mesma pausa.
- [menor] A linha "Aprovação anterior" perdia as `Condições` e o item `Archive:`. Corrigido em aaf7ca1.
- [menor] A mensagem do archive dizia "nunca aprovada" mesmo depois de uma aprovação zerada. Corrigido em aaf7ca1.
- [menor] "Dependencies in Impact" podia acusar serviços fora do manifesto e projetos sem manifesto. Corrigido em aaf7ca1: manifesto só para bibliotecas e pacotes; sem manifesto, não se aplica.
- [menor] "Tool generators" não dizia o que é um gerador. Corrigido em aaf7ca1: inicializadores e scaffolders, não instalações de pacotes.
- [menor] O `rules.md` não dizia que mudança de escopo zera a aprovação. Corrigido em aaf7ca1 (seção 2).
- [menor] O design citava outra posição para os trechos do apply e o passo 1a. Corrigido em aaf7ca1 (design alinhado ao código).
