# Revisão de código — regras-em-qualquer-agente

## 2026-10-22

- Intervalo: efd88c4..9091bca (correções em d68b3e1)
- Revisor: subagente requesting-code-review
- Críticos: 0
- Importantes: 1 (corrigido 1, justificado 0)
- Menores: 10 (corrigidos 9, aceito 1)
- Segurança: varredura de secrets adiada no `openspec/project.md` deste repositório; auditoria de dependências não aplicável (a change não adiciona dependências)

Achados:

- [importante] O `--update` (e o workflow semanal dos projetos) falhava inteiro quando o projeto ignorava um dos arquivos de instrução no `.gitignore` (por exemplo, um `CLAUDE.md` pessoal), e o rollback deixava o arquivo criado. Corrigido em d68b3e1: arquivo ignorado e não rastreado é pulado com aviso, não é criado e sai da lista do commit; caso novo na CI ("Arquivo de instrução ignorado pelo projeto").
- [menor] Um `CLAUDE.md` que é symlink para o `AGENTS.md` bloqueava a instalação. Corrigido em d68b3e1: o symlink é pulado com aviso; o alvo recebe o bloco. Não testado no Windows (o Git Bash não cria symlinks por padrão); a lógica é a mesma do pulo por `.gitignore`, coberto pela CI.
- [menor] Um par de marcadores já existente antes da primeira instalação gerava a mensagem genérica "standard files that would change". Corrigido em d68b3e1: sem manifesto, a linha diz que há um bloco `openspec-padrao` não escrito pelo instalador e que ele seria substituído.
- [menor] Arquivo com finais de linha misturados era visto como alterado. Corrigido em d68b3e1: a comparação ignora a diferença entre LF e CRLF; conferido com um `AGENTS.md` misto (segunda execução → "Unchanged").
- [menor] Arquivo só com BOM ganhava linhas em branco antes do bloco. Corrigido em d68b3e1: o BOM fica e o bloco vem logo depois; conferido.
- [menor] Temporários `.openspec-block-*.tmp` (e `.skill-file-*.tmp`) não eram limpos. Corrigido em d68b3e1: a limpeza cobre os dois padrões e as pastas dos blocos; conferido.
- [menor] O modo do arquivo original não era preservado. Corrigido em d68b3e1.
- [menor] As seções 2 e 7 das regras citavam `openspec/` sem dizer que, no código, a raiz OpenSpec é o store. Corrigido em d68b3e1.
- [menor] O design dizia que a guarda do `sync-root` procurava `padrao-openspec/openspec/rules.md`; o código procura o `COMECE-AQUI.md`. Corrigido em d68b3e1 (design alinhado ao código, que é a checagem que funciona com o `rules.md` da raiz gerado).
- [menor] A spec não tinha cenário para bloco alterado exigindo modo nem para arquivo ignorado. Corrigido em d68b3e1.
- [menor] Um par de marcadores dentro de um bloco de código do usuário é tratado como o bloco gerenciado. Aceito: é raro, a mensagem nova explica o que seria substituído, e sem modo nada muda.
