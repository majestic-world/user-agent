# Validação da entrega

Ambiente: Chrome real **157.0.8103.39**, Windows, perfil isolado de outras extensões modificadoras. Servidores descartáveis HTTP e HTTPS em loopback, respostas `no-store`, sem service worker. Certificado TLS temporário aceito somente pelo Chrome de integração. Nenhuma chamada ao Horus, CrawlerCheck ou banco.

Fronteira: formulários do popup/configurações e cabeçalhos recebidos pelo servidor. As falhas determinísticas de DNR e storage foram induzidas somente nas APIs externas do Chrome. Não há mocks substituindo a prova de rede. `tests/harness.mjs` fornece o eco; não é backend de produto.

## Critérios

| Critério | Evidência executada |
| --- | --- |
| A1 | MV3 instalado no Chrome; popup da ação aberto nativamente. Documentos finais de popup e configurações inspecionados com capturas nativas omp. Diagnóstico Chrome sem erros de manifesto/runtime ou avisos de instalação. Recursos das interfaces somente `chrome-extension://`. |
| A2 | Conferência de entrega: 15 Desktop, 25 Mobile, 10 Tablet, 12 Bots; 62 IDs distintos, todos com UA, fonte e data acessíveis. Busca por Samsung, iOS e Firefox em caixa mista retornou as famílias correspondentes. |
| A3 | Entrada direta `LocalProbe/1.0` recebida exatamente; os 62 perfis também foram selecionados e transmitidos individualmente pelo popup. |
| A4 | Abas do mesmo site receberam `FirstTab/1.0` e `SecondTab/2.0` sem vazamento; aba nova e aba duplicada mantiveram a referência original. |
| A5 | Documento, iframe, imagem SVG, fetch e XHR receberam o snapshot; navegação HTTP/HTTPS e iframe entre origens locais diferentes preservaram a alteração. |
| A6 | Contagem de documentos no servidor permaneceu igual após aplicar/restaurar; só a ação Recarregar aumentou a contagem. |
| A7 | Referência enviou hints de identidade, inclusive alta entropia via Accept-CH. Nenhum `sec-ch-ua*` chegou enquanto ativo. Após restaurar, cada hint observado voltou ao valor da referência. |
| A8 | `navigator.userAgent` e `navigator.userAgentData.toJSON()` permaneceram iguais à referência na origem segura, enquanto o servidor recebeu outro UA. Limite HTTP visível nas interfaces. |
| A9 | Restauração voltou ao UA/hints originais e preservou a outra aba; Restaurar fica indisponível sem override, evitando remoções repetidas desnecessárias. |
| A10 | Worker realmente encerrado e debugger destacado; a regra continuou atuando e o popup recuperou UA/badge ao retomar, inclusive sem metadados por aba. Metadados sem regra foram descartados sem indicar atividade falsa. |
| A11 | Fechar aba removeu a regra antiga; aba nova não herdou identidade. Reinício do Chrome deixou override vazio e preservou personalizados. Recarga e desativação/reativação da extensão descartaram override. Atualização real para 1.0.1 no pacote descartável também descartou override e preservou o cadastro; pacote final permanece 1.0.0. |
| A12 | Cadastro, edição, exclusão confirmada e duplicação exercitados nas configurações; cadastro pelo popup também conferido. Listas abertas refletiram alterações e integrado continuou somente leitura. |
| A13 | Servidor continuou recebendo `SavedProbe/1` após editar o cadastro para `/2` e excluí-lo. |
| A14 | Vazio, espaços, LF, controle, NUL e TAB rejeitados sem trocar o override válido. Identificador sem Mozilla aceito. NUL inserido diretamente no campo público porque CDP descarta esse caractere antes da entrada. |
| A15 | Acesso a hosts realmente retido no perfil descartável: Aplicar e badge indisponíveis, Restaurar permitido. Rejeições de regra, metadados pós-regra, cadastro e exclusão mantiveram mensagens de erro e estado real, sem falso sucesso. |
| A16 | Duas interfaces aplicando durante atraso controlado da API concluíram em ordem; rede e interface mostraram o último UA confirmado. A mensagem textual também acompanhou aplicação/restauração externa, sem manter um rótulo de rascunho já confirmado. Edição/exclusão concorrentes preservaram rascunho e bloquearam sobrescrita. |
| A17 | Todos os 12 bots recebidos exatamente, com tokens Google/Meta preservados. Isso não comprova reconhecimento por Horus/CrawlerDetect nem autenticidade do bot. |
| A18 | Nome com `<img ... onerror>` permaneceu texto, sem elemento/executável. UA de 6.010 caracteres recebido integralmente; rodapé permaneceu alcançável e estável. Nome longo sem overflow horizontal nas configurações a 390 px. |
| A19 | Pesquisa, seleção nativa, edição e aplicação operadas por teclado; outline sólido visível. Controles nativos com rótulos, formulários, estados textuais e regiões live. Capturas nativas confirmaram alinhamento, legibilidade e rodapé do popup. |
| A20 | `chrome://version` deixou Aplicar indisponível com explicação, sem novo sucesso. |
| A21 | Eco HTTP e HTTPS recebeu o UA esperado; referência segura efetivamente enviou hints antes de testar sua remoção. |

## Evidências e reprodução

- `npm run build`: TypeScript e Vite, recursos locais e ícones.
- `npm test`: integração de identidade HTTP e personalizados no Chrome real; cada cenário libera navegador, perfil e servidores.
- Conferência ampliada de entrega: 62 transmissões exatas, busca, teclado, strings longas, duplicação de aba, iframe entre origens e atualização real. Resultado detalhado da execução local em `artifacts/acceptance.json` (ignorado no Git); os resultados duradouros estão registrados nesta matriz, não dependem desse arquivo temporário.
- Inspeção nativa: ação popup aberta no Chrome isolado; documentos finais `popup.html` (layout 420 × 600) e `options.html` capturados pelo `computer` do omp, sem substituir essa inspeção por screenshots do harness. O Windows recusou parte da ativação por janela; a inspeção final das superfícies carregadas usou captura nativa somente leitura. Controle de desktop liberado; janelas isoladas encerradas.
- Gates integrados finais: `npm test` recompilou a extensão e passou os 13 cenários, sem falhas. ZIP com 18 arquivos do `dist`; duas gerações produziram SHA-256 `b7d6c67193d8c9074eecfc45c00afb9b6dda5b5df9416a2ee2b082c778a8440c` (91.523 bytes).

As notas de fontes do catálogo distinguem exemplos históricos, fixtures e relatos de terceiros. Não houve teste físico de modelos de aparelho, publicação em loja, integração Horus ou autenticação de bots; nada disso é critério desta entrega.

## Revisão final

Base fixa: `1ddcc8e7437428b774d09b3f6b2e126d3d392d46`; revisão de todo o intervalo até a implementação e reavaliação das correções em `f15a230`.

- **Standards:** 3 achados aceitos e corrigidos (triagem separada da execução, títulos de testes em inglês em 2 arquivos); nenhum smell heurístico ou achado acionável restante.
- **Spec:** 1 achado aceito e corrigido (mensagem textual stale após alteração por outra interface), com regressão red/green pelo popup real e conferência no eco. Nenhum achado acionável restante.

Nenhum achado foi descartado. Tickets 01–03 encerrados localmente somente após os dois eixos confirmarem as correções.
