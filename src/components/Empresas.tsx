import { BotaoWhatsApp } from "./BotaoWhatsApp";
import { EMPRESAS } from "~/lib/lojas";

/**
 * Bloco B2B.
 *
 * O cliente pediu, em 17/08/2026, que ficasse logo abaixo da escolha de loja, e
 * em 18/08/2026 que o botão ficasse verde com letra branca, igual aos das lojas.
 * O bloco em si segue baixo e sem imagem, o que ainda o mantém abaixo da ação
 * principal na hierarquia da página.
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
          className="sm:w-auto sm:shrink-0"
        />
      </div>
    </section>
  );
}
