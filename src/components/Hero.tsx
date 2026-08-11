/**
 * Topo da página.
 *
 * Ângulos aprovados no planejamento de agosto: imprevisto não espera, locadora
 * da região com atendimento local, menos burocracia. Sem prazo e sem preço:
 * nenhum dos dois está confirmado com o cliente.
 */
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

        <p className="mt-4 max-w-2xl text-lg text-white/90">
          Vila Velha, Vitória e Guarapari. Você conversa direto com a equipe da
          unidade que vai entregar o carro, pelo WhatsApp, sem formulário e sem
          intermediário.
        </p>

        <a
          href="#lojas"
          className="text-marca mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-4 text-base font-semibold transition-colors hover:bg-white/90"
        >
          Escolher a loja e falar no WhatsApp
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </header>
  );
}
