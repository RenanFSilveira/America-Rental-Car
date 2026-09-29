/**
 * Versão da Diferenciais.tsx reordenada e reescrita para leitor B2B.
 *
 * Os quatro fatos são os mesmos da página de lojas (texto do cliente,
 * 17/08/2026) e de perfil.md — nenhum dado novo. Só muda o enquadramento: a
 * operação local no ES "contra as redes nacionais" é alavanca #1 declarada em
 * perfil.md, então entra aqui em destaque, o que não fazia sentido na página
 * de consumidor final.
 */
const ITENS = [
  {
    titulo: "+35 anos de experiência",
    texto: "Locação de veículos para pessoas e empresas.",
  },
  {
    titulo: "Presença local no Espírito Santo",
    texto:
      "Atendimento direto, sem central de relacionamento nacional. Loja própria em Vila Velha, Vitória e Guarapari.",
  },
  {
    titulo: "Frota diversificada",
    texto:
      "Veículos econômicos, SUVs, executivos, pickups, furgões, vans e utilitários.",
  },
  {
    titulo: "Atendimento próximo",
    texto:
      "Você fala com pessoas. Nossa equipe entende a necessidade da sua empresa e ajuda a montar a solução.",
  },
] as const;

export function DiferenciaisEmpresas() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <h2 className="text-2xl font-bold sm:text-3xl">
        Por que empresas escolhem a América
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
