import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { Diferenciais } from "~/components/Diferenciais";
import { Empresas } from "~/components/Empresas";
import { Frota } from "~/components/Frota";
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
      <Frota />
      <Diferenciais />
      <Empresas />
      <Rodape />
    </main>
  );
}
