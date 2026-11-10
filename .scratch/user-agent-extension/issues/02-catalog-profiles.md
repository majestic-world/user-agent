# 02: Catálogo e personalizados persistentes

Status: ready-for-agent
Blocked by: 01
Fonte: ../spec.md; A2, A12–A13, A16–A18.

## Entrega
62 perfis nominais rastreáveis; busca por metadados; configurações para cadastro, edição, duplicação e exclusão de personalizados. Worker serializa mutações, valida e detecta conflitos. Listas refletem armazenamento confirmado e snapshots ativos são independentes.

## Aceite
- 15 Desktop, 25 Mobile, 10 Tablet e 12 Bots com strings/fontes verificadas e limitações visíveis.
- CRUD persistente sem alterar abas implicitamente; integrados protegidos.
- Conflitos/erros de storage não sobrescrevem nem declaram sucesso.

## Evidências
Pendente.
