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
- Com pull request, a aprovação é a revisão do PR que muda o status para `Accepted`. Em projetos sem pull request, a aprovação é a declaração explícita do responsável, citada na mensagem do commit que muda o status. Nos dois casos, o histórico do Git é o registro de autoria e data; não duplique revisor, aprovação ou hash de commit no arquivo.
- As ADRs fundacionais geradas pelo `/opsx:init` nascem `Accepted`, porque as respostas da entrevista foram confirmadas bloco a bloco pelo responsável.
- `verificacao` (opcional): lista dos testes ou comandos que conferem a decisão no código, por exemplo um teste de arquitetura que proíbe o domínio de importar a camada de banco (`tests/architecture/test_dependencias.py`, `npx depcruise src`, `dotnet test --filter Architecture`). O `/opsx:verify` roda esses testes nas changes que tocam a ADR. Fica vazio quando a decisão não se confere por código (hospedagem, processo). Acrescentar ou corrigir `verificacao` numa ADR `Accepted` não muda a decisão e não exige ADR nova.
- `imposicao` (opcional): a forma como a decisão é imposta, e com ela a severidade no `/opsx:verify`:
  - `controle`: a verificação roda e a falha é crítica;
  - `consultivo`: a verificação roda e a falha é registrada como warning, sem bloquear;
  - `externo`: a regra mora na configuração de uma ferramenta do projeto, e a `verificacao` cita `<arquivo de configuração>#<regra>`; o verify confere que a regra está lá e não está desligada;
  - `norma`: sob palavra, sem verificação automática.

  Sem o campo, a ADR conta como `controle` quando tem `verificacao` e como `norma` quando não tem. `controle` ou `consultivo` sem `verificacao` é crítico ("verificador ausente"). Uma verificação nova costuma nascer `consultivo` e só é promovida a `controle` depois de vista reprovando e sem falso positivo no registro.
- **Visto reprovando:** uma verificação só conta depois de rodar com a violação injetada, falhando, e no caso limpo, passando, com os dois códigos de saída na evidência da tarefa. A violação injetada é temporária e não entra no commit.
- **Limite:** a seção separa o que o mecanismo garante do que fica sob palavra, nomeando o campo exato ("confere as importações declaradas", e não "confere a arquitetura").
- Mudar `imposicao` ou "Limite" numa ADR `Accepted` não muda a decisão e não exige ADR nova; promover a `controle` exige a prova de reprovação.

## Relação com os agentes

- O Consistency Guardian trata ADRs `Accepted` como restrições vigentes: uma change que as contrarie é reportada como contradição, e uma decisão nova que atenda aos critérios acima gera a recomendação de criar uma ADR.
- O Spec Architect pode apresentar o rascunho da ADR junto dos drafts de design; quem grava o arquivo é o coordenador ou o humano.
