# América Rental Car: página de atendimento

Página única de destino para os anúncios de busca da [América Rental Car](https://america-rentalcar.com.br), locadora de veículos com loja própria em Vila Velha, Vitória e Guarapari (ES).

O trabalho da página é um só: levar quem clicou no anúncio até o WhatsApp da loja certa, o mais rápido possível, disparando a conversão correta no caminho.

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
  routes/index.tsx     a página
  components/          Hero, SeletorLoja, Empresas, Diferenciais, Rodape
  lib/lojas.ts         fonte única: endereço, telefone, WhatsApp e conversão por loja
  lib/tracking.ts      origem, código de atendimento e disparo de conversão
  lib/config.ts        identificadores e chaves de configuração
scripts/               imagens, servidor local e os dois scripts de verificação
```

`lib/lojas.ts` é fonte única. Nenhum telefone, link ou rótulo de conversão pode aparecer solto em componente.

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
