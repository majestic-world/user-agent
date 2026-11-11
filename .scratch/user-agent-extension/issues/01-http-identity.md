# 01: Identidade HTTP isolada por aba

Status: ready-for-agent
Execution: done
Blocked by: none
Fonte: ../spec.md; A1, A3–A11, A14–A16, A20–A21.

## Entrega
Pacote MV3 TypeScript/Vite com popup funcional para aplicar string, restaurar e recarregar explicitamente. Regras de sessão e snapshots por aba, remoção de hints, reconciliação, tratamento de permissões/falhas e ciclo de vida.

## Aceite
- Chrome real recebe UA exato e mantém isolamento, navigator e navegação inalterados.
- Restaurar, fechar, reiniciar, recarregar extensão e retomar worker respeitam spec.
- Entradas inválidas, acesso retido e erros não apresentam falso sucesso.

## Evidências
Commit 3578ac3 e correção integrada f15a230. Primeiro red: pacote inexistente (`Extensions.loadUnpacked`); green: UA recebido `LocalProbe/1.0` sem navegação. Aceite final em docs/validacao.md; 13 cenários de integração passaram após build/tipos. Standards e Spec reavaliados sem pendências.

## Comments
Encerrado localmente após comprovar isolamento, hints, restauração, retomada, descarte de regras e falhas sem falso sucesso. Não depende de merge remoto.
