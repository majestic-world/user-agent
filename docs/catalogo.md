# Procedência do catálogo

Verificação das fontes: **10/11/2026**. Seleção nominal conforme a spec: 15 Desktop, 25 Mobile, 10 Tablet e 12 Bots. O registro executável de cada entrada contém `source`, `verifiedAt` e notas; a interface oferece esses dados junto do UA completo. Não há consulta remota durante o uso.

## Critério

São exemplos documentados, não uma lista das versões mais recentes ou um ranking de aparelhos. Fontes incluem documentação de fabricantes/MDN, relatos públicos de compatibilidade e fixtures de parsers. Não foram capturados 50 aparelhos físicos. A data de verificação não transforma um exemplo histórico em uma versão atual.

- Chrome/Edge Windows e macOS, Safari e Opera developer: exemplos completos da [referência MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/User-Agent). A edição developer do Opera permanece explicitamente indicada.
- Firefox Windows e Chrome Linux: diretórios WhatIsMyBrowser; o exemplo concreto consultado está preservado no pacote, sem atualização remota.
- Firefox macOS: [guia MDN de detecção](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Browser_detection_using_the_user_agent). Firefox Linux, Chrome iPhone/iPad e Edge Linux: relatos/capturas públicos, com URL específica em cada perfil.
- Firefox iPhone: fixture de UAParser.js fixada por commit. Firefox Android: exemplo histórico de Firefox 41 do guia oficial Mozilla. Ambos identificam claramente a idade do exemplo.
- Aparelhos Android (Chrome e Samsung Internet): capturas reais que trazem o código do modelo no UA, copiadas sem edição de [WhatMyUserAgent](https://whatmyuseragent.com/) e das fixtures do [Matomo device-detector](https://github.com/matomo-org/device-detector) fixadas pelo commit `c69640507d`. As páginas do WhatMyUserAgent mostram só as capturas mais recentes; a string ficou preservada no pacote. Sem captura pública de Chrome com o modelo, Vivo V40, Galaxy Tab S10 e Xiaomi Pad 6 foram trocados por Vivo Y28s 5G, Galaxy Tab S9 Ultra e Redmi Pad.
- Safari iPad: exemplo do diretório Useragents.me consultado, atualizado em 08/11/2026. Silk: fixture do Matomo fixada por commit, identificando Fire HD 10 **2023 / KFTUWI**, não todas as gerações.
- Google, Bing, DuckDuckGo, Yandex e Meta: documentação oficial; Googlebot Smartphone e Bingbot usam exemplos históricos com versões concretas publicadas. Googlebot Desktop usa a variante compacta oficial rara, indicada na interface. `meta-externalagent/1.1` é uma variante HTTP completa documentada, não uma confusão com robots.txt.
- Baiduspider e LinkedInBot: exemplos completos do Known Agents. Twitterbot: Cloudflare Radar. Não atribuímos suas strings a páginas oficiais que não as apresentam.

## Ambiguidades mantidas

Windows NT 10.0 não distingue Windows 10 de Windows 11. O Chrome Android atual envia por padrão o formato reduzido (`Android 10; K`), sem modelo; o catálogo usa capturas com o modelo para permitir testar detecção de aparelho. Algumas capturas são de variantes regionais (por exemplo SM-A356U, 24095PCADI) e Redmi Note 13 e Pixels enviam o nome comercial em vez de um código.

iPhone/iPad não expõem geração/M4/M2 no UA. O Safari no iPad em modo desktop [pode se apresentar como macOS](https://webkit.org/blog/9674/new-webkit-features-in-safari-13/). Os exemplos de iPad do pacote são em modo mobile. Selecionar um rótulo nunca muda hardware, motor ou viewport.

[Redução oficial de UA do Chromium](https://www.chromium.org/updates/ua-reduction/). Para revisar uma string, abra sua fonte nas configurações. Duplicar como personalizado permite atualizar o exemplo local sem adulterar a referência distribuída.

## Bots

O eco HTTP comprova somente o valor transmitido. Nenhum teste deste projeto autentica IP/DNS ou comprova reconhecimento pelo Horus/CrawlerDetect. Um nome de bot não concede origem legítima nem capacidade de renderização desse crawler.
