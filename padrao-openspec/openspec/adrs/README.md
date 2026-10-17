# Architecture Decision Records

Registro das decisões de arquitetura duradouras do projeto. As specs em
`openspec/specs/` descrevem **o que** o sistema faz; as ADRs registram **por que**
uma escolha técnica transversal foi feita e o que ela impõe às próximas changes.

## Quando criar uma ADR

Crie uma ADR quando a decisão:

- afeta mais de uma capability ou sobrevive à change que a originou;
- é cara de reverter (stack, persistência, autenticação, integração, formato de dados, topologia de deploy);
- restringe changes futuras ("toda API pública deve...", "não usar...").

Decisões locais a uma única change ficam no `design.md` dessa change. Se o design
de uma change tomar uma decisão que se encaixa nos critérios acima, extraia-a para
uma ADR antes do arquivamento, porque o `design.md` passa a viver em
`openspec/changes/archive/`.

## Convenções

- Arquivo: `NNNN-titulo-curto.md`, numeração sequencial com quatro dígitos. Copie [template.md](template.md).
- Status: `Proposed` → `Accepted`; depois, se for o caso, `Superseded` ou `Deprecated`.
- ADR aceita não é reescrita. Para mudar a decisão, crie uma nova ADR com `supersedes` e marque a anterior como `Superseded`, preenchendo `superseded_by`.
- A aprovação é a revisão do pull request que muda o status para `Accepted`; o histórico do Git é o registro de autoria e data. Não duplique revisor, aprovação ou hash de commit no arquivo.

## Relação com os agentes

- O Consistency Guardian trata ADRs `Accepted` como restrições vigentes: uma change que as contrarie é reportada como contradição, e uma decisão nova que atenda aos critérios acima gera a recomendação de criar uma ADR.
- O Spec Architect pode apresentar o rascunho da ADR junto dos drafts de design; quem grava o arquivo é o coordenador ou o humano.
