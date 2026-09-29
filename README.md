# América Rental Car: páginas de destino

Páginas de destino para os anúncios de busca da [América Rental Car](https://america-rentalcar.com.br), locadora de veículos com loja própria em Vila Velha, Vitória e Guarapari (ES). Duas rotas, um projeto:

- **`/`** — consumidor final. Leva quem clicou no anúncio até o WhatsApp da loja certa, o mais rápido possível, disparando a conversão correta no caminho.
- **`/empresas`** — campanha B2B dedicada (29/09/2026), separada da campanha de loja porque a página de consumidor "fala com tudo", não só com empresa (decisão do Renan com o cliente em 22/09/2026). Formulário curto (nome, empresa, necessidade) que monta a mensagem e reusa o mesmo mecanismo de conversão. Ver seção "Página de empresas" abaixo.

## Como rodar

```bash
npm install
npm run build
npm start          # http://localhost:3210
```

| Comando | O que faz |
|:--|:--|
| `npm run dev` | desenvolvimento com recarga |
| `npm run build` | build de produção e pré-renderização do HTML |
| `npm start` | serve o build estático localmente, com gzip e cache iguais aos de produção |
| `npm run validar` | checklist automatizado: links, tags, peso, conteúdo |
| `npm run verificar-tags` | prova em navegador de que cada botão dispara a conversão certa |
| `npm run imagens` | regenera logo, imagem de compartilhamento e favicon |
| `npm run typecheck` | conferência de tipos |

O logo bruto não está versionado. Para reconstruir as imagens a partir do site oficial:

```bash
bash scripts/baixar-imagens.sh
npm run imagens
```

## Stack

TanStack Start (React 19) com Tailwind 4 e build em Vite. Todas as versões estão travadas em exato, sem `^` e sem pré-lançamento: a página fica no caminho crítico do único canal de aquisição do cliente.

O build **pré-renderiza a página em HTML estático**. O HTML sai pronto, com todo o conteúdo, só que gerado uma vez no build em vez de a cada visita. Na prática `dist/client` é um site estático: qualquer CDN entrega, sem função de servidor e sem cold start no caminho do clique pago. O React hidrata em cima desse HTML para os cliques de contato.

## Estrutura

```
src/
  routes/__root.tsx    shell do documento, metadados e tags de rastreamento
  routes/index.tsx     página de consumidor final ("/")
  routes/empresas.tsx  página de empresas ("/empresas")
  components/          Hero, SeletorLoja, Empresas, Diferenciais, Rodape
                        HeroEmpresas, NecessidadesEmpresas, DiferenciaisEmpresas,
                        FormularioEmpresas, FaqEmpresas
  lib/lojas.ts         fonte única: endereço, telefone, WhatsApp e conversão por loja
  lib/tracking.ts      origem, código de atendimento e disparo de conversão
  lib/config.ts        identificadores e chaves de configuração
scripts/               imagens, servidor local e os dois scripts de verificação
```

`lib/lojas.ts` é fonte única. Nenhum telefone, link ou rótulo de conversão pode aparecer solto em componente.

Cada rota declara seu próprio `title`, `description` e `link rel="canonical"` no `head()` do arquivo em `routes/`, nunca em `__root.tsx`: o TanStack Router dedupe `meta` por `name`/`property` (a rota filha substitui a raiz), mas **concatena `links`** em vez de substituir — um canonical fixo em `__root.tsx` sairia duplicado em toda rota nova. Ver o comentário em `routes/index.tsx`.

## Rastreamento

O `gtag` é carregado uma vez, com Google Ads e GA4. As conversões são disparadas **direto no código**, sem depender de gerenciador de tags.

Cada botão de contato é um `<a href>` real com o link do WhatsApp já montado no HTML servido: sem JavaScript, o clique leva ao WhatsApp do mesmo jeito. Com JavaScript, o `onClick` segura a navegação, dispara a conversão com `event_callback` e só então segue. Um tempo limite de 800 ms garante que rede lenta ou bloqueador de anúncio não prendam ninguém na página.

Quando a campanha traz o nome de uma cidade em `utm_campaign` ou `utm_term`, o card daquela loja sobe para a frente e ganha uma etiqueta. Como a página é estática, quem faz isso é um script curto no fim do corpo, que marca o card antes da primeira pintura: a mudança é só de CSS, o HTML continua o mesmo que o React espera hidratar, e não há salto de layout. Os termos de cada cidade vêm de `lib/lojas.ts`, não estão escritos no script.

Os parâmetros de origem (`gclid`, `wbraid`, `gbraid` e as UTMs) são **lidos da URL de entrada** e guardados em `localStorage` e num cookie primário de 90 dias. Nenhuma UTM é escrita no código. Cada sessão recebe um código curto (`AR-XXXXXXX`) que entra na mensagem do WhatsApp como protocolo de atendimento, o que permite reconciliar depois qual conversa virou locação. O código é aleatório e não carrega dado pessoal.

`LOG_ENDPOINT` em `lib/config.ts` está vazio: a função de registro é no-op e a página funciona normalmente. Preenchido, passa a enviar um JSON por `navigator.sendBeacon` a cada clique de contato.

### Verificação

`npm run verificar-tags` abre um Chrome de verdade e faz duas passadas por botão: uma confere a requisição de conversão saindo pela rede com o rótulo daquela loja, antes da navegação; a outra, com as bibliotecas de terceiro bloqueadas, confere os argumentos exatos de cada chamada.

Todos os endpoints de coleta são bloqueados na camada de rede durante o teste, então **nenhuma conversão de teste chega à conta de anúncios**.

## Regras de conteúdo

A página não afirma nada que não esteja confirmado na fonte. Sem preço, sem horário de funcionamento, sem prazo de entrega, sem tempo de resposta, sem selo, sem quantidade de veículos. Onde o dado não existe, o assunto simplesmente não aparece.

O tempo de mercado ("mais de 35 anos") e a composição da frota são afirmações do próprio cliente, enviadas em 17/08/2026, e por isso entram. `scripts/validar.mjs` guarda essa distinção: essas duas passam, qualquer outro número de anos, preço ou selo reprova o build.

## Desempenho

Medido no Lighthouse mobile, 4G simulado, contra o build de produção:

| Métrica | Valor |
|:--|:--|
| Performance | 97 |
| Acessibilidade | 100 |
| SEO | 100 |
| LCP | 1,6 s |
| CLS | 0 |
| Página inteira | 114 KB transferidos |

Sem vídeo, sem autoplay, sem fonte externa e sem imagem além do logo: a página toda cabe na primeira dobra.

## Página de empresas (`/empresas`)

Adicionada em 29/09/2026, registrada em `vite.config.ts` (`pages: [{ path: "/" }, { path: "/empresas" }]`) — sem essa entrada o build não pré-renderiza a rota e ela quebraria em produção, mesmo funcionando normalmente em `npm run dev`.

**Formulário em vez de botão direto.** Decisão do cliente: nome, empresa e "o que sua empresa precisa" (mínimo direcionamento para o atendente, não um funil de qualificação). No envio, monta a mensagem e chama o mesmo `irParaWhatsApp` de `lib/tracking.ts` — mesma conversão (`AW-866527260/mZ5XCPrsuKUcEJzQmJ0D`, a mesma que o bloco "Empresas" da raiz já usa) e o mesmo evento de GA4 dos outros botões.

**Isso quebra o padrão "funciona sem JavaScript" do resto do site.** A mensagem só existe depois de combinar três campos digitados, e HTML puro não sabe fazer isso — não existe fallback estático equivalente ao dos botões de loja. Por isso o formulário tem, logo abaixo, um `BotaoWhatsApp` de reforço (mensagem genérica, sem os três campos) que funciona do jeito antigo. `npm run validar` confere que esse link está no HTML servido.

**Conteúdo.** Segue a mesma regra da raiz — nada sem fonte confirmada. Os diferenciais reaproveitam fatos já validados pelo cliente (17/08/2026: "+35 anos", frota incluindo furgões e vans) e a alavanca de operação local contra redes nacionais, que é texto de `perfil.md`, não copy nova. Onde a condição comercial não está confirmada (o que entra no contrato de terceirização, manutenção, prazo mínimo), a página não afirma — direciona para "fale com o atendimento corporativo" em vez de prometer. O FAQ corrige de propósito a expectativa de atendimento fora do ES: os termos de busca que o cliente repassou (22/09/2026) incluem variações "Bahia", "MG" e "Brasil", mas a operação confirmada é só Vila Velha, Vitória e Guarapari.

**Pendência que fica registrada aqui, não resolvida:** `perfil.md` tem uma regra CRÍTICA de que B2B só pode ser reaberto com canal novo, teto de verba próprio e critério de corte declarado por escrito — histórico da conta é R$ 13.583 investidos em 3-4 tentativas de B2B no Google Search, zero conversão. A campanha combinada em 22/09/2026 reorganiza o mesmo canal (Google Search), não abre canal novo, e o teto/corte não foi declarado nesta entrega (decisão explícita: só a página, por ora). Esta página reduz risco de leilão (ver seção 7 de `RELATORIO.md`), mas não substitui essa declaração pendente.

**Verificação.** `npm run verificar-tags` ganhou um caso dedicado (`provaDoFormularioEmpresas`): preenche os três campos de verdade num Chrome headless, confere que a conversão sai com o rótulo certo antes da navegação, e que nome/empresa/necessidade chegam decodificados na mensagem do WhatsApp. `npm run validar` ganhou os mesmos checks de conteúdo e um check de canonical único (ver nota na seção Estrutura). Capturas em `provas/pagina-empresas-celular.png` e `provas/pagina-empresas-desktop.png`.

## Publicação

**Vercel** é a publicação principal, configurada em `vercel.json`: build com `npm run build` e saída estática em `dist/client`. Conectado ao repositório, cada push na `main` publica.

**Cloudflare** funciona como alternativa, com o `wrangler.toml` da raiz:

```bash
npm run build
npx wrangler deploy
```

Dois cuidados antes de trocar o destino dos anúncios:

1. **A URL final precisa ser um domínio da América.** Um subdomínio serve; um endereço de plataforma (`*.vercel.app`, `*.workers.dev`) não. Ajuste `SITE_URL` em `lib/config.ts` e o domínio na hospedagem quando ele existir.
2. **Não rode esta página e o agregador de links antigo em paralelo** para o mesmo tráfego. As ações de conversão são primárias e contam uma por clique: manter os dois duplica conversão e suja a série histórica.

## Estado atual

O pixel do Meta está desligado por uma chave em `lib/config.ts`. O código dele está pronto e o evento de contato continua sendo chamado; basta trocar para `true`. Em teste de navegador, o pixel carrega e inicializa mas não transmite evento nenhum, e o mesmo acontece no site oficial: antes de ligar, vale confirmar no Gerenciador de Eventos se ele ainda está ativo.
