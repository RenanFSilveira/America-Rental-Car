import { BotaoWhatsApp } from "./BotaoWhatsApp";
import { EMPRESAS } from "~/lib/lojas";

/**
 * Bloco B2B.
 *
 * O cliente pediu, em 17/08/2026, que ficasse logo abaixo da escolha de loja.
 * O tratamento visual continua contido de propósito (botão de contorno, bloco
 * baixo): o canal de empresas já consumiu verba nesta conta sem retorno, então
 * ele existe para não perder quem chega, sem competir com a ação principal.
 */
export function Empresas() {
  return (
    <section className="border-linha border-y bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Atendimento para empresas</h2>
          <p className="text-tinta-suave mt-1 max-w-xl text-sm">
            Se a necessidade é de locação para a sua empresa, o atendimento é
            por um canal próprio.
          </p>
        </div>

        <BotaoWhatsApp
          numero={EMPRESAS.whatsapp}
          sendTo={EMPRESAS.sendTo}
          loja={EMPRESAS.slug}
          rotulo="Falar com o Atendimento Corporativo"
          variante="contorno"
          className="sm:w-auto sm:shrink-0"
        />
      </div>
    </section>
  );
}
