# Extensão de User-Agent para desenvolvimento web

Status: ready-for-agent
Execution: done

## Problem Statement

O desenvolvedor precisa alternar rapidamente a identidade HTTP do navegador para testar respostas de aplicações web conforme dispositivo, navegador ou crawler. A extensão atual organiza escolhas em menus em cascata, dificulta o uso de strings próprias e não oferece o gerenciamento de dispositivos desejado.

A solução deve reunir seleção pesquisável, entrada direta e manutenção do catálogo em uma interface robusta, sem afetar inadvertidamente outras abas. Um caso concreto é exercitar identificadores esperados pelo CrawlerCheck do projeto Horus, que lê o cabeçalho User-Agent, reconhece Google e Facebook/Meta e delega outros casos ao CrawlerDetect.

## Solution

Criar uma extensão Chrome Manifest V3 para uso local, com popup em pt-BR, um seletor pesquisável de perfis e um campo de User-Agent imediatamente abaixo. Permitir aplicar a seleção ou uma string própria à aba atual, restaurar o navegador original e abrir uma página de configurações para gerenciar perfis personalizados.

Entregar 50 perfis de dispositivos/navegadores, distribuídos em 15 de desktop, 25 de mobile e 10 de tablet, mais 12 perfis de bots. O catálogo será uma seleção representativa de famílias populares e úteis ao desenvolvimento, com fontes e datas de verificação, não um ranking comprovado de modelos. Perfis cujo hardware não possa ser identificado pelo UA informarão essa limitação.

A alteração atua nos cabeçalhos HTTP das requisições suportadas da aba. Não modifica o motor de renderização, viewport, touch, IP ou as propriedades JavaScript de navigator. O produto deve explicar essa fronteira em vez de prometer emulação completa.

O usuário confirmou Chrome real e servidor local de eco de cabeçalhos como limite principal de validação. Integração com Horus é complementar, não condição de conclusão.

## User Stories

1. Como desenvolvedor web, quero instalar a extensão pelo modo desenvolvedor do Chrome, para utilizá-la sem depender de publicação em uma loja.
2. Como desenvolvedor web, quero abrir um popup compacto e legível, para trocar o User-Agent sem navegar por menus em cascata.
3. Como desenvolvedor web, quero encontrar perfis pelo nome do dispositivo, para selecionar rapidamente o cenário desejado.
4. Como desenvolvedor web, quero pesquisar por navegador, sistema e fabricante, para localizar perfis mesmo sem conhecer seu nome completo.
5. Como desenvolvedor web, quero distinguir Desktop, Mobile, Tablet, Bots e Personalizados, para entender o tipo de perfil que vou aplicar.
6. Como desenvolvedor web, quero acessar 50 perfis de dispositivos/navegadores e 12 bots adicionais, para cobrir diferentes cenários sem montar todas as strings manualmente.
7. Como desenvolvedor web, quero inspecionar a string completa de um perfil, para saber exatamente qual cabeçalho será enviado.
8. Como desenvolvedor web, quero que a seleção preencha o campo de User-Agent abaixo do seletor, para revisar o valor antes de aplicar.
9. Como desenvolvedor web, quero editar o valor preenchido, para adaptar um perfil sem alterar o catálogo integrado.
10. Como desenvolvedor web, quero colar uma string diretamente no campo abaixo do seletor, para testar identificadores próprios.
11. Como desenvolvedor web, quero aplicar uma string sem cadastrá-la, para realizar testes pontuais com poucos passos.
12. Como desenvolvedor web, quero aplicar o perfil somente à aba atual, para manter minha navegação restante intacta.
13. Como desenvolvedor web, quero usar perfis diferentes em duas abas do mesmo site, para comparar respostas lado a lado.
14. Como desenvolvedor web, quero manter o perfil durante as navegações da mesma aba, para testar fluxos completos.
15. Como desenvolvedor web, quero que navegação, iframes e requisições de recursos associadas à aba usem a alteração suportada, para manter consistência nas requisições de teste.
16. Como desenvolvedor web, quero que o perfil só seja indicado como aplicado após confirmação do Chrome, para não confiar em um estado falso.
17. Como desenvolvedor web, quero distinguir o perfil selecionado do perfil aplicado, para saber se uma edição ainda aguarda aplicação.
18. Como desenvolvedor web, quero aplicar sem recarregamento automático, para evitar perder formulários ou repetir operações involuntariamente.
19. Como desenvolvedor web, quero uma ação explícita para recarregar após aplicar, para solicitar novamente a página quando estiver pronto.
20. Como desenvolvedor web, quero um indicador de alteração ativa no ícone da extensão, para lembrar quais abas estão com identidade modificada.
21. Como desenvolvedor web, quero restaurar a identidade original da aba, para encerrar o teste sem descobrir ou copiar o UA original.
22. Como desenvolvedor web, quero que restaurar remova também a intervenção nos Client Hints, para voltar ao comportamento original do navegador.
23. Como desenvolvedor web, quero que fechar uma aba descarte seu perfil ativo, para não deixar regras órfãs.
24. Como desenvolvedor web, quero iniciar uma nova sessão do navegador sem alterações ativas, para evitar testes esquecidos em navegação futura.
25. Como desenvolvedor web, quero que o perfil continue correto quando o service worker da extensão for suspenso e retomado, para não depender de um processo permanentemente aberto.
26. Como desenvolvedor web, quero abrir as configurações pelo popup, para gerenciar o catálogo no mesmo fluxo de trabalho.
27. Como desenvolvedor web, quero listar e pesquisar perfis nas configurações, para encontrar entradas integradas e personalizadas.
28. Como desenvolvedor web, quero cadastrar nome, categoria e User-Agent de um perfil, para reutilizar cenários próprios.
29. Como desenvolvedor web, quero editar perfis personalizados, para corrigir ou atualizar minhas strings.
30. Como desenvolvedor web, quero excluir explicitamente perfis personalizados, para remover entradas que deixaram de ser úteis.
31. Como desenvolvedor web, quero duplicar um perfil integrado como personalizado, para adaptá-lo preservando o catálogo original.
32. Como desenvolvedor web, quero manter os perfis integrados protegidos contra edição e exclusão, para conservar uma referência confiável.
33. Como desenvolvedor web, quero que meus perfis personalizados persistam após reiniciar o Chrome, para não refazer o cadastro.
34. Como desenvolvedor web, quero que criar ou editar um perfil atualize as listas abertas, para não selecionar dados desatualizados.
35. Como desenvolvedor web, quero que editar ou excluir um perfil salvo não altere abas já configuradas, para preservar o cenário de teste em andamento.
36. Como desenvolvedor web, quero consultar fonte e data de verificação dos perfis integrados, para avaliar a procedência e a atualidade das strings.
37. Como desenvolvedor web, quero saber quando aparelhos compartilham um UA ou quando o perfil representa uma família, para não presumir diferenciação de hardware inexistente.
38. Como desenvolvedor web, quero usar perfis de Google e Facebook/Meta, para enviar ao backend os identificadores previstos em meus fluxos de crawler.
39. Como desenvolvedor web, quero testar outros crawlers e bots sociais, para exercitar aplicações que usam bibliotecas de detecção.
40. Como desenvolvedor web, quero que a extensão não envie Client Hints HTTP de identidade conflitantes com o perfil ativo, para reduzir ambiguidades na identificação pelo servidor.
41. Como desenvolvedor web, quero entender que navigator continua refletindo o navegador real, para interpretar corretamente testes de identificação em JavaScript.
42. Como desenvolvedor web, quero entender que selecionar um dispositivo não muda tela, touch ou motor, para combinar esta ferramenta com emulação visual quando necessário.
43. Como desenvolvedor web, quero impedir valores vazios e cabeçalhos inválidos, para não comprometer uma configuração ativa válida.
44. Como desenvolvedor web, quero mensagens de falha que indiquem o problema e a próxima ação, para resolver permissões negadas ou operações rejeitadas.
45. Como desenvolvedor web, quero identificar páginas não suportadas antes de aplicar, para não interpretar uma limitação do Chrome como sucesso.
46. Como desenvolvedor web, quero que nomes e strings sejam exibidos como texto, para que entradas personalizadas não executem conteúdo na extensão.
47. Como desenvolvedor web, quero operar pesquisa, seleção, formulário e ações pelo teclado, para utilizar a extensão com acessibilidade e agilidade.
48. Como desenvolvedor web, quero foco visível e estados descritos por texto, para não depender exclusivamente de cor ou mouse.
49. Como desenvolvedor web, quero usar a interface sem cortes em strings longas e sem deslocamento dos controles principais, para manter o fluxo previsível.
50. Como desenvolvedor web, quero usar a extensão sem serviços remotos, telemetria ou sincronização de navegação, para manter meus dados locais.
51. Como desenvolvedor web, quero testar localhost em HTTP e aplicações em HTTPS, para atender desenvolvimento local e ambientes de teste.
52. Como desenvolvedor web, quero confirmar pelo servidor o cabeçalho realmente recebido, para não confundir uma indicação da interface com prova de alteração da rede.
53. Como desenvolvedor web, quero saber que um UA de bot não comprova IP ou DNS do crawler, para evitar conclusões incorretas sobre autenticação de robôs.
54. Como desenvolvedor web, quero documentação de instalação, permissões e limitações, para reproduzir o uso e diagnosticar conflitos com outras extensões.
55. Como desenvolvedor web, quero que falhas de armazenamento não sejam apresentadas como cadastro concluído, para não perder um perfil acreditando que foi salvo.

## Implementation Decisions

### Plataforma e responsabilidades

- Construir uma extensão Chrome Manifest V3 com TypeScript, Vite, HTML e CSS, sem framework de interface, backend de produto ou banco externo. Código e comentários em inglês; interface e documentação de uso em pt-BR.
- Separar responsabilidades entre popup, configurações, catálogo integrado, gerenciamento de perfis e service worker de aplicação por aba. Compartilhar contratos de dados e validação entre as duas interfaces.
- O service worker é o responsável pelas mutações de perfis, regras e estado aplicado. As interfaces solicitam ações, recebem sucesso ou erro e refletem os valores confirmados, evitando gravações concorrentes independentes do catálogo.
- Comandos públicos internos abrangem consultar catálogo e estado da aba, aplicar UA, restaurar, cadastrar, editar e excluir perfil personalizado. Verificar remetente e formato das mensagens; não expor esses comandos a páginas da web.
- Permissões de produto: storage, declarativeNetRequestWithHostAccess e acesso aos hosts HTTP e HTTPS necessários, incluindo localhost. Não solicitar cookies, histórico, captura de tela, debugger ou permissão ampla de tabs sem necessidade comprovada. Consultar a aba atual e usar os métodos de tabs não exige, por si só, essa permissão ampla.
- Tratar acesso retido pelo usuário ou bloqueado por política do navegador como estado não disponível, com explicação. Não conceder permissões, alterar políticas ou usar mecanismos alternativos automaticamente.
- Distribuir recursos de interface, fontes e scripts junto com o pacote. Sem CDN, scripts remotos, analytics ou chamadas de rede necessárias ao funcionamento do produto.

### Identidade HTTP por aba

- Aplicar User-Agent com declarativeNetRequest, ação modifyHeaders e regras de sessão limitadas a tabIds. Usar set, nunca append, para enviar exatamente uma identidade selecionada.
- O escopo é a aba, não o domínio: a alteração acompanha navegações HTTP/HTTPS da mesma aba e suas requisições associadas cobertas pela API. Abas novas, duplicadas ou abertas por links começam sem herdar o perfil.
- Incluir requisições de documento, iframe, fetch/XHR e recursos associados à aba suportados pelo Chrome. Não incluir requisições sem tabId apenas para ampliar cobertura, pois isso quebraria o isolamento.
- Atualizar a regra da aba removendo a anterior e adicionando a nova na mesma operação de atualização de sessão. A alteração dos Client Hints faz parte dessa mesma substituição, não de uma etapa independente com sucesso parcial.
- Permitir somente um UA aplicado por aba. Aplicações concorrentes devem ser ordenadas, e a interface deve refletir o último comando concluído, não o último clique ainda pendente.
- Iniciar sem regras de alteração. Aplicar afeta próximas requisições, mas não modifica respostas já recebidas nem reescreve a página carregada.
- A interface confirma regra configurada, não afirma que todas as requisições já foram recebidas pelo servidor. A ação Recarregar página é separada, explícita e nunca ocorre apenas por selecionar, aplicar, restaurar ou salvar um perfil.
- Restaurar remove as regras de UA e hints da aba; não cria outra regra com uma string supostamente original. O Chrome volta a gerar seus cabeçalhos normalmente.
- Fechamento da aba remove regras e estado correspondentes. Tratar substituição de identificadores de aba como descarte da identidade antiga; não transferir o perfil para outra aba implicitamente.
- Encerramento do navegador, atualização, recarga ou desativação da extensão não deve restaurar automaticamente perfis ativos de sessões anteriores. Perfis salvos permanecem disponíveis, mas a atividade por aba é temporária.
- Guardar estado aplicado em storage.session, incluindo cópia do UA, nome, categoria e referência de origem quando houver. O estado não depende apenas de memória do worker.
- Ao retomar o worker, reconciliar regras de sessão, abas existentes e estado. A regra efetivamente instalada é a referência para mostrar atividade; uma regra ausente não pode resultar em indicador ativo. Se houver regra sem metadados, recuperar o UA para apresentar um perfil personalizado aplicado, sem descartar silenciosamente uma alteração real.
- Falhas anteriores à atualização da regra preservam o perfil anterior. Se a API de regras falhar, não atualizar estado ou badge como sucesso. Se uma falha posterior impedir salvar metadados, mostrar erro e reconciliar com a regra realmente instalada; nunca afirmar que a configuração anterior continua ativa sem verificar.
- O badge é específico por aba. Seu texto acessível e o popup identificam atividade sem depender apenas da cor.

### Client Hints e limites de simulação

- Enquanto houver perfil ativo, remover os cabeçalhos de identidade HTTP Sec-CH-UA, Sec-CH-UA-Mobile, Sec-CH-UA-Platform, Sec-CH-UA-Full-Version, Sec-CH-UA-Full-Version-List, Sec-CH-UA-Platform-Version, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Model, Sec-CH-UA-WoW64 e Sec-CH-UA-Form-Factors quando enviados pelo Chrome suportado.
- Essa política é a mesma para perfis integrados, bots e entrada direta. Não sintetizar metadados de hardware a partir de uma string arbitrária, nem modificar hints não relacionados à identidade UA.
- Restaurar desfaz a remoção. Não alterar Accept-CH ou outros cabeçalhos de resposta para implementar essa política.
- Não injetar scripts para falsificar navigator.userAgent, navigator.userAgentData ou navigator.platform. Não alterar viewport, touch, idioma, timezone, motor, cookies, TLS ou IP.
- Informar no popup e na documentação que a alteração é HTTP e que a identificação JavaScript permanece a do navegador real. Não apresentar perfis como emuladores de hardware ou de motores alternativos.
- Páginas internas, lojas e outros destinos protegidos pelo Chrome devem ser tratados como não suportados. Conteúdo servido integralmente por cache de aplicação ou por service worker pode não chegar ao servidor; requisições de workers sem associação à aba não fazem parte da garantia.

### Interface e interação

- Popup com largura aproximada de 420 px, layout alinhado à esquerda, seletor pesquisável agrupado, campo de UA imediatamente abaixo, link para configurações e ações Aplicar nesta aba e Restaurar.
- Seguir a direção visual do plano: papel #F4F7FA, tinta #203247, azul #275DC7, borda #CCD6E2, sucesso #247453 e erro #B53648. Source Sans 3 local para interface e fonte monoespaçada apenas para strings de UA. Usar contraste, espaçamento e hierarquia de estados em vez de menus em cascata ou cartões decorativos repetidos.
- Busca sem distinção entre maiúsculas e minúsculas, abrangendo nome, navegador, sistema e fabricante. Categorias visíveis: Desktop, Mobile, Tablet, Bots e Personalizados; perfis personalizados conservam também sua categoria funcional.
- Selecionar preenche o campo. Modificar esse valor o transforma em rascunho personalizado, sem modificar o perfil integrado ou salvo. Reabrir o popup consulta a configuração aplicada à aba; rascunhos não aplicados não precisam persistir.
- Distinguir navegador original, perfil aplicado, rascunho diferente do aplicado, operação em andamento, erro e página não suportada. Evitar chamadas repetidas enquanto a mesma operação está pendente.
- Após aplicar ou restaurar, informar que próximas requisições já usarão o estado configurado e que recarregar é uma ação opcional. Não afirmar que a página carregada já foi atualizada.
- Permitir aplicar UA sem nome e sem cadastro. Salvar como perfil abre formulário com nome, categoria e UA; salvar não implica aplicar nem recarregar.
- Configurações abrem como página da extensão em uma aba própria. Exibir lista pesquisável, tipo integrado/personalizado, categoria, navegador/sistema quando conhecidos, acesso ao UA completo e ações de gerenciamento adequadas à origem.
- Entradas integradas são somente leitura. Duplicar cria um perfil personalizado independente. Exclusão é explícita e limitada a personalizados; um erro preserva a entrada na lista.
- Atualizar listas abertas a partir de alterações confirmadas no armazenamento. Se um perfil personalizado em edição tiver sido alterado ou excluído em outra interface, informar o conflito e impedir sobrescrita silenciosa.
- Nomes e UAs longos devem quebrar linha ou ter área própria de rolagem, mantendo controles alcançáveis. Suportar teclado, foco visível, rótulos, seleção sem mouse, mensagens acessíveis e preferências de movimento reduzido.

### Dados e persistência

- Cada perfil possui identificador estável, nome, categoria funcional e User-Agent. Origem distingue integrado de personalizado. Navegador, sistema, fabricante e modelo são metadados opcionais; fonte e data de verificação são obrigatórias para integrados.
- Os dados locais personalizados são versionados e separados do catálogo distribuído. Atualizar a extensão não deve sobrescrever personalizados. Não criar uma infraestrutura genérica de migração antes de existir uma mudança real de formato.
- Nomes obrigatórios após remoção de espaços externos; identificadores distintos permitem nomes repetidos. A busca e o gerenciamento mostram contexto suficiente para diferenciá-los.
- Rejeitar UA vazio ou composto apenas de espaços e caracteres incompatíveis com cabeçalhos, incluindo CR, LF, NUL e controles. Remover apenas espaços externos permitidos; não corrigir silenciosamente quebras de linha ou controles. Não exigir prefixo Mozilla ou uma expressão rígida de navegador, pois bots e identificadores próprios são válidos.
- Validar o conteúdo antes de persistir ou aplicar e tratar rejeições adicionais da API como erros. Entradas inválidas nunca substituem uma configuração válida.
- Renderizar nomes, metadados e strings como texto, nunca como HTML executável.
- O snapshot aplicado a uma aba é independente do perfil salvo: editar ou excluir o cadastro não altera o UA ativo; trocar exige nova aplicação explícita.

### Catálogo nominal

A relação a seguir fecha os 50 perfis e os 12 bots. Ela define rótulos e cobertura, não comprova participação de mercado por modelo. A implementação deve preencher versões concretas e strings verificadas em fontes rastreáveis antes da entrega, sem placeholders ou versões inventadas. Usar o formato reduzido moderno quando essa for a identidade real do navegador.

Quando modelos diferentes compartilham UA, conservar essa informação visível e não fabricar identificadores para diferenciá-los. Perfis iPhone/iPad podem identificar apenas família e versão do sistema; perfis Android modernos podem omitir modelo. No caso de Safari no iPad em modo desktop, informar que o UA pode parecer macOS. Esses perfis continuam sendo exemplos de navegação representativa, não prova de identificação do aparelho pelo servidor.

| Nº | Categoria | Perfil |
| --- | --- | --- |
| 1 | Desktop | Chrome — Windows 11 |
| 2 | Desktop | Edge — Windows 11 |
| 3 | Desktop | Firefox — Windows 11 |
| 4 | Desktop | Opera — Windows 11 |
| 5 | Desktop | Chrome — Windows 10 |
| 6 | Desktop | Edge — Windows 10 |
| 7 | Desktop | Firefox — Windows 10 |
| 8 | Desktop | Chrome — macOS |
| 9 | Desktop | Safari — macOS |
| 10 | Desktop | Firefox — macOS |
| 11 | Desktop | Edge — macOS |
| 12 | Desktop | Opera — macOS |
| 13 | Desktop | Chrome — Linux |
| 14 | Desktop | Firefox — Linux |
| 15 | Desktop | Edge — Linux |
| 16 | Mobile | iPhone 17 — Safari |
| 17 | Mobile | iPhone 16 — Safari |
| 18 | Mobile | iPhone 15 — Safari |
| 19 | Mobile | iPhone 14 — Safari |
| 20 | Mobile | iPhone 13 — Safari |
| 21 | Mobile | iPhone SE de 3ª geração — Safari |
| 22 | Mobile | iPhone — Chrome |
| 23 | Mobile | iPhone — Firefox |
| 24 | Mobile | Samsung Galaxy S25 — Chrome |
| 25 | Mobile | Samsung Galaxy S24 — Chrome |
| 26 | Mobile | Samsung Galaxy S23 — Chrome |
| 27 | Mobile | Samsung Galaxy A56 — Chrome |
| 28 | Mobile | Samsung Galaxy A55 — Chrome |
| 29 | Mobile | Samsung Galaxy A35 — Chrome |
| 30 | Mobile | Samsung Galaxy S24 — Samsung Internet |
| 31 | Mobile | Samsung Galaxy A55 — Samsung Internet |
| 32 | Mobile | Xiaomi Redmi Note 14 — Chrome |
| 33 | Mobile | Xiaomi Redmi Note 13 — Chrome |
| 34 | Mobile | Poco X7 — Chrome |
| 35 | Mobile | Google Pixel 9 — Chrome |
| 36 | Mobile | Google Pixel 8 — Chrome |
| 37 | Mobile | Motorola Moto G85 — Chrome |
| 38 | Mobile | Oppo Reno12 — Chrome |
| 39 | Mobile | Vivo V40 — Chrome |
| 40 | Mobile | Android — Firefox |
| 41 | Tablet | iPad Pro M4 — Safari |
| 42 | Tablet | iPad Air M2 — Safari |
| 43 | Tablet | iPad de 10ª geração — Safari |
| 44 | Tablet | iPad mini de 6ª geração — Safari |
| 45 | Tablet | iPad — Chrome |
| 46 | Tablet | Samsung Galaxy Tab S10 — Chrome |
| 47 | Tablet | Samsung Galaxy Tab S9 — Chrome |
| 48 | Tablet | Amazon Fire HD 10 — Silk |
| 49 | Tablet | Xiaomi Pad 6 — Chrome |
| 50 | Tablet | Lenovo Tab M11 — Chrome |

| Nº | Categoria | Perfil de bot |
| --- | --- | --- |
| 1 | Bots | Googlebot Desktop |
| 2 | Bots | Googlebot Smartphone |
| 3 | Bots | Google-InspectionTool |
| 4 | Bots | AdsBot-Google |
| 5 | Bots | Bingbot |
| 6 | Bots | DuckDuckBot |
| 7 | Bots | YandexBot |
| 8 | Bots | Baiduspider |
| 9 | Bots | facebookexternalhit |
| 10 | Bots | meta-externalagent |
| 11 | Bots | Twitterbot |
| 12 | Bots | LinkedInBot |

- Cada bot deve usar um UA HTTP completo e documentado. Não confundir token de robots.txt com identificador HTTP. Exemplos de fabricantes que contêm marcadores de versão precisam ser concretizados com versões verificadas, não publicados literalmente.
- A lista nominal é uma decisão de cobertura desta especificação, não uma alegação de que todos esses modelos são os mais usados ou de que todos os detectores reconhecerão cada string.

### Sequência de entrega

1. Criar build e pacote Manifest V3 instalável com popup, configurações, ícones e service worker; confirmar carregamento real sem erros.
2. Implementar aplicação/restauração por aba e ciclo de vida; comprovar isolamento e cabeçalhos com servidor local.
3. Incorporar catálogo completo com procedência e gerenciamento persistente de personalizados; confirmar que salvar não altera abas implicitamente.
4. Concluir interface, acessibilidade, estados de erro e atualização das listas; verificar popup e configurações reais.
5. Executar os cenários de aceite, documentar instalação, permissões e limites, e entregar o pacote reproduzível. Não criar mudanças no Horus como parte desse fluxo.

## Testing Decisions

### Limite confirmado pelo usuário

- Limite principal único: extensão instalada em Chrome real, operada pelas superfícies públicas do popup e das configurações, com conferência dos cabeçalhos efetivamente recebidos por um servidor local de teste. Esse limite integra interface, service worker, armazenamento e regras sem testar detalhes internos de implementação.
- O usuário selecionou essa proposta em vez de exigir integração com Horus como critério de conclusão. Nenhum teste deve chamar automaticamente checkIsBot ou tocar seu banco.
- O repositório ainda não possui aplicação ou suíte de testes. Não há exemplos existentes a reutilizar. O servidor local de eco e as páginas de teste serão a nova fronteira de integração, não um backend do produto.
- Um bom teste verifica comportamento observável e transições: valor recebido, ausência de vazamento entre abas, restauração, preservação dos personalizados e erros sem falso sucesso. Não testar nomes de funções, estrutura do DOM incidental, texto exato da interface ou cópias de dados sem significado para o usuário.
- Mocks das APIs Chrome podem auxiliar erros determinísticos que sejam difíceis de induzir, mas nunca substituem a prova de alteração HTTP no navegador. Testes permanentes adicionais de validação devem ser pequenos, comportamentais e necessários; não criar uma suíte que apenas confira encaminhamento de mensagens.

### Cenários de aceite

| Identificador | Cenário | Resultado obrigatório |
| --- | --- | --- |
| A1 | Instalar e abrir as duas superfícies | Chrome carrega a extensão e oferece popup e configurações sem erros de extensão ou recursos remotos necessários. |
| A2 | Consultar catálogo | As quatro categorias integradas oferecem os 50 perfis e os 12 bots especificados, com UA utilizável, fonte e data; pesquisa localiza nomes e metadados. |
| A3 | Aplicar perfil e string direta | Próxima requisição recebida pelo servidor contém exatamente o UA confirmado; aplicar valor direto não exige cadastro. |
| A4 | Comparar duas abas | Uma aba alterada não modifica a outra; duas abas do mesmo site mantêm valores diferentes. Aba nova não herda a seleção. |
| A5 | Navegar e solicitar recursos | Documento, iframe, recurso e fetch/XHR associados à aba respeitam o perfil em requisições suportadas, inclusive navegação entre origens permitidas. |
| A6 | Aplicar e restaurar sem recarregar | Nenhuma navegação é disparada automaticamente; novas requisições já refletem o estado. Recarregar só ocorre por ação explícita. |
| A7 | Conferir hints | Em origem segura local que solicite UA-CH, os cabeçalhos de identidade enumerados estão ausentes enquanto ativo e voltam ao comportamento de referência após restaurar. |
| A8 | Conferir fronteira JavaScript | navigator.userAgent e navigator.userAgentData, quando disponíveis, continuam com os valores reais de referência; a interface informa que a troca é HTTP. |
| A9 | Restaurar e repetir | Requisições voltam ao UA e à política de hints da referência na mesma sessão; não há valores concatenados, regra residual ou alteração em outras abas. Restaurar novamente é seguro. |
| A10 | Retomar worker | Suspender e retomar o worker não perde a regra ativa nem inventa estado ativo; o popup e o badge refletem o valor realmente configurado. |
| A11 | Encerrar aba e sessão | Fechar aba descarta seu perfil; reiniciar Chrome deixa abas sem override. Personalizados permanecem disponíveis. Recarregar ou atualizar a extensão não reaplica snapshots antigos automaticamente. |
| A12 | Gerenciar personalizados | Cadastrar, editar, excluir e duplicar integrado funcionam; listas abertas refletem alterações confirmadas, e integrados permanecem preservados. |
| A13 | Alterar perfil já aplicado | Editar ou excluir o cadastro não modifica o UA recebido pela aba ativa até nova aplicação ou restauração explícita. |
| A14 | Validar entrada | Vazio, controles e quebras de linha são rejeitados sem substituir a configuração válida; identificadores incomuns válidos de bots e ferramentas próprias são aceitos. |
| A15 | Negar acesso ou induzir falha | Sem acesso ao host ou diante de rejeição de regra/armazenamento, a interface apresenta erro e o estado real; não declara aplicação ou cadastro concluído falsamente. |
| A16 | Tratar concorrência | Trocas rápidas resultam no último comando confirmado; edição concorrente de cadastro não causa sobrescrita silenciosa. |
| A17 | Usar bots | Servidor recebe exatamente o UA de cada bot selecionado; os perfis Google/Meta conservam os tokens previstos na classificação observada no Horus. Não alegar verificação do detector de terceiros sem exercitá-lo. |
| A18 | Inspecionar conteúdo malicioso e longo | Nome contendo marcação aparece como texto sem execução; strings longas permanecem acessíveis sem ocultar os controles. |
| A19 | Operar por teclado e ler estados | Pesquisa, seleção, formulário e ações são alcançáveis; foco é visível, estados têm indicação textual e não dependem apenas de cor. |
| A20 | Abrir destino protegido | Aplicação fica indisponível com explicação; não há indicador falso de sucesso naquele destino. |
| A21 | Usar HTTP e HTTPS local | Ambas as modalidades recebem o UA correto; teste de Client Hints usa origem que realmente os envie na referência. |

### Preparação e evidências

- Usar perfil de navegador isolado de outras extensões modificadoras, páginas locais sem service worker e respostas de teste sem cache. Cada cenário deve partir de estado conhecido e liberar seus recursos ao terminar.
- Capturar referência de UA, hints e valores de navigator antes de aplicar. Para hints, usar origem local segura e solicitar explicitamente os valores de alta entropia via Accept-CH; ausência já existente na referência não comprova remoção.
- O servidor local deve permitir observar documento, iframe, recursos e fetch/XHR com identificadores de cenário, sem armazenar dados de navegação externa ou divulgar cabeçalhos a terceiros.
- Conferir quantidade e procedência do catálogo na entrega; não criar testes permanentes frágeis que apenas fixem cópias literais de todas as strings ou o número de linhas de um arquivo.
- Validar visualmente popup e configurações no Chrome real. Preferir verificações sem desktop; quando a superfície exigir desktop em sessão omp, usar apenas o computer use do omp, em segundo plano sempre que possível, com controle curto e liberação imediata. Se indisponível, avisar uma vez, concluir os outros checks e informar a prova de UI pendente, sem substituí-lo por outro mecanismo de controle do desktop.
- Prova automatizada de regras pode usar um Chrome isolado instrumentado para integração; isso não substitui a inspeção visual das superfícies reais nem autoriza controlar o desktop pessoal por outro mecanismo.
- A entrega só pode declarar a validação completa quando as evidências obrigatórias estiverem obtidas. Identificar individualmente qualquer cenário não exercitado e sua dependência, sem apresentar saída inferida como teste executado.
- Integração complementar com Horus, se solicitada posteriormente, exige aplicação e banco isolados. O reconhecimento de bots delegados depende da versão instalada do CrawlerDetect; o eco de cabeçalhos não comprova esse resultado.

## Out of Scope

- Emulação de viewport, touch, motor de navegador, idioma, timezone ou hardware.
- Falsificação de navigator ou de Client Hints JavaScript, incluindo uso de debugger como mecanismo do produto.
- Mudança de IP, DNS, TLS ou comprovação de autenticidade de crawlers; evasão de antifraude ou de verificações de segurança.
- Regras globais, por domínio ou persistentes entre sessões; herança automática entre abas; suporte dedicado a navegação anônima.
- Sincronização em nuvem, contas, telemetria, atualização remota automática do catálogo, importação/exportação e recursos não pedidos como favoritos.
- Alterações no Horus, correções em CrawlerCheck, dependência do banco do Horus ou integração obrigatória com CrawlerDetect.
- Compatibilidade com Firefox como plataforma de extensão, instalação em navegadores mobile e publicação na Chrome Web Store.
- Alegar que a seleção é um ranking estatístico dos 50 modelos mais usados ou que rótulos de hardware são distinguíveis pelo UA em todos os casos.

## Further Notes

### Decisões e premissas

- Pedido original: extensão Chrome com design mais robusto, seleção de dispositivo, input diretamente abaixo, configurações para listar e adicionar dispositivos, 50 dispositivos e bots para testes de backend.
- O plano recomendou 50 perfis de dispositivos/navegadores mais bots, isolamento por aba, alteração apenas HTTP e nenhuma implementação automática. Esta especificação consolida essas recomendações; não atribui ao usuário aprovação individual de cada combinação nominal do catálogo.
- Em confirmação explícita nesta etapa, o usuário escolheu Chrome real e servidor local como limite principal de validação, mantendo Horus como verificação complementar.
- O catálogo nominal é uma seleção de cobertura para implementação. Fontes de mercado consultadas sustentam famílias de navegador/fabricante, não popularidade individual dos modelos. A procedência das strings e a versão concreta de cada perfil são verificações obrigatórias da implementação, não uma pergunta pendente ao usuário.
- Não há código da extensão, testes ou arquitetura existente a migrar. Node.js e npm foram encontrados no ambiente; isso não comprova que uma build da futura extensão já tenha sido executada.
- Não há decisão funcional bloqueante conhecida. Disponibilidade futura de um Chrome real controlável e origem segura local afeta a execução da validação, não autoriza reduzir os critérios.

### Evidências consultadas

- Instruções do repositório e configuração do tracker local em docs/agents/.
- CrawlerCheck inspecionado em C:\WebServer\www\horus\src\Security\CrawlerCheck.php. checkIsBot lê a identidade HTTP, identifica Google/Meta antes de CrawlerDetect e também grava informações de crawler no banco; o arquivo não foi alterado ou executado.
- Regras e permissões Chrome: https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest
- Persistência local e de sessão: https://developer.chrome.com/docs/extensions/reference/api/storage
- Client Hints HTTP e JavaScript: https://developer.chrome.com/docs/privacy-security/user-agent-client-hints
- Identificadores HTTP de crawlers Google: https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
- Visão geral e autenticidade dos crawlers Google: https://developers.google.com/crawling/docs/crawlers-fetchers/overview-google-crawlers
- Famílias de navegadores: https://gs.statcounter.com/browser-market-share
- Navegadores mobile no Brasil: https://gs.statcounter.com/browser-market-share/mobile/brazil
- Fabricantes mobile: https://gs.statcounter.com/vendor-market-share/mobile/worldwide
- Fabricantes tablet: https://gs.statcounter.com/vendor-market-share/tablet/worldwide

### Continuidade

Implementação concluída na branch `main`. Critérios A1–A21 e revisões independentes Standards/Spec concluídos; registros, commits e evidências em [execution.md](execution.md) e [docs/validacao.md](../../docs/validacao.md). Pacote local em `dist/` e `user-agent-local.zip`; nenhum push, PR ou deploy realizado.
