import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import {
  GA4_ID,
  GOOGLE_ADS_ID,
  META_PIXEL_ENABLED,
  META_PIXEL_ID,
  SITE_URL,
} from "~/lib/config";
import "~/styles/app.css";

const TITULO = "Aluguel de carros no Espírito Santo | América Rental Car";
const DESCRICAO =
  "Locadora com loja e equipe próprias em Vila Velha, Vitória e Guarapari. Fale direto no WhatsApp com a unidade que vai entregar o seu carro.";

/**
 * gtag carregado uma vez, com as duas configurações (Google Ads e GA4).
 * As conversões são disparadas direto no código, em lib/tracking.ts.
 * Não entra GTM aqui. Não entra Universal Analytics, que está descontinuado.
 */
const GTAG_INLINE = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');
gtag('config', '${GA4_ID}');
`.trim();

const PIXEL_INLINE = `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');
`.trim();

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: TITULO },
      { name: "description", content: DESCRICAO },
      { name: "theme-color", content: "#026237" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:site_name", content: "América Rental Car" },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESCRICAO },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: `${SITE_URL}/og.jpg` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITULO },
      { name: "twitter:description", content: DESCRICAO },
      { name: "twitter:image", content: `${SITE_URL}/og.jpg` },
    ],
    links: [
      { rel: "canonical", href: SITE_URL },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://www.googletagmanager.com" },
      { rel: "preload", as: "image", href: "/logo.webp" },
    ],
    scripts: [
      {
        src: `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`,
        async: true,
      },
      { children: GTAG_INLINE },
      ...(META_PIXEL_ENABLED ? [{ children: PIXEL_INLINE }] : []),
    ],
  }),
  shellComponent: Documento,
});

function Documento({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
