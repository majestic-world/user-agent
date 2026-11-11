# 03: Interface completa e aceite integrado

Status: ready-for-agent
Execution: implemented
Blocked by: 02
Fonte: ../spec.md; todos A1–A21, especialmente A18–A19.

## Entrega
Interface pt-BR na direção visual especificada, teclado e estados acessíveis. Documentação de instalação, permissões, limites e pacote reproduzível. Validar HTTP/HTTPS e cenários de aceite no Chrome, inspecionar popup/configurações visualmente via omp computer.

## Aceite
- Seleção, rascunho, aplicado, original, pendente e erros distinguíveis sem depender de cor.
- Conteúdo malicioso/longos seguro e alcançável; formulários com foco visível.
- Evidências individuais A1–A21 e revisão Standards/Spec desde base_sha.

## Evidências
`npm run package` e `npm test` passaram (12 cenários); aceite ampliado transmitiu os 62 perfis exatos, verificou busca/teclado/longos, duplicação, iframe entre origens e atualização. Matriz A1–A21 em docs/validacao.md. Capturas nativas omp do popup/configurações finais; controle e janelas isoladas liberados. ZIP reproduzível, 18 arquivos idênticos ao dist. Revisão Standards/Spec ainda pendente antes do encerramento.
