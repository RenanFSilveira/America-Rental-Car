/**
 * Diferenciais.
 *
 * Texto enviado pelo cliente em 17/08/2026, substituindo a versão anterior.
 * O tempo de mercado e a composição da frota são afirmações dele sobre o
 * próprio negócio. Continua sem preço, sem horário e sem prazo, que seguem
 * não confirmados.
 */
const ITENS = [
  {
    titulo: "+35 anos de experiência",
    texto: "Experiência em locação de veículos para pessoas e empresas.",
  },
  {
    titulo: "Frota diversificada",
    texto:
      "Veículos econômicos, SUVs, executivos, pickups, furgões, vans e utilitários.",
  },
  {
    titulo: "3 lojas no Espírito Santo",
    texto: "Pontos de atendimento em Vila Velha, Vitória e Guarapari.",
  },
  {
    titulo: "Atendimento próximo",
    texto:
      "Aqui, você fala com pessoas. Nossa equipe entende sua necessidade e ajuda a encontrar a melhor solução para a sua locação.",
  },
] as const;

export function Diferenciais() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <h2 className="text-2xl font-bold sm:text-3xl">
        Por que alugar com a América
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
