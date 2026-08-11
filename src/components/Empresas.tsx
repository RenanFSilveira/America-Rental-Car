import { BotaoWhatsApp } from "./BotaoWhatsApp";
import { EMPRESAS } from "~/lib/lojas";

/**
 * Bloco B2B, discreto de propósito.
 *
 * O canal de empresas já consumiu verba nesta conta sem retorno. Ele existe
 * aqui para não perder quem chega por conta própria, não para ser trabalhado.
 */
export function Empresas() {
  return (
    <section className="border-linha border-y bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Locação para empresas</h2>
          <p className="text-tinta-suave mt-1 max-w-xl text-sm">
            Se a necessidade é de locação para a sua empresa, o atendimento é
            por um canal próprio.
          </p>
        </div>

        <BotaoWhatsApp
          numero={EMPRESAS.whatsapp}
          sendTo={EMPRESAS.sendTo}
          loja={EMPRESAS.slug}
          rotulo="Falar com o time de empresas"
          variante="contorno"
          className="sm:w-auto sm:shrink-0"
        />
      </div>
    </section>
  );
}
