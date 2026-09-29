import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { Diferenciais } from "~/components/Diferenciais";
import { Empresas } from "~/components/Empresas";
import { Hero } from "~/components/Hero";
import { Rodape } from "~/components/Rodape";
import { SeletorLoja } from "~/components/SeletorLoja";
import { INSTAGRAM_URL, SITE_URL } from "~/lib/config";
import { LOJAS } from "~/lib/lojas";
import { capturarOrigem } from "~/lib/tracking";

/** Dados estruturados das três lojas. Só campos verificados na fonte. */
const DADOS_ESTRUTURADOS = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": LOJAS.map((loja) => ({
    "@type": "AutoRental",
    name: `América Rental Car ${loja.nome}`,
    url: SITE_URL,
    telephone: loja.telefone,
    email: loja.email,
    sameAs: [INSTAGRAM_URL],
    address: {
      "@type": "PostalAddress",
      streetAddress: loja.endereco,
      addressLocality: loja.nome,
      addressRegion: "ES",
      addressCountry: "BR",
    },
  })),
});

export const Route = createFileRoute("/")({
  head: () => ({
    // canonical fica na rota, não em __root.tsx: TanStack Router concatena
    // `links` em vez de sobrescrever por chave (diferente de `meta`, que
    // dedupe por name/property). Com o canonical no root, toda rota nova
    // herdava o dele e a página saía com dois <link rel="canonical">. Ver
    // routes/empresas.tsx para o mesmo padrão.
    links: [{ rel: "canonical", href: SITE_URL }],
    scripts: [{ type: "application/ld+json", children: DADOS_ESTRUTURADOS }],
  }),
  component: Pagina,
});

function Pagina() {
  useEffect(() => {
    capturarOrigem();
  }, []);

  return (
    <main>
      <Hero />
      <SeletorLoja />
      <Empresas />
      <Diferenciais />
      <Rodape />
    </main>
  );
}
