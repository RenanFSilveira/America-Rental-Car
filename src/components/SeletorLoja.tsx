import { BotaoWhatsApp } from "./BotaoWhatsApp";
import { LOJAS } from "~/lib/lojas";

/**
 * Ação principal da página: escolher a loja e falar no WhatsApp.
 *
 * A ordem no HTML é sempre a mesma. Quando a URL de entrada traz o nome de uma
 * cidade em utm_campaign ou utm_term, um script curto no fim do corpo marca o
 * card daquela loja com data-destaque="sim", e o CSS o move para a frente e
 * mostra a etiqueta. É feito assim, e não no React, por dois motivos:
 *
 *   1. A página é pré-renderizada em HTML estático, então não existe servidor
 *      para ler a query string no momento da visita.
 *   2. Mexer na ordem depois da hidratação faria os cards pularem na tela. Com
 *      atributo e CSS, a mudança acontece antes da primeira pintura e o React
 *      hidrata exatamente o HTML que veio pronto.
 *
 * Não pedimos permissão de geolocalização: o custo em conversão não compensa.
 */
export function SeletorLoja() {
  return (
    <section id="lojas" className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      {/* é o <h1> da página desde que o título do topo saiu, em 18/08/2026.
          O tamanho na tela continua o mesmo: a mudança é só de semântica. */}
      <h1 className="text-2xl font-bold sm:text-3xl">
        Escolha a loja e fale agora
      </h1>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {LOJAS.map((loja) => (
          <li
            key={loja.slug}
            className="cartao-loja border-linha flex flex-col rounded-2xl border bg-white p-6"
            data-loja={loja.slug}
            data-sinais={loja.sinaisDeCidade.join("|")}
          >
            <span className="etiqueta-destaque bg-marca-tinta text-marca mb-3 self-start rounded-full px-3 py-1 text-xs font-semibold">
              Loja da sua busca
            </span>

            {/* h2 e não h3: o título da seção virou o h1 da página, então
                pular um nível aqui quebraria a ordem dos cabeçalhos */}
            <h2 className="text-marca text-xl font-bold">{loja.nome}</h2>

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
        ))}
      </ul>
    </section>
  );
}
