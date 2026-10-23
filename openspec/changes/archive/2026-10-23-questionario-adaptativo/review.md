# Revisão de código — questionario-adaptativo

## 2026-10-23

- Intervalo: e77c917..9748c95
- Revisor: subagente requesting-code-review
- Críticos: 0 (corrigidos 0, justificados 0)
- Importantes: 2 (corrigidos 2, justificados 0)
- Menores: 5 (corrigidos 4, justificados 1)
- Segurança: não verificado (varredura de secrets adiada no `project.md`; a change não adiciona dependências nem credenciais)

Achados:

- [importante] Frase das "Regras de salto" dizia que a pulada não entra nos filtros, contradizendo a correção do filtro pelo valor registrado — corrigido em a92bcdf
- [importante] Filtros da 3.7 e da 5.4 escondiam Zod e Vitest/Jest num monorepo com back-end em outra linguagem e front-end JS/TS — corrigido em a92bcdf (mantém a opção 1 com a 3.2 em 1 ou 2)
- [menor] D3 do design ainda diz que uma pulada não filtra — justificado: o desvio está registrado na evidência da 4.1; atualizar o design muda o selo do planejamento e pede a reconfirmação do responsável, levada ao verify
- [menor] Microsserviços com dois gatilhos numa linha só engolia o segundo motivo — corrigido em a92bcdf (duas linhas)
- [menor] "Ajustar" para um bloco já confirmado sem dizer como retomar e reavaliar saltos e filtros — corrigido em a92bcdf
- [menor] Brief que sustenta uma opção oculta — corrigido em a92bcdf (mostra a lista inteira e recomenda, com o aviso)
- [menor] CHANGELOG dizia só "continua compatível" para o arquivo de respostas — corrigido em a92bcdf
