# User-Agent Local

Extensão para Chrome que troca o User-Agent HTTP de uma aba por vez. Escolha um perfil do catálogo (Desktop, Mobile, Tablet ou Bots) ou cole sua própria string, aplique na aba atual e restaure quando quiser. Tudo roda localmente, sem serviços remotos.

## Compilar

Requisitos: Node.js 24+, npm e Chrome 131+.

```sh
npm ci
npm run build
```

O resultado fica na pasta `dist`.

## Carregar no Chrome

1. Abra `chrome://extensions`.
2. Ative o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e selecione a pasta `dist`.

Depois de recompilar, clique em recarregar no card da extensão.
