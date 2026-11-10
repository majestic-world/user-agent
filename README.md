# User-Agent Local

Extensão Chrome Manifest V3 para configurar a identidade **HTTP de uma aba**, sem serviços remotos.

## Instalar

Requisitos: Node.js 24+, npm e Chrome 131+.

```sh
npm ci
npm run build
```

Abra `chrome://extensions`, ative **Modo do desenvolvedor**, escolha **Carregar sem compactação** e selecione a pasta `dist`. Fixe a extensão na barra se desejar. Não carregue a raiz do repositório.

## Usar

Abra uma página HTTP/HTTPS e o popup da extensão. Revise ou cole o User-Agent e escolha **Aplicar nesta aba**. A confirmação significa que o Chrome configurou a regra para próximas requisições; não comprova uma resposta já recebida. **Recarregar página** é uma ação separada. **Restaurar** remove a intervenção, inclusive nos Client Hints; não grava uma cópia presumida do UA original.

Cada aba tem seu próprio estado. Abas novas não herdam a alteração. Fechar a aba descarta a regra; reiniciar o navegador ou recarregar/atualizar a extensão começa sem alterações ativas. Suspender o worker não remove a regra.

## Permissões e privacidade

- `storage`: dados locais e estado temporário da aba.
- `declarativeNetRequestWithHostAccess`: substitui o cabeçalho User-Agent e remove hints HTTP de identidade na mesma regra de sessão.
- Hosts HTTP/HTTPS: permite navegação entre sites e recursos associados à aba, incluindo localhost. O acesso pode ser retido nas configurações do Chrome; nesse caso a extensão não tenta concedê-lo automaticamente.

Sem permissão ampla de `tabs`, cookies, histórico ou debugger no produto. Sem telemetria, sincronização, CDN ou scripts remotos. Fontes e recursos são empacotados localmente.

## Limites

Não altera `navigator.userAgent`, `navigator.userAgentData`, `navigator.platform`, tela, touch, idioma, timezone, motor, cookies, TLS ou IP. Não é emulação de hardware. Um UA de bot não autentica IP/DNS nem comprova reconhecimento por detectores externos.

Remove apenas os hints de identidade `Sec-CH-UA`, `Sec-CH-UA-Mobile`, `Sec-CH-UA-Platform`, `Sec-CH-UA-Full-Version`, `Sec-CH-UA-Full-Version-List`, `Sec-CH-UA-Platform-Version`, `Sec-CH-UA-Arch`, `Sec-CH-UA-Bitness`, `Sec-CH-UA-Model`, `Sec-CH-UA-WoW64` e `Sec-CH-UA-Form-Factors`. Não modifica `Accept-CH` ou cabeçalhos de resposta. Restaurar devolve a geração normal de hints ao Chrome.

Páginas internas, Chrome Web Store e outros destinos protegidos não são suportados. Conteúdo servido por cache/service worker pode não chegar ao servidor. Workers sem associação a uma aba não estão cobertos. Acesso parcial a hosts pode limitar recursos entre origens. Outras extensões de cabeçalhos podem interferir: use um perfil isolado e confirme o valor recebido pelo servidor.

## Verificar

```sh
npm run typecheck
npm test
```

A integração usa Chrome real instalado em `C:/Program Files/Google/Chrome/Application/chrome.exe`, perfil descartável e servidores de eco HTTP/HTTPS locais sem cache. O certificado temporário é aceito apenas pelo Chrome isolado de testes; nenhuma permissão do navegador pessoal é alterada. Instrumentação de depuração pertence ao harness, nunca à extensão distribuída. Não acessa Horus, seu banco ou navegação externa.
