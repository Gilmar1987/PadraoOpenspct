# Revisão de código — ajustes-do-init-e-arquitetura

## 2026-10-22

- Intervalo: b217a10..b237b47 (correções em 573f2e1)
- Revisor: subagente requesting-code-review
- Críticos: 0
- Importantes: 4 (corrigidos 4, justificados 0)
- Menores: 9 (corrigidos 7, aceitos 2)
- Segurança: varredura de secrets adiada no `openspec/project.md` deste repositório (registrada como "Adiado"); auditoria de dependências não aplicável (a change não adiciona dependências)

Achados:

- [importante] O CHANGELOG e a proposta subestimavam a renumeração da 3.8: um arquivo de respostas com a 3.8 = 3 (Hangfire) viraria "Broker dedicado" sem aviso. Corrigido em 573f2e1: mapa completo antiga → nova nas "Ações no projeto" e a nota de compatibilidade da proposta corrigida.
- [importante] Com "5) Testcontainers" na 5.5, a linha de E2E falaria em cobrir a interface com Testcontainers. Corrigido em 573f2e1: a linha de E2E vale para frameworks de interface (1 a 4); Testcontainers gera uma linha de integração e, com front-end, também a do roteiro em navegador; o comando citado passa a ser o de E2E do bloco 7.
- [importante] O "Arquivo 2" pedia só um resumo, mas o modelo do `project.md` manteve as subseções "Componentes e limites" e "Fluxo de dados e integrações". Corrigido em 573f2e1: as subseções registram uma linha cada e apontam para o `arquitetura.md`.
- [importante] A regra do diagrama ("só componentes e setas da 2.4") não permitia as setas entre camadas nem o ator, que o exemplo do Lava Jato usa. Corrigido em 573f2e1: o ator é o público da 1.3, e as setas são as dependências reais, no estilo da 2.4; o exemplo passa a seguir a regra.
- [menor] A 7.2 podia perguntar "Idioma do código" antes da 7.3. Corrigido em 573f2e1 ("nem a 7.3"), e "Organização e estilo" passa a considerar o lint da 7.1.
- [menor] O arquivo de respostas não previa a 7.3 nem os campos de Development Conventions. Corrigido em 573f2e1.
- [menor] A nota da 3.8 podia ser mostrada ao usuário e não dizia se os exemplos eram fixos. Corrigido em 573f2e1: a nota é para o agente e manda ajustar os exemplos mantendo os seis tipos.
- [menor] A checagem de coerência ainda falava em "biblioteca" e não cobria Redis ou broker sem serviço no deploy. Corrigido em 573f2e1: linha antiga reescrita e linha nova de infraestrutura.
- [menor] O rodapé do `project-setup.md` não citava o `arquitetura.md`. Corrigido em 573f2e1.
- [menor] A CI checava `openspec/arquitetura.md`, que também aparece nos próximos passos. Corrigido em 573f2e1: checa o título do "Arquivo 5", o `flowchart LR`, a 7.2 com Development Conventions e a linha nova da checagem.
- [menor] README e COMECE-AQUI não citavam o `arquitetura.md`. Corrigido em 573f2e1.
- [menor] O modelo não cobre multi-tenant (1.6) nem offline/PWA (1.8). Aceito: as duas decisões aparecem pelas ADRs na seção "Decisões"; ampliar o modelo fica para outra change.
- [menor] A tarefa 4.2 estava aberta durante a revisão. Concluída depois, com a suíte completa.
