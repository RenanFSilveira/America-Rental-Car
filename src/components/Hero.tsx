/**
 * Topo da página.
 *
 * Os três pontos abaixo do título são texto do cliente, enviado em 17/08/2026.
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

        <p className="mt-8 text-sm font-semibold tracking-wide text-white/80 uppercase">
          Locadora capixaba, com loja própria em três cidades
        </p>

        <h1 className="mt-3 text-3xl leading-tight font-bold text-balance sm:text-5xl">
          Imprevisto não espera. Fale agora com a loja mais perto de você.
        </h1>

        <ul className="mt-6 flex max-w-2xl flex-col gap-2 text-lg text-white/90">
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
