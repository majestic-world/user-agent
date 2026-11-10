# 01: Identidade HTTP isolada por aba

Status: implemented
Blocked by: none
Fonte: ../spec.md; A1, A3–A11, A14–A16, A20–A21.

## Entrega
Pacote MV3 TypeScript/Vite com popup funcional para aplicar string, restaurar e recarregar explicitamente. Regras de sessão e snapshots por aba, remoção de hints, reconciliação, tratamento de permissões/falhas e ciclo de vida.

## Aceite
- Chrome real recebe UA exato e mantém isolamento, navigator e navegação inalterados.
- Restaurar, fechar, reiniciar, recarregar extensão e retomar worker respeitam spec.
- Entradas inválidas, acesso retido e erros não apresentam falso sucesso.

## Evidências
Chrome real: `npm test` (3 cenários iniciais); cenários adicionais de retomada, recarga, reinício e falhas de regra/metadados passaram em execuções direcionadas. `npm run typecheck` passou. Primeiro red: pacote inexistente (`Extensions.loadUnpacked`); green: UA recebido `LocalProbe/1.0` sem navegação. Validação integrada e revisão final ainda pendentes.
