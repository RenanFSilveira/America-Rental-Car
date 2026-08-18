/**
 * Topo da página.
 *
 * A linha de apoio e o título saíram a pedido do cliente em 18/08/2026, então o
 * topo passou a ser marca, três pontos de apoio e a chamada para a ação. Sem
 * título aqui, o <h1> da página passou a ser o da seção de escolha de loja
 * (components/SeletorLoja.tsx): a página precisa ter um, e só um.
 *
 * Os três pontos são texto do cliente, enviado em 17/08/2026.
 * O "mais de 35 anos" é afirmação dele sobre o próprio negócio, então é fato
 * declarado na fonte, não estimativa nossa. Continua valendo o resto: sem
 * preço, sem prazo, sem horário.
 */
const PONTOS = [
  "Locadora de veículos com mais de 35 anos de experiência no segmento",
  "Frota diversificada: encontre o veículo ideal para a sua necessidade",
  "Atendimento personalizado",
] as const;

export function Hero() {
  return (
    <header className="bg-marca text-white">
      <div className="mx-auto max-w-5xl px-5 pt-6 pb-10 sm:pt-8 sm:pb-14">
        <img
          src="/logo.webp"
          alt="América Rental Car"
          width={244}
          height={72}
          className="h-12 w-auto sm:h-14"
          fetchPriority="high"
        />

        <ul className="mt-8 flex max-w-2xl flex-col gap-3 text-lg text-white/95 sm:text-xl">
          {PONTOS.map((ponto) => (
            <li key={ponto} className="flex gap-3">
              <span aria-hidden="true" className="mt-1 shrink-0 text-white/70">
                ✓
              </span>
              {ponto}
            </li>
          ))}
        </ul>

        <a
          href="#lojas"
          className="text-marca mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-4 text-base font-semibold transition-colors hover:bg-white/90"
        >
          Escolha a loja e fale no WhatsApp
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </header>
  );
}
