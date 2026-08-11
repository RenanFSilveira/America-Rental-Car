import { BotaoWhatsApp } from "./BotaoWhatsApp";
import type { Loja } from "~/lib/lojas";

/**
 * Ação principal da página: escolher a loja e falar no WhatsApp.
 *
 * A ordem dos cards já chega pronta do servidor (ver ordenarLojas em
 * lib/lojas.ts). Não pedimos permissão de geolocalização.
 */
export function SeletorLoja({
  lojas,
  temDestaque,
}: {
  lojas: readonly Loja[];
  temDestaque: boolean;
}) {
  return (
    <section id="lojas" className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <h2 className="text-2xl font-bold sm:text-3xl">
        Escolha a loja e fale agora
      </h2>
      <p className="text-tinta-suave mt-2 max-w-2xl">
        Cada loja tem o próprio WhatsApp e a própria equipe. Quem responde é
        quem entrega o carro.
      </p>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {lojas.map((loja, indice) => {
          const destacada = temDestaque && indice === 0;
          return (
            <li
              key={loja.slug}
              className={`border-linha flex flex-col rounded-2xl border bg-white p-6 ${
                destacada ? "border-marca ring-marca/20 ring-2" : ""
              }`}
            >
              {destacada ? (
                <span className="bg-marca-tinta text-marca mb-3 self-start rounded-full px-3 py-1 text-xs font-semibold">
                  Loja da sua busca
                </span>
              ) : null}

              <h3 className="text-marca text-xl font-bold">{loja.nome}</h3>

              <address className="text-tinta-suave mt-2 text-sm not-italic">
                {loja.endereco}
              </address>

              <div className="mt-5 flex flex-col gap-3">
                <BotaoWhatsApp
                  numero={loja.whatsapp}
                  sendTo={loja.sendTo}
                  loja={loja.slug}
                  rotulo="Falar no WhatsApp"
                />
                <a
                  href={loja.telefoneLink}
                  className="text-tinta-suave hover:text-marca text-center text-sm font-medium underline underline-offset-4"
                >
                  Ligar para {loja.telefone}
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
