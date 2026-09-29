import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { DiferenciaisEmpresas } from "~/components/DiferenciaisEmpresas";
import { FaqEmpresas } from "~/components/FaqEmpresas";
import { FormularioEmpresas } from "~/components/FormularioEmpresas";
import { HeroEmpresas } from "~/components/HeroEmpresas";
import { NecessidadesEmpresas } from "~/components/NecessidadesEmpresas";
import { Rodape } from "~/components/Rodape";
import { SITE_URL } from "~/lib/config";
import { capturarOrigem } from "~/lib/tracking";

/**
 * Página dedicada de empresas, para a campanha B2B 100% separada que o Renan
 * combinou com o cliente em 22/09/2026: quem busca "terceirização de frota"
 * ou "locação para empresa" não pode cair na página de lojas, que fala com
 * o consumidor final. O bloco Empresas na página raiz (rota "/") continua
 * como está — pega quem chega lá por engano, não é destino de campanha.
 *
 * Título e descrição sobrescrevem os da rota raiz (__root.tsx): mesmo padrão
 * de chave (name/property), TanStack Router substitui pela versão mais
 * específica da rota filha. O canonical é declarado aqui e não em
 * __root.tsx, pelo mesmo motivo documentado em routes/index.tsx: `links` não
 * dedupe por chave, só `meta` faz isso.
 */
const TITULO =
  "Locação e Terceirização de Frota para Empresas | América Rental Car";
const DESCRICAO =
  "Locação e terceirização de frota para empresas no Espírito Santo. Atendimento direto, sem central nacional. Fale com o atendimento corporativo.";
const URL_PAGINA = `${SITE_URL}/empresas`;

export const Route = createFileRoute("/empresas")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESCRICAO },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESCRICAO },
      { property: "og:url", content: URL_PAGINA },
      { name: "twitter:title", content: TITULO },
      { name: "twitter:description", content: DESCRICAO },
    ],
    links: [{ rel: "canonical", href: URL_PAGINA }],
  }),
  component: Pagina,
});

function Pagina() {
  useEffect(() => {
    capturarOrigem();
  }, []);

  return (
    <main>
      <HeroEmpresas />
      <NecessidadesEmpresas />
      <DiferenciaisEmpresas />
      <FormularioEmpresas />
      <FaqEmpresas />
      <Rodape />
    </main>
  );
}
