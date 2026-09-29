/**
 * Topo da página de empresas.
 *
 * Mesma regra da Hero.tsx original: os pontos de apoio são fato confirmado na
 * fonte, nunca estimativa. "+35 anos" e a composição da frota (incluindo
 * furgões e utilitários) são texto do próprio cliente, enviado em 17/08/2026
 * (ver Diferenciais.tsx). A operação local no ES contra as redes nacionais é
 * alavanca declarada em perfil.md, não copy nova.
 *
 * O primeiro ponto assume o <h1>, pelo mesmo motivo da página de lojas: numa
 * página de destino de anúncio, é o que o rastreador lê para entender do que
 * a página trata, e aqui precisa dizer "empresa", não "locadora" genérico.
 */
const PONTOS = [
  "Locação e terceirização de frota para empresas, com mais de 35 anos de experiência",
  "Frota diversificada: do econômico ao utilitário, incluindo furgões e vans",
  "Atendimento direto no Espírito Santo, sem central de relacionamento nacional",
] as const;

function Marca() {
  return (
    <span aria-hidden="true" className="mt-1 shrink-0 text-white/70">
      ✓
    </span>
  );
}

export function HeroEmpresas() {
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

        <div className="mt-8 flex max-w-2xl flex-col gap-3 text-lg text-white/95 sm:text-xl">
          <div className="flex gap-3">
            <Marca />
            <h1 className="font-normal">{PONTOS[0]}</h1>
          </div>

          <ul className="flex flex-col gap-3">
            {PONTOS.slice(1).map((ponto) => (
              <li key={ponto} className="flex gap-3">
                <Marca />
                {ponto}
              </li>
            ))}
          </ul>
        </div>

        <a
          href="#fale-com-a-gente"
          className="text-marca mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-4 text-base font-semibold transition-colors hover:bg-white/90"
        >
          Falar com o atendimento corporativo
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </header>
  );
}
