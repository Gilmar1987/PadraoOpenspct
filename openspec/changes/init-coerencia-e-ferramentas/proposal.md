# Proposal

## Why

O teste do padrão com o projeto Lava Jato (relatório em `C:\TesteOpenSpct\response.md`) e o roteiro da entrevista adaptativa deixaram problemas do `/opsx:init` em aberto:

- **Combinações incoerentes fora da tabela** (item 5 do relatório). O agente só as achou por conta própria: banco local com deploy serverless, chave de criptografia guardada só em `.env` e cobertura mínima exigida com um comando de testes que não mede cobertura. Um contrato de interface registrado sem comando de teste de contrato também passa sem aviso. Outro agente pode deixar tudo isso passar.
- **Ferramentas ausentes da máquina** (item 13). O `project.md` exige comandos (por exemplo, `gitleaks`) que ninguém confere. A falta só aparece no meio do apply.
- **Auditoria de dependências** (item 24). O comando registrado acusa vulnerabilidades de ferramentas de desenvolvimento sem correção e trava o apply. A auditoria só de produção (`npm audit --omit=dev`, por exemplo) daria o sinal certo.
- **Ambiguidades achadas no roteiro da entrevista adaptativa:**
  - na linha "Redis ou broker sem serviço no bloco 4", não há onde registrar o serviço;
  - a linha "4.1/4.3 não têm produção" nunca é verdadeira como está escrita;
  - a 6.4 não diz que "0) Nenhuma no MVP" exclui as outras opções.

## What Changes

- **Checagem de coerência do init, quatro linhas novas:**
  - banco local (3.3 = SQLite ou 3.4 = "Local apenas") com deploy serverless (4.1 = Vercel/Netlify ou 2.1 = Serverless): o sistema de arquivos é efêmero;
  - 4.4 = "Apenas .env" com 6.6 = criptografia de campos na aplicação: a chave fica sem cofre em produção;
  - 5.6 com cobertura mínima com um comando de testes da 7.1 que não mede cobertura;
  - 2.6 com contrato registrado com o "Teste de contrato" da 7.1 em "Não aplicável".
- **Linhas existentes reescritas, sem mudar a intenção:**
  - "3.8 é Redis ou broker dedicado e o bloco 4 não prevê esse serviço" passa a dizer onde registrar o serviço (contêiner na 4.2 ou serviço gerenciado na 4.1, por "Outro");
  - "4.4 usa variáveis ou cofre da plataforma e 4.1/4.3 não têm produção" passa a ter uma condição verdadeira: a 4.1 em "Outro" sem produção, como "Sem deploy no MVP".
- **6.4:** a opção "0) Nenhuma no MVP" exclui as demais, como a "0" da 2.6.
- **7.1, auditoria de dependências:** a sugestão passa a ser a auditoria só das dependências de produção (por exemplo, `npm audit --omit=dev`, `pip-audit -r requirements.txt`), que bloqueia o apply. A auditoria completa vai como informativa na coluna "Observações".
- **Ferramentas conferidas no fim do init:** depois do commit, o init confere se a ferramenta de cada comando de verificação registrado responde (`<ferramenta> --version`, ou o equivalente do sistema). Ele lista as que faltam com a sugestão de instalação e não instala nada. O COMECE-AQUI ganha o aviso de que, no Windows, um terminal aberto antes de uma instalação por `winget` não enxerga a ferramenta nova.
- **Documentação e CI:** marcadores dos trechos novos, a linha do README e o item na 1.15.0 do CHANGELOG.

### Fora do escopo

- Itens do relatório que tocam o propose, e não o init, ficam para uma change própria, a "versões e ADRs no propose":
  - consultar e fixar versões estáveis das dependências no design (itens 9 e 10);
  - commitar a ADR criada no propose junto do planejamento (item 7).
- Instalar ferramentas automaticamente.
- Mudar o modelo de `project.md` (uma linha de auditoria só, como hoje).
- Publicar a release.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `project-initialization`: as quatro combinações novas, o "0" exclusivo da 6.4, a auditoria de produção sugerida na 7.1 e a conferência das ferramentas no fim do init.

## Impact

- **Comando** (fonte em `padrao-openspec/.claude/commands/opsx/init.md`, espelhado pelo `sync-root.mjs`): tabela de coerência, pergunta 6.4, 7.1 e uma seção nova "Ferramentas da máquina" depois de "Commit the init".
- **CI e documentação:** marcadores no passo "Trechos customizados das skills" (`.github/workflows/validate.yml`), `README.md`, `COMECE-AQUI.md` e `CHANGELOG.md`.
- **Dependências:** nenhuma nova.
- **Riscos:**
  - Compatibilidade: o arquivo de respostas continua igual, e a checagem de coerência roda no fim, como hoje.
  - Projetos já inicializados não são afetados.
- **Interface com outros sistemas:** não se aplica.
- **Débitos:** o repositório não tem `openspec/estado-atual.md`.
- **Falhas aceitas:** o repositório não tem `openspec/estado-atual.md`, então a seção não existe.
- **Changes concorrentes:** nenhuma ativa nesta branch. A change da outra sessão que leva ao padrão a aprovação escrita e o comando por etapa (branch `feat/aprovacao-e-comando-por-etapa`) não toca o `init.md`. Ela se sobrepõe a esta só no `validate.yml`, no README e no CHANGELOG, com conflitos textuais. Quem entrar por último faz o rebase.
- **Versão:** acrescenta um item à seção aberta do `CHANGELOG.md` (1.15.0, ainda sem release), sem mexer no `VERSION`.

## Aprovação

- Responsável: Pendente
- Data: —
- Escopo: —
- Condições: —
- Origem: —
