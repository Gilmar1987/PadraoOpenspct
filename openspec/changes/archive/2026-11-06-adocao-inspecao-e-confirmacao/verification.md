# Verificações — adocao-inspecao-e-confirmacao

## 2026-11-06

- Críticos: 0
- Warnings: 2
- Sugestões: 1
- Não verificado: —
- Camadas: — (sem matriz no project.md)
- Cobertura fora da suíte: "Projeto adotado pelo script", "Confirmação da linguagem do back-end", "Detecção recusada", "Banco em conflito" e "Registro da 3.1 confirmada" (teste do `/opsx:init` em `C:\teste006\loja`, rodado pelo responsável, tarefa 5.3); "Branch de adoção", "Escopo antes da leitura" e "Detecção incompatível com a stack escolhida" (reteste em `C:\teste007\loja`, rodado pelo responsável, tarefa 5.5)
- Avaliação: No critical issues. 2 warning(s) to consider. 1 suggestion(s) to consider. Ready for archive (with noted improvements).

Itens:

- [warning] Design decision not followed: o D8 lista na Ativação e na exceção da branch só `managedFiles`, o manifesto e o `openspec/config.yaml`, sem as condições `rev-list` e de lista não vazia; o `init.md` usa a lista do commit de adoção (com `managedBlocks`, `.gitignore`, `.claude/settings.json` e o `.gitattributes` com o bloco) e as quatro condições (`design.md` D8, passos 1 e 3; `padrao-openspec/.claude/commands/opsx/init.md:117` e `:145`); o desvio está só nas evidências da 5.4 e no `review.md` — alinhar o D8 por `/opsx:update` antes do archive
- [warning] Design decision not followed: o D7 e o D10 pedem o `esperado.json` com a saída inteira sem `raiz`, e os fixtures guardam a projeção que o teste compara (`padrao-openspec/scripts/test-inspecionar-codigo.mjs:54-70`); o desvio está só na evidência da 2.1 — alinhar o D7 e o D10 no mesmo `/opsx:update`
- [sugestão] Cenários "Código sem a marca", "Dois back-ends" e "Comentário que tenta mudar a entrevista" não foram exercitados por nenhuma execução: só o texto da regra é conferido no "Trechos customizados das skills" (a regra da Ativação e a dos vários projetos nem isso), o que a seção "Limite" da ADR-0010 aceita como "sob palavra"; o reteste da 5.5 rodou antes de 07f17c3, que tornou mais estrita a condição da branch (no cenário do reteste o resultado é o mesmo) — exercitar os três num próximo teste de adoção

Comandos:

- `review.md` → c5ef13f..a4f3182 (correções c674d44) e 6d4cb82..7900094 (correções 07f17c3), subagente requesting-code-review; nenhum código depois de 7900094 além da correção listada
- `openspec instructions apply --change adocao-inspecao-e-confirmacao --json` → 19/19 tarefas, `all_done` (exit 0)
- `node scripts/test-inspecionar-codigo.mjs` (em `padrao-openspec/`, `verificacao` da ADR-0010, `controle`) → "Teste da inspeção: 9 fixtures ok" (exit 0); vista falhando nas tarefas 2.2 (sem o script, exit 1) e 3.4 (cinco violações injetadas, exit 1 cada)
- `node --check` nos dois scripts → ok (exit 0)
- `node padrao-openspec/scripts/sync-root.mjs --check` → em dia (exit 0)
- jobs `store` e `root` do `validate.yml` → 26 PASS, 1 pulado (só Linux) (exit 0; reused from apply, tarefa 6.2, sobre 69394ef; depois só 5b98774, que muda o `tasks.md`)
- `openspec validate --all --strict` → 23 passed; `markdownlint-cli2@0.23.2` → 0 issues em 319 e 30 arquivos (exit 0; reused from apply, tarefa 6.2)
- Princípios de engenharia (sem a linha no `project.md`, os três itens valem): a entrada externa do script (argumentos e arquivos lidos) é tratada como dado, com erro de uso no código 2; não há mutação, então o log de três estados não se aplica; os erros mostram só `Erro: <mensagem>`, sem pilha (`inspecionar-codigo.mjs:880-895`); a saída mascara segredos e não traz trecho de arquivos de dados (teste acima)
- Interface: sem brief visual e sem tela; "telas" aparece só no "Fora do escopo" do `proposal.md:29` (change 3), sem pergunta
- Lacunas, "Falhas aceitas", saídas do `estado-atual.md` e contratos de interface: não aplicáveis (o repositório não tem `lacunas.md` nem `estado-atual.md`, e a change não toca contrato registrado)
