# Revisão de código — qualidade-em-windows

## 2026-10-22

- Intervalo: 2138053..7c2138d (ajustes em 8915771)
- Revisor: subagente requesting-code-review
- Críticos: 0
- Importantes: 0
- Menores: 5 (corrigidos 4, corrigido em parte 1)
- Segurança: varredura de secrets adiada no `openspec/project.md` deste repositório; auditoria de dependências não aplicável (o PyYAML só roda na CI, com versão fixa `6.*`)

Achados:

- [menor] Uma falha no meio do passo do drive deixaria o id `ci-drive` registrado, e uma execução local seguinte falharia com uma mensagem sem relação com o erro real. Corrigido em 8915771: `trap` que desregistra o id no fim; o mesmo no passo do script de entrada (`ci-entrada`).
- [menor] Avisos "LF will be replaced by CRLF" no log do Windows, porque o repositório temporário não tinha o `.gitattributes`. Corrigido em parte em 8915771: o padrão temporário recebe o `.gitattributes` da raiz; os avisos que sobram vêm do repositório de código do teste, que, como um projeto real, não tem `.gitattributes`, e não afetam o resultado.
- [menor] PyYAML instalado sem versão e sujeito à PEP 668 numa imagem Ubuntu futura. Corrigido em 8915771: `pyyaml==6.*`, com fallback `--user --break-system-packages`.
- [menor] O teste cobre o drive minúsculo e o nome curto 8.3 ao mesmo tempo. Corrigido em 8915771: comentário no passo explicando que os dois casos são cobertos de propósito.
- [menor] A regra do console real não dizia o que fazer quando a change não tem release. Corrigido em 8915771: "sem release, o teste vem antes do archive", e "na dúvida se um script é interativo, ele é".
