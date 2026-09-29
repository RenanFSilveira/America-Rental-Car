/**
 * Blocos de autoidentificação, um por cluster de busca real do cliente
 * (lista de termos que o Gabriel enviou em 22/09/2026: "terceirização de
 * frota", "locação/aluguel para empresa", "assinatura de veículos para
 * empresa", "utilitário para entrega e logística").
 *
 * Propositalmente descritivo, não promessa de condição contratual: nenhuma
 * das quatro linhas afirma o que está incluso no contrato (manutenção,
 * seguro, prazo mínimo), porque isso não está confirmado na fonte. Quem
 * decide a condição é o atendimento corporativo, no formulário abaixo.
 */
const ITENS = [
  {
    titulo: "Aluguel avulso",
    texto: "Veículo para a empresa por diária ou período determinado.",
  },
  {
    titulo: "Terceirização de frota",
    texto:
      "Estruture a frota da sua empresa em contrato com a América, em vez de manter veículos próprios.",
  },
  {
    titulo: "Aluguel por assinatura",
    texto: "Veículo para a empresa com contrato mensal.",
  },
  {
    titulo: "Utilitários e logística",
    texto: "Furgões e vans para entrega e operação.",
  },
] as const;

export function NecessidadesEmpresas() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <h2 className="text-2xl font-bold sm:text-3xl">
        Qual a necessidade da sua empresa
      </h2>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ITENS.map((item) => (
          <li key={item.titulo}>
            <div className="bg-marca h-1 w-10 rounded-full" />
            <h3 className="mt-4 text-lg font-semibold">{item.titulo}</h3>
            <p className="text-tinta-suave mt-2 text-sm leading-relaxed">
              {item.texto}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
