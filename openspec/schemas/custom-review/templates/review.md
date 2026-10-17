# Review: {{change_name}}

## Checklist de Qualidade

### Especificação
- [ ] Todos os requisitos têm ao menos um cenário testável
- [ ] Nenhum requisito contradiz specs existentes em `openspec/specs/`
- [ ] Escopo fora do change está declarado explicitamente no `proposal.md`

### Implementação
- [ ] Regras de negócio estão nos serviços, não em componentes ou rotas
- [ ] Entradas validadas com Zod
- [ ] Datas tratadas em UTC com conversão para o fuso do negócio
- [ ] Cobertura ≥ 80% nos módulos `availability` e `booking`

### Conflitos e Concorrência
- [ ] Constraint `no_overlap` testada com inserts simultâneos
- [ ] Nenhum lock de aplicação substituindo garantia do banco

### Notificações
- [ ] Jobs cancelados/recriados corretamente em remarcações e cancelamentos
- [ ] Reenvio com backoff testado com provedor fake

### Segurança e LGPD
- [ ] Isolamento entre negócios validado (recurso de outro negócio retorna 404)
- [ ] Consentimento registrado na página pública
- [ ] Exclusão de dados do cliente implementada e testada

### Performance
- [ ] Página pública testada: p95 < 2s em perfil 4G

## Rastreabilidade de Requisitos

| Requisito | Spec | Tarefa | Teste |
|---|---|---|---|
| | | | |

## Critérios de Aceite

<!-- Liste os critérios de aceite do PO para esta feature -->

## Questões em Aberto

<!-- Nenhuma questão em aberto antes do arquivamento -->

## Resultado

- [ ] Aprovado para arquivamento
- [ ] Reprovado — ver observações abaixo

**Observações:**
