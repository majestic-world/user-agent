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

## Catálogo e personalizados

O popup lista as famílias de navegador (Chrome, Edge, Firefox, Safari, Opera, Samsung Internet, Silk), Bots e Personalizados; abrir uma família mostra seus perfis por categoria. A busca pesquisa nome, navegador, sistema e fabricante em todo o catálogo, sem diferenciar maiúsculas ou acentos. Selecionar preenche o campo; editar cria um rascunho independente. O perfil selecionado mostra notas, fonte e data de verificação. Há 15 perfis Desktop, 25 Mobile, 10 Tablet e 12 Bots. O cartão no topo indica se a aba usa o navegador original ou um UA ativo, e oferece **Restaurar**.

**Salvar como perfil** cadastra o campo sem aplicar. O ícone de engrenagem abre as **Configurações** em uma aba, com navegação por família, pesquisa, formulário e ações de gerenciamento. Integrados são somente leitura: **Duplicar como personalizado** prepara uma cópia que deve ser salva explicitamente. Excluir exige confirmação local. Nomes repetidos são permitidos e os personalizados mostram categoria e ID para diferenciação. As duas interfaces seguem o tema claro ou escuro do sistema.

Alterações confirmadas atualizam interfaces abertas. Uma edição concorrente preserva o rascunho e bloqueia sobrescrita; selecione a entrada atual na lista para revisá-la. Editar ou excluir um cadastro não altera o snapshot já aplicado à aba. Personalizados persistem em `storage.local`, formato 1; atualizar a extensão não substitui esse catálogo.

Os rótulos de aparelhos indicam cobertura representativa, não popularidade comprovada. Modelos diferentes podem compartilhar exatamente o mesmo UA, inclusive Windows 10/11, iPhones e Androids modernos com redução de identidade. Há exemplos históricos explicitamente identificados nas notas; data de verificação é a data de consulta da fonte, não lançamento ou captura física. [Procedência do catálogo](docs/catalogo.md).

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

Resultados e cenários A1–A21: [matriz de validação](docs/validacao.md). `npm test` recompila a extensão antes dos 13 cenários de integração, evitando validar um `dist` desatualizado. Não há linter separado configurado; a build inclui a checagem estrita de tipos.

## Gerar pacote

```sh
npm run package
```

Produz `user-agent-local.zip` com manifesto na raiz, ícones, scripts e fontes locais. Extraia em uma pasta estável e use **Carregar sem compactação** nessa pasta. Não há assinatura ou publicação em loja. O ZIP usa ordem e timestamps fixos; duas gerações com os mesmos arquivos de build produziram o mesmo SHA-256. `dist/`, o ZIP e evidências brutas em `artifacts/` são gerados e não versionados.

Source Sans 3 é distribuída sob SIL OFL 1.1; a licença acompanha o pacote em `licenses/source-sans-3.txt`.
