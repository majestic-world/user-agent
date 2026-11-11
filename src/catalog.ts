import type { BuiltinProfile, Category } from './model';

const verifiedAt = '2026-11-10';
const mdn = 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/User-Agent';
const reduction = 'UA reduzido: versão do sistema e modelo podem estar congelados. Não identifica o hardware do rótulo.';
const appleFamily = 'Exemplo da família; o UA não distingue os modelos de hardware do catálogo.';
const windows = 'Windows 10 e 11 compartilham Windows NT 10.0; o UA não distingue essas versões.';
const ipad = appleFamily + ' Exemplo em modo mobile. Safari no iPad em modo desktop pode enviar um UA semelhante ao macOS.';
const wmua = 'https://whatmyuseragent.com';
// Commit-pinned Matomo device-detector fixtures: stable references for real captured UAs.
const matomo = (file: string, line: number) => 'https://github.com/matomo-org/device-detector/blob/c69640507d6e5d3d0943492ed7a22bd7060d24f4/Tests/fixtures/' + file + '#L' + line;
const captured = 'Captura real com o código do modelo; versões de Android e navegador são as da captura. O Chrome atual pode enviar o formato reduzido (Android 10; K).';
const rolling = ' Página com as capturas mais recentes; a linha pode sair da listagem.';

interface Sample { ua: string; source: string; notes?: string }
const samples = {
  chromeWindows: { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', source: mdn, notes: windows },
  edgeWindows: { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', source: mdn, notes: windows },
  firefoxWindows: { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:160.0) Gecko/20100101 Firefox/160.0', source: 'https://www.whatismybrowser.com/guides/the-latest-user-agent/firefox', notes: windows },
  operaWindows: { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 OPR/124.0.0.0 (Edition developer)', source: mdn, notes: windows + ' Exemplo da edição developer, não da versão estável.' },
  chromeMac: { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', source: mdn, notes: reduction },
  safariMac: { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15', source: mdn, notes: 'Versão do sistema no UA pode estar congelada; não identifica arquitetura ou modelo de Mac.' },
  firefoxMac: { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:138.0) Gecko/20100101 Firefox/138.0', source: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Browser_detection_using_the_user_agent', notes: 'Exemplo documentado de Firefox 138, não afirma ser a versão mais recente.' },
  edgeMac: { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', source: mdn, notes: reduction },
  operaMac: { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 OPR/124.0.0.0 (Edition developer)', source: mdn, notes: 'Exemplo documentado da edição developer; não identifica modelo de Mac.' },
  chromeLinux: { ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', source: 'https://www.whatismybrowser.com/guides/the-latest-user-agent/chrome', notes: 'Exemplo documentado; não identifica distribuição Linux.' },
  firefoxLinux: { ua: 'Mozilla/5.0 (X11; Linux x86_64; rv:138.0) Gecko/20100101 Firefox/138.0', source: 'https://github.com/webcompat/web-bugs/issues/229677', notes: 'UA relatado em issue pública; exemplo histórico, não uma captura própria.' },
  edgeLinux: { ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0', source: 'https://github.com/Kiritsu/Chameleon.Net/pull/52', notes: 'Exemplo de captura automatizada publicada por terceiro; não captura própria.' },
  safariIphone: { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', source: mdn, notes: appleFamily + ' Token do sistema conforme exemplo documentado; não deduzir a versão real do iOS.' },
  chromeIphone: { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0.7339.122 Mobile/15E148 Safari/604.1', source: 'https://github.com/webcompat/web-bugs/issues/182335', notes: appleFamily + ' Exemplo relatado em 2025.' },
  firefoxIphone: { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/112.0 Mobile/15E148 Safari/605.1.15', source: 'https://github.com/faisalman/ua-parser-js/blob/25b0f6cb06bc7d85657dce0366ea38c1ce81cfad/test/data/ua/browser/mobile-firefox.json', notes: appleFamily + ' Fixture histórica de Firefox 112, não versão atual.' },
  firefoxAndroid: { ua: 'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0', source: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/User-Agent/Firefox', notes: 'Exemplo histórico oficial de Firefox 41/Android 4.4; não uma afirmação de versão atual ou de modelo.' },
  safariIpad: { ua: 'Mozilla/5.0 (iPad; CPU OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1', source: 'https://www.useragents.me/', notes: ipad + ' Exemplo observado em diretório independente atualizado em 08/11/2026.' },
  chromeIpad: { ua: 'Mozilla/5.0 (iPad; CPU OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1', source: 'https://github.com/webcompat/web-bugs/issues/144318', notes: appleFamily + ' Exemplo histórico relatado em 2024, em modo mobile.' },
  silk: { ua: 'Mozilla/5.0 (Linux; Android 11; KFTUWI) AppleWebKit/537.36 (KHTML, like Gecko) Silk/118.1.77 like Chrome/118.0.5993.111 Safari/537.36', source: 'https://github.com/matomo-org/device-detector/blob/2644dc6f21e14cc6283d6e442d30bf6b0aba6f99/Tests/fixtures/tablet-11.yml#L237-L252', notes: 'Fixture de Fire HD 10 (2023), modelo KFTUWI. Não representa todas as gerações de Fire HD 10.' },
} satisfies Record<string, Sample>;

function profile(id: string, name: string, category: Category, sample: Sample, browser: string, system: string, manufacturer?: string, model?: string): BuiltinProfile {
  return { id, name, category, origin: 'builtin', ...sample, browser, system, manufacturer, model, verifiedAt };
}

/** Android device whose UA was captured with its own model token. */
function android(id: string, name: string, category: Category, browser: string, manufacturer: string, model: string, ua: string, source: string, notes = captured): BuiltinProfile {
  return profile(id, name + ' — ' + browser, category, { ua, source, notes }, browser, 'Android', manufacturer, model);
}

export const builtinProfiles: BuiltinProfile[] = [
  profile('chrome-win11', 'Chrome — Windows 11', 'Desktop', samples.chromeWindows, 'Chrome', 'Windows 11', 'Microsoft'),
  profile('edge-win11', 'Edge — Windows 11', 'Desktop', samples.edgeWindows, 'Edge', 'Windows 11', 'Microsoft'),
  profile('firefox-win11', 'Firefox — Windows 11', 'Desktop', samples.firefoxWindows, 'Firefox', 'Windows 11', 'Microsoft'),
  profile('opera-win11', 'Opera — Windows 11', 'Desktop', samples.operaWindows, 'Opera developer', 'Windows 11', 'Microsoft'),
  profile('chrome-win10', 'Chrome — Windows 10', 'Desktop', samples.chromeWindows, 'Chrome', 'Windows 10', 'Microsoft'),
  profile('edge-win10', 'Edge — Windows 10', 'Desktop', samples.edgeWindows, 'Edge', 'Windows 10', 'Microsoft'),
  profile('firefox-win10', 'Firefox — Windows 10', 'Desktop', samples.firefoxWindows, 'Firefox', 'Windows 10', 'Microsoft'),
  profile('chrome-macos', 'Chrome — macOS', 'Desktop', samples.chromeMac, 'Chrome', 'macOS', 'Apple'),
  profile('safari-macos', 'Safari — macOS', 'Desktop', samples.safariMac, 'Safari', 'macOS', 'Apple'),
  profile('firefox-macos', 'Firefox — macOS', 'Desktop', samples.firefoxMac, 'Firefox', 'macOS', 'Apple'),
  profile('edge-macos', 'Edge — macOS', 'Desktop', samples.edgeMac, 'Edge', 'macOS', 'Apple'),
  profile('opera-macos', 'Opera — macOS', 'Desktop', samples.operaMac, 'Opera developer', 'macOS', 'Apple'),
  profile('chrome-linux', 'Chrome — Linux', 'Desktop', samples.chromeLinux, 'Chrome', 'Linux'),
  profile('firefox-linux', 'Firefox — Linux', 'Desktop', samples.firefoxLinux, 'Firefox', 'Linux'),
  profile('edge-linux', 'Edge — Linux', 'Desktop', samples.edgeLinux, 'Edge', 'Linux'),
  ...['17', '16', '15', '14', '13', 'SE de 3ª geração'].map(model => profile('iphone-' + model.replaceAll(' ', '-'), 'iPhone ' + model + ' — Safari', 'Mobile', samples.safariIphone, 'Safari', 'iOS', 'Apple', 'iPhone ' + model)),
  profile('iphone-chrome', 'iPhone — Chrome', 'Mobile', samples.chromeIphone, 'Chrome', 'iOS', 'Apple', 'iPhone'),
  profile('iphone-firefox', 'iPhone — Firefox', 'Mobile', samples.firefoxIphone, 'Firefox', 'iOS', 'Apple', 'iPhone'),
  android('galaxy-s25', 'Samsung Galaxy S25', 'Mobile', 'Chrome', 'Samsung', 'Galaxy S25 (SM-S931B)', 'Mozilla/5.0 (Linux; Android 15; SM-S931B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36', wmua + '/device/samsung/galaxy-s25', captured + rolling),
  android('galaxy-s24', 'Samsung Galaxy S24', 'Mobile', 'Chrome', 'Samsung', 'Galaxy S24 (SM-S921B)', 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36', wmua + '/device/samsung/galaxy-s24', captured + rolling),
  android('galaxy-s23', 'Samsung Galaxy S23', 'Mobile', 'Chrome', 'Samsung', 'Galaxy S23 (SM-S911B)', 'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.56 Mobile Safari/537.36', wmua + '/device/samsung/galaxy-s23', captured + rolling),
  android('galaxy-a56', 'Samsung Galaxy A56', 'Mobile', 'Chrome', 'Samsung', 'Galaxy A56 5G (SM-A566B)', 'Mozilla/5.0 (Linux; Android 16; SM-A566b) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.7031.85 Mobile Safari/537.36', wmua + '/device/samsung/galaxy-a56-5g', captured + ' O código aparece em minúsculas na captura original.' + rolling),
  android('galaxy-a55', 'Samsung Galaxy A55', 'Mobile', 'Chrome', 'Samsung', 'Galaxy A55 5G (SM-A556B)', 'Mozilla/5.0 (Linux; Android 14; SM-A556B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36', wmua + '/device/samsung/galaxy-a55-5g', captured + rolling),
  android('galaxy-a35', 'Samsung Galaxy A35', 'Mobile', 'Chrome', 'Samsung', 'Galaxy A35 5G (SM-A356U)', 'Mozilla/5.0 (Linux; Android 14; SM-A356U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', matomo('smartphone-42.yml', 901), captured + ' Variante norte-americana (U).'),
  android('samsung-internet-s24', 'Samsung Galaxy S24', 'Mobile', 'Samsung Internet', 'Samsung', 'Galaxy S24 (SM-S921B)', 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36', wmua + '/browser/browser-samsung-browser/28', captured + rolling),
  android('samsung-internet-a55', 'Samsung Galaxy A55', 'Mobile', 'Samsung Internet', 'Samsung', 'Galaxy A55 5G (SM-A556E)', 'Mozilla/5.0 (Linux; Android 16; SAMSUNG SM-A556E) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36', wmua + '/browser/browser-samsung-browser/23', captured + ' Variante E, com o prefixo SAMSUNG usado por versões antigas do Samsung Internet.' + rolling),
  android('redmi-note14', 'Xiaomi Redmi Note 14', 'Mobile', 'Chrome', 'Xiaomi', 'Redmi Note 14 (24117RN76L)', 'Mozilla/5.0 (Linux; Android 15; 24117RN76L) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', matomo('phablet-1.yml', 6116)),
  android('redmi-note13', 'Xiaomi Redmi Note 13', 'Mobile', 'Chrome', 'Xiaomi', 'Redmi Note 13', 'Mozilla/5.0 (Linux; Android 13; Redmi Note 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.139 Mobile Safari/537.36', wmua + '/device/xiaomi/redmi-note-13', 'Captura real; este aparelho envia o nome comercial em vez do código do modelo.' + rolling),
  android('poco-x7', 'Poco X7', 'Mobile', 'Chrome', 'Poco', 'Poco X7 (24095PCADI)', 'Mozilla/5.0 (Linux; Android 15; 24095PCADI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36', matomo('smartphone-42.yml', 3667), captured + ' Variante indiana (I).'),
  android('pixel9', 'Google Pixel 9', 'Mobile', 'Chrome', 'Google', 'Pixel 9', 'Mozilla/5.0 (Linux; Android 14; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36', wmua + '/device/google/pixel-9', 'Captura real; Pixels enviam o nome do aparelho no lugar de um código.' + rolling),
  android('pixel8', 'Google Pixel 8', 'Mobile', 'Chrome', 'Google', 'Pixel 8', 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.8010.47 Mobile Safari/537.36', wmua + '/device/google/pixel-8', 'Captura real; Pixels enviam o nome do aparelho no lugar de um código.' + rolling),
  android('moto-g85', 'Motorola Moto G85', 'Mobile', 'Chrome', 'Motorola', 'Moto G85 5G (XT2427-4)', 'Mozilla/5.0 (Linux; Android 14; XT2427-4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36', matomo('smartphone-41.yml', 7838)),
  android('reno12', 'Oppo Reno12', 'Mobile', 'Chrome', 'Oppo', 'Reno12 (CPH2625)', 'Mozilla/5.0 (Linux; Android 14; CPH2625) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36', matomo('smartphone-39.yml', 6999)),
  android('vivo-y28s', 'Vivo Y28s 5G', 'Mobile', 'Chrome', 'Vivo', 'Y28s 5G (V2351)', 'Mozilla/5.0 (Linux; Android 15; V2351) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', wmua + '/browser/browser-chrome-mobile/151', captured + rolling),
  profile('android-firefox', 'Android — Firefox', 'Mobile', samples.firefoxAndroid, 'Firefox', 'Android'),
  ...[['pro-m4', 'Pro M4'], ['air-m2', 'Air M2'], ['10', 'de 10ª geração'], ['mini6', 'mini de 6ª geração']].map(([id, model]) => profile('ipad-' + id, 'iPad ' + model + ' — Safari', 'Tablet', samples.safariIpad, 'Safari', 'iPadOS', 'Apple', 'iPad ' + model)),
  profile('ipad-chrome', 'iPad — Chrome', 'Tablet', samples.chromeIpad, 'Chrome', 'iPadOS', 'Apple', 'iPad'),
  android('tab-s9-ultra', 'Samsung Galaxy Tab S9 Ultra', 'Tablet', 'Chrome', 'Samsung', 'Galaxy Tab S9 Ultra Wi-Fi (SM-X910)', 'Mozilla/5.0 (Linux; Android 14; SM-X910) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', wmua + '/browser/browser-chrome/146', captured + ' Formato tablet, sem o token Mobile.' + rolling),
  android('tab-s9', 'Samsung Galaxy Tab S9', 'Tablet', 'Chrome', 'Samsung', 'Galaxy Tab S9 Wi-Fi (SM-X710)', 'Mozilla/5.0 (Linux; Android 13; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', wmua + '/browser/browser-chrome/145', captured + ' Formato tablet, sem o token Mobile.' + rolling),
  profile('fire-hd10', 'Amazon Fire HD 10 — Silk', 'Tablet', samples.silk, 'Silk', 'Fire OS / Android', 'Amazon', 'Fire HD 10 (2023)'),
  android('redmi-pad', 'Xiaomi Redmi Pad', 'Tablet', 'Chrome', 'Xiaomi', 'Redmi Pad (22081283G)', 'Mozilla/5.0 (Linux; Android 12; 22081283G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36', matomo('tablet-8.yml', 9826), captured + ' Formato tablet, sem o token Mobile. Captura antiga, de 2022.'),
  android('lenovo-m11', 'Lenovo Tab M11', 'Tablet', 'Chrome', 'Lenovo', 'Tab M11 (TB330FU)', 'Mozilla/5.0 (Linux; Android 15; TB330FU) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.7727.56 Mobile Safari/537.36', wmua + '/device/lenovo/tab-m11', captured + ' Esta captura traz o token Mobile mesmo sendo tablet.' + rolling),
  ...[
    ['googlebot-desktop', 'Googlebot Desktop', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#googlebot', 'Variante compacta oficial, rara; não a variante desktop típica com versão Chrome.'],
    ['googlebot-smartphone', 'Googlebot Smartphone', 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.96 Mobile Safari/537.36 (compatible; Googlebot/2.1; +https://www.google.com/bot.html)', 'https://developers.google.com/search/blog/2019/10/updating-user-agent-of-googlebot', 'Exemplo oficial histórico de 2019. Nexus 5X não comprova hardware físico do crawler.'],
    ['google-inspection', 'Google-InspectionTool', 'Mozilla/5.0 (compatible; Google-InspectionTool/1.0)', 'https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-inspectiontool', 'Variante desktop das ferramentas de inspeção.'],
    ['adsbot-google', 'AdsBot-Google', 'AdsBot-Google (+http://www.google.com/adsbot.html)', 'https://developers.google.com/crawling/docs/crawlers-fetchers/google-special-case-crawlers#adsbot', 'Crawler desktop de qualidade de anúncios.'],
    ['bingbot', 'Bingbot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/100.0.4896.127 Safari/537.36', 'https://blogs.bing.com/webmaster/2022/4/Announcing-user-agent-change-for-Bing-crawler-bingbot/', 'Exemplo histórico oficial de 2022, com versão concreta documentada.'],
    ['duckduckbot', 'DuckDuckBot', 'DuckDuckBot/1.1; (+http://duckduckgo.com/duckduckbot.html)', 'https://duckduckgo.com/duckduckgo-help-pages/results/duckduckbot', 'UA HTTP completo oficial.'],
    ['yandexbot', 'YandexBot', 'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)', 'https://yandex.com/support/webmaster/en/robot-workings/check-yandex-robots', 'Crawler principal; há outras variantes oficiais.'],
    ['baiduspider', 'Baiduspider', 'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)', 'https://knownagents.com/agents/baiduspider', 'UA observado em diretório independente, não captura própria.'],
    ['facebookexternalhit', 'facebookexternalhit', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', 'https://developers.facebook.com/documentation/sharing/webmasters/web-crawlers', 'Coleta de prévias de links do Facebook/Meta.'],
    ['meta-externalagent', 'meta-externalagent', 'meta-externalagent/1.1', 'https://developers.facebook.com/documentation/sharing/webmasters/web-crawlers', 'Variante curta documentada como UA HTTP completo, não apenas token de robots.txt.'],
    ['twitterbot', 'Twitterbot', 'Twitterbot/1.0', 'https://radar.cloudflare.com/bots/directory/twitterbot', 'UA completo documentado em diretório independente.'],
    ['linkedinbot', 'LinkedInBot', 'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)', 'https://knownagents.com/agents/linkedinbot', 'UA completo observado em diretório independente.'],
  ].map(([id, name, ua, source, notes]) => ({ id, name, category: 'Bots' as const, origin: 'builtin' as const, ua, source, verifiedAt, notes: notes + ' Não autentica IP/DNS ou reconhecimento por detectores externos.' })),
];
