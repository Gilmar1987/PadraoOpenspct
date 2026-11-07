# Revisão de código — guarda-da-pasta-para-qualquer-agente

## 2026-11-06

- Intervalo: 2f81802..88ae213
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 4 (corrigidos 3, justificados 1)
- Menores: 5
- Segurança: varredura de secrets não verificada (o `project.md` a registra como adiada); auditoria de dependências não se aplica (nenhuma dependência nova)

Achados:

- [importante] O `CHANGELOG.md` mandava atualizar a raiz do clone com `git pull`, mas a `main` do clone não tem upstream — corrigido em f8de91b (e o "Migration Plan" do design, no `/opsx:update` de 52422f1)
- [importante] A guarda não disparava na pasta `padrao-openspec/` do clone, que também tem `.claude/commands/opsx/` — corrigido em f8de91b: o segundo marcador, `.openspec-store/store.yaml`, ao lado do `.claude/`, na guarda, nas regras e na CI (spec ajustada em 52422f1)
- [importante] As regras proibiam só "specs, changes ou ADRs" — corrigido em f8de91b: "nada em `openspec/`"
- [importante] Faltavam as tarefas 3.2 e 3.3 — justificado: eram tarefas abertas, não um defeito; a 3.2 foi registrada em 5ae796a e a 3.3 roda antes do verify
- [menor] O "lido desse arquivo" das regras apontava para o `config.yaml` — corrigido em f8de91b ("lido do `store.yaml`")
- [menor] A CI não conferia a ordem nem o "em qualquer agente" — corrigido em 0d23eb1, visto falhando com a troca temporária das guardas no `init.md`
- [menor] O repositório do padrão sem proteção contra o marcador — corrigido em 0d23eb1 (passo novo no job `root`)
- [menor] O comando expandido pelo Claude Code não traz o caminho do arquivo — corrigido em f8de91b (a pasta da sessão, nesse caso)
- [menor] O `COMECE-AQUI.md` não tinha a ressalva dos clones antigos — corrigido em f8de91b

## 2026-11-06

- Intervalo: bed644e..f8de91b
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 1 (corrigidos 1, justificados 0)
- Menores: 4
- Segurança: varredura de secrets não verificada (adiada no `project.md`); auditoria de dependências não se aplica

Achados:

- [importante] A ressalva do `CHANGELOG.md` e do `COMECE-AQUI.md` falava em clones criados a partir desta versão, mas a raiz vem do store, e clonar um store antigo traz a raiz antiga — corrigido em 66c9321 ("stores criados a partir da 1.19.0", com o caso da opção "projeto em andamento")
- [menor] A conferência da ordem abortava sem mensagem sob `pipefail` quando faltava uma das guardas — corrigido (`|| true`)
- [menor] O passo do job `root` não olhava `.openspec-store/` na raiz do repositório — corrigido (os dois caminhos), visto falhando com o marcador criado à mão na raiz e passando sem ele
- [menor] A CI exigia ``nada em `openspec/` `` só no `rules.md` — corrigido (também no bloco de agentes)
- [menor] Na raiz do clone, o primeiro pedido sem aprovação parou pela aprovação antes de citar a guarda — justificado: nada foi gravado e o agente para do mesmo jeito; pôr a guarda acima da conduta de aprovação nas regras mudaria a ordem de uma regra que vale para todos os fluxos, sem ganho de segurança
