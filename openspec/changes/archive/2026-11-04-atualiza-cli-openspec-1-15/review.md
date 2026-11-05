# Revisão de código — atualiza-cli-openspec-1-15

## 2026-11-04

- Intervalo: 4e02504..a5650c8
- Revisor: subagente requesting-code-review (general-purpose, só leitura)
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 0 (corrigidos 0, justificados 0)
- Menores: 5
- Segurança: varredura de secrets não verificada (adiada no `project.md`, "Varredura de secrets"); auditoria de dependências não aplicável (o repositório não tem `package.json`, e o CLI tem versão fixa)

O revisor reproduziu, a partir de 4e02504, o roteiro do README: a mesma saída pura das duas versões, o mesmo patch e os mesmos dois trechos rejeitados. A cópia resultante difere da HEAD só nas duas linhas do D3. Ele também conferiu que nenhuma referência ao 1.14.2 ficou para trás fora das specs principais, que o archive atualiza.

Achados:

- [menor] `validate.yml`: com `pipefail`, um documento sem `@fission-ai/openspec@` derrubava a atribuição do `grep` e o passo saía com 1 sem mensagem — corrigido em fc0ea58 (`{ grep ... || true; }`)
- [menor] `validate.yml`: um glob de skills sem arquivo fazia o `sed` abortar sem `::error` — corrigido em fc0ea58 (arquivo ausente vira `::error` "Nenhuma skill openspec-* encontrada")
- [menor] `validate.yml`: uma comparação do passo "Instalar OpenSpec CLI" reescrita em outro formato (por exemplo, `==`) saía da checagem sem aviso — corrigido em fc0ea58 (cada formato precisa aparecer uma vez por passo "Instalar OpenSpec CLI")
- [menor] `CHANGELOG.md`: a frase dizia que o update passou a conferir o caminho por glob, mas no upstream o update só mudou o `generatedBy` (conferido no diff da saída pura) — corrigido em fc0ea58; o proposal e o design repetem a afirmação ("em `propose`, `explore` e `update`") e ficam para o `/opsx:update`, se o responsável quiser, porque são artefatos de planejamento
- [menor] uma `cliVersion` de pré-release (`1.16.0-beta.1`) faria a checagem falhar com "cliVersion não encontrada" — sem ação: a falha é segura, e o padrão recusa pré-releases

Conferência das correções (fc0ea58), com o passo extraído e rodado com `bash -e` e com `bash -e -o pipefail`: limpo → exit 0; documento sem menção → exit 1 com `::error file=COMECE-AQUI.md`; comparação reescrita com `==` e 1.14.2 → exit 1 citando os 2 passos; sem as skills da raiz → exit 1 com `::error file=.claude/skills/openspec-*/SKILL.md`; eco do passo de instalação em 1.14.2 → exit 1 citando o `validate.yml`; limpo de novo → exit 0. "Ids de teste com sufixo" e "Versão e changelog" → exit 0; lint do `CHANGELOG.md` → 0 issues; o `validate.yml` carrega como YAML.
