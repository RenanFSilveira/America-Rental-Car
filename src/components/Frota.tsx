import { CATEGORIAS } from "~/lib/frota";

/**
 * Vitrine de categorias. É o conteúdo real da página.
 *
 * Sem preço, sem ano, sem quantidade de veículos: nada disso está confirmado.
 * A foto ilustra a categoria e não promete modelo.
 */
export function Frota() {
  return (
    <section id="frota" className="border-linha border-y bg-white">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Categorias para locação
        </h2>
        <p className="text-tinta-suave mt-2 max-w-2xl">
          Do compacto para a cidade ao utilitário de carga. A disponibilidade
          varia por loja e por período: confirme no WhatsApp qual categoria está
          livre para as suas datas.
        </p>

        <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIAS.map((categoria) => (
            <li
              key={categoria.codigo}
              className="border-linha overflow-hidden rounded-2xl border"
            >
              <picture>
                <source
                  srcSet={`/frota/${categoria.imagem}.webp`}
                  type="image/webp"
                />
                <img
                  src={`/frota/${categoria.imagem}.jpg`}
                  alt={categoria.alt}
                  width={500}
                  height={300}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full bg-white"
                />
              </picture>

              <div className="px-5 pt-1 pb-5">
                <p className="text-marca text-xs font-bold tracking-wider uppercase">
                  Grupo {categoria.codigo}
                </p>
                <h3 className="mt-1 text-lg font-semibold">
                  {categoria.descricao}
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {categoria.etiquetas.map((etiqueta) => (
                    <li
                      key={etiqueta}
                      className="bg-marca-tinta text-marca-escuro rounded-full px-3 py-1 text-xs font-medium"
                    >
                      {etiqueta}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
