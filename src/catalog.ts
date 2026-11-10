import type { BuiltinProfile, Category } from './model';

const verifiedAt = '2026-11-10';
const mdn = 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/User-Agent';
const reduction = 'UA reduzido: versão do sistema e modelo podem estar congelados. Não identifica o hardware do rótulo.';
const appleFamily = 'Exemplo da família; o UA não distingue os modelos de hardware do catálogo.';
const windows = 'Windows 10 e 11 compartilham Windows NT 10.0; o UA não distingue essas versões.';
const ipad = appleFamily + ' Exemplo em modo mobile. Safari no iPad em modo desktop pode enviar um UA semelhante ao macOS.';

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
  chromeAndroid: { ua: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', source: mdn, notes: reduction },
  samsung: { ua: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/24.0 Chrome/117.0.0.0 Mobile Safari/537.36', source: 'https://developer.samsung.com/browser/user-agent-string-format.html', notes: reduction + ' Exemplo oficial de Samsung Internet 24.' },
  firefoxAndroid: { ua: 'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0', source: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/User-Agent/Firefox', notes: 'Exemplo histórico oficial de Firefox 41/Android 4.4; não uma afirmação de versão atual ou de modelo.' },
  safariIpad: { ua: 'Mozilla/5.0 (iPad; CPU OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1', source: 'https://www.useragents.me/', notes: ipad + ' Exemplo observado em diretório independente atualizado em 08/11/2026.' },
  chromeIpad: { ua: 'Mozilla/5.0 (iPad; CPU OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1', source: 'https://github.com/webcompat/web-bugs/issues/144318', notes: appleFamily + ' Exemplo histórico relatado em 2024, em modo mobile.' },
  chromeTablet: { ua: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', source: 'https://www.useragents.me/', notes: reduction + ' Formato tablet sem token Mobile, observado em diretório independente atualizado em 08/11/2026.' },
  silk: { ua: 'Mozilla/5.0 (Linux; Android 11; KFTUWI) AppleWebKit/537.36 (KHTML, like Gecko) Silk/118.1.77 like Chrome/118.0.5993.111 Safari/537.36', source: 'https://github.com/matomo-org/device-detector/blob/2644dc6f21e14cc6283d6e442d30bf6b0aba6f99/Tests/fixtures/tablet-11.yml#L237-L252', notes: 'Fixture de Fire HD 10 (2023), modelo KFTUWI. Não representa todas as gerações de Fire HD 10.' },
} satisfies Record<string, Sample>;

function profile(id: string, name: string, category: Category, sample: Sample, browser: string, system: string, manufacturer?: string, model?: string): BuiltinProfile {
  return { id, name, category, origin: 'builtin', ...sample, browser, system, manufacturer, model, verifiedAt };
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
  ...['S25', 'S24', 'S23', 'A56', 'A55', 'A35'].map(model => profile('galaxy-' + model.toLowerCase(), 'Samsung Galaxy ' + model + ' — Chrome', 'Mobile', samples.chromeAndroid, 'Chrome', 'Android', 'Samsung', 'Galaxy ' + model)),
  ...['S24', 'A55'].map(model => profile('samsung-internet-' + model.toLowerCase(), 'Samsung Galaxy ' + model + ' — Samsung Internet', 'Mobile', samples.samsung, 'Samsung Internet', 'Android', 'Samsung', 'Galaxy ' + model)),
  ...[
    ['redmi-note14', 'Xiaomi Redmi Note 14', 'Xiaomi'], ['redmi-note13', 'Xiaomi Redmi Note 13', 'Xiaomi'],
    ['poco-x7', 'Poco X7', 'Poco'], ['pixel9', 'Google Pixel 9', 'Google'], ['pixel8', 'Google Pixel 8', 'Google'],
    ['moto-g85', 'Motorola Moto G85', 'Motorola'], ['reno12', 'Oppo Reno12', 'Oppo'], ['vivo-v40', 'Vivo V40', 'Vivo'],
  ].map(([id, name, manufacturer]) => profile(id, name + ' — Chrome', 'Mobile', samples.chromeAndroid, 'Chrome', 'Android', manufacturer, name)),
  profile('android-firefox', 'Android — Firefox', 'Mobile', samples.firefoxAndroid, 'Firefox', 'Android'),
  ...[['pro-m4', 'Pro M4'], ['air-m2', 'Air M2'], ['10', 'de 10ª geração'], ['mini6', 'mini de 6ª geração']].map(([id, model]) => profile('ipad-' + id, 'iPad ' + model + ' — Safari', 'Tablet', samples.safariIpad, 'Safari', 'iPadOS', 'Apple', 'iPad ' + model)),
  profile('ipad-chrome', 'iPad — Chrome', 'Tablet', samples.chromeIpad, 'Chrome', 'iPadOS', 'Apple', 'iPad'),
  ...[['tab-s10', 'Samsung Galaxy Tab S10', 'Samsung'], ['tab-s9', 'Samsung Galaxy Tab S9', 'Samsung']].map(([id, name, manufacturer]) => profile(id, name + ' — Chrome', 'Tablet', samples.chromeTablet, 'Chrome', 'Android', manufacturer, name)),
  profile('fire-hd10', 'Amazon Fire HD 10 — Silk', 'Tablet', samples.silk, 'Silk', 'Fire OS / Android', 'Amazon', 'Fire HD 10 (2023)'),
  ...[['xiaomi-pad6', 'Xiaomi Pad 6', 'Xiaomi'], ['lenovo-m11', 'Lenovo Tab M11', 'Lenovo']].map(([id, name, manufacturer]) => profile(id, name + ' — Chrome', 'Tablet', samples.chromeTablet, 'Chrome', 'Android', manufacturer, name)),
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
